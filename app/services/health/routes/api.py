from flask import Blueprint, jsonify
from app.services.health.services.HealthCheckService import HealthCheckService
from app.utils.loggers import get_logger

logger = get_logger(__name__)

# Create a Blueprint for health check routes
health_bp = Blueprint('health', __name__, url_prefix='/api/health')

# Initialize service
health_service = HealthCheckService()


@health_bp.route('/check', methods=['POST'])
def check_connection():
    """
    POST endpoint to check if the device can reach the server.
    Used by mobile devices to validate the base_url configuration.
    
    Returns:
        JSON response with connection status and message.
    """
    result = health_service.check_connection()
    status_code = 200 if result.get('status') == 'success' else 500
    return jsonify(result), status_code

