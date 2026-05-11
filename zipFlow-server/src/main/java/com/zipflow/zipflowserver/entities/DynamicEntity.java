package com.zipflow.zipflowserver.entities;

import com.zipflow.zipflowserver.converters.FilterKeyListConverter;
import com.zipflow.zipflowserver.converters.KeyListConverter;
import com.zipflow.zipflowserver.converters.MainControlsListConverter;
import com.zipflow.zipflowserver.converters.MainDetailsConverter;
import com.zipflow.zipflowserver.model.FilterKey;
import com.zipflow.zipflowserver.model.Key;
import com.zipflow.zipflowserver.model.MainControls;
import com.zipflow.zipflowserver.model.MainDetails;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnTransformer;

import java.util.List;

@Setter
@Getter
@Entity
@Table(name = "dynamic_entity")
public class DynamicEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "main_details", columnDefinition = "jsonb")
    @Convert(converter = MainDetailsConverter.class)
    @ColumnTransformer(write = "?::jsonb")
    private MainDetails main_details;

    @Column(name = "keys", columnDefinition = "jsonb")
    @Convert(converter = KeyListConverter.class)
    @ColumnTransformer(write = "?::jsonb")
    private List<Key> keys;

    @Column(name = "filter_keys", columnDefinition = "jsonb")
    @Convert(converter = FilterKeyListConverter.class)
    @ColumnTransformer(write = "?::jsonb")
    private List<FilterKey> filter_keys;

    @Column(name = "main_controls", columnDefinition = "jsonb")
    @Convert(converter = MainControlsListConverter.class)
    @ColumnTransformer(write = "?::jsonb")
    private List<MainControls> main_controls;

    @Column(name = "has_filters", columnDefinition = "boolean default false")
    private boolean has_filters;

    @Column(name = "has_main_controls", columnDefinition = "boolean default false")
    private boolean has_main_controls;
}
