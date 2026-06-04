
# SMART CITY DASHBOARD
# app.py


from flask import Flask, jsonify, render_template, request
from flask_cors import CORS

import sqlite3
import random
import time
import hashlib
import logging
from functools import lru_cache
from threading import Lock
from datetime import datetime

app = Flask(__name__)

CORS(app)


# LOGGING CONFIGURATION


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# BLOCKCHAIN INTEGRATION


BLOCKCHAIN_ENABLED = False
try:
    from blockchain.blockchain import (
        send_hash_to_blockchain,
        get_data_from_blockchain,
        check_ganache_status,
        verify_blockchain_hash
    )
    BLOCKCHAIN_ENABLED = True
    logger.info("✅ Blockchain module loaded successfully")
except Exception as e:
    logger.warning(f"⚠️ Blockchain module not available: {type(e).__name__}: {e}")


# DATABASE CONFIGURATION


DATABASE_TIMEOUT = 10
DATABASE_NAME = 'database.db'
db_lock = Lock()

# Cache for read operations
cache_data = None
cache_timestamp = 0
CACHE_DURATION = 1  # seconds


# DATABASE CONNECTION HELPER


def get_db_connection():
    """Get database connection with proper timeout handling"""
    try:
        conn = sqlite3.connect(
            DATABASE_NAME,
            timeout=DATABASE_TIMEOUT,
            check_same_thread=False
        )
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.OperationalError as e:
        logger.error(f"Database connection error: {e}")
        raise


# DATABASE INIT


def init_db():

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''

            CREATE TABLE IF NOT EXISTS smartcity (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                traffic INTEGER,

                air_quality INTEGER,

                electricity INTEGER,

                water_level INTEGER,

                security_alert TEXT,

                event_log TEXT,

                timestamp TEXT,

                previous_hash TEXT,

                hash TEXT,

                tx_hash TEXT

            )

        ''')
        
        # Add tx_hash column if it doesn't exist (for existing databases)
        try:
            cursor.execute('ALTER TABLE smartcity ADD COLUMN tx_hash TEXT')
            conn.commit()
            logger.info("Added tx_hash column to smartcity table")
        except sqlite3.OperationalError:
            pass  # Column already exists

        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        raise


# HASH FUNCTION


def generate_hash(data, previous_hash):

    block_data = str(data) + str(previous_hash)

    encoded_data = block_data.encode()

    hash_code = hashlib.sha256(
        encoded_data
    ).hexdigest()

    return hash_code


# HOME PAGE


@app.route('/')
def home():

    return render_template(
        'index.html'
    )


# GENERATE EVENT


def generate_event(
    traffic,
    air_quality,
    water_level
):

    if traffic > 90:

        return "Traffic Jam Detected"

    elif air_quality > 170:

        return "Air Pollution Warning"

    elif water_level > 80:

        return "Flood Risk Warning"

    else:

        return "System Normal"


# API DATA


@app.route('/data')
def data():
    try:
        smart_city_data = {
            "traffic": random.randint(0, 100),
            "air_quality": random.randint(50, 200),
            "electricity": random.randint(100, 1000),
            "water_level": random.randint(0, 100),
            "security_alert": random.choice(["Normal", "Warning", "Danger"]),
            "timestamp": time.strftime("%H:%M:%S")
        }

        # Generate event log
        smart_city_data["event_log"] = generate_event(
            smart_city_data["traffic"],
            smart_city_data["air_quality"],
            smart_city_data["water_level"]
        )

        # Get previous hash from database with thread-safe access
        with db_lock:
            conn = get_db_connection()
            cursor = conn.cursor()

            try:
                cursor.execute('''
                    SELECT hash FROM smartcity
                    ORDER BY id DESC LIMIT 1
                ''')
                previous = cursor.fetchone()
                previous_hash = previous[0] if previous else "GENESIS_BLOCK"

                # Generate and save hash
                hash_code = generate_hash(smart_city_data, previous_hash)
                smart_city_data["previous_hash"] = previous_hash
                smart_city_data["hash"] = hash_code

                # Send hash to blockchain if enabled
                tx_hash = None
                if BLOCKCHAIN_ENABLED:
                    try:
                        tx_hash = send_hash_to_blockchain(hash_code)
                        smart_city_data["tx_hash"] = tx_hash
                        logger.info(f"Hash sent to blockchain: {tx_hash}")
                    except Exception as e:
                        logger.warning(f"Failed to send hash to blockchain: {e}")
                        smart_city_data["tx_hash"] = None
                else:
                    smart_city_data["tx_hash"] = None

                # Save to database
                cursor.execute('''
                    INSERT INTO smartcity(
                        traffic, air_quality, electricity, water_level,
                        security_alert, event_log, timestamp,
                        previous_hash, hash, tx_hash
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    smart_city_data["traffic"],
                    smart_city_data["air_quality"],
                    smart_city_data["electricity"],
                    smart_city_data["water_level"],
                    smart_city_data["security_alert"],
                    smart_city_data["event_log"],
                    smart_city_data["timestamp"],
                    smart_city_data["previous_hash"],
                    smart_city_data["hash"],
                    tx_hash
                ))
                conn.commit()
                logger.info("Data saved successfully with blockchain transaction")

            except sqlite3.OperationalError as e:
                logger.error(f"Database operation failed: {e}")
                conn.rollback()
                return jsonify({
                    "error": "Database temporarily locked",
                    "data": smart_city_data
                }), 200  # Return data anyway with cached info
            finally:
                conn.close()

        return jsonify(smart_city_data)

    except Exception as e:
        logger.error(f"Error in data endpoint: {e}")
        return jsonify({"error": str(e)}), 500


