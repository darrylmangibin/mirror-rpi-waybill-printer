from flask import Blueprint, jsonify, render_template

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
