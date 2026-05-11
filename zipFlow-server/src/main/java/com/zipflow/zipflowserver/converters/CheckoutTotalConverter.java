package com.zipflow.zipflowserver.converters;

import com.fasterxml.jackson.core.type.TypeReference;
import com.zipflow.zipflowserver.model.CheckoutTotal;
import jakarta.persistence.Converter;

@Converter
public class CheckoutTotalConverter extends AbstractJsonConverter<CheckoutTotal> {
    @Override
    protected TypeReference<CheckoutTotal> typeReference() {
        return new TypeReference<>() {};
    }
}
