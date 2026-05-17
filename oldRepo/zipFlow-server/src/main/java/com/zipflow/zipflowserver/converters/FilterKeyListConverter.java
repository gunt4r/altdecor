package com.zipflow.zipflowserver.converters;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zipflow.zipflowserver.model.FilterKey;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import com.fasterxml.jackson.core.JsonProcessingException;

import java.util.List;

@Converter(autoApply = true)
public class FilterKeyListConverter implements AttributeConverter<List<FilterKey>, String> {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<FilterKey> filterKeys) {
        try {
            return objectMapper.writeValueAsString(filterKeys);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting object to JSON", e);
        }
    }

    @Override
    public List<FilterKey> convertToEntityAttribute(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<FilterKey>>() {});
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting JSON to object", e);
        }
    }
}
