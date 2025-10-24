from flask import Blueprint, request, jsonify
from flask_sieve import validate
from app.services.waybills.requests import StoreWaybillRequest
from app.services.waybills.controllers import WaybillPrintController
from app.services.waybills.models.WaybillPrint import WaybillPrint
from app.utils.decorators import get_model

# Create a Blueprint for waybill routes
waybills_bp = Blueprint('waybills', __name__, url_prefix='/api/waybills')

# Initialize controller
controller = WaybillPrintController()


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
