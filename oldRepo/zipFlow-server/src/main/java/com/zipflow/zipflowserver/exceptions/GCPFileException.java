package com.zipflow.zipflowserver.exceptions;

import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class GCPFileException extends RuntimeException{

    private final String message;

    public GCPFileException(String message) {
        super(message);
        this.message = message;
    }
}