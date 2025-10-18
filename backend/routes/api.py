from flask import Blueprint, request, current_app
from domains.print_jobs import CreatePrintJobAction, WaybillPrintJobPrintAction

api_bp = Blueprint('api', __name__, url_prefix='/api')


@api_bp.route("/waybills/prints", methods=["POST"])
def create_print_job():
    """
    Create a print job for a waybill.
    
    Expected JSON payload:
    {
        "tenant_id": "string",
        "invoice_number": "string",
        "waybill_url": "string"
    }
    
    Returns:
        201: Print job received and created successfully
        400: Invalid JSON or missing required fields
        409: Duplicate job (same tenant, invoice, and URL already exists)
        500: Internal server error
    """
    action = CreatePrintJobAction()
    return action(request.get_json(), current_app)


@api_bp.route("/waybills/prints/<int:waybill_print_job_id>/print", methods=["POST"])
def trigger_waybill_print(waybill_print_job_id):
    """
    Trigger printing for a specific waybill print job.
    This endpoint allows manual triggering of print jobs that have already been downloaded.
    
    Parameters:
        waybill_print_job_id (int): The ID of the waybill print job to print
    
    Returns:
        200: Print job has been sent to printer successfully
        404: Print job not found
        422: Cannot print (file not downloaded or invalid state)
        500: Internal server error
    """
    action = WaybillPrintJobPrintAction()
    return action(waybill_print_job_id, current_app)
