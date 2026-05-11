package com.zipflow.zipflowserver.model;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class CrudEntityResponse {
    private Long id;
    private String slug;
    private String label;
}
