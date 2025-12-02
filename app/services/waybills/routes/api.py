from flask import Blueprint, request, jsonify, Response, current_app, send_file
from flask_sieve import validate
from app.services.waybills.requests import StoreWaybillRequest, ChangeStatusRequest
from app.services.waybills.controllers import WaybillPrintController
from app.services.waybills.models.WaybillPrint import WaybillPrint
from app.services.waybills.actions import DownloadWaybillAction, PrintWaybillAction, ChangeStatusAction, GetStatusAction, CancelPrintWaybillAction
from app.services.waybills.enums.WaybillPrintStatuses import WaybillPrintStatuses
from app.services.waybills.enums.PrintStatuses import PrintStatuses
from app.utils.decorators import get_model
from app.utils.loggers import get_logger
from app.database import db
import json
import time
import os
from datetime import datetime

logger = get_logger(__name__)

# Create a Blueprint for waybill routes
waybills_bp = Blueprint('waybills', __name__, url_prefix='/api/waybills')

# Initialize controller
controller = WaybillPrintController()


# ============================================================================
# Helper Functions for Invoice Number Routes
# ============================================================================

def get_waybill_by_invoice_number(invoice_number: str, tenant_id):
    """
    Retrieve the latest WaybillPrint record by invoice_number and tenant_id, ordered by created_at DESC.
    
    Ensures tenant data isolation - each tenant can only access their own waybills.
    
    Args:
        invoice_number: The invoice number to search for
        tenant_id: The tenant ID for data isolation
        
    Returns:
        WaybillPrint: The latest matching record, or None if not found
    """
    waybill = WaybillPrint.query.filter_by(
        invoice_number=invoice_number,
        tenant_id=tenant_id
    ).order_by(
        WaybillPrint.created_at.desc()
    ).first()
    return waybill


# ============================================================================
# Standard Routes (by WaybillPrintID)
# ============================================================================

@waybills_bp.route('/prints', methods=['GET'])
def index():
    """Retrieve all waybill prints."""
    result = controller.index()
    status_code = 200 if result.get('status') == 'success' else 500
    return jsonify(result), status_code


