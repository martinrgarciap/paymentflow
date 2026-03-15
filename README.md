# PaymentFlow

A full-stack payments dashboard simulating a modern payment operations system. Built with Spring Boot and React.

---

## Project Structure

```
paymentflow/
├── backend/    # Spring Boot REST API
└── frontend/   # React + TypeScript dashboard
```

---

## Tech Stack

**Backend**

- Java, Spring Boot, Spring Data JPA, Hibernate
- PostgreSQL
- Maven
- Spring Validation, Spring Boot Actuator

**Frontend**

- React, TypeScript

**Testing**

- JUnit 5, Mockito, MockMvc
- H2 in-memory database (integration tests)

---

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL running locally

### Backend

```bash
cd backend
mvn spring-boot:run
```

Runs on `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## API Reference

| Method  | Endpoint                               | Description                |
| ------- | -------------------------------------- | -------------------------- |
| `POST`  | `/api/payments`                        | Create a payment           |
| `GET`   | `/api/payments`                        | Get all payments           |
| `GET`   | `/api/payments/{transactionId}`        | Get payment by ID          |
| `PATCH` | `/api/payments/{transactionId}/status` | Update payment status      |
| `GET`   | `/api/payments/filter`                 | Filter and search payments |
| `GET`   | `/actuator/health`                     | Health check               |

---

## Running Tests

```bash
cd backend
mvn test
```

---

## Features

- Create and manage payment records
- Search and filter by transaction ID, sender, recipient, and status
- Automatic risk flagging for high-value transactions
- Structured error handling and input validation
- Health monitoring via Spring Actuator
