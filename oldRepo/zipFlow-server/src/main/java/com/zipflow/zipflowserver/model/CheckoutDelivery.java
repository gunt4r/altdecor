package com.zipflow.zipflowserver.model;

import com.zipflow.zipflowserver.enums.DeliveryMethodEnum;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Embeddable
public class CheckoutDelivery {
    private boolean judiciary;
    private String name;
    private String surname;
    private String street;
    private String companyName;
    private String apartment;
    private String address;
    private String city;
    private String region;
    private String idno;
    private String zipcode;
    private String tvacode;
    private String country;
    private String phone;
    private DeliveryMethodEnum deliveryMethod;
}