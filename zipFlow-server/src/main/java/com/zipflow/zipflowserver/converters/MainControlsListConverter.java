package com.zipflow.zipflowserver.converters;

import com.fasterxml.jackson.core.type.TypeReference;
import com.zipflow.zipflowserver.model.MainControls;
import jakarta.persistence.Converter;

import java.util.List;

@Converter
public class MainControlsListConverter extends AbstractJsonConverter<List<MainControls>> {
    @Override
    protected TypeReference<List<MainControls>> typeReference() {
        return new TypeReference<>() {};
    }
}
