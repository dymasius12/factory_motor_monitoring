-- Factory Motor Health Monitoring System
-- Query Scripts
-- 
-- This file contains the required SQL queries for the dashboard metrics.

-- ============================================================================
-- Query 1: Recent 5 alerts for a given motor (:motorId)
-- ============================================================================

-- This query retrieves the 5 most recent alerts for a specific motor ID
-- Replace ':motorId' with the actual motor ID when executing

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

-- Example usage:
-- SELECT 
--     id,
--     motor_id,
--     sensor_type,
--     timestamp,
--     value,
--     alert_type,
--     created_at
-- FROM motor_alerts
-- WHERE motor_id = 'MTR-01'
-- ORDER BY timestamp DESC
-- LIMIT 5;

-- ============================================================================
-- Query 2: Daily alert counts per motor between two dates (:start, :end)
-- ============================================================================

-- This query returns daily alert counts per motor between two dates
-- Replace ':start' and ':end' with actual date values when executing
-- Returns: motor_id, alert_date, count

SELECT 
    motor_id,
    DATE(timestamp) as alert_date,
    COUNT(*) as count
FROM motor_alerts
WHERE DATE(timestamp) BETWEEN :start AND :end
GROUP BY motor_id, DATE(timestamp)
ORDER BY alert_date DESC, motor_id;

-- Example usage:
-- SELECT 
--     motor_id,
--     DATE(timestamp) as alert_date,
--     COUNT(*) as count
-- FROM motor_alerts
-- WHERE DATE(timestamp) BETWEEN '2025-07-01' AND '2025-07-31'
-- GROUP BY motor_id, DATE(timestamp)
-- ORDER BY alert_date DESC, motor_id;

-- ============================================================================
-- Additional Useful Queries for Dashboard
-- ============================================================================

-- Query 3: Current active alerts (last 1 hour)
SELECT 
    id,
    motor_id,
    sensor_type,
    timestamp,
    value,
    alert_type,
    EXTRACT(EPOCH FROM (NOW() - timestamp)) / 60 AS minutes_ago
FROM motor_alerts
WHERE timestamp >= NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;

-- Query 4: Alert counts by sensor type for a specific motor
SELECT 
    sensor_type,
    alert_type,
    COUNT(*) as count,
    AVG(value) as avg_value,
    MAX(value) as max_value,
    MIN(timestamp) as first_occurrence,
    MAX(timestamp) as last_occurrence
FROM motor_alerts
WHERE motor_id = :motorId
GROUP BY sensor_type, alert_type
ORDER BY sensor_type, alert_type;

-- Query 5: Motors with most alerts in the last 24 hours
SELECT 
    motor_id,
    COUNT(*) as alert_count,
    COUNT(DISTINCT sensor_type) as sensor_types_affected,
    MAX(timestamp) as last_alert_time
FROM motor_alerts
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY motor_id
ORDER BY alert_count DESC, last_alert_time DESC;

-- Query 6: Hourly alert distribution for a specific date
SELECT 
    EXTRACT(HOUR FROM timestamp) as hour,
    COUNT(*) as alert_count,
    COUNT(DISTINCT motor_id) as motors_affected
FROM motor_alerts
WHERE DATE(timestamp) = :date
GROUP BY EXTRACT(HOUR FROM timestamp)
ORDER BY hour;

-- Query 7: Alert trend analysis (daily counts for last 30 days)
SELECT 
    DATE(timestamp) as alert_date,
    COUNT(*) as total_alerts,
    COUNT(DISTINCT motor_id) as motors_affected,
    COUNT(CASE WHEN sensor_type = 'vibration' THEN 1 END) as vibration_alerts,
    COUNT(CASE WHEN sensor_type = 'temperature' THEN 1 END) as temperature_alerts
FROM motor_alerts
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY alert_date DESC;

-- Query 8: Motor health status summary
SELECT 
    motor_id,
    COUNT(*) as total_alerts,
    MAX(timestamp) as last_alert,
    CASE 
        WHEN MAX(timestamp) >= NOW() - INTERVAL '1 hour' THEN 'CRITICAL'
        WHEN MAX(timestamp) >= NOW() - INTERVAL '6 hours' THEN 'WARNING'
        WHEN MAX(timestamp) >= NOW() - INTERVAL '24 hours' THEN 'CAUTION'
        ELSE 'NORMAL'
    END as health_status
FROM motor_alerts
GROUP BY motor_id
ORDER BY 
    CASE 
        WHEN MAX(timestamp) >= NOW() - INTERVAL '1 hour' THEN 1
        WHEN MAX(timestamp) >= NOW() - INTERVAL '6 hours' THEN 2
        WHEN MAX(timestamp) >= NOW() - INTERVAL '24 hours' THEN 3
        ELSE 4
    END,
    total_alerts DESC;

-- ============================================================================
-- Performance Testing Queries
-- ============================================================================

-- Query to check index usage
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM motor_alerts 
WHERE motor_id = 'MTR-01' 
ORDER BY timestamp DESC 
LIMIT 5;

-- Query to check table statistics
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE tablename = 'motor_alerts';

-- Query to check table size
SELECT 
    pg_size_pretty(pg_total_relation_size('motor_alerts')) as total_size,
    pg_size_pretty(pg_relation_size('motor_alerts')) as table_size,
    pg_size_pretty(pg_total_relation_size('motor_alerts') - pg_relation_size('motor_alerts')) as index_size;