# API HISTORY


@app.route('/history')
def history():
    try:
        with db_lock:
            logging.info("Fetching history data...")
            conn = sqlite3.connect('database.db', timeout=DATABASE_TIMEOUT)
            cursor = conn.cursor()
            cursor.execute('''
                SELECT *
                FROM smartcity
                ORDER BY id DESC
                LIMIT 10
            ''')
            rows = cursor.fetchall()
            conn.close()
            
            history_data = []
            for row in rows:
                history_data.append({
                    "id": row[0],
                    "traffic": row[1],
                    "air_quality": row[2],
                    "electricity": row[3],
                    "water_level": row[4],
                    "security_alert": row[5],
                    "event_log": row[6],
                    "timestamp": row[7],
                    "previous_hash": row[8],
                    "hash": row[9],
                    "tx_hash": row[10] if len(row) > 10 else None
                })
            
            logging.info(f"Successfully retrieved {len(history_data)} history records")
            return jsonify(history_data)
    
    except sqlite3.OperationalError as e:
        logging.error(f"Database lock error in /history: {e}")
        return jsonify({
            "error": "Database temporarily locked",
            "details": str(e)
        }), 503
    
    except Exception as e:
        logging.error(f"Unexpected error in /history: {e}")
        return jsonify({
            "error": "Failed to fetch history",
            "details": str(e)
        }), 500


# API SENSORS


@app.route('/sensors')
def sensors():

    sensors_data = [
        {
            "id": 1,
            "name": "Traffic Sensor 1",
            "type": "traffic",
            "lat": 40,
            "lng": 30,
            "value": random.randint(0, 100),
            "unit": "vehicles/min",
            "status": "normal"
        },
        {
            "id": 2,
            "name": "Air Quality 1",
            "type": "air",
            "lat": 60,
            "lng": 50,
            "value": random.randint(50, 200),
            "unit": "AQI",
            "status": "warning"
        },
        {
            "id": 3,
            "name": "Water Level 1",
            "type": "water",
            "lat": 50,
            "lng": 70,
            "value": random.randint(0, 100),
            "unit": "meters",
            "status": "normal"
        },
        {
            "id": 4,
            "name": "Power Station 1",
            "type": "power",
            "lat": 30,
            "lng": 60,
            "value": random.randint(700, 1000),
            "unit": "MW",
            "status": "normal"
        },
        {
            "id": 5,
            "name": "Traffic Sensor 2",
            "type": "traffic",
            "lat": 70,
            "lng": 40,
            "value": random.randint(0, 100),
            "unit": "vehicles/min",
            "status": "normal"
        }
    ]

    return jsonify(sensors_data)


# API CAMERAS


