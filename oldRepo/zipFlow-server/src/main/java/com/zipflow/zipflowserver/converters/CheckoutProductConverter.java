package com.zipflow.zipflowserver.converters;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zipflow.zipflowserver.model.CheckoutProduct;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.List;

@Converter(autoApply = true)
public class CheckoutProductConverter implements AttributeConverter<List<CheckoutProduct>, String> {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<CheckoutProduct> checkoutProduct) {
        try {
            return objectMapper.writeValueAsString(checkoutProduct);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting object to JSON", e);
        }
    }

    @Override
    public List<CheckoutProduct> convertToEntityAttribute(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<CheckoutProduct>>() {
            });
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting JSON to object", e);
        }
    }
}
