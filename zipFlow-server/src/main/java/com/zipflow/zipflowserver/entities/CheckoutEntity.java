package com.zipflow.zipflowserver.entities;

import com.zipflow.zipflowserver.converters.CheckoutDetailsConverter;
import com.zipflow.zipflowserver.converters.CheckoutProductConverter;
import com.zipflow.zipflowserver.converters.CheckoutTotalConverter;
import com.zipflow.zipflowserver.model.CheckoutDetails;
import com.zipflow.zipflowserver.model.CheckoutProduct;
import com.zipflow.zipflowserver.model.CheckoutTotal;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnTransformer;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Setter
@Getter
@Entity
@Table(name = "checkout")
public class CheckoutEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "details", columnDefinition = "jsonb")
    @Convert(converter = CheckoutDetailsConverter.class)
    @ColumnTransformer(write = "?::jsonb")
    private CheckoutDetails details;

//    @Column(name = "delivery", columnDefinition = "jsonb default null")
//    @Convert(converter = CheckoutDeliveryConverter.class)
//    @ColumnTransformer(write = "?::jsonb")
//    private CheckoutDelivery delivery;

    @Column(name = "products", columnDefinition = "jsonb")
    @Convert(converter = CheckoutProductConverter.class)
    @ColumnTransformer(write = "?::jsonb")
    private List<CheckoutProduct> products;

    @Column(name = "total", columnDefinition = "jsonb")
    @Convert(converter = CheckoutTotalConverter.class)
    @ColumnTransformer(write = "?::jsonb")
    private CheckoutTotal total;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
