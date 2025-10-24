from flask import Blueprint, request, jsonify

# Create a Blueprint for waybill routes
waybills_bp = Blueprint('waybills', __name__, url_prefix='/api/waybills')

@waybills_bp.route('/prints', methods=['POST'])
def print_waybill():
    """
    Accept a POST request to print a waybill.
    
    Expected JSON body:
    {
        "invoice_number": str,
        "waybill_url": str
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        invoice_number = data.get('invoice_number')
        waybill_url = data.get('waybill_url')
        
        if not invoice_number:
            return jsonify({"error": "invoice_number is required"}), 400
        if not waybill_url:
            return jsonify({"error": "waybill_url is required"}), 400
        
        # TODO: Implement printing logic here
        return jsonify({
            "status": "success",
            "message": "Waybill print request received",
            "invoice_number": invoice_number,
            "waybill_url": waybill_url
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
