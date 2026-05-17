package com.zipflow.zipflowserver.converters;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zipflow.zipflowserver.model.CheckoutDetails;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class CheckoutDetailsConverter implements AttributeConverter<CheckoutDetails, String> {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(CheckoutDetails checkoutDetails) {
        try {
            return objectMapper.writeValueAsString(checkoutDetails);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting object to JSON", e);
        }
    }

    @Override
    public CheckoutDetails convertToEntityAttribute(String json) {
        try {
            return objectMapper.readValue(json, CheckoutDetails.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting JSON to object", e);
        }
    }
}
