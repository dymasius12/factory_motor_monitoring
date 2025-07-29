import json
import logging
import signal
import sys
import time
from datetime import datetime
from typing import Dict, Any

import pika
from pika.exceptions import AMQPConnectionError, AMQPChannelError

from config import Config
from database import DatabaseManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class AlertProcessor:
    def __init__(self, config: Config):
        self.config = config
        self.db_manager = DatabaseManager(config)
        self.connection = None
        self.channel = None
        self.should_stop = False
        
        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        logger.info(f"Received signal {signum}, initiating graceful shutdown...")
        self.should_stop = True
        if self.connection and not self.connection.is_closed:
            self.connection.close()
    
    def connect_rabbitmq(self):
        """Establish RabbitMQ connection and setup exchanges/queues"""
        try:
            # Establish connection
            parameters = pika.URLParameters(self.config.RABBITMQ_URL)
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            # Declare exchanges
            self.channel.exchange_declare(
                exchange=self.config.MOTOR_ALERTS_EXCHANGE,
                exchange_type='fanout',
                durable=True
            )
            
            self.channel.exchange_declare(
                exchange=self.config.MOTOR_NOTIFICATIONS_EXCHANGE,
                exchange_type='fanout',
                durable=True
            )
            
            # Declare and bind queue for motor.alerts
            self.channel.queue_declare(
                queue=self.config.MOTOR_ALERTS_QUEUE,
                durable=True
            )
            
            self.channel.queue_bind(
                exchange=self.config.MOTOR_ALERTS_EXCHANGE,
                queue=self.config.MOTOR_ALERTS_QUEUE
            )
            
            # Set QoS to control message prefetch
            self.channel.basic_qos(prefetch_count=self.config.PREFETCH_COUNT)
            
            logger.info("Connected to RabbitMQ and setup exchanges/queues")
            return True
            
        except AMQPConnectionError as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error connecting to RabbitMQ: {e}")
            return False
    
    def disconnect_rabbitmq(self):
        """Close RabbitMQ connection"""
        if self.connection and not self.connection.is_closed:
            self.connection.close()
            logger.info("Disconnected from RabbitMQ")
    
    def parse_alert_message(self, message_body: str) -> Dict[str, Any]:
        """Parse alert message from JSON"""
        try:
            alert_data = json.loads(message_body)
            
            # Validate required fields
            required_fields = ['motorId', 'timestamp', 'sensorType', 'value', 'alertType']
            for field in required_fields:
                if field not in alert_data:
                    raise ValueError(f"Missing required field: {field}")
            
            # Parse timestamp
            timestamp = datetime.fromisoformat(alert_data['timestamp'].replace('Z', '+00:00'))
            
            return {
                'motor_id': alert_data['motorId'],
                'sensor_type': alert_data['sensorType'],
                'timestamp': timestamp,
                'value': float(alert_data['value']),
                'alert_type': alert_data['alertType']
            }
            
        except (json.JSONDecodeError, ValueError, KeyError) as e:
            logger.error(f"Failed to parse alert message: {e}")
            raise
    
    def publish_notification(self, alert_data: Dict[str, Any], alert_id: int):
        """Publish notification to motor.notifications exchange"""
        try:
            notification = {
                'alertId': alert_id,
                'motorId': alert_data['motor_id'],
                'sensorType': alert_data['sensor_type'],
                'timestamp': alert_data['timestamp'].isoformat(),
                'value': alert_data['value'],
                'alertType': alert_data['alert_type'],
                'processedAt': datetime.utcnow().isoformat()
            }
            
            message = json.dumps(notification)
            
            self.channel.basic_publish(
                exchange=self.config.MOTOR_NOTIFICATIONS_EXCHANGE,
                routing_key='',
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Make message persistent
                    content_type='application/json'
                )
            )
            
            logger.info(f"Published notification for alert ID: {alert_id}")
            
        except Exception as e:
            logger.error(f"Failed to publish notification: {e}")
            # Don't raise here as the alert was already saved to database
    
    def process_alert(self, ch, method, properties, body):
        """Process a single alert message"""
        try:
            # Parse the alert message
            alert_data = self.parse_alert_message(body.decode('utf-8'))
            
            logger.info(f"Processing alert for motor {alert_data['motor_id']}: "
                       f"{alert_data['sensor_type']} = {alert_data['value']}")
            
            # Insert alert into database
            alert_id = self.db_manager.insert_alert(
                motor_id=alert_data['motor_id'],
                sensor_type=alert_data['sensor_type'],
                timestamp=alert_data['timestamp'],
                value=alert_data['value'],
                alert_type=alert_data['alert_type']
            )
            
            # Publish notification
            self.publish_notification(alert_data, alert_id)
            
            # Acknowledge the message
            ch.basic_ack(delivery_tag=method.delivery_tag)
            
            logger.info(f"Successfully processed alert ID: {alert_id}")
            
        except Exception as e:
            logger.error(f"Failed to process alert: {e}")
            # Reject the message and don't requeue to avoid infinite loops
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    
    def start_consuming(self):
        """Start consuming messages from the motor.alerts queue"""
        try:
            logger.info("Starting to consume messages from motor.alerts queue...")
            
            self.channel.basic_consume(
                queue=self.config.MOTOR_ALERTS_QUEUE,
                on_message_callback=self.process_alert
            )
            
            logger.info("Waiting for messages. To exit press CTRL+C")
            
            # Start consuming with timeout to allow for graceful shutdown
            while not self.should_stop:
                try:
                    self.connection.process_data_events(time_limit=1)
                except KeyboardInterrupt:
                    logger.info("Received keyboard interrupt")
                    break
                except Exception as e:
                    logger.error(f"Error processing data events: {e}")
                    break
            
            logger.info("Stopped consuming messages")
            
        except Exception as e:
            logger.error(f"Error in start_consuming: {e}")
            raise
    
    def run(self):
        """Main run method"""
        logger.info("Starting Alert Processor...")
        
        try:
            # Connect to database
            if not self.db_manager.connect():
                logger.error("Failed to connect to database")
                return False
            
            # Create tables if they don't exist
            if not self.db_manager.create_tables():
                logger.error("Failed to create database tables")
                return False
            
            # Connect to RabbitMQ
            if not self.connect_rabbitmq():
                logger.error("Failed to connect to RabbitMQ")
                return False
            
            # Start consuming messages
            self.start_consuming()
            
        except Exception as e:
            logger.error(f"Unexpected error in run: {e}")
            return False
        
        finally:
            # Cleanup
            self.disconnect_rabbitmq()
            self.db_manager.disconnect()
            logger.info("Alert Processor stopped")
        
        return True

def main():
    """Main entry point"""
    config = Config()
    processor = AlertProcessor(config)
    
    try:
        success = processor.run()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt, shutting down...")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

