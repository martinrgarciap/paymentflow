package com.martin.paymentflow.api.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AdminUserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private BigDecimal balance;

    @JsonProperty("isAdmin")
    private boolean isAdmin;

    @JsonProperty("isDeactivated")
    private boolean isDeactivated;

    public AdminUserResponse() {
    }

    public AdminUserResponse(
            Long id,
            String firstName,
            String lastName,
            String email,
            BigDecimal balance,
            boolean isAdmin,
            boolean isDeactivated
    ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.balance = balance;
        this.isAdmin = isAdmin;
        this.isDeactivated = isDeactivated;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    public void setAdmin(boolean admin) {
        isAdmin = admin;
    }

    public boolean isDeactivated() {
        return isDeactivated;
    }

    public void setDeactivated(boolean deactivated) {
        isDeactivated = deactivated;
    }
}