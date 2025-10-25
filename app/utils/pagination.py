"""
Pagination utilities for Flask responses.
"""


def format_pagination(paginated, status="success", message="Retrieved successfully"):
    """
    Format Flask-SQLAlchemy paginated results into a standard response.
    
    Args:
        paginated: Result from .paginate() method
        status: Status message (default: "success")
        message: Response message (default: "Retrieved successfully")
    
    Returns:
        dict: Formatted pagination response with status, data, and metadata
    """
    data = [item.to_dict() for item in paginated.items]
    
    return {
        "status": status,
        "message": message,
        "data": data,
        "pagination": {
            "current_page": paginated.page,
            "per_page": paginated.per_page,
            "total": paginated.total,
            "last_page": paginated.pages,
            "from": (paginated.page - 1) * paginated.per_page + 1 if paginated.items else None,
            "to": (paginated.page - 1) * paginated.per_page + len(paginated.items) if paginated.items else None,
        },
        "links": {
            "first": f"?page=1&per_page={paginated.per_page}",
            "last": f"?page={paginated.pages}&per_page={paginated.per_page}",
            "prev": f"?page={paginated.page - 1}&per_page={paginated.per_page}" if paginated.has_prev else None,
            "next": f"?page={paginated.page + 1}&per_page={paginated.per_page}" if paginated.has_next else None,
        }
    }
