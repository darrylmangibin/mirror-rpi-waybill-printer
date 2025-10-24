from functools import wraps
from flask import jsonify


def get_model(model_class):
    """
    Decorator to automatically fetch a model instance by ID from URL parameter.
    Similar to Laravel's Route Model Binding.
    
    Usage:
        @waybills_bp.route('/prints/<int:waybill_print_id>', methods=['DELETE'])
        @get_model(WaybillPrint)
        def destroy(waybill_print):
            db.session.delete(waybill_print)
            db.session.commit()
            return jsonify({'status': 'success'}), 200
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Extract the model ID from kwargs (first integer value)
            model_id = None
            for key, value in kwargs.items():
                if isinstance(value, int):
                    model_id = value
                    break
            
            # Query the model
            instance = model_class.query.get(model_id)
            
            # Return 404 if not found
            if not instance:
                return jsonify({'error': 'Not found', 'message': f'{model_class.__name__} not found'}), 404
            
            # Replace the ID parameter with the model instance
            # Keep the same parameter name in kwargs
            for key in list(kwargs.keys()):
                if isinstance(kwargs[key], int) and kwargs[key] == model_id:
                    kwargs[key] = instance
                    break
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator
