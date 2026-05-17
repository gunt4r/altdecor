package com.zipflow.zipflowserver.model;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ColumnDefinition {
    private String columnName;
    private String columnType;

    public ColumnDefinition(String columnName, String columnType) {
        this.columnName = columnName;
        this.columnType = columnType;
    }
}

