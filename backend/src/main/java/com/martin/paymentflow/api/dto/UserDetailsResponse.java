package com.martin.paymentflow.api.dto;

import java.math.BigDecimal;

public class UserDetailsResponse {

    private Long id;
    private String fullName;
    private BigDecimal balance;
    private boolean isAdmin;
    private boolean isDeactivated;

    public UserDetailsResponse() {
    }

    public UserDetailsResponse(Long id, String fullName, BigDecimal balance, boolean isAdmin, boolean isDeactivated) {
        this.id = id;
        this.fullName = fullName;
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