import logging
from flask import Flask, request, jsonify
from datetime import datetime

app = Flask(__name__)

# Configure logging
log_file_name = datetime.now().strftime("%m_%d_%Y") + ".log"
handler = logging.FileHandler(log_file_name)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
app.logger.addHandler(handler)
app.logger.setLevel(logging.INFO)


@app.route("/api/waybills/prints", methods=["POST"])
def create_print_job():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    invoice_number = data.get("invoice_number")
    waybill_url = data.get("waybill_url")

    if not invoice_number or not waybill_url:
        return jsonify({"error": "Missing invoice_number or waybill_url"}), 400

    log_message = f"Received print job - Invoice Number: {invoice_number}, PDF URL: {waybill_url}"
    app.logger.info(log_message)
    print(log_message) # Also log to console for immediate feedback

    return jsonify({"message": "Print job received successfully", "invoice_number": invoice_number}), 201

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"