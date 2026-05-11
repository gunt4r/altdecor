package com.zipflow.zipflowserver.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ColumnDefinition {
    private String columnName;
    private String columnType;
}
