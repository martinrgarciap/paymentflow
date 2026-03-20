```markdown
# PaymentFlow

A full-stack payments dashboard simulating a modern payment operations system. Built with Java Spring Boot and React + TypeScript, deployed live on Railway and Vercel.

🔗 **Live Demo:** [paymentflow-khaki.vercel.app](https://paymentflow-khaki.vercel.app)

---

## Project Structure
```

paymentflow/
├── backend/ # Spring Boot REST API
└── frontend/ # React + TypeScript dashboard

````

---

## Tech Stack

**Backend**
- Java 21, Spring Boot, Spring Data JPA, Hibernate
- PostgreSQL (production), H2 (testing)
- Maven
- Spring Validation, Spring Boot Actuator

**Frontend**
- React 19, TypeScript, Vite
- Tailwind CSS, shadcn/ui
- React Router

**Testing**
- JUnit 5, Mockito, MockMvc
- H2 in-memory database (integration tests)

**Deployment**
- Backend + PostgreSQL: Railway
- Frontend: Vercel

---

## Getting Started

### Prerequisites
- Java 21+
- Node.js 22+
- PostgreSQL running locally

### Backend

```bash
cd backend
mvn spring-boot:run
````

Runs on `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`

> The frontend proxies `/api` requests to `http://localhost:8080` via Vite's dev server config — no CORS setup needed locally.

---

## API Reference

| Method  | Endpoint                               | Description                                        |
| ------- | -------------------------------------- | -------------------------------------------------- |
| `POST`  | `/api/payments`                        | Create a payment                                   |
| `GET`   | `/api/payments`                        | Get all payments (paginated)                       |
| `GET`   | `/api/payments/{transactionId}`        | Get payment by transaction ID                      |
| `PATCH` | `/api/payments/{transactionId}/status` | Update payment status                              |
| `GET`   | `/api/payments/search`                 | Full-text search across sender, recipient, ID      |
| `GET`   | `/api/payments/filter`                 | Filter by transactionId, sender, recipient, status |
| `GET`   | `/actuator/health`                     | Health check                                       |

All paginated endpoints support `?page=0&size=50` query params and return a Spring `Page<PaymentResponse>` object.

---

## Running Tests

```bash
cd backend
mvn test
```

---

## Features

**Dashboard**

- Stat cards showing total, pending, completed, failed, and reversed counts with per-status risk flag counts
- Real-time search across transaction ID, sender name, and recipient name
- Filter by status and risk flag independently or combined
- Sortable, paginated transaction table (50 per page)
- Transaction details modal with contextual actions based on status:
  - Pending → Approve, Flag, Deny
  - Flagged → Approve, Deny
  - Completed → Reverse
  - Failed → Try Again
  - Reversed → View only
- Fully responsive — hamburger nav, adaptive stat card grid, and horizontally scrollable table with sticky Action column on mobile

**Send Payment**

- Two-step flow with confirmation screen before submission
- Live summary preview as you type
- High-value transfer warning for amounts ≥ $5,000 (auto-set to PENDING for admin review)
- Pending approval vs success modal based on returned status

**Backend**

- Automatic risk flagging for high-value transactions
- Pagination, sorting, full-text search, and combined filtering via Spring Data JPA
- Structured error handling and input validation
- Health monitoring via Spring Actuator
- Environment-based configuration for local and production profiles

```

```
