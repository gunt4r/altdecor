package com.zipflow.zipflowserver.converters;

import com.fasterxml.jackson.core.type.TypeReference;
import com.zipflow.zipflowserver.model.MainDetails;
import jakarta.persistence.Converter;

@Converter
public class MainDetailsConverter extends AbstractJsonConverter<MainDetails> {
    @Override
    protected TypeReference<MainDetails> typeReference() {
        return new TypeReference<>() {};
    }
}
