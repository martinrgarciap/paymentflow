package com.martin.paymentflow.api.dto;

import java.math.BigDecimal;

public class MeResponse {

    private Long id;
    private String fullName;
    private String email;
    private BigDecimal balance;
    private boolean isAdmin;
    private boolean isDeactivated;

    public MeResponse() {
    }

    public MeResponse(Long id, String fullName, String email, BigDecimal balance, boolean isAdmin, boolean isDeactivated) {
        this.id = id;
        this.fullName = fullName;
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

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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