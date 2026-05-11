package com.zipflow.zipflowserver.configurations;

import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableJpaRepositories(basePackages = {"com.zipflow.zipflowserver.repository"})
public class MainConfig {
    private final EntityManagerFactoryBuilder builder;
    private final DataSource dataSource;

    public MainConfig(EntityManagerFactoryBuilder builder, DataSource dataSource) {
        this.builder = builder;
        this.dataSource = dataSource;
    }

    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory() {
        return builder
                .dataSource(dataSource)
                .packages("com.zipflow.zipflowserver.entities")
                .properties(getJpaProperties())
                .build();
    }

    private Map<String, String> getJpaProperties() {
        Map<String, String> jpaProperties = new HashMap<>();
        jpaProperties.put("hibernate.ddl-auto", "update");
        jpaProperties.put("hibernate.hbm2ddl.auto", "update");
        jpaProperties.put("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        return jpaProperties;
    }
}
