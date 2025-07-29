import psycopg2
import psycopg2.extras
import logging
from datetime import datetime
from config import Config

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self, config: Config):
        self.config = config
        self.connection = None
        
    def connect(self):
        """Establish database connection"""
        try:
            self.connection = psycopg2.connect(
                host=self.config.DB_HOST,
                port=self.config.DB_PORT,
                database=self.config.DB_NAME,
                user=self.config.DB_USER,
                password=self.config.DB_PASSWORD
            )
            self.connection.autocommit = True
            logger.info("Connected to PostgreSQL database")
            return True
        except psycopg2.Error as e:
            logger.error(f"Failed to connect to database: {e}")
            return False
    
    def disconnect(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            logger.info("Disconnected from PostgreSQL database")
    
    def create_tables(self):
        """Create the motor_alerts table if it doesn't exist"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS motor_alerts (
                        id SERIAL PRIMARY KEY,
                        motor_id TEXT NOT NULL,
                        sensor_type TEXT NOT NULL,
                        timestamp TIMESTAMPTZ NOT NULL,
                        value NUMERIC NOT NULL,
                        alert_type TEXT NOT NULL,
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                
                # Create indexes for better query performance
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_motor_alerts_motor_id 
                    ON motor_alerts(motor_id);
                """)
                
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_motor_alerts_timestamp 
                    ON motor_alerts(timestamp);
                """)
                
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_motor_alerts_created_at 
                    ON motor_alerts(created_at);
                """)
                
                logger.info("Database tables and indexes created successfully")
                return True
        except psycopg2.Error as e:
            logger.error(f"Failed to create tables: {e}")
            return False
    
    def insert_alert(self, motor_id, sensor_type, timestamp, value, alert_type):
        """Insert a new alert into the motor_alerts table"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO motor_alerts (motor_id, sensor_type, timestamp, value, alert_type)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id;
                """, (motor_id, sensor_type, timestamp, value, alert_type))
                
                alert_id = cursor.fetchone()[0]
                logger.info(f"Alert inserted with ID: {alert_id}")
                return alert_id
        except psycopg2.Error as e:
            logger.error(f"Failed to insert alert: {e}")
            raise
    
    def get_recent_alerts(self, motor_id, limit=5):
        """Get recent alerts for a specific motor"""
        try:
            with self.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT id, motor_id, sensor_type, timestamp, value, alert_type, created_at
                    FROM motor_alerts
                    WHERE motor_id = %s
                    ORDER BY timestamp DESC
                    LIMIT %s;
                """, (motor_id, limit))
                
                return cursor.fetchall()
        except psycopg2.Error as e:
            logger.error(f"Failed to get recent alerts: {e}")
            return []
    
    def get_daily_alert_counts(self, start_date, end_date):
        """Get daily alert counts per motor between two dates"""
        try:
            with self.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT 
                        motor_id,
                        DATE(timestamp) as alert_date,
                        COUNT(*) as count
                    FROM motor_alerts
                    WHERE DATE(timestamp) BETWEEN %s AND %s
                    GROUP BY motor_id, DATE(timestamp)
                    ORDER BY alert_date DESC, motor_id;
                """, (start_date, end_date))
                
                return cursor.fetchall()
        except psycopg2.Error as e:
            logger.error(f"Failed to get daily alert counts: {e}")
            return []
    
    def health_check(self):
        """Check database connection health"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
                return True
        except psycopg2.Error as e:
            logger.error(f"Database health check failed: {e}")
            return False

