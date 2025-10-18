from flask import Blueprint
from domains.print_jobs.routes import print_jobs_bp

api_bp = Blueprint('api', __name__, url_prefix='/api')

# Register domain blueprints
api_bp.register_blueprint(print_jobs_bp)