@waybills_bp.route('/prints', methods=['POST'])
@validate(StoreWaybillRequest)
def store():
    """Store a waybill print request. Cancels any previous print jobs for the same invoice."""
    try:
        # Get validated data from the request
        data = request.get_json()
        invoice_number = data.get('invoice_number')
        tenant_id = data.get('tenant_id')
        
        # Check if a waybill with the same invoice already exists and cancel it
        if invoice_number and tenant_id:
            existing_waybill = get_waybill_by_invoice_number(invoice_number, tenant_id)
            if existing_waybill and existing_waybill.cups_job_id:
                try:
                    cancel_action = CancelPrintWaybillAction()
                    cancel_action(existing_waybill)
                    logger.info(f"Cancelled previous print job {existing_waybill.cups_job_id} for invoice {invoice_number}")
                except Exception as e:
                    logger.warning(f"Could not cancel previous job for invoice {invoice_number}: {str(e)}")
        
        # Create new waybill
        result = controller.store(data)
        status_code = 200 if result.get('status') == 'success' else 500
        return jsonify(result), status_code
        
    except Exception as e:
        logger.error(f"Error storing waybill: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@waybills_bp.route('/prints/<int:waybill_print>', methods=['PUT'])
@get_model(WaybillPrint)
@validate(StoreWaybillRequest)
def update(waybill_print):
    """Update a waybill print by ID."""
    data = request.get_json()
    result = controller.update(waybill_print, data)
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
    """Print a waybill."""
    print_action = PrintWaybillAction()
    result = print_action(waybill_print)
    status_code = 200 if result.get('status') == 'success' else 400
    return jsonify(result), status_code


@waybills_bp.route('/prints/<int:waybill_print>/cancel', methods=['POST'])
@get_model(WaybillPrint)
def cancel_print(waybill_print):
    """Cancel an ongoing print job."""
    cancel_action = CancelPrintWaybillAction()
    result = cancel_action(waybill_print)
    status_code = 200 if result.get('status') == 'success' else 400
    return jsonify(result), status_code


@waybills_bp.route('/prints/<int:waybill_print>/status', methods=['GET'])
@get_model(WaybillPrint)
def get_status(waybill_print):
    """Get comprehensive status information for a waybill print job."""
    get_status_action = GetStatusAction()
    result = get_status_action(waybill_print)
    status_code = 200 if result.get('status') == 'success' else 500
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


@waybills_bp.route('/prints/<int:waybill_print>/preview', methods=['GET'])
@get_model(WaybillPrint)
def preview_file(waybill_print):
    """Preview/download the waybill file (PDF)."""
    if not waybill_print.local_file_path:
        return jsonify({
            'status': 'error',
            'message': 'File not found - waybill has not been downloaded yet'
        }), 404
    
    file_path = waybill_print.local_file_path
    
    # Check if file exists
    if not os.path.exists(file_path):
        logger.error(f"File not found at path: {file_path} for waybill {waybill_print.id}")
        return jsonify({
            'status': 'error',
            'message': 'File not found on disk'
        }), 404
    
    # Determine if it's a download request (query param) or preview
    as_attachment = request.args.get('download', 'false').lower() == 'true'
    
    # Get filename for download
    filename = os.path.basename(file_path)
    
    # Determine content type based on file extension
    if file_path.lower().endswith('.pdf'):
        mimetype = 'application/pdf'
    elif file_path.lower().endswith('.png'):
        mimetype = 'image/png'
    else:
        mimetype = 'application/octet-stream'
    
    return send_file(
        file_path,
        mimetype=mimetype,
        as_attachment=as_attachment,
        download_name=filename
    )


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


# ============================================================================
# Routes by Invoice Number - Print Only
# ============================================================================

@waybills_bp.route('/prints/by-invoice/print', methods=['POST'])
def print_by_invoice_number():
    """Print the latest waybill by invoice number (tenant-specific). Cancels previous print jobs before initiating new print."""
    try:
        data = request.get_json()
        invoice_number = data.get('invoice_number')
        tenant_id = data.get('tenant_id')
        
        if not invoice_number:
            return jsonify({
                'status': 'error',
                'message': 'invoice_number is required in request body'
            }), 400
        
        if not tenant_id:
            return jsonify({
                'status': 'error',
                'message': 'tenant_id is required in request body'
            }), 400
        
        waybill_print = get_waybill_by_invoice_number(invoice_number, tenant_id)
        
        if not waybill_print:
            return jsonify({
                'status': 'error',
                'message': f'No waybill found with invoice number: {invoice_number} for tenant: {tenant_id}'
            }), 404
        
        # Cancel any previous print job if it exists
        if waybill_print.cups_job_id:
            try:
                cancel_action = CancelPrintWaybillAction()
                cancel_action(waybill_print)
                logger.info(f"Cancelled previous print job {waybill_print.cups_job_id} for invoice {invoice_number}")
            except Exception as e:
                logger.warning(f"Could not cancel previous job {waybill_print.cups_job_id}: {str(e)}")
        
        # Reset error fields for a fresh print attempt
        waybill_print.error_message = None
        waybill_print.print_error = None
        waybill_print.status = WaybillPrintStatuses.PRINTING.value
        waybill_print.print_status = PrintStatuses.IDLE.value
        db.session.commit()
        logger.info(f"Reset error state for invoice {invoice_number} before new print attempt - status: {WaybillPrintStatuses.PRINTING.value}, print_status: {PrintStatuses.IDLE.value}")
        
        # Trigger new print action
        print_action = PrintWaybillAction()
        print_result = print_action(waybill_print)
        
        # Get current status (CRON job will monitor and update)
        get_status_action = GetStatusAction()
        status_result = get_status_action(waybill_print)
        
        if print_result.get('status') == 'success':
            # Return updated status for visual feedback on mobile
            status_code = 200
            return jsonify({
                'status': 'success',
                'message': 'Print job initiated (previous jobs cancelled)',
                'data': status_result.get('data', {})
            }), status_code
        else:
            status_code = 400
            return jsonify(print_result), status_code
        
    except Exception as e:
        logger.error(f"Error printing waybill by invoice number: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@waybills_bp.route('/prints/by-invoice/status', methods=['GET'])
def get_status_by_invoice_number():
    """Get the status of the latest waybill by invoice number (tenant-specific)."""
    try:
        invoice_number = request.args.get('invoice_number')
        tenant_id = request.args.get('tenant_id')
        
        if not invoice_number:
            return jsonify({
                'status': 'error',
                'message': 'invoice_number is required as query parameter'
            }), 400
        
        if not tenant_id:
            return jsonify({
                'status': 'error',
                'message': 'tenant_id is required as query parameter'
            }), 400
        
        waybill_print = get_waybill_by_invoice_number(invoice_number, tenant_id)
        
        if not waybill_print:
            return jsonify({
                'status': 'error',
                'message': f'No waybill found with invoice number: {invoice_number} for tenant: {tenant_id}'
            }), 404
        
        get_status_action = GetStatusAction()
        result = get_status_action(waybill_print)
        status_code = 200 if result.get('status') == 'success' else 500
        return jsonify(result), status_code
        
    except Exception as e:
        logger.error(f"Error getting status for waybill by invoice number: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@waybills_bp.route('/prints/by-invoice/cancel', methods=['POST'])
def cancel_by_invoice_number():
    """Cancel the latest waybill print job by invoice number (tenant-specific)."""
    try:
        data = request.get_json()
        invoice_number = data.get('invoice_number')
        tenant_id = data.get('tenant_id')
        
        if not invoice_number:
            return jsonify({
                'status': 'error',
                'message': 'invoice_number is required in request body'
            }), 400
        
        if not tenant_id:
            return jsonify({
                'status': 'error',
                'message': 'tenant_id is required in request body'
            }), 400
        
        waybill_print = get_waybill_by_invoice_number(invoice_number, tenant_id)
        
        if not waybill_print:
            return jsonify({
                'status': 'error',
                'message': f'No waybill found with invoice number: {invoice_number} for tenant: {tenant_id}'
            }), 404
        
        # Cancel the print job using the existing action
        cancel_action = CancelPrintWaybillAction()
        result = cancel_action(waybill_print)
        
        status_code = 200 if result.get('status') == 'success' else 400
        return jsonify(result), status_code
        
    except Exception as e:
        logger.error(f"Error cancelling waybill by invoice number: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
