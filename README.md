# 🚀 SkillSync - Microservices Monorepo

SkillSync is a scalable microservices-based platform designed for collaboration, hackathons, and project management.

---
## 🧩 System Architecture Diagram

```mermaid
flowchart TD

    Client[👤 Client / Frontend (React)] -->|HTTP Requests| Gateway[🌐 API Gateway :3000]

    subgraph Microservices
        Auth[🔐 Auth Service :3001]
        User[👤 User Service :3002]
        Project[📁 Project Service :3003]
        Chat[💬 Chat Service :3004]
        Hackathon[🏆 Hackathon Service :3005]
        Notification[🔔 Notification Service :3006]
    end

    Gateway --> Auth
    Gateway --> User
    Gateway --> Project
    Gateway --> Chat
    Gateway --> Hackathon

    User --> Notification
    Project --> Notification
    Hackathon --> Notification

    Chat <-->|WebSocket| Client

    subgraph Shared Layer
        Redis[(⚡ Redis Cache)]
        Utils[🧰 Shared Utils]
    end

    Auth --> Redis
    User --> Redis
    Project --> Redis

    Auth --> Utils
    User --> Utils
    Project --> Utils

    subgraph Deployment
        Docker[🐳 Docker]
        K8s[☸️ Kubernetes]
    end

    Docker --> Microservices
    K8s --> Microservices
```

## 📁 Project Structure

```
skillsync/
│
├── api-gateway/
├── services/
│   ├── auth-service/
│   ├── user-service/
│   ├── project-service/
│   ├── hackathon-service/
│   ├── chat-service/
│   └── notification-service/
│
├── shared/
│   ├── config/
│   ├── middleware/
│   └── utils/
│
├── docker/
│   ├── docker-compose.yml
│   └── kubernetes/
│
├── docs/
└── frontend/
```

---

## 🧠 Architecture Overview

- API Gateway → Routes client requests to services  
- Microservices → Domain-based independent services  
- Shared → Common utilities and configs  
- Docker/Kubernetes → Deployment and scaling  
- Frontend → React application  

---

## 🌐 API Gateway Structure

```
api-gateway/
│
├── src/
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── project.routes.js
│   │   └── hackathon.routes.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── rateLimiter.js
│   │
│   ├── services/
│   │   └── proxyService.js
│   │
│   ├── config/
│   │   └── gatewayConfig.js
│   │
│   └── server.js
│
└── package.json
```

---

## 🔐 Auth Service

```
auth-service/
│
├── src/
│   ├── controllers/
│   │   └── auth.controller.js
│   │
│   ├── routes/
│   │   └── auth.routes.js
│   │
│   ├── models/
│   │   └── user.model.js
│   │
│   ├── services/
│   │   └── auth.service.js
│   │
│   ├── middleware/
│   │   └── authValidation.js
│   │
│   ├── config/
│   │   └── db.js
│   │
│   └── server.js
│
└── package.json
```

---

## 👤 User Service

```
user-service/
│
├── src/
│   ├── controllers/
│   │   └── user.controller.js
│   │
│   ├── routes/
│   │   └── user.routes.js
│   │
│   ├── models/
│   │   └── profile.model.js
│   │
│   ├── services/
│   │   └── user.service.js
│   │
│   ├── repository/
│   │   └── user.repository.js
│   │
│   ├── events/
│   │   └── user.events.js
│   │
│   └── server.js
```

---

## 📁 Project Service

```
project-service/
│
├── src/
│   ├── controllers/
│   │   └── project.controller.js
│   │
│   ├── routes/
│   │   └── project.routes.js
│   │
│   ├── models/
│   │   ├── project.model.js
│   │   └── task.model.js
│   │
│   ├── services/
│   │   └── project.service.js
│   │
│   ├── repository/
│   │   └── project.repository.js
│   │
│   └── server.js
```

---

## 💬 Chat Service

```
chat-service/
│
├── src/
│   ├── sockets/
│   │   └── chat.socket.js
│   │
│   ├── controllers/
│   │   └── chat.controller.js
│   │
│   ├── models/
│   │   └── message.model.js
│   │
│   ├── services/
│   │   └── chat.service.js
│   │
│   └── server.js
```

---

## 🔔 Notification Service

```
notification-service/
│
├── src/
│   ├── consumers/
│   │   └── notification.consumer.js
│   │
│   ├── producers/
│   │   └── notification.producer.js
│   │
│   ├── services/
│   │   └── email.service.js
│   │
│   └── server.js
```

---

## 🔁 Shared Module

```
shared/
│
├── config/
│   ├── redis.js
│   └── env.js
│
├── middleware/
│   └── logger.js
│
└── utils/
    ├── errorHandler.js
    └── responseFormatter.js
```

---

## 🐳 Docker & Deployment

```
docker/
│
├── docker-compose.yml
│
└── kubernetes/
    ├── auth-deployment.yaml
    ├── user-deployment.yaml
    └── project-deployment.yaml
```

---

## 🎨 Frontend (React)

```
frontend/
│
├── src/
│   ├── pages/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── store/
│   └── App.jsx
```

---

## 🔌 Service Ports

| Service               | Port  |
|----------------------|------|
| API Gateway          | 3000 |
| Auth Service         | 3001 |
| User Service         | 3002 |
| Project Service      | 3003 |
| Chat Service         | 3004 |
| Hackathon Service    | 3005 |
| Notification Service | 3006 |

---

## ⚙️ Tech Stack

- Backend: Node.js, Express  
- Frontend: React  
- Database: MongoDB / PostgreSQL  
- Message Broker: Kafka / RabbitMQ  
- Cache: Redis  
- Containerization: Docker  
- Orchestration: Kubernetes  

---

## 🚀 Getting Started

```bash
git clone https://github.com/your-repo/skillsync.git
cd skillsync
docker-compose up --build
```

---

## 📌 Features

- Microservices Architecture  
- API Gateway Routing  
- Real-time Chat (WebSockets)  
- Event-driven Notifications  
- Scalable Deployment  
- Shared Utilities  

---

## 📄 License

MIT License