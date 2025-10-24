from flask import Blueprint, request, jsonify
from flask_sieve import validate
from app.services.waybills.requests import StoreWaybillRequest
from app.services.waybills.controllers import WaybillPrintController

# Create a Blueprint for waybill routes
waybills_bp = Blueprint('waybills', __name__, url_prefix='/api/waybills')

# Initialize controller
controller = WaybillPrintController()


@waybills_bp.route('/prints', methods=['POST'])
@validate(StoreWaybillRequest)
def store():
    """Store a waybill print request."""
    data = request.get_json()
    result = controller.store(data.get('invoice_number'), data.get('waybill_url'))
    status_code = 200 if result.get('status') == 'success' else 500
    return jsonify(result), status_code
