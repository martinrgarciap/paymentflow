# PaymentFlow

PaymentFlow is a full-stack payments dashboard project built to simulate a modern payment operations system.

The project is designed to showcase how a frontend application can interact with a backend API to create, manage, search, and update payment records. It focuses on building a clean API, structured backend architecture, and a frontend that can later visualize and manage payment activity.

## Overview

The application allows users to:

- create payment records
- view all payments
- retrieve individual payments by transaction ID
- update payment statuses
- search and filter payments by key fields
- work with realistic payment-related data such as amount, currency, and status

The project is being built to demonstrate practical full-stack development using Java, Spring Boot, PostgreSQL, React, and TypeScript.

## Tech Stack

### Backend

- Java
- Spring Boot
- Spring Data JPA
- Hibernate
- PostgreSQL
- Maven
- Spring Validation
- Spring Boot Actuator

### Testing

- JUnit 5
- Mockito
- MockMvc
- H2 in-memory database for integration tests

### Frontend

- React
- TypeScript

## API Summary

The backend exposes a REST API for managing payment data.

### Main capabilities

- create payments
- retrieve all payments
- retrieve a payment by transaction ID
- update payment status
- filter and search payment records
- expose a health check endpoint

### Current API endpoints

- `POST /api/payments`
- `GET /api/payments`
- `GET /api/payments/{transactionId}`
- `PATCH /api/payments/{transactionId}/status`
- `GET /api/payments/filter`
- `GET /actuator/health`

## What the API Uses

The API uses:

- Spring Boot for application setup and REST endpoints
- Spring Data JPA and Hibernate for persistence
- PostgreSQL for development data storage
- H2 for integration testing
- validation annotations for request validation
- global exception handling for cleaner API responses

## What the API Does

The API handles the core payment workflow for the project, including:

- receiving payment data from clients
- validating request input
- generating and storing payment records
- tracking payment status
- returning structured JSON responses
- supporting search and filtering features
- exposing health information for the running application

## Running the Backend

From the `backend` folder:

```bash
mvn spring-boot:run

The API runs locally on:

http://localhost:8080
Running Tests

From the backend folder:

mvn test
Project Structure
paymentflow/
  backend/
  frontend/
  README.md
Current Status

The backend API is implemented and tested.

The frontend is the next major phase of the project and will consume the existing API to display and manage payment data through a dashboard interface.

Purpose

This project was created to practice building a real-world style full-stack application with a strong backend foundation and a frontend that can grow on top of it.
```
