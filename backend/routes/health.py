from flask import Blueprint, jsonify, render_template, send_file, request
from io import BytesIO
import qrcode
import socket

health_bp = Blueprint('health', __name__)


@health_bp.route("/", methods=["GET"])
def home():
    """
    Root endpoint - displays API information and status as HTML.
    """
    return render_template('index.html'), 200


@health_bp.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint - returns API status.
    """
    return jsonify({
        "status": "healthy",
        "message": "API is running and ready to accept requests"
    }), 200


@health_bp.route("/api/hostname", methods=["GET"])
def get_hostname():
    """
    Returns the system hostname for QR code URL construction.
    """
    hostname = socket.gethostname()
    return jsonify({
        "hostname": hostname,
        "fqdn": f"{hostname}.local"
    }), 200


@health_bp.route("/api/server-info", methods=["GET"])
def get_server_info():
    """
    Returns comprehensive server information including hostname, IP address, and access URLs.
    """
    try:
        hostname = socket.gethostname()
        fqdn = f"{hostname}.local"
        
        # Get IP address from request
        request_host = request.host.split(':')[0]  # Remove port if present
        port = request.host.split(':')[1] if ':' in request.host else '5000'
        
        return jsonify({
            "hostname": hostname,
            "fqdn": fqdn,
            "ip_address": request_host,
            "port": port,
            "urls": {
                "hostname_local": f"http://{fqdn}:{port}",
                "ip_address": f"http://{request_host}:{port}",
                "api_endpoint": f"http://{fqdn}:{port}/api/waybills/prints"
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@health_bp.route("/api/qrcode", methods=["GET"])
def generate_qrcode():
    """
    Generates and returns a QR code image for the print endpoint.
    The QR code encodes the full API endpoint URL based on the current origin.
    """
    try:
        # Get the base URL from the request origin
        # This works for both localhost (development) and hostname.local (production)
        api_endpoint = f"{request.base_url.rstrip('/')}/api/waybills/prints"
        
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=6,
            border=2,
        )
        qr.add_data(api_endpoint)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save to BytesIO object
        img_io = BytesIO()
        img.save(img_io, 'PNG')
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/png')
    except Exception as e:
        return jsonify({"error": str(e)}), 500
