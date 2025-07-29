-- Factory Motor Health Monitoring System
-- Database Schema Creation Script
-- 
-- This script creates the necessary tables and indexes for the motor health monitoring system.
-- Run this script on your PostgreSQL database before starting the alert processor.

-- Create the motor_alerts table
CREATE TABLE IF NOT EXISTS motor_alerts (
    id SERIAL PRIMARY KEY,
    motor_id TEXT NOT NULL,
    sensor_type TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    value NUMERIC NOT NULL,
    alert_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_motor_alerts_motor_id 
ON motor_alerts(motor_id);

CREATE INDEX IF NOT EXISTS idx_motor_alerts_timestamp 
ON motor_alerts(timestamp);

CREATE INDEX IF NOT EXISTS idx_motor_alerts_created_at 
ON motor_alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_motor_alerts_sensor_type 
ON motor_alerts(sensor_type);

CREATE INDEX IF NOT EXISTS idx_motor_alerts_alert_type 
ON motor_alerts(alert_type);

-- Create a composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_motor_alerts_motor_timestamp 
ON motor_alerts(motor_id, timestamp DESC);

-- Add comments to the table and columns for documentation
COMMENT ON TABLE motor_alerts IS 'Stores all motor health alerts triggered by sensor threshold breaches';
COMMENT ON COLUMN motor_alerts.id IS 'Unique identifier for each alert (auto-incrementing)';
COMMENT ON COLUMN motor_alerts.motor_id IS 'Identifier for the motor (e.g., MTR-01)';
COMMENT ON COLUMN motor_alerts.sensor_type IS 'Type of sensor that triggered the alert (vibration, temperature)';
COMMENT ON COLUMN motor_alerts.timestamp IS 'Timestamp when the sensor reading was taken';
COMMENT ON COLUMN motor_alerts.value IS 'The sensor reading value that triggered the alert';
COMMENT ON COLUMN motor_alerts.alert_type IS 'Type of alert (high_vibration, high_temperature)';
COMMENT ON COLUMN motor_alerts.created_at IS 'Timestamp when the alert was inserted into the database';

-- Create a view for recent alerts (last 24 hours)
CREATE OR REPLACE VIEW recent_alerts AS
SELECT 
    id,
    motor_id,
    sensor_type,
    timestamp,
    value,
    alert_type,
    created_at,
    EXTRACT(EPOCH FROM (NOW() - timestamp)) / 3600 AS hours_ago
FROM motor_alerts
WHERE timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;

COMMENT ON VIEW recent_alerts IS 'View showing all alerts from the last 24 hours with hours_ago calculation';

-- Create a view for alert summary statistics
CREATE OR REPLACE VIEW alert_summary AS
SELECT 
    motor_id,
    sensor_type,
    alert_type,
    COUNT(*) as total_alerts,
    MIN(timestamp) as first_alert,
    MAX(timestamp) as last_alert,
    AVG(value) as avg_value,
    MIN(value) as min_value,
    MAX(value) as max_value
FROM motor_alerts
GROUP BY motor_id, sensor_type, alert_type
ORDER BY motor_id, sensor_type, alert_type;

COMMENT ON VIEW alert_summary IS 'Summary statistics for alerts grouped by motor, sensor type, and alert type';

-- Grant permissions (adjust as needed for your environment)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON motor_alerts TO motor_monitoring_user;
-- GRANT USAGE, SELECT ON SEQUENCE motor_alerts_id_seq TO motor_monitoring_user;
-- GRANT SELECT ON recent_alerts TO motor_monitoring_user;
-- GRANT SELECT ON alert_summary TO motor_monitoring_user;

-- Display table information
\d motor_alerts;

-- Show the created indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'motor_alerts'
ORDER BY indexname;

