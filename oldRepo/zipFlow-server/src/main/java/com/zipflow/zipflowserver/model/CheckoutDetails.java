package com.zipflow.zipflowserver.model;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Embeddable
public class CheckoutDetails {
    private String name;
    private String surname;
    private String email;
    private String phone;
    private boolean createAccount;
}