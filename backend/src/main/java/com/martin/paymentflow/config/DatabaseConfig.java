package com.martin.paymentflow.config;

import javax.sql.DataSource;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import com.zaxxer.hikari.HikariDataSource;

@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    @ConfigurationProperties(prefix = "spring.datasource.hikari")
    public DataSource dataSource() {
        String url = System.getenv("DATABASE_URL");

        // Convert Railway's postgresql:// to jdbc:postgresql://
        if (url != null && url.startsWith("postgresql://")) {
            url = "jdbc:" + url;
        } else if (url != null && url.startsWith("postgres://")) {
            url = "jdbc:postgresql://" + url.substring("postgres://".length());
        }

        // Fall back to DB_URL or local default
        if (url == null) {
            url = System.getenv("DB_URL");
        }
        if (url == null) {
            url = "jdbc:postgresql://localhost:5432/paymentflow_db";
        }

        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(url);
        ds.setUsername(System.getenv().getOrDefault("PGUSER",
                       System.getenv().getOrDefault("DB_USERNAME", "user")));
        ds.setPassword(System.getenv().getOrDefault("PGPASSWORD",
                       System.getenv().getOrDefault("DB_PASSWORD", "")));
        ds.setDriverClassName("org.postgresql.Driver");
        return ds;
    }
}