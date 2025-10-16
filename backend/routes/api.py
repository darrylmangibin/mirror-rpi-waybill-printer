from flask import Blueprint, request, jsonify
from domains.print_jobs import CreatePrintJobAction

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
    action = CreatePrintJobAction()
    result, status_code = action(request.get_json(), request.app)
    return jsonify(result), status_code
