package com.zipflow.zipflowserver.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DeliveryMethodEnum {
    ADDRESS("address"),
    PHONE("phone"),
    STORE("store");

    private final String value;

    @JsonValue
    public String toValue() {
        return value;
    }

    @JsonCreator
    public static DeliveryMethodEnum fromValue(String value) {
        for (DeliveryMethodEnum method : values()) {
            if (method.getValue().equals(value)) return method;
        }
        throw new IllegalArgumentException("Invalid DeliveryMethodEnum value: " + value);
    }
}
