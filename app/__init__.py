from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    
    # Enable CORS - allows frontend on different port to call this API
    CORS(app)
    
    # Register blueprints
    from app.services.waybills.routes.api import waybills_bp
    app.register_blueprint(waybills_bp)
    
    # API endpoint for testing
    @app.route('/api/hello')
    def api_hello():
        return {
            "message": "Hello from Flask Backend!",
            "status": "success"
        }
    
    @app.route('/')
    def hello():
        return {"message": "Hello World"}
    
    return app
