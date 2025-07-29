#!/usr/bin/env python3
"""
Test script for the Alert Processor
This script can be used to test database operations and message parsing
"""

import json
import logging
from datetime import datetime, timedelta
from config import Config
from database import DatabaseManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_database_operations():
    """Test database operations"""
    logger.info("Testing database operations...")
    
    config = Config()
    db_manager = DatabaseManager(config)
    
    try:
        # Connect to database
        if not db_manager.connect():
            logger.error("Failed to connect to database")
            return False
        
        # Create tables
        if not db_manager.create_tables():
            logger.error("Failed to create tables")
            return False
        
        # Test inserting alerts
        test_alerts = [
            {
                'motor_id': 'MTR-TEST-01',
                'sensor_type': 'vibration',
                'timestamp': datetime.now(),
                'value': 3.2,
                'alert_type': 'high_vibration'
            },
            {
                'motor_id': 'MTR-TEST-01',
                'sensor_type': 'temperature',
                'timestamp': datetime.now(),
                'value': 85.5,
                'alert_type': 'high_temperature'
            },
            {
                'motor_id': 'MTR-TEST-02',
                'sensor_type': 'vibration',
                'timestamp': datetime.now() - timedelta(hours=1),
                'value': 2.8,
                'alert_type': 'high_vibration'
            }
        ]
        
        alert_ids = []
        for alert in test_alerts:
            alert_id = db_manager.insert_alert(**alert)
            alert_ids.append(alert_id)
            logger.info(f"Inserted alert with ID: {alert_id}")
        
        # Test getting recent alerts
        recent_alerts = db_manager.get_recent_alerts('MTR-TEST-01', 5)
        logger.info(f"Recent alerts for MTR-TEST-01: {len(recent_alerts)}")
        for alert in recent_alerts:
            logger.info(f"  Alert: {alert['sensor_type']} = {alert['value']} at {alert['timestamp']}")
        
        # Test getting daily alert counts
        start_date = (datetime.now() - timedelta(days=1)).date()
        end_date = datetime.now().date()
        daily_counts = db_manager.get_daily_alert_counts(start_date, end_date)
        logger.info(f"Daily alert counts: {len(daily_counts)}")
        for count in daily_counts:
            logger.info(f"  {count['motor_id']} on {count['alert_date']}: {count['count']} alerts")
        
        # Test health check
        health = db_manager.health_check()
        logger.info(f"Database health check: {'PASS' if health else 'FAIL'}")
        
        logger.info("Database operations test completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Database operations test failed: {e}")
        return False
    
    finally:
        db_manager.disconnect()

def test_message_parsing():
    """Test alert message parsing"""
    logger.info("Testing message parsing...")
    
    from alert_processor import AlertProcessor
    
    config = Config()
    processor = AlertProcessor(config)
    
    # Test valid message
    valid_message = json.dumps({
        "motorId": "MTR-01",
        "timestamp": "2025-07-17T10:15:00Z",
        "sensorType": "vibration",
        "value": 3.2,
        "alertType": "high_vibration"
    })
    
    try:
        parsed = processor.parse_alert_message(valid_message)
        logger.info(f"Parsed valid message: {parsed}")
        
        # Verify parsed data
        assert parsed['motor_id'] == 'MTR-01'
        assert parsed['sensor_type'] == 'vibration'
        assert parsed['value'] == 3.2
        assert parsed['alert_type'] == 'high_vibration'
        assert isinstance(parsed['timestamp'], datetime)
        
        logger.info("Valid message parsing test passed")
        
    except Exception as e:
        logger.error(f"Valid message parsing test failed: {e}")
        return False
    
    # Test invalid message
    invalid_message = json.dumps({
        "motorId": "MTR-01",
        "timestamp": "2025-07-17T10:15:00Z",
        # Missing sensorType, value, alertType
    })
    
    try:
        parsed = processor.parse_alert_message(invalid_message)
        logger.error("Invalid message parsing should have failed but didn't")
        return False
    except Exception as e:
        logger.info(f"Invalid message parsing correctly failed: {e}")
    
    logger.info("Message parsing test completed successfully")
    return True

def main():
    """Run all tests"""
    logger.info("Starting Alert Processor tests...")
    
    tests = [
        ("Message Parsing", test_message_parsing),
        ("Database Operations", test_database_operations),
    ]
    
    results = {}
    for test_name, test_func in tests:
        logger.info(f"\n{'='*50}")
        logger.info(f"Running {test_name} test...")
        logger.info(f"{'='*50}")
        
        try:
            results[test_name] = test_func()
        except Exception as e:
            logger.error(f"{test_name} test failed with exception: {e}")
            results[test_name] = False
    
    # Print summary
    logger.info(f"\n{'='*50}")
    logger.info("Test Summary:")
    logger.info(f"{'='*50}")
    
    all_passed = True
    for test_name, result in results.items():
        status = "PASS" if result else "FAIL"
        logger.info(f"{test_name}: {status}")
        if not result:
            all_passed = False
    
    logger.info(f"\nOverall: {'ALL TESTS PASSED' if all_passed else 'SOME TESTS FAILED'}")
    return all_passed

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

