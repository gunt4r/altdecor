package com.zipflow.zipflowserver.converters;

import com.fasterxml.jackson.core.type.TypeReference;
import com.zipflow.zipflowserver.model.CheckoutProduct;
import jakarta.persistence.Converter;

import java.util.List;

@Converter
public class CheckoutProductConverter extends AbstractJsonConverter<List<CheckoutProduct>> {
    @Override
    protected TypeReference<List<CheckoutProduct>> typeReference() {
        return new TypeReference<>() {};
    }
}
