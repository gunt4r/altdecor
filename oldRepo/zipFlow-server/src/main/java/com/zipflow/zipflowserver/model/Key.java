package com.zipflow.zipflowserver.model;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@Embeddable
public class Key {
    private String key;
    private String type;
    private Boolean optional;
    private Boolean avoid_translate;
    private List<Key> object_keys;
    private List<Key> array_keys;
}
