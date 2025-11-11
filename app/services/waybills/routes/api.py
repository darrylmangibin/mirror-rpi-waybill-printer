from flask import Blueprint, request, jsonify
from flask_sieve import validate
from app.services.waybills.requests import StoreWaybillRequest, ChangeStatusRequest
from app.services.waybills.controllers import WaybillPrintController
from app.services.waybills.models.WaybillPrint import WaybillPrint
from app.services.waybills.actions import DownloadWaybillAction, PrintWaybillAction, ChangeStatusAction
from app.utils.decorators import get_model

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
    """Print a waybill."""
    print_action = PrintWaybillAction()
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
