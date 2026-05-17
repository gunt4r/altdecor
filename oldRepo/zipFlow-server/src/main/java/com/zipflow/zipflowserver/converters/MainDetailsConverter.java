package com.zipflow.zipflowserver.converters;

import com.zipflow.zipflowserver.model.MainDetails;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Converter(autoApply = true)
public class MainDetailsConverter implements AttributeConverter<MainDetails, String> {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(MainDetails mainDetails) {
        try {
            return objectMapper.writeValueAsString(mainDetails);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting object to JSON", e);
        }
    }

    @Override
    public MainDetails convertToEntityAttribute(String json) {
        try {
            return objectMapper.readValue(json, MainDetails.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting JSON to object", e);
        }
    }
}
