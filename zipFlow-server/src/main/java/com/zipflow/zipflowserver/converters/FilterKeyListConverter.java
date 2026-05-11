package com.zipflow.zipflowserver.converters;

import com.fasterxml.jackson.core.type.TypeReference;
import com.zipflow.zipflowserver.model.FilterKey;
import jakarta.persistence.Converter;

import java.util.List;

@Converter
public class FilterKeyListConverter extends AbstractJsonConverter<List<FilterKey>> {
    @Override
    protected TypeReference<List<FilterKey>> typeReference() {
        return new TypeReference<>() {};
    }
}
