package com.zipflow.zipflowserver.model;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@Embeddable
public class CheckoutProduct {
    private Number id;
    private String img;
    private Map<String, Object> name;
    private String price;
    private String oldPrice;
    private String model;
    private String size;
    private String sku;
    private Number quantity;
}
