package com.zipflow.zipflowserver.converters;

import com.fasterxml.jackson.core.type.TypeReference;
import com.zipflow.zipflowserver.model.Key;
import jakarta.persistence.Converter;

import java.util.List;

@Converter
public class KeyListConverter extends AbstractJsonConverter<List<Key>> {
    @Override
    protected TypeReference<List<Key>> typeReference() {
        return new TypeReference<>() {};
    }
}
