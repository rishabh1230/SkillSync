export const rabbitMQConfig = {
  urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
  queue: 'project_queue',
  queueOptions: {
    durable: true,
  },
};

// Event patterns for communication
export const RMQ_PATTERNS = {
  // Project events
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  PROJECT_DELETED: 'project.deleted',
  
  // User verification (to user-service)
  USER_VERIFY: 'user.verify',
  
  // Auth verification (to auth-service)
  AUTH_VALIDATE_TOKEN: 'auth.validate.token',
};