##SkillSync - A complete microservice system for Coders and 

Project Root(Monorepo)
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
│
└── frontend/

Explanation:
api-gateway → routes requests to services
services → each microservice
shared → reusable code
docker → container configs
frontend → React app

API Gateway Structure
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

Auth Service Structure

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

User Service Structure

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


Project Service Structure
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
│   │   │── project.model.js
│   │   └── task.model.js
│   │
│   ├── services/
│   │   └── project.service.js
│   │
│   ├── repository/
│   │   └── project.repository.js
│   │
│   └── server.js

Chat Service Structure

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


Notification Service Structure
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

Shared Folder
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

Docker Deployment Structure
docker/
│
├── docker-compose.yml
│
└── kubernetes/
    ├── auth-deployment.yaml
    ├── user-deployment.yaml
    └── project-deployment.yaml


Frontend 
frontend/
│
├── src/
│   ├── pages/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── store/
│   └── App.jsx



PORTS of All the services
API Gateway → 3000
Auth Service → 3001
User Service → 3002
Project Service → 3003
Chat Service → 3004
Hackathon Service → 3005
Notification Service → 3006
