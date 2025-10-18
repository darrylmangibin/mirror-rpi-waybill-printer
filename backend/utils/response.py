from flask import jsonify


class ResponseTrait:
    """
    Response trait for standardized API responses.
    Similar to Laravel's response trait - provides consistent response format.
    
    Usage in Actions or Services:
        class MyAction(ResponseTrait):
            def handle(self):
                return self.success(data, "Message", 200)
    """
    
    @staticmethod
    def success(data=None, message="Success", status_code=200):
        """
        Return a success response.
        
        Args:
            data: Response data (dict, list, or model instance)
            message: Success message
            status_code: HTTP status code (default: 200)
            
        Returns:
            tuple: (jsonify response, status_code)
            
        Example:
            return self.success(user_dict, "User created successfully", 201)
        """
        return jsonify({
            "message": message,
            "data": data,
            "status": "success"
        }), status_code
    
    @staticmethod
    def created(data=None, message="Resource created successfully"):
        """
        Return a 201 Created response.
        
        Args:
            data: Created resource data
            message: Success message
            
        Returns:
            tuple: (jsonify response, 201)
            
        Example:
            return self.created(print_job.to_dict())
        """
        return ResponseTrait.success(data, message, 201)
    
    @staticmethod
    def error(message="An error occurred", errors=None, status_code=400):
        """
        Return an error response.
        
        Args:
            message: Error message
            errors: List of error details (optional)
            status_code: HTTP status code (default: 400)
            
        Returns:
            tuple: (jsonify response, status_code)
            
        Example:
            return self.error("Validation failed", ["email is required"], 422)
        """
        response = {
            "message": message,
            "status": "error"
        }
        
        if errors:
            response["errors"] = errors if isinstance(errors, list) else [errors]
        
        return jsonify(response), status_code
    
    @staticmethod
    def validation_error(errors, message="Validation failed"):
        """
        Return a 422 Unprocessable Entity validation error response.
        
        Args:
            errors: List of validation error messages
            message: Error message
            
        Returns:
            tuple: (jsonify response, 422)
            
        Example:
            return self.validation_error(["invoice_number is required", "waybill_url is required"])
        """
        return ResponseTrait.error(message, errors, 422)
    
    @staticmethod
    def not_found(message="Resource not found"):
        """
        Return a 404 Not Found response.
        
        Args:
            message: Error message
            
        Returns:
            tuple: (jsonify response, 404)
            
        Example:
            return self.not_found("Print job not found")
        """
        return ResponseTrait.error(message, status_code=404)
    
    @staticmethod
    def unauthorized(message="Unauthorized"):
        """
        Return a 401 Unauthorized response.
        
        Args:
            message: Error message
            
        Returns:
            tuple: (jsonify response, 401)
            
        Example:
            return self.unauthorized("Invalid token")
        """
        return ResponseTrait.error(message, status_code=401)
    
    @staticmethod
    def forbidden(message="Forbidden"):
        """
        Return a 403 Forbidden response.
        
        Args:
            message: Error message
            
        Returns:
            tuple: (jsonify response, 403)
            
        Example:
            return self.forbidden("You don't have permission")
        """
        return ResponseTrait.error(message, status_code=403)
    
    @staticmethod
    def conflict(data=None, message="Resource already exists"):
        """
        Return a 409 Conflict response.
        
        Args:
            data: Existing resource data (optional)
            message: Error message
            
        Returns:
            tuple: (jsonify response, 409)
            
        Example:
            return self.conflict(existing_job.to_dict(), "Duplicate print job exists")
        """
        response = {
            "message": message,
            "status": "error"
        }
        
        if data:
            response["data"] = data
        
        return jsonify(response), 409
    
    @staticmethod
    def server_error(message="Internal server error"):
        """
        Return a 500 Internal Server Error response.
        
        Args:
            message: Error message
            
        Returns:
            tuple: (jsonify response, 500)
            
        Example:
            return self.server_error("Database connection failed")
        """
        return ResponseTrait.error(message, status_code=500)
    
    @staticmethod
    def paginated(items, total, page, per_page, message="Success"):
        """
        Return a paginated response.
        
        Args:
            items: List of items
            total: Total count
            page: Current page
            per_page: Items per page
            message: Success message
            
        Returns:
            tuple: (jsonify response, 200)
            
        Example:
            return self.paginated(jobs, 100, 1, 10, "Print jobs retrieved")
        """
        return jsonify({
            "message": message,
            "data": items,
            "pagination": {
                "total": total,
                "page": page,
                "per_page": per_page,
                "last_page": (total + per_page - 1) // per_page
            },
            "status": "success"
        }), 200
