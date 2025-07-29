const fs = require('fs');
const path = require('path');

// Test script to send sample sensor data to the ingestion service
const BASE_URL = 'http://localhost:3000';

async function sendSensorData(data) {
  try {
    const response = await fetch(`${BASE_URL}/api/sensor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    console.log('---');
    
    return result;
  } catch (error) {
    console.error('Error sending data:', error.message);
  }
}

async function testWithSampleData() {
  console.log('Testing Node.js Sensor Data Ingestion Service\n');
  
  // Test 1: Valid data with no alerts
  console.log('Test 1: Valid data with no alerts');
  await sendSensorData({
    motorId: "MTR-01",
    timestamp: "2025-07-28T10:15:00Z",
    vibration: 2.0,
    temperature: 75.0
  });
  
  // Test 2: Valid data with vibration alert
  console.log('Test 2: Valid data with vibration alert');
  await sendSensorData({
    motorId: "MTR-02",
    timestamp: "2025-07-28T10:16:00Z",
    vibration: 3.2,
    temperature: 75.0
  });
  
  // Test 3: Valid data with temperature alert
  console.log('Test 3: Valid data with temperature alert');
  await sendSensorData({
    motorId: "MTR-03",
    timestamp: "2025-07-28T10:17:00Z",
    vibration: 2.0,
    temperature: 85.1
  });
  
  // Test 4: Valid data with both alerts
  console.log('Test 4: Valid data with both alerts');
  await sendSensorData({
    motorId: "MTR-04",
    timestamp: "2025-07-28T10:18:00Z",
    vibration: 3.5,
    temperature: 90.0
  });
  
  // Test 5: Invalid data - missing field
  console.log('Test 5: Invalid data - missing field');
  await sendSensorData({
    motorId: "MTR-05",
    timestamp: "2025-07-28T10:19:00Z",
    vibration: 2.0
    // temperature missing
  });
  
  // Test 6: Invalid data - vibration <= 0
  console.log('Test 6: Invalid data - vibration <= 0');
  await sendSensorData({
    motorId: "MTR-06",
    timestamp: "2025-07-28T10:20:00Z",
    vibration: 0,
    temperature: 75.0
  });
  
  // Test 7: Invalid data - temperature <= -50
  console.log('Test 7: Invalid data - temperature <= -50');
  await sendSensorData({
    motorId: "MTR-07",
    timestamp: "2025-07-28T10:21:00Z",
    vibration: 2.0,
    temperature: -60.0
  });
}

async function testWithProvidedData() {
  console.log('\nTesting with provided sensor_data.jsonl\n');
  
  try {
    // Read the provided sensor data file
    const dataPath = path.join(__dirname, '..', 'upload', 'sensor_data.jsonl');
    const fileContent = fs.readFileSync(dataPath, 'utf8');
    const lines = fileContent.trim().split('\n');
    
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i];
      const data = JSON.parse(line);
      
      // Convert the data format to match our API
      const apiData = {
        motorId: data.motor_id,
        timestamp: data.timestamp,
        vibration: data.vibration_g,
        temperature: data.temperature_c
      };
      
      console.log(`Test with provided data ${i + 1}:`);
      await sendSensorData(apiData);
    }
  } catch (error) {
    console.error('Error reading provided data file:', error.message);
  }
}

// Run tests
if (require.main === module) {
  testWithSampleData()
    .then(() => testWithProvidedData())
    .catch(console.error);
}

module.exports = { sendSensorData, testWithSampleData, testWithProvidedData };

