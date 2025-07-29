# Node.js Sensor Data Ingestion Service

This service provides an HTTP API endpoint for receiving sensor data from factory motors, validates the data, checks against predefined thresholds, and publishes alerts to a RabbitMQ message queue.

## Features

- HTTP POST endpoint `/api/sensor` for receiving sensor data
- Input validation for all required fields
- Threshold checking for vibration (> 2.5g) and temperature (> 80°C)
- RabbitMQ integration for publishing alerts
- CORS support for frontend integration
- Health check endpoint

## Installation

```bash
npm install
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `RABBITMQ_URL`: RabbitMQ connection URL (default: amqp://localhost)

## Usage

```bash
npm start
```

## API Endpoints

### POST /api/sensor

Accepts sensor data and processes alerts.

**Request Body:**
```json
{
  "motorId": "MTR-01",
  "timestamp": "2025-07-17T10:15:00Z",
  "vibration": 3.2,
  "temperature": 85.1
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Sensor data processed",
  "alertsTriggered": 2,
  "alerts": [
    {
      "sensorType": "vibration",
      "alertType": "high_vibration",
      "value": 3.2
    },
    {
      "sensorType": "temperature",
      "alertType": "high_temperature",
      "value": 85.1
    }
  ]
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-28T10:15:00Z"
}
```

## Testing

You can test the service using curl:

```bash
curl -X POST http://localhost:3000/api/sensor \
  -H "Content-Type: application/json" \
  -d '{
    "motorId": "MTR-01",
    "timestamp": "2025-07-17T10:15:00Z",
    "vibration": 3.2,
    "temperature": 85.1
  }'
```

