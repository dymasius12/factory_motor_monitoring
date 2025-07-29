-- Factory Motor Health Monitoring System
-- Sample Data Insertion Script
-- 
-- This script inserts sample data for testing and demonstration purposes.
-- Run this after creating the tables to populate the database with test data.

-- Insert sample motor alerts
INSERT INTO motor_alerts (motor_id, sensor_type, timestamp, value, alert_type) VALUES
-- MTR-01 alerts
('MTR-01', 'vibration', '2025-07-28 08:15:00+00', 3.2, 'high_vibration'),
('MTR-01', 'temperature', '2025-07-28 08:30:00+00', 85.5, 'high_temperature'),
('MTR-01', 'vibration', '2025-07-28 09:45:00+00', 2.8, 'high_vibration'),
('MTR-01', 'temperature', '2025-07-28 10:15:00+00', 82.3, 'high_temperature'),
('MTR-01', 'vibration', '2025-07-28 11:20:00+00', 3.5, 'high_vibration'),

-- MTR-02 alerts
('MTR-02', 'temperature', '2025-07-28 07:45:00+00', 88.2, 'high_temperature'),
('MTR-02', 'vibration', '2025-07-28 08:20:00+00', 2.9, 'high_vibration'),
('MTR-02', 'temperature', '2025-07-28 09:10:00+00', 91.0, 'high_temperature'),
('MTR-02', 'vibration', '2025-07-28 10:35:00+00', 3.1, 'high_vibration'),

-- MTR-03 alerts
('MTR-03', 'vibration', '2025-07-28 06:30:00+00', 2.7, 'high_vibration'),
('MTR-03', 'temperature', '2025-07-28 07:15:00+00', 83.8, 'high_temperature'),
('MTR-03', 'vibration', '2025-07-28 08:45:00+00', 3.0, 'high_vibration'),

-- Historical data (previous days)
('MTR-01', 'vibration', '2025-07-27 14:20:00+00', 2.6, 'high_vibration'),
('MTR-01', 'temperature', '2025-07-27 15:30:00+00', 81.2, 'high_temperature'),
('MTR-02', 'temperature', '2025-07-27 16:45:00+00', 89.5, 'high_temperature'),
('MTR-03', 'vibration', '2025-07-27 17:10:00+00', 2.8, 'high_vibration'),

('MTR-01', 'vibration', '2025-07-26 10:15:00+00', 3.1, 'high_vibration'),
('MTR-02', 'temperature', '2025-07-26 11:30:00+00', 86.7, 'high_temperature'),
('MTR-03', 'vibration', '2025-07-26 12:45:00+00', 2.9, 'high_vibration'),
('MTR-01', 'temperature', '2025-07-26 13:20:00+00', 84.3, 'high_temperature'),

-- More historical data for trend analysis
('MTR-01', 'vibration', '2025-07-25 09:00:00+00', 2.7, 'high_vibration'),
('MTR-01', 'temperature', '2025-07-25 14:30:00+00', 82.1, 'high_temperature'),
('MTR-02', 'vibration', '2025-07-25 16:15:00+00', 3.3, 'high_vibration'),
('MTR-03', 'temperature', '2025-07-25 18:45:00+00', 87.9, 'high_temperature'),

('MTR-01', 'temperature', '2025-07-24 08:20:00+00', 83.5, 'high_temperature'),
('MTR-02', 'vibration', '2025-07-24 10:40:00+00', 2.8, 'high_vibration'),
('MTR-02', 'temperature', '2025-07-24 12:15:00+00', 90.2, 'high_temperature'),
('MTR-03', 'vibration', '2025-07-24 15:30:00+00', 3.0, 'high_vibration');

-- Display inserted data summary
SELECT 
    'Total alerts inserted' as description,
    COUNT(*) as count
FROM motor_alerts
WHERE created_at >= NOW() - INTERVAL '1 minute'

UNION ALL

SELECT 
    'Motors with alerts' as description,
    COUNT(DISTINCT motor_id) as count
FROM motor_alerts

UNION ALL

SELECT 
    'Date range' as description,
    EXTRACT(DAY FROM (MAX(timestamp) - MIN(timestamp))) as count
FROM motor_alerts;

-- Show sample of inserted data
SELECT 
    motor_id,
    sensor_type,
    timestamp,
    value,
    alert_type
FROM motor_alerts
ORDER BY timestamp DESC
LIMIT 10;

