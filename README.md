#  Distributed Notification System

A scalable **event-driven microservices architecture** for handling notifications (Email, Push, etc.) asynchronously using **RabbitMQ**, **Redis**, and **PostgreSQL**.  
Each service runs independently but communicates through a central message broker.

---

## Table of Contents
- [Overview](#-overview)
- [Microservices](#-microservices)
- [Architecture Diagram](#️-architecture-diagram)
- [Core Technologies](#️-core-technologies)
- [System Design Highlights](#-system-design-highlights)
- [Local Development](#-local-development)
- [CI/CD Workflow](#-cicd-workflow)
- [Environment Variables](#-environment-variables)
- [Health & Monitoring](#-health--monitoring)
- [Contributors](#-contributors)

---

## Overview
The Distributed Notification System is designed to process **high-volume notifications** efficiently with minimal latency and maximum reliability.  
It utilizes **asynchronous messaging** to decouple services and prevent cascading failures.

---

## Microservices
| Service | Description | Stack |
|----------|--------------|-------|
| **API Gateway** | Routes and authenticates external notification requests. | Node.js |
| **User Service** | Manages user data, preferences, and authentication. | NestJS / PostgreSQL / Redis |
| **Email Service** | Sends templated emails through SMTP or SendGrid API. | Node.js / |
| **Push Service** | Sends web and mobile push notifications via FCM. | Node.js / Firebase |
| **Template Service** | Stores and manages multilingual templates. | python/Flask / PostgreSQL |
| **Message Broker** | Routes messages between services asynchronously. | RabbitMQ |

---

## Architecture Diagram
[ Client ]  
↓  
[ API Gateway ]  
↓  
[ RabbitMQ Exchange ]  
├── Email Queue → Email Service  
├── Push Queue → Push Service  
└── Failed Queue → Dead Letter Queue  


Each service operates independently and communicates through **RabbitMQ** for reliability and scalability.

---

## Core Technologies
- **Node.js / NestJS** — Core microservice logic
- **RabbitMQ** — Asynchronous message broker
- **PostgreSQL** — Persistent storage
- **Redis** — Caching and rate-limiting
- **Docker + Docker Compose** — Containerized deployment
- **GitHub Actions** — CI/CD automation
- **JWT Auth** — Secure user authentication

---

## System Design Highlights
- **Asynchronous Messaging:** Services communicate via events, not direct calls.
- **Retry & Dead Letter Queues:** Failed messages are retried with exponential backoff.
- **Circuit Breaker Pattern:** Prevents total failure if one service goes down.
- **Health Probes:** `/health` and `/ready` endpoints for monitoring.
- **Scalability:** Each microservice runs as a separate container for horizontal scaling.

---

## Local Development
### Prerequisites
- Docker & Docker Compose
- Node.js 20+

### Run all services
```bash
docker compose up --build
```

### View running services
```
Service	URL
User Service	http://localhost:3001

RabbitMQ Dashboard	http://localhost:15672

Redis	localhost:6379
PostgreSQL	localhost:5432
```
## CI/CD Workflow

#### Stage	Action
- CI (Continuous Integration)	Lint, test, and build each service on every push.
- CD (Continuous Deployment)	Build and push Docker images to Docker Hub when main branch is updated.

---
### Workflows are located in:

.github/workflows/  
 ├── [ci.yml](.github/workflows/ci.yml)  
 └── [cd.yml](.github/workflows/cd.yml)  
---

## Environment Variables

Each service has its own .env file. Example:
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=usersdb
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
REDIS_HOST=redis
JWT_SECRET=your_jwt_secret
```
## Health & Monitoring

- /health → Reports general health

- /ready → Checks DB, Redis, and message broker connection

- Logs written to ./logs/user-service.log

## Contributors
|Name	|Role	|Service|
|-----|------|--------|
|[Aghaulor]()	|Full-stack Developer	|User Service|
|[Alexander]()|Backend Developer	|API Gateway Service|
|  [Emzy]()  |  Backend Developer    | Email Service|
|  [Emzy]()   |  Backend Developer     | Push Service|
|  [Precious]()   | Backend Developer      |Template|