package com.zipflow.zipflowserver.converters;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zipflow.zipflowserver.model.CheckoutDelivery;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class CheckoutDeliveryConverter implements AttributeConverter<CheckoutDelivery, String> {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(CheckoutDelivery checkoutDelivery) {
        try {
            return objectMapper.writeValueAsString(checkoutDelivery);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting object to JSON", e);
        }
    }

    @Override
    public CheckoutDelivery convertToEntityAttribute(String json) {
        try {
            return objectMapper.readValue(json, CheckoutDelivery.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting JSON to object", e);
        }
    }
}
