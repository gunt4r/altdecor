package com.zipflow.zipflowserver.model;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class CheckoutTotal {
    private String subtotal;
    private String total;
}
