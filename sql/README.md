# SQL Scripts for Factory Motor Health Monitoring

This directory contains SQL scripts for setting up and querying the PostgreSQL database for the Factory Motor Health Monitoring system.

## Files

### 01_create_tables.sql
Database schema creation script that includes:
- `motor_alerts` table definition
- Indexes for optimal query performance
- Views for common queries
- Table and column comments for documentation

### 02_queries.sql
Required SQL queries for the dashboard metrics:
- **Query 1**: Recent 5 alerts for a given motor ID
- **Query 2**: Daily alert counts per motor between two dates
- Additional useful queries for dashboard functionality

### 03_sample_data.sql
Sample data insertion script for testing and demonstration purposes.

## Database Schema

### motor_alerts Table

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

**Columns:**
- `id`: Unique identifier for each alert (auto-incrementing)
- `motor_id`: Identifier for the motor (e.g., 'MTR-01')
- `sensor_type`: Type of sensor ('vibration', 'temperature')
- `timestamp`: When the sensor reading was taken
- `value`: The sensor reading value that triggered the alert
- `alert_type`: Type of alert ('high_vibration', 'high_temperature')
- `created_at`: When the alert was inserted into the database

## Setup Instructions

1. **Create Database:**
   ```sql
   CREATE DATABASE motor_monitoring;
   ```

2. **Run Schema Script:**
   ```bash
   psql -d motor_monitoring -f 01_create_tables.sql
   ```

3. **Insert Sample Data (Optional):**
   ```bash
   psql -d motor_monitoring -f 03_sample_data.sql
   ```

## Required Queries

### Query 1: Recent 5 Alerts for a Motor

```sql
SELECT 
    id,
    motor_id,
    sensor_type,
    timestamp,
    value,
    alert_type,
    created_at
FROM motor_alerts
WHERE motor_id = :motorId
ORDER BY timestamp DESC
LIMIT 5;
```

**Parameters:**
- `:motorId` - The motor ID to query (e.g., 'MTR-01')

**Example:**
```sql
SELECT 
    id,
    motor_id,
    sensor_type,
    timestamp,
    value,
    alert_type,
    created_at
FROM motor_alerts
WHERE motor_id = 'MTR-01'
ORDER BY timestamp DESC
LIMIT 5;
```

### Query 2: Daily Alert Counts per Motor

```sql
SELECT 
    motor_id,
    DATE(timestamp) as alert_date,
    COUNT(*) as count
FROM motor_alerts
WHERE DATE(timestamp) BETWEEN :start AND :end
GROUP BY motor_id, DATE(timestamp)
ORDER BY alert_date DESC, motor_id;
```

**Parameters:**
- `:start` - Start date (e.g., '2025-07-01')
- `:end` - End date (e.g., '2025-07-31')

**Example:**
```sql
SELECT 
    motor_id,
    DATE(timestamp) as alert_date,
    COUNT(*) as count
FROM motor_alerts
WHERE DATE(timestamp) BETWEEN '2025-07-01' AND '2025-07-31'
GROUP BY motor_id, DATE(timestamp)
ORDER BY alert_date DESC, motor_id;
```

## Indexes

The following indexes are created for optimal performance:

- `idx_motor_alerts_motor_id` - For motor-specific queries
- `idx_motor_alerts_timestamp` - For time-based queries
- `idx_motor_alerts_created_at` - For recent data queries
- `idx_motor_alerts_sensor_type` - For sensor-specific queries
- `idx_motor_alerts_alert_type` - For alert type filtering
- `idx_motor_alerts_motor_timestamp` - Composite index for common query patterns

## Views

### recent_alerts
Shows all alerts from the last 24 hours with a calculated `hours_ago` field.

### alert_summary
Provides summary statistics for alerts grouped by motor, sensor type, and alert type.

## Performance Considerations

- All timestamp columns use `TIMESTAMPTZ` for timezone awareness
- Indexes are optimized for the most common query patterns
- The composite index on `(motor_id, timestamp DESC)` optimizes the "recent alerts for motor" query
- Use `EXPLAIN ANALYZE` to verify query performance

## Connection Example

```bash
# Connect to database
psql -h localhost -p 5432 -U postgres -d motor_monitoring

# Or using connection string
psql postgresql://postgres:password@localhost:5432/motor_monitoring
```

