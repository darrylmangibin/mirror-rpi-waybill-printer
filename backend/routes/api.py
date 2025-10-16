from flask import Blueprint, request, jsonify
from handlers import handle_print_job

api_bp = Blueprint('api', __name__, url_prefix='/api')


@api_bp.route("/waybills/prints", methods=["POST"])
def create_print_job():
    """
    Create a print job for a waybill.
    
    Expected JSON payload:
    {
        "invoice_number": "string",
        "waybill_url": "string"
    }
    
    Returns:
        201: Print job received successfully
        400: Invalid JSON or missing required fields
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    invoice_number = data.get("invoice_number")
    waybill_url = data.get("waybill_url")

    if not invoice_number or not waybill_url:
        return jsonify({"error": "Missing invoice_number or waybill_url"}), 400

    result = handle_print_job(request.app, invoice_number, waybill_url)
    return jsonify(result), 201
