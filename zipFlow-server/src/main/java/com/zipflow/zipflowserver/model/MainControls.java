package com.zipflow.zipflowserver.model;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class MainControls {
    private String path;
    private String label;
    private Number order;
}
