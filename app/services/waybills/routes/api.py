from flask import Blueprint, request, jsonify, Response, current_app
from flask_sieve import validate
from app.services.waybills.requests import StoreWaybillRequest, ChangeStatusRequest
from app.services.waybills.controllers import WaybillPrintController
from app.services.waybills.models.WaybillPrint import WaybillPrint
from app.services.waybills.actions import DownloadWaybillAction, PrintWaybillAction, ChangeStatusAction
from app.services.waybills.actions.PrintWaybillThermalAction import PrintWaybillThermalAction
from app.utils.decorators import get_model
from app.utils.loggers import get_logger
from app.database import db
import json
import time
from datetime import datetime

logger = get_logger(__name__)

# Create a Blueprint for waybill routes
waybills_bp = Blueprint('waybills', __name__, url_prefix='/api/waybills')

# Initialize controller
controller = WaybillPrintController()


@waybills_bp.route('/prints', methods=['GET'])
def index():
    """Retrieve all waybill prints."""
    result = controller.index()
    status_code = 200 if result.get('status') == 'success' else 500
    return jsonify(result), status_code


@waybills_bp.route('/prints', methods=['POST'])
@validate(StoreWaybillRequest)
def store():
    """Store a waybill print request."""
    # Get validated data from the request
    data = request.get_json()
    result = controller.store(data)
    status_code = 200 if result.get('status') == 'success' else 500
    return jsonify(result), status_code


@waybills_bp.route('/prints/<int:waybill_print>', methods=['DELETE'])
@get_model(WaybillPrint)
def destroy(waybill_print):
    """Delete a waybill print by ID."""
    result = controller.destroy(waybill_print)
    status_code = 200 if result.get('status') == 'success' else 500
    return jsonify(result), status_code


@waybills_bp.route('/prints/<int:waybill_print>/download', methods=['POST'])
@get_model(WaybillPrint)
def download(waybill_print):
    """Download a waybill file from URL and save to local storage."""
    download_action = DownloadWaybillAction()
    result = download_action(waybill_print)
    status_code = 200 if result.get('status') == 'success' else 400
    return jsonify(result), status_code


@waybills_bp.route('/prints/<int:waybill_print>/print', methods=['POST'])
@get_model(WaybillPrint)
def print_waybill(waybill_print):
    """Print a waybill using thermal printer (ESC/POS)."""
    # Use thermal printer action for direct USB printing
    print_action = PrintWaybillThermalAction()
    result = print_action(waybill_print)
    status_code = 200 if result.get('status') == 'success' else 400
    return jsonify(result), status_code


@waybills_bp.route('/prints/<int:waybill_print>/status', methods=['PUT'])
@get_model(WaybillPrint)
@validate(ChangeStatusRequest)
def change_status(waybill_print):
    """Change the status of a waybill print."""
    data = request.get_json()
    status = data.get('status')
    
    change_action = ChangeStatusAction()
    result = change_action(waybill_print, status)
    status_code = 200 if result.get('status') == 'success' else 400
    return jsonify(result), status_code


@waybills_bp.route('/prints/stream', methods=['GET'])
def stream_waybills():
    """
    Server-Sent Events endpoint for real-time waybill updates.
    Sends events whenever waybill data is created, updated, or deleted.
    
    The frontend maintains a persistent EventSource connection to this endpoint.
    When changes are detected, the server sends an SSE event which triggers
    a cache invalidation on the client side, causing React Query to refetch.
    """
    # Capture app reference here (in request context) for use in generator
    app = current_app._get_current_object()
    
    def event_generator():
        last_sync = datetime.now()
        consecutive_errors = 0
        max_consecutive_errors = 10
        
        while consecutive_errors < max_consecutive_errors:
            try:
                # Check for updates every 500ms
                time.sleep(0.5)
                
                # Use app context for database access (generator runs outside request context)
                with app.app_context():
                    # Query for waybills updated since last check
                    recent_waybills = WaybillPrint.query.filter(
                        WaybillPrint.updated_at > last_sync
                    ).all()
                    
                    if recent_waybills:
                        # Send SSE event with detailed update information
                        waybill_ids = [w.id for w in recent_waybills]
                        statuses = {w.id: w.status for w in recent_waybills}
                        data = {
                            'type': 'waybill_updated',
                            'timestamp': datetime.now().isoformat(),
                            'count': len(recent_waybills),
                            'waybill_ids': waybill_ids,
                            'statuses': statuses,
                            'message': f'{len(recent_waybills)} waybill(s) updated'
                        }
                        yield f"data: {json.dumps(data)}\n\n"
                        logger.info(f"SSE: Sent update for waybills {waybill_ids} with statuses {statuses}")
                        last_sync = datetime.now()
                        consecutive_errors = 0  # Reset error counter on success
                    
            except GeneratorExit:
                logger.info('Client closed SSE connection')
                break
            except Exception as e:
                consecutive_errors += 1
                logger.error(f"Error in SSE stream (attempt {consecutive_errors}/{max_consecutive_errors}): {str(e)}", exc_info=True)
                if consecutive_errors >= max_consecutive_errors:
                    logger.error('Max consecutive errors in SSE stream, closing connection')
                    break
                # Continue trying even with errors
                continue
    
    return Response(
        event_generator(),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',  # Important for Nginx reverse proxy
            'Content-Type': 'text/event-stream; charset=utf-8'
        }
    )
