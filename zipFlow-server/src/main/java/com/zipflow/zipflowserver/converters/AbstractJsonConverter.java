package com.zipflow.zipflowserver.converters;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;

public abstract class AbstractJsonConverter<T> implements AttributeConverter<T, String> {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    protected abstract TypeReference<T> typeReference();

    @Override
    public String convertToDatabaseColumn(T attribute) {
        if (attribute == null) {
            return null;
        }

        try {
            return OBJECT_MAPPER.writeValueAsString(attribute);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("Failed to serialize JSON attribute", exception);
        }
    }

    @Override
    public T convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }

        try {
            return OBJECT_MAPPER.readValue(dbData, typeReference());
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("Failed to deserialize JSON attribute", exception);
        }
    }
}
