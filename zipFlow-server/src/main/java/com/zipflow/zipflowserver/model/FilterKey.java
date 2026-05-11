package com.zipflow.zipflowserver.model;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class FilterKey {
    private String db_key;
    private String label;
    private String filter_type;
    private String entity;
}
