# 👤 Distributed Notification System — User Service

**User Service (NestJS + PostgreSQL + Redis)**  
Part of the **Distributed Notification System (Microservices & Message Queues)** project.

This microservice manages **user accounts**, **contact information**, and **notification preferences**.  
It exposes REST APIs that allow other services — like the **API Gateway** and **Template Service** — to retrieve and manage user data.

---
## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Context](#architecture-context)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Standardized Response Interface](standardized-response-interface)
- [Docker Setup](#docker-setup)
- [Health Monitoring](#health-and-monitoring)
- [CI/CD Workflow](#cicd-workflow)
- [Author](#author)
- [License](#license)

## Overview

The **User Service** is responsible for:
- Creating and managing user accounts.
- Storing user contact information (email, push tokens, etc.).
- Managing user notification preferences (opt-in/out, locale, rate limits).
- Exposing REST APIs for other services.
- Caching preferences in Redis for performance.
- Integrating with the shared RabbitMQ broker for asynchronous workflows.

This service is one of five microservices in the **Distributed Notification System**:

| # | Service | Repo | Owner | Description |
|---|----------|------|--------|--------------|
| 1️⃣ | API Gateway | [`distributed-notification-system-api-gateway`](https://github.com/distributed-notification-system-api-gateway) | Alexander | Entry point for all notification requests. Publishes to RabbitMQ. |
| **2️⃣** | **User Service** | [`distributed-notification-system-user-service`](https://github.com/distributed-notification-system-user-service) | **Gift** | Manages users and preferences. |
| 3️⃣ | Template Service | [`distributed-notification-system-template-service`](https://github.com/distributed-notification-system-template-service) | Precious | Stores and renders templates. |
| 4️⃣ | Email Service | [`distributed-notification-system-email-service`](https://github.com/distributed-notification-system-email-service) | Emzy | Sends email notifications. |
| 5️⃣ | Push Service | [`distributed-notification-system-push-service`](https://github.com/distributed-notification-system-push-service) | Emzy | Sends mobile/web push notifications. |
| 6️⃣ | Shared Contracts | [`distributed-notification-system-shared-contracts`](https://github.com/distributed-notification-system-shared-contracts) | All | Shared message/response interfaces. |

---

##  Architecture Context

┌──────────────────────────────┐  
│ API Gateway │  
│ (Publishes to RabbitMQ) │  
└──────────────┬───────────────┘  
│ REST  
▼  
┌──────────────────────────────┐  
│ User Service │  
│ (User Data + Preferences DB) │  
└──────────────┬───────────────┘  
│  
▼  
PostgreSQL + Redis  
---
## Tech Stack

| Component | Technology |
|------------|-------------|
| Framework | [NestJS](https://nestjs.com/) |
| Language | TypeScript |
| Database | PostgreSQL |
| Cache | Redis |
| Message Queue | RabbitMQ |
| Container | Docker |
| Package Manager | PNPM or NPM |
| Testing | Jest |

---
## Installation
Clone the repository:

```bash
git clone https://github.com/<your-org>/distributed-notification-system-user-service.git  

cd distributed-notification-system-user-service
```
### Install dependencies:
```
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and configure it:

```
SERVICE_NAME=user-service
PORT=3001

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=usersdb

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ (CloudAMQP)
RABBITMQ_URL=amqps://<user>:<password>@<cloudamqp-url>/<vhost>
TEMPLATE_SERVICE_URL=https://template-service.team.cloud
API_GATEWAY_URL=https://gateway.team.cloud
```
---

## Project Structure
```
distributed-notification-system-user-service/
├── src/
│ ├── app.module.ts
│ ├── main.ts
│ ├── users/
│ │ ├── dto/
│ │ ├── entities/
│ │ ├── users.controller.ts
│ │ ├── users.service.ts
│ │ └── users.module.ts
│ ├── rabbitmq/
│ │ └── rabbitmq.service.ts
│ ├── redis/
│ │ └── redis.module.ts
│ └── health/
│ └── health.module.ts
├── package.json
├── .env
├── .env.example
└── README.md
```
## Quick Start
```
npm run start:dev
```

The service will start on:
```
http://localhost:3001

```

## API Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| **POST** | [`/api/users`](#post-apiusers) | Create a new user and publish a welcome notification |
| **GET** | [`/api/users/:id`](#get-apiusersid) | Retrieve user details by ID |
| **GET** | [`/api/users/:id/preferences`](#get-apiusersidpreferences) | Get a user's notification preferences |
| **PUT** | [`/api/users/:id/preferences`](#put-apiusersidpreferences) | Update a user's notification preferences |
| **GET** | [`/health`](#get-health) | Health check for service availability |
| **GET** | [`/ready`](#get-ready) | Readiness check (database + Redis connectivity) |
      

### Example Response Format
```
{
  "success": true,  
  "data": {  
    "id": "uuid",  
    "email": "user@example.com",  
    "preference": {  
      "email_opt_in": true,  
      "push_opt_in": false,  
      "locale": "en",  
      "rate_limit_per_min": 60  
    }  
  },  
  "message": "ok"  
}

```

## Database Schema

### users table

| Column        | Type      | Notes          |
| ------------- | --------- | -------------- |
| id            | UUID (PK) | Auto-generated |
| email         | VARCHAR   | Unique         |
| password_hash | VARCHAR   | Hashed         |
| push_token    | VARCHAR   | Optional       |
| created_at    | TIMESTAMP | Default: now() |  

### preferences table
| Column             | Type      | Notes                  |
| ------------------ | --------- | ---------------------- |
| id                 | UUID (PK) | Auto-generated         |
| user_id            | UUID (FK) | References `users(id)` |
| email_opt_in       | BOOLEAN   | Default: true          |
| push_opt_in        | BOOLEAN   | Default: true          |
| locale             | VARCHAR   | Default: 'en'          |
| rate_limit_per_min | INTEGER   | Default: 60            |  




### Service Responsibilities
| Function            | Type        | Description                            |
| ------------------- | ----------- | -------------------------------------- |
| **User Creation**   | REST        | Register new users                     |
| **Preferences API** | REST        | Read/Update notification preferences   |
| **Cache Layer**     | Redis       | Cache user preferences for API Gateway |
| **Integration**     | REST + AMQP | Provides user data to other services   |
| **Health Checks**   | REST        | `/health` and `/ready` endpoints       |  
 

## Standardized Response Interface

### All responses must follow the shared contract:
```
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
  meta?: {
    total: number;
    limit: number;
    page: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}
```


##  Docker Setup

### Build the image
```
docker build -t distributed-notification-system-user-service .
```
### Run locally
```
docker run -p 3001:3001 --env-file .env distributed-notification-system-user-service
```
### Or use Docker Compose
```
docker compose up -d
```

### Running Tests
```
pnpm test
```


## CI/CD Workflow

This service uses GitHub Actions for automatic build and deployment.

### .github/workflows/deploy.yaml
```
name: CI/CD
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: docker build -t ghcr.io/distributed-notification-system-user-service:latest .
      - run: docker push ghcr.io/distributed-notification-system-user-service:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        run: ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_IP }} \
          "docker pull ghcr.io/distributed-notification-system-user-service:latest && docker compose up -d"
```

## Health and Monitoring
| Endpoint                | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| `/health`               | Returns basic heartbeat `{ success: true, message: 'ok' }` |
| `/ready`                | Checks DB + Redis + RabbitMQ connection                    |
| `/metrics` *(optional)* | Prometheus metrics (if enabled)                            |
  


## Integration with Other Services
| Consumer         | Method                           | Description                                           |
| ---------------- | -------------------------------- | ----------------------------------------------------- |
| API Gateway      | `GET /api/users/:id/preferences` | Fetches user preferences before sending notifications |
| Template Service | —                                | (Optional future integration for personalization)     |



## Part of the Distributed Notification System
| Service                 | Responsibility                                         |
| ----------------------- | ------------------------------------------------------ |
| **API Gateway**         | Entry point; routes and publishes messages to RabbitMQ |
| **User Service (this)** | Manages user data and preferences                      |
| **Template Service**    | Renders templates with variables                       |
| **Email Service**       | Sends email notifications                              |
| **Push Service**        | Sends push notifications                               |


## Author

Aghaulor Gift
Role: Full Stack Developer  
Focus for current project: Backend (NestJS, PostgreSQL, Redis, RabbitMQ)  
Email:[Email](mailto:aghaulor.gift@gmail.com)

## License

This project is part of the Distributed Notification System task under Backend Task: Microservices & Message Queues.