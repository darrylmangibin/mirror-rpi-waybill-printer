from app.utils.loggers import get_logger

logger = get_logger(__name__)


def test_foo():
    """Simple test function with logging."""
    logger.info("test_foo() called")
    return {"message": "Hello from test_foo"}
