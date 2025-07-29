import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # RabbitMQ Configuration
    RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://localhost')
    MOTOR_ALERTS_EXCHANGE = os.getenv('MOTOR_ALERTS_EXCHANGE', 'motor.alerts')
    MOTOR_ALERTS_QUEUE = os.getenv('MOTOR_ALERTS_QUEUE', 'motor.alerts.queue')
    MOTOR_NOTIFICATIONS_EXCHANGE = os.getenv('MOTOR_NOTIFICATIONS_EXCHANGE', 'motor.notifications')
    
    # PostgreSQL Configuration
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'motor_monitoring')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')
    
    @property
    def database_url(self):
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    # Processing Configuration
    PREFETCH_COUNT = int(os.getenv('PREFETCH_COUNT', '10'))
    RETRY_ATTEMPTS = int(os.getenv('RETRY_ATTEMPTS', '3'))
    RETRY_DELAY = int(os.getenv('RETRY_DELAY', '5'))  # seconds

