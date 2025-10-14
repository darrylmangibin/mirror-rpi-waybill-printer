from flask import Flask

# Create Flask app
app = Flask(__name__)

# Simple home page
@app.route('/')
def home():
    return "Hello! Waybill Printer API is running!"

if __name__ == '__main__':
    print("🚀 Starting Flask app...")
    print("🌐 Open: http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=True)