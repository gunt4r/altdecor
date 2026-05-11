package com.zipflow.zipflowserver.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@Embeddable
@JsonIgnoreProperties(ignoreUnknown = true)
public class Key {
    private String key;
    private String type;
    private Boolean optional;
    private Boolean avoid_translate;
    private List<Key> object_keys;
    private List<Key> array_keys;
    private Map<String, Object> config;
}
