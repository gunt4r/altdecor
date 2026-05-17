package com.zipflow.zipflowserver.converters;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zipflow.zipflowserver.model.CheckoutTotal;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class CheckoutTotalConverter implements AttributeConverter<CheckoutTotal, String> {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(CheckoutTotal checkoutTotal) {
        try {
            return objectMapper.writeValueAsString(checkoutTotal);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting object to JSON", e);
        }
    }

    @Override
    public CheckoutTotal convertToEntityAttribute(String json) {
        try {
            return objectMapper.readValue(json, CheckoutTotal.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting JSON to object", e);
        }
    }
}
