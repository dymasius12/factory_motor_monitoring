# Factory Motor Health Monitoring System

## Project Summary

This project implements a modern maintenance platform for an automotive assembly plant to monitor motor health through vibration and temperature sensors. The system ingests sensor data, evaluates readings against thresholds, flags alerts, processes them, stores them in a database, and provides a dashboard for visualization.

### Components Developed

1. **Node.js Data Ingestion Service**
   - HTTP API endpoint for receiving sensor data
   - Input validation and threshold checking
   - Alert publishing to message queue

2. **Python Alert Processor**
   - Consumes alert messages from queue
   - Processes and stores alerts in PostgreSQL
   - Publishes notifications for dashboard

3. **SQL Database Schema & Queries**
   - Table definition for motor alerts
   - Queries for recent alerts and daily counts
   - Indexes for optimal performance

4. **React Frontend Dashboard**
   - Real-time display of active alerts
   - Motor status visualization
   - Charts for alert trends and statistics

5. **Presentation Slides**
   - 5-slide deck explaining the architecture and demo

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- Python 3.8+
- PostgreSQL
- RabbitMQ
- Modern web browser

### 1. Database Setup

```bash
# Create database
createdb motor_monitoring

# Run schema creation script
psql -d motor_monitoring -f sql/01_create_tables.sql

# (Optional) Load sample data
psql -d motor_monitoring -f sql/03_sample_data.sql
```

### 2. RabbitMQ Setup

```bash
# Install RabbitMQ (if not already installed)
# Ubuntu:
sudo apt-get install rabbitmq-server

# Start RabbitMQ service
sudo service rabbitmq-server start

# Verify RabbitMQ is running
sudo rabbitmqctl status
```

### 3. Node.js Service Setup

```bash
# Navigate to Node.js project directory
cd nodejs-ingestor

# Install dependencies
npm install

# Start the service
npm start
```

The Node.js service will run on port 3000 by default.

### 4. Python Alert Processor Setup

```bash
# Navigate to Python project directory
cd python-alert-processor

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env

# Edit .env file with your configuration
# Update database and RabbitMQ connection details

# Start the processor
python alert_processor.py
```

### 5. Frontend Dashboard Setup

```bash
# Navigate to frontend project directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will be available at http://localhost:5173

## Demo Instructions

### 1. Start All Services

Start each component in separate terminal windows:

```bash
# Terminal 1: Start Node.js service
cd nodejs-ingestor && npm start

# Terminal 2: Start Python processor
cd python-alert-processor && python alert_processor.py

# Terminal 3: Start frontend
cd frontend && npm run dev
```

### 2. Send Test Data

Use the test script to send sample sensor data:

```bash
# From the nodejs-ingestor directory
node test-data.js
```

Or use curl to send custom data:

```bash
curl -X POST http://localhost:3000/api/sensor \
  -H "Content-Type: application/json" \
  -d '{
    "motorId": "MTR-01",
    "timestamp": "2025-07-28T10:15:00Z",
    "vibration": 3.2,
    "temperature": 85.1
  }'
```

### 3. View Dashboard

Open http://localhost:5173 in your browser to see the dashboard with:
- Active alerts
- Motor status cards
- Daily alert count charts
- Alert trend visualization

### 4. Present Slides

To present the slides, open each HTML file in a browser:

```bash
# Open slides in browser
cd slides
# Open each HTML file in order:
# 1. system_overview.html
# 2. data_flow_architecture.html
# 3. nodejs_ingestion.html
# 4. python_processing.html
# 5. dashboard_demo.html
```

## Project Structure

```
.
├── nodejs-ingestor/           # Node.js data ingestion service
│   ├── index.js               # Main service code
│   ├── package.json           # Dependencies and scripts
│   ├── test-data.js           # Test script
│   └── README.md              # Service documentation
│
├── python-alert-processor/    # Python alert processor
│   ├── alert_processor.py     # Main processor code
│   ├── config.py              # Configuration handling
│   ├── database.py            # Database operations
│   ├── requirements.txt       # Python dependencies
│   ├── test_processor.py      # Test script
│   └── README.md              # Processor documentation
│
├── sql/                       # SQL scripts
│   ├── 01_create_tables.sql   # Schema creation
│   ├── 02_queries.sql         # Required queries
│   ├── 03_sample_data.sql     # Sample data insertion
│   └── README.md              # SQL documentation
│
├── frontend/                  # React frontend dashboard
│   ├── src/                   # Source code
│   │   ├── App.jsx            # Main dashboard component
│   │   └── ...                # Other components
│   ├── package.json           # Dependencies and scripts
│   └── README.md              # Frontend documentation
│
└── slides/                    # Presentation slides
    ├── system_overview.html   # Slide 1
    ├── data_flow_architecture.html # Slide 2
    ├── nodejs_ingestion.html  # Slide 3
    ├── python_processing.html # Slide 4
    └── dashboard_demo.html    # Slide 5
```

## Deployment Options

### Local Deployment

The setup instructions above are for local deployment. This is suitable for development and demonstration purposes.

### Production Deployment

For production deployment, consider:

1. **Node.js Service**
   - Use PM2 or Docker for process management
   - Set up behind Nginx/Apache reverse proxy
   - Configure proper environment variables

2. **Python Processor**
   - Use Supervisor or systemd for process management
   - Set up logging to file
   - Configure proper environment variables

3. **Frontend**
   - Build the React app: `cd frontend && npm run build`
   - Serve static files from Nginx/Apache
   - Or deploy to services like Netlify, Vercel, etc.

4. **Database**
   - Use managed PostgreSQL service or properly configured self-hosted instance
   - Set up regular backups
   - Configure proper user permissions

5. **RabbitMQ**
   - Use managed RabbitMQ service or properly configured self-hosted instance
   - Set up clustering for high availability
   - Configure proper user permissions and vhosts

## Troubleshooting

### Common Issues

1. **Node.js service won't start**
   - Check if port 3000 is already in use
   - Verify all dependencies are installed
   - Check RabbitMQ connection settings

2. **Python processor errors**
   - Verify PostgreSQL connection details
   - Check RabbitMQ connection settings
   - Ensure all dependencies are installed

3. **Dashboard not showing data**
   - Check browser console for errors
   - Verify the Node.js service is running
   - Ensure test data has been sent

4. **Database connection issues**
   - Verify PostgreSQL is running
   - Check connection credentials
   - Ensure database and tables exist

### Logs

- Node.js service logs to console by default
- Python processor logs to console by default
- Check browser console for frontend errors

## Future Enhancements

1. **Authentication and Authorization**
   - Add user authentication for API and dashboard
   - Role-based access control

2. **Advanced Analytics**
   - Predictive maintenance algorithms
   - Historical trend analysis
   - Anomaly detection

3. **Mobile App**
   - Develop companion mobile app for alerts
   - Push notifications for critical issues

4. **Expanded Monitoring**
   - Additional sensor types
   - More complex threshold rules
   - Machine learning for pattern recognition

5. **Integration**
   - Connect with ERP systems
   - Integrate with maintenance scheduling
   - Automated work order generation

