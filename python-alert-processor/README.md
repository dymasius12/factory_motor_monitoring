# Python Alert Processor

This service consumes alert messages from the RabbitMQ `motor.alerts` exchange, processes them, stores them in a PostgreSQL database, and publishes notifications to the `motor.notifications` exchange.

## Features

- Consumes messages from RabbitMQ `motor.alerts` exchange
- Parses alert messages into structured data
- Stores alerts in PostgreSQL `motor_alerts` table
- Publishes processed notifications to `motor.notifications` exchange
- Graceful shutdown handling
- Configurable via environment variables
- Comprehensive logging
- Database connection management
- Message acknowledgment and error handling

## Installation

```bash
pip3 install -r requirements.txt
```

## Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your actual configuration values:

- `RABBITMQ_URL`: RabbitMQ connection URL
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: PostgreSQL connection details
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR)
- `PREFETCH_COUNT`: Number of messages to prefetch from RabbitMQ

## Database Setup

The processor will automatically create the required tables and indexes when it starts. Ensure your PostgreSQL database exists and the user has appropriate permissions.

## Usage

```bash
python3 alert_processor.py
```

## Message Format

The processor expects alert messages in the following JSON format:

```json
{
  "motorId": "MTR-01",
  "timestamp": "2025-07-17T10:15:00Z",
  "sensorType": "vibration",
  "value": 3.2,
  "alertType": "high_vibration"
}
```

## Output Notifications

Processed alerts are published as notifications in the following format:

```json
{
  "alertId": 123,
  "motorId": "MTR-01",
  "sensorType": "vibration",
  "timestamp": "2025-07-17T10:15:00Z",
  "value": 3.2,
  "alertType": "high_vibration",
  "processedAt": "2025-07-17T10:15:05Z"
}
```

## Database Schema

The processor creates the following table:

```sql
CREATE TABLE motor_alerts (
    id SERIAL PRIMARY KEY,
    motor_id TEXT NOT NULL,
    sensor_type TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    value NUMERIC NOT NULL,
    alert_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

## Logging

The processor logs all important events including:
- Connection status to RabbitMQ and PostgreSQL
- Message processing status
- Errors and exceptions
- Graceful shutdown events

## Graceful Shutdown

The processor handles SIGINT and SIGTERM signals for graceful shutdown:
- Stops consuming new messages
- Processes any messages currently being handled
- Closes database and RabbitMQ connections
- Logs shutdown status

## Error Handling

- Invalid messages are rejected and not requeued to prevent infinite loops
- Database connection errors are logged and the processor will attempt to reconnect
- RabbitMQ connection errors are handled with appropriate logging

