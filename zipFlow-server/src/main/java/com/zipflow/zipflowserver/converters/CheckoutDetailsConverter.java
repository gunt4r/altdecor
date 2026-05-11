package com.zipflow.zipflowserver.converters;

import com.fasterxml.jackson.core.type.TypeReference;
import com.zipflow.zipflowserver.model.CheckoutDetails;
import jakarta.persistence.Converter;

@Converter
public class CheckoutDetailsConverter extends AbstractJsonConverter<CheckoutDetails> {
    @Override
    protected TypeReference<CheckoutDetails> typeReference() {
        return new TypeReference<>() {};
    }
}
