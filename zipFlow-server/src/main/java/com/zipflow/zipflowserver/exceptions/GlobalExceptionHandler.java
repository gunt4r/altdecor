package com.zipflow.zipflowserver.exceptions;

import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;

/**
 * Maps uncaught exceptions to proper HTTP status codes with a JSON body.
 *
 * Without this, an uncaught controller exception (e.g. "Table does not exist")
 * is forwarded to Spring's /error endpoint. Because the JWT filter (an
 * OncePerRequestFilter) does not run on ERROR dispatches, the stateless
 * SecurityContext is empty there and Spring Security returns 403 — masking the
 * real error. This advice handles the exception before it propagates, so
 * clients get a meaningful status (404/400/500) instead of a misleading 403.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException e) {
        return build(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleEntityNotFound(EntityNotFoundException e) {
        return build(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException e) {
        String message = e.getMessage() != null ? e.getMessage() : "";
        // The dynamic-table service throws this for both "does not exist" (a 404
        // condition) and genuine persistence failures (a 500 condition).
        if (message.toLowerCase().contains("does not exist")) {
            return build(HttpStatus.NOT_FOUND, message);
        }
        LOGGER.error("Unhandled illegal state", e);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, message);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException e) {
        return build(HttpStatus.valueOf(e.getStatusCode().value()), e.getReason());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception e) {
        LOGGER.error("Unhandled exception", e);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
    }

    private ResponseEntity<Map<String, Object>> build(HttpStatus status, String message) {
        Map<String, Object> body = Map.of(
                "timestamp", Instant.now().toString(),
                "status", status.value(),
                "error", status.getReasonPhrase(),
                "message", message != null ? message : ""
        );
        return ResponseEntity.status(status).body(body);
    }
}
