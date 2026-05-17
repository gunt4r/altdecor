package com.zipflow.zipflowserver.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zipflow.zipflowserver.model.ColumnDefinition;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.postgresql.util.PGobject;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DynamicTableService {
    @PersistenceContext
    private EntityManager entityManager;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public DynamicTableService(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper, EntityManager entityManager) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
        this.entityManager = entityManager;
    }

    public void createOrUpdateTable(String slug, List<ColumnDefinition> columnDefinitions) {
        if (StringUtils.isEmpty(slug) || columnDefinitions.isEmpty()) {
            throw new IllegalArgumentException("Slug and column definitions cannot be empty");
        }

        validateSlug(slug);

        if (!tableExists(slug)) {
            createTable(slug);
            columnDefinitions.forEach(columnDefinition -> addColumn(slug, columnDefinition.getColumnName(), columnDefinition.getColumnType()));
        }
    }

    public Map<String, Object> getData(String slug, int page, int rowsPerPage, String search, String filter, String sortBy, String sortOrder) {
        if (StringUtils.isEmpty(slug)) {
            throw new IllegalArgumentException("Slug cannot be empty");
        }

        validateSlug(slug);

        if (!tableExists(slug)) {
            throw new IllegalStateException("Table does not exist for slug: " + slug);
        }

        try {
            return getFilteredData(slug, page, rowsPerPage, search, filter, sortBy, sortOrder);
        } catch (DataAccessException e) {
            throw new IllegalStateException("Failed to retrieve data from table: " + slug, e);
        }
    }

    public Map<String, Object> getFilteredData(String slug, int page, int rowsPerPage, String search, String filter, String sortBy, String sortOrder) {
        int offset = (page - 1) * rowsPerPage;

        StringBuilder dataSql = new StringBuilder("SELECT * FROM " + slug);

        dataSql.append(getQueryBuilder(search, " WHERE "));
        dataSql.append(getQueryBuilder(filter, search != null ? " AND " : " WHERE "));
        dataSql.append(getSortClause(sortBy, sortOrder));
        dataSql.append(" LIMIT ? OFFSET ?");

        String countSql = "SELECT COUNT(*) FROM " + slug + getQueryBuilder(search, " WHERE ") + getQueryBuilder(filter, search != null ? " AND " : " WHERE ");

        int total = jdbcTemplate.queryForObject(countSql.toString(), Integer.class);
        List<Map<String, Object>> rawData = jdbcTemplate.queryForList(dataSql.toString(), rowsPerPage, offset);

        Map<String, Object> result = new HashMap<>();
        Map<String, Object> meta = new HashMap<>();
        meta.put("total", total);
        result.put("meta", meta);
        result.put("data", getParsedData(rawData));

        return result;
    }

    private StringBuilder getQueryBuilder(String param, String initialQueryPart) {
        StringBuilder dataSql = new StringBuilder();

        if (param != null) {
            String[] andParts = param.split("_and_");
            for (int andIndex = 0; andIndex < andParts.length; andIndex++) {
                StringBuilder andSql = new StringBuilder((andIndex > 0 ? ")) AND " : initialQueryPart) + "EXISTS ( SELECT 1 FROM jsonb_array_elements(data) AS elem WHERE ((");

                String[] orParts = andParts[andIndex].split("_or_");

                for (int orIndex = 0; orIndex < orParts.length; orIndex++) {
                    StringBuilder orSql = new StringBuilder((orIndex > 0 ? " OR " : "") + "((elem #>> '{");

                    // TODO add conditions for number && greater,lower
                    String[] searchParts = orParts[orIndex].split("_contains_");
                    boolean equals = false;

                    if (searchParts.length == 1) {
                        equals = true;
                        searchParts = orParts[orIndex].split("_equals_");
                    }

                    String[] objectParts = searchParts[0].split("\\.");

                    for (int partIndex = 0; partIndex < objectParts.length; partIndex++) {
                        if (partIndex > 0) {
                            orSql.append(",");
                        }

                        orSql.append(objectParts[partIndex]);
                    }

                    if (equals) {
                        boolean isBoolean = searchParts[1].equals("true") || searchParts[1].equals("false");
                        boolean isInteger = parseInteger(searchParts[1]);
                        boolean isFloat = parseFloat(searchParts[1]);

                        if (isBoolean) {
                            orSql.append("}')::boolean = ").append(Boolean.parseBoolean(searchParts[1])).append(")");
                        } else if (isInteger) {
                            orSql.append("}')::int = ").append(Integer.parseInt(searchParts[1])).append(")");
                        } else if (isFloat) {
                            // TODO add logic for float
//                            orSql.append("}')::int = ").append(Float.parseFloat(searchParts[1])).append(")");
                        } else {
                            orSql.append("}') = '").append(searchParts[1]).append("')");
                        }
                    } else {
                        orSql.append("}') LIKE '%").append(searchParts[1]).append("%')");
                    }

                    andSql.append(orSql);
                }
                andSql.append(")");
                dataSql.append(andSql);
            }

            dataSql.append("))");
        }

        return dataSql;
    }

    public boolean parseInteger(String intStr) {
        try {
            Integer.parseInt(intStr);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    public boolean parseFloat(String intStr) {
        try {
            Float.parseFloat(intStr);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private List<Map<String, Object>> getParsedData(List<Map<String, Object>> rawData) {
        List<Map<String, Object>> data = new ArrayList<>();
        for (Map<String, Object> row : rawData) {
            Map<String, Object> rowData = new HashMap<>();
            PGobject dataObject = (PGobject) row.get("data");
            if (dataObject != null) {
                String jsonDataString = dataObject.getValue(); // Retrieve JSON string from PGobject
                try {
                    JsonNode jsonData = objectMapper.readTree(jsonDataString);
                    if (jsonData.isArray()) {
                        List<Map<String, Object>> parsedValue = new ArrayList<>();
                        for (JsonNode node : jsonData) {
                            // Convert each element of the array to a Map<String, Object>
                            Map<String, Object> element = objectMapper.convertValue(node, new TypeReference<>() {
                            });
                            parsedValue.add(element);
                        }
                        rowData.put("data", parsedValue);
                        rowData.put("id", row.get("id"));
                    }
                } catch (JsonProcessingException e) {
                    // Handle JSON processing exception
                    e.printStackTrace();
                }
            }
            // Add created_at and updated_at fields to rowData
            rowData.put("created_at", row.get("created_at"));
            rowData.put("updated_at", row.get("updated_at"));
            data.add(rowData);
        }

        return data;
    }

    private StringBuilder getSortClause(String sortBy, String sortOrder) {
        StringBuilder sortClause = new StringBuilder();
        if (sortBy != null && !sortBy.isEmpty()) {
            if ("created_at".equals(sortBy) || "updated_at".equals(sortBy)) {
                sortClause.append(" ORDER BY ").append(sortBy).append(" ").append(sortOrder).append(" ");
            } else {
                String[] keys = sortBy.split("\\.");
                sortClause.append(" ORDER BY jsonb_extract_path_text(");

                for (int i = 0; i < keys.length; i++) {
                    if (i > 0) {
                        sortClause.append(", ");
                        sortClause.append("'" + keys[i] + "'");
                    } else {
                        sortClause.append("\"" + keys[i] + "\"");
                    }
                }

                if (sortOrder != null && !sortOrder.isEmpty()) {
                    sortClause.append(") ").append(sortOrder);
                }
            }
        }
        return sortClause;
    }


    public Map<String, Object> saveData(String slug, Map<String, Object> data) {
        if (StringUtils.isEmpty(slug) || data == null || data.isEmpty()) {
            throw new IllegalArgumentException("Slug and data cannot be empty");
        }

        validateSlug(slug);
        validateData(data);

        if (!tableExists(slug)) {
            throw new IllegalStateException("Table does not exist for slug: " + slug);
        }

        try {
            insertData(slug, data);
            return data;
        } catch (DataAccessException e) {
            throw new IllegalStateException("Failed to insert data into table: " + slug, e);
        }
    }

    public Map<String, Object> updateData(String slug, Long id, Map<String, Object> newData) {
        try {
            // Validate slug
            validateSlug(slug);

            // Check if table exists
            if (!tableExists(slug)) {
                throw new IllegalStateException("Table does not exist for slug: " + slug);
            }

            // Validate data
            validateData(newData);

            // Convert newData to JSON string
            String newDataJson = objectMapper.writeValueAsString(newData.get("data"));

            // Update data in the database including updated_at column
            String updateSql = "UPDATE " + slug + " SET data = ?::jsonb, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
            jdbcTemplate.update(updateSql, newDataJson, id);

            // Retrieve and return the updated data
            return getDataById(slug, id);
        } catch (DataAccessException | JsonProcessingException e) {
            throw new IllegalStateException("Failed to update data for slug: " + slug + " and id: " + id, e);
        }
    }

    public Map<String, Object> getDataById(String slug, Long id) {
        if (StringUtils.isEmpty(slug) || id == null) {
            throw new IllegalArgumentException("Slug and ID cannot be empty");
        }

        validateSlug(slug);

        if (!tableExists(slug)) {
            throw new IllegalStateException("Table does not exist for slug: " + slug);
        }

        try {
            String sql = "SELECT data FROM " + slug + " WHERE id = ?";
            String jsonData = jdbcTemplate.queryForObject(sql, String.class, id);

            // Parse the JSON array into a List<Map<String, Object>>
            List<Map<String, Object>> dataList = objectMapper.readValue(jsonData, new TypeReference<>() {
            });

            // Construct the response object
            Map<String, Object> response = new HashMap<>();
            response.put("data", dataList);
            response.put("id", id);

            return response;
        } catch (DataAccessException | JsonProcessingException e) {
            throw new IllegalStateException("Failed to retrieve data by ID from table: " + slug, e);
        }
    }

    public void deleteDataById(String slug, Long id) {
        if (StringUtils.isEmpty(slug) || id == null) {
            throw new IllegalArgumentException("Slug and ID cannot be empty");
        }

        validateSlug(slug);

        if (!tableExists(slug)) {
            throw new IllegalStateException("Table does not exist for slug: " + slug);
        }

        String sql = "DELETE FROM " + slug + " WHERE id = ?";
        int deletedRows = jdbcTemplate.update(sql, id);

        if (deletedRows <= 0) throw new IllegalStateException("Failed to delete row by ID from table: " + slug);
    }

    public boolean tableExists(String tableName) {
        try {
            String sql = "SELECT EXISTS (SELECT * FROM pg_tables WHERE tablename = ?)";
            return jdbcTemplate.queryForObject(sql, Boolean.class, tableName);
        } catch (DataAccessException e) {
            throw new IllegalStateException("Failed to check if table exists: " + tableName, e);
        }
    }

    private void createTable(String tableName) {
        try {
            String sql = "CREATE TABLE " + tableName + " (id SERIAL PRIMARY KEY)";
            jdbcTemplate.execute(sql);
        } catch (DataAccessException e) {
            throw new IllegalStateException("Failed to create table: " + tableName, e);
        }
    }

    private void addColumn(String tableName, String columnName, String columnType) {
        if (StringUtils.isEmpty(columnName) || StringUtils.isEmpty(columnType)) {
            throw new IllegalArgumentException("Column name and type cannot be empty");
        }
        try {
            String sql = "ALTER TABLE " + tableName + " ADD COLUMN " + columnName + " " + columnType;
            jdbcTemplate.execute(sql);
        } catch (DataAccessException e) {
            throw new IllegalStateException("Failed to add column to table: " + tableName, e);
        }
    }

    private void insertData(String tableName, Map<String, Object> data) {
        try {
            StringBuilder columns = new StringBuilder();
            StringBuilder placeholders = new StringBuilder();
            Object[] values = new Object[data.size() + 2]; // Additional 2 for created_at and updated_at

            int i = 0;
            for (Map.Entry<String, Object> entry : data.entrySet()) {
                columns.append(entry.getKey()).append(",");
                placeholders.append("?::jsonb,");
                values[i++] = objectMapper.writeValueAsString(entry.getValue());
            }
            // Append created_at and updated_at columns
            columns.append("created_at,updated_at");
            placeholders.append("?,?");

            // Set values for created_at and updated_at
            values[i++] = Timestamp.valueOf(LocalDateTime.now());
            values[i] = Timestamp.valueOf(LocalDateTime.now());

            // Construct INSERT SQL query
            String sql = "INSERT INTO " + tableName + " (" + columns + ") VALUES (" + placeholders + ")";

            // Execute the INSERT SQL query
            jdbcTemplate.update(sql, values);
        } catch (DataAccessException | JsonProcessingException e) {
            throw new IllegalStateException("Failed to insert data into table: " + tableName, e);
        }
    }

    private void validateSlug(String slug) {
        if (!isValidSlug(slug)) {
            throw new IllegalArgumentException("Invalid slug: " + slug);
        }
    }

    private boolean isValidSlug(String slug) {
        return slug.matches("[a-zA-Z0-9_]+");
    }

    private void validateData(Map<String, Object> data) {
        // Check if the "data" key exists
        if (!data.containsKey("data")) {
            throw new IllegalArgumentException("Missing 'data' key in input JSON");
        }

        // Retrieve the value associated with the "data" key
        Object value = data.get("data");

        // Ensure that the value is a list
        if (!(value instanceof List)) {
            throw new IllegalArgumentException("Value associated with 'data' key must be a list");
        }

        // Validate each object in the list
        List<Object> dataList = (List<Object>) value;
        for (Object obj : dataList) {
            // Ensure that each object is a map
            if (!(obj instanceof Map)) {
                throw new IllegalArgumentException("Each item in the 'data' list must be an object");
            }

            Map<String, Object> item = (Map<String, Object>) obj;
            // Optionally, perform additional validation on the structure of each item if needed
            // For example, check for required keys or specific value types
        }
    }

    public boolean isEntityPublicPost(String slug) {
        if (!isValidSlug(slug)) {
            return false;
        }

        if (!tableExists(slug)) {
            return false;
        }

        Map<String, Object> mainDetails = getMainDetails(slug);

        return mainDetails != null && mainDetails.get("public_entity_post") != null && (Boolean) mainDetails.get("public_entity_post");
    }

    public boolean isEntityPublicGet(String slug) {
        if (!isValidSlug(slug)) {
            return false;
        }

        if (!tableExists(slug)) {
            return false;
        }

        Map<String, Object> mainDetails = getMainDetails(slug);

        return mainDetails != null && mainDetails.get("public_entity_get") != null && (Boolean) mainDetails.get("public_entity_get");
    }

    public Map<String, Object> getMainDetails(String slug) {
        try {
            String sql = "SELECT main_details FROM dynamic_entity WHERE main_details ->> 'slug' = :slug";
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("slug", slug);

            String mainDetailsJson = (String) query.getSingleResult();
            return objectMapper.readValue(mainDetailsJson, new TypeReference<Map<String, Object>>() {
            });
        } catch (NoResultException e) {
            return null;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to retrieve main details for slug: " + slug, e);
        }
    }

    // TODO optimize in next phase
    public List<Map<String, Object>> extractElementsWithLabels(String tableName, List<String> labels) {
        List<Map<String, Object>> extractedElements = new ArrayList<>();
        String sql = "SELECT data FROM " + tableName;

        jdbcTemplate.query(sql, (ResultSet rs) -> {
            String jsonDataString = rs.getString("data");
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode jsonData = objectMapper.readTree(jsonDataString);
                if (jsonData.isArray()) {
                    for (JsonNode element : jsonData) {
                        extractElementsFromElement(element, labels, extractedElements);
                    }
                }
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
        });

        return extractedElements;
    }

    private void extractElementsFromElement(JsonNode element, List<String> labels, List<Map<String, Object>> extractedElements) {
        Map<String, Object> extractedElement = new HashMap<>();
        for (String label : labels) {
            JsonNode childNode = element.path(label);
            if (!childNode.isMissingNode()) {
                extractedElement.put(label, convertNodeToMap(childNode));
            }
        }
        if (!extractedElement.isEmpty()) {
            if (!extractedElements.contains(extractedElement)) {
                extractedElements.add(extractedElement);
            }
        }
    }

    private List<Map<String, Object>> convertNodeToMap(JsonNode node) {
        List<Map<String, Object>> resultList = new ArrayList<>();

        // Check if the node is an array
        if (node.isArray()) {
            // Iterate over each element in the array
            for (JsonNode element : node) {
                // Convert the current element to a map
                Map<String, Object> elementMap = convertElementToMap(element);
                // Add the map to the result list
                resultList.add(elementMap);
            }
        } else {
            // If it's not an array, convert the node to a single map
            Map<String, Object> singleElementMap = convertElementToMap(node);
            resultList.add(singleElementMap);
        }

        return resultList;
    }

    private Map<String, Object> convertElementToMap(JsonNode element) {
        Map<String, Object> elementMap = new HashMap<>();

        if (element.isObject()) {
            // If the element is an object, convert it to a map
            elementMap = objectMapper.convertValue(element, new TypeReference<>() {
            });
        } else if (element.isTextual()) {
            // If the element is a string, add it directly to the map
            elementMap.put("value", element.asText());
        } else if (element.isNumber()) {
            // If the element is a number, add it directly to the map
            elementMap.put("value", element.numberValue());
        } else if (element.isBoolean()) {
            // If the element is a boolean, add it directly to the map
            elementMap.put("value", element.asBoolean());
        } else if (element.isNull()) {
            // If the element is null, add null to the map
            elementMap.put("value", null);
        }

        return elementMap;
    }
}