@app.route('/cameras')
def cameras():

    cameras_data = [
        {
            "id": 1,
            "name": "Traffic Camera - Main Street",
            "location": "Downtown - Intersection A",
            "type": "traffic",
            "status": "online",
            "online": True,
            "resolution": "1920x1080",
            "fps": 30,
            "vehicle_count": random.randint(30, 80),
            "avg_speed": random.randint(20, 50)
        },
        {
            "id": 2,
            "name": "Environmental Camera - Park Area",
            "location": "Green Zone - Park Center",
            "type": "environmental",
            "status": "online",
            "online": True,
            "resolution": "1920x1080",
            "fps": 24,
            "air_quality": random.randint(50, 200),
            "temperature": random.randint(22, 35)
        },
        {
            "id": 3,
            "name": "Security Camera - Industrial Zone",
            "location": "Industrial - Area B",
            "type": "security",
            "status": "online",
            "online": True,
            "resolution": "2560x1440",
            "fps": 30,
            "motion_detected": random.choice([True, False]),
            "alerts": random.randint(0, 5)
        },
        {
            "id": 4,
            "name": "Water Level Camera - River",
            "location": "Waterfront - River Monitor",
            "type": "water",
            "status": "offline",
            "online": False,
            "resolution": "1280x720",
            "fps": 15,
            "water_level": 0,
            "last_update": "N/A"
        }
    ]

    return jsonify(cameras_data)


# VERIFY BLOCKCHAIN


@app.route('/verify')
def verify():
    try:
        with db_lock:
            logging.info("Verifying blockchain integrity...")
            conn = sqlite3.connect('database.db', timeout=DATABASE_TIMEOUT)
            cursor = conn.cursor()
            cursor.execute('''
                SELECT *
                FROM smartcity
                ORDER BY id ASC
            ''')
            rows = cursor.fetchall()
            conn.close()
            
            valid = True
            for i in range(1, len(rows)):
                previous_block_hash = rows[i-1][9]
                current_previous_hash = rows[i][8]
                if previous_block_hash != current_previous_hash:
                    valid = False
                    logging.warning(f"Blockchain integrity compromised at record {i}")
                    break
            
            if valid:
                logging.info("Blockchain verification passed")
                return jsonify({
                    "status": "Blockchain Valid",
                    "records_verified": len(rows)
                })
            else:
                logging.warning("Blockchain verification failed - tampering detected")
                return jsonify({
                    "status": "Blockchain Tampered",
                    "records_verified": i
                })
    
    except sqlite3.OperationalError as e:
        logging.error(f"Database lock error in /verify: {e}")
        return jsonify({
            "error": "Database temporarily locked",
            "details": str(e)
        }), 503
    
    except Exception as e:
        logging.error(f"Unexpected error in /verify: {e}")
        return jsonify({
            "error": "Failed to verify blockchain",
            "details": str(e)
        }), 500


# API GANACHE STATUS


@app.route('/ganache-status')
def ganache_status():
    """Check Ganache blockchain connection status"""
    if not BLOCKCHAIN_ENABLED:
        return jsonify({
            "status": "Blockchain module not loaded",
            "connected": False
        }), 503
    
    try:
        status = check_ganache_status()
        return jsonify(status)
    except Exception as e:
        logger.error(f"Error checking Ganache status: {e}")
        return jsonify({
            "error": str(e),
            "connected": False
        }), 500


# API IOT DATA RECEIVER


@app.route('/iot', methods=['POST'])
def iot():
    """
    Receive IoT data from ESP8266 or other devices
    
    Expected JSON format:
    {
        "temperature": 25.5,
        "humidity": 60,
        "device_id": "ESP001"
    }
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({
                "error": "No JSON data provided"
            }), 400
        
        logger.info(f"IoT data received: {data}")
        
        # You can store this data in database if needed
        # For now, just logging it
        print(f"✅ IoT Device Data: {data}")
        
        return jsonify({
            "status": "success",
            "message": "Data received successfully",
            "timestamp": time.strftime("%H:%M:%S")
        }), 200
    
    except Exception as e:
        logger.error(f"Error receiving IoT data: {e}")
        return jsonify({
            "error": "Failed to process IoT data",
            "details": str(e)
        }), 500


# MAIN


if __name__ == '__main__':

    init_db()

    app.run(debug=True)