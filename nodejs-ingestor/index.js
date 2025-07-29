const express = require('express');
const amqp = require('amqplib');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const EXCHANGE_NAME = 'motor.alerts';

// Middleware
app.use(cors());
app.use(express.json());

// RabbitMQ connection
let channel;

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    // For demo purposes, we'll continue without RabbitMQ
    console.log('Continuing without RabbitMQ connection...');
  }
}

// Validation function
function validateSensorData(data) {
  const { motorId, timestamp, vibration, temperature } = data;
  
  // Check if all required fields are present
  if (!motorId || !timestamp || vibration === undefined || temperature === undefined) {
    return { valid: false, error: 'All fields (motorId, timestamp, vibration, temperature) are required' };
  }
  
  // Validate vibration and temperature ranges
  if (vibration <= 0) {
    return { valid: false, error: 'Vibration must be greater than 0' };
  }
  
  if (temperature <= -50) {
    return { valid: false, error: 'Temperature must be greater than -50°C' };
  }
  
  // Validate timestamp format
  const timestampDate = new Date(timestamp);
  if (isNaN(timestampDate.getTime())) {
    return { valid: false, error: 'Invalid timestamp format' };
  }
  
  return { valid: true };
}

// Threshold checking function
function checkThresholds(data) {
  const { vibration, temperature } = data;
  const alerts = [];
  
  // Vibration threshold: > 2.5 g
  if (vibration > 2.5) {
    alerts.push({
      motorId: data.motorId,
      timestamp: data.timestamp,
      sensorType: 'vibration',
      value: vibration,
      alertType: 'high_vibration'
    });
  }
  
  // Temperature threshold: > 80°C
  if (temperature > 80) {
    alerts.push({
      motorId: data.motorId,
      timestamp: data.timestamp,
      sensorType: 'temperature',
      value: temperature,
      alertType: 'high_temperature'
    });
  }
  
  return alerts;
}

// Publish alert to RabbitMQ
async function publishAlert(alert) {
  if (channel) {
    try {
      const message = JSON.stringify(alert);
      channel.publish(EXCHANGE_NAME, '', Buffer.from(message));
      console.log('Alert published to RabbitMQ:', alert);
    } catch (error) {
      console.error('Failed to publish alert to RabbitMQ:', error);
    }
  } else {
    console.log('RabbitMQ not connected. Alert would be published:', alert);
  }
}

// API endpoint for sensor data
app.post('/api/sensor', async (req, res) => {
  try {
    // Validate input
    const validation = validateSensorData(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Check thresholds
    const alerts = checkThresholds(req.body);
    
    // Publish alerts if any
    for (const alert of alerts) {
      await publishAlert(alert);
    }
    
    // Return response
    const response = {
      status: 'success',
      message: 'Sensor data processed',
      alertsTriggered: alerts.length,
      alerts: alerts.map(alert => ({
        sensorType: alert.sensorType,
        alertType: alert.alertType,
        value: alert.value
      }))
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error processing sensor data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
  await connectRabbitMQ();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sensor Data Ingestion Service running on port ${PORT}`);
    console.log(`POST /api/sensor - Accept sensor data`);
    console.log(`GET /health - Health check`);
  });
}

startServer().catch(console.error);

