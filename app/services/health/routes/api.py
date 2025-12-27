from flask import Blueprint, jsonify, request, current_app
from app.services.health.services.HealthCheckService import HealthCheckService
from app.services.health.services.CleanupTestService import CleanupTestService
from app.services.waybills.services.PrinterCheckService import PrinterCheckService
from app.config.helper import get
from app.config import printing as printing_config
from app.utils.loggers import get_logger

logger = get_logger(__name__)

# Create a Blueprint for health check routes
health_bp = Blueprint('health', __name__, url_prefix='/api/health')

# Initialize services
health_service = HealthCheckService()
printer_check_service = PrinterCheckService()

# Get printer name from config
PRINTER_NAME = get(printing_config.config, 'printer.name')


@health_bp.route('/check', methods=['GET'])
def check_connection():
    """
    GET endpoint to check if the device can reach the server.
    Used by mobile devices to validate the base_url configuration.
    
    Returns:
        JSON response with connection status and message.
    """
    # Log device request
    device_ip = request.remote_addr
    user_agent = request.headers.get('User-Agent', 'Unknown')
    logger.info(f"📱 Health check request from device - IP: {device_ip}, User-Agent: {user_agent}")
    
    result = health_service.check_connection()
    status_code = 200 if result.get('status') == 'success' else 500
    return jsonify(result), status_code


@health_bp.route('/printer-status', methods=['GET'])
def printer_status():
    """
    GET endpoint to check printer status and detect offline/stuck jobs.
    Shows if printer is online and if there are any stuck jobs waiting.
    
    Returns:
        JSON response with printer status, online status, and stuck job count.
    """
    try:
        report = printer_check_service.get_printer_status_report(PRINTER_NAME)
        
        return jsonify({
            'status': 'success',
            'data': report
        }), 200
    
    except Exception as e:
        logger.error(f"Error checking printer status: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@health_bp.route('/printer-check', methods=['POST'])
def check_and_handle_printer():
    """
    POST endpoint to manually trigger printer check and handle offline scenarios.
    Checks if printer is online, and if offline, cancels stuck jobs.
    
    Returns:
        JSON response with action results.
    """
    try:
        result = printer_check_service.check_and_handle_stuck_jobs(PRINTER_NAME)
        
        status_code = 200 if result.get('status') == 'success' else 500
        return jsonify({
            'status': result['status'],
            'message': result['message'],
            'data': {
                'printer_online': result['printer_online'],
                'cancelled_count': result['cancelled_count'],
                'cancelled_jobs': result['cancelled_jobs']
            }
        }), status_code
    
    except Exception as e:
        logger.error(f"Error in manual printer check: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@health_bp.route('/test/cleanup', methods=['POST'])
def test_cleanup():
    """
    TEST ENDPOINT: Create test waybills and manually trigger cleanup.
    Use this to test the auto-cleanup CRON job functionality.
    
    Query parameters:
    - create: 'true' to create 10 test waybills (1-hour spaced)
    - trigger: 'true' to manually run cleanup now
    
    Examples:
    - POST /api/health/test/cleanup?create=true
    - POST /api/health/test/cleanup?trigger=true
    - POST /api/health/test/cleanup?create=true&trigger=true
    """
    try:
        create_test_data = request.args.get('create', 'false').lower() == 'true'
        trigger_cleanup_job = request.args.get('trigger', 'false').lower() == 'true'
        
        messages = []
        data = {}
        
        # Create test waybills
        if create_test_data:
            result = CleanupTestService.create_test_waybills()
            if result['success']:
                data['created_waybills'] = result['waybills']
                messages.append(f"✅ Created {result['created_count']} test waybills with 1-hour spacing")
            else:
                return jsonify({
                    'status': 'error',
                    'message': f"Failed to create test waybills: {result['error']}"
                }), 500
        
        # Trigger cleanup
        if trigger_cleanup_job:
            result = CleanupTestService.trigger_cleanup(current_app._get_current_object())
            if result['success']:
                data['cleanup_result'] = {
                    'records_before': result['records_before'],
                    'records_after': result['records_after'],
                    'records_deleted': result['records_deleted'],
                    'threshold_hours': result['threshold_hours']
                }
                messages.append(f"✅ Cleanup executed - Deleted {result['records_deleted']} records (before: {result['records_before']}, after: {result['records_after']})")
            else:
                return jsonify({
                    'status': 'error',
                    'message': f"Failed to trigger cleanup: {result['error']}"
                }), 500
        
        if not create_test_data and not trigger_cleanup_job:
            messages.append("ℹ️ No action taken. Use ?create=true or ?trigger=true parameters")
        
        return jsonify({
            'status': 'success',
            'message': ' | '.join(messages),
            'data': data
        }), 200
    
    except Exception as e:
        logger.error(f"[TEST CLEANUP] Unexpected error: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': f"Test failed: {str(e)}"
        }), 500

