package com.zipflow.zipflowserver.model;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Embeddable
public class MainDetails {
    private String slug;
    private String label;
    private boolean active;
    private boolean has_meta;
    private boolean public_entity_post;
    private boolean public_entity_get;
    private boolean avoid_translate;
}
