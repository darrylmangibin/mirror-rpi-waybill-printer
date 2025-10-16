def handle_print_job(app, invoice_number, waybill_url):
    """
    Handle print job creation.
    Logs the print job details.
    
    Args:
        app: Flask application instance
        invoice_number: Invoice number for the print job
        waybill_url: URL to the waybill PDF
    
    Returns:
        dict: Status information about the print job
    """
    log_message = f"Received print job - Invoice Number: {invoice_number}, PDF URL: {waybill_url}"
    app.logger.info(log_message)
    print(log_message)  # Also log to console for immediate feedback
    
    return {
        "message": "Print job received successfully",
        "invoice_number": invoice_number
    }
