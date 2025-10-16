# Installation Steps

1. Create a virtual environment:

   ```bash
   cd backend
   python3 -m venv venv
   ```

2. Activate the virtual environment:

   ```bash
   source venv/bin/activate
   ```

3. Install Flask:

   ```bash
   pip install Flask

   # Optional: For automatic reloading during development
   pip install watchdog
   # Optional: For managing environment variables
   pip install python-dotenv
   ```

## Running the API

To run the Flask API, execute the `run_api.sh` script:

```bash
./run_api.sh
```

The API will be accessible on port `5000`.

### Accessing the API from Windows (using Postman/Browser)

If you are running the Flask API in WSL and trying to access it from a Windows client (like Postman or a web browser), use the following URL:

```bash
http://127.0.0.1:5000/api/waybills/prints
```

**Note:** WSL automatically forwards ports from the WSL environment to your Windows host's `localhost`. Therefore, you can use `127.0.0.1` (or `localhost`) on your Windows machine to reach the Flask application running on `0.0.0.0:5000` inside WSL.

## References

* [Flask Quickstart Guide](https://flask.palletsprojects.com/en/stable/quickstart/)

## Troubleshooting

### Import "flask" could not be resolved

If you encounter an "Import "flask" could not be resolved" error, it means your IDE is not using the correct Python interpreter. Follow these steps to select the virtual environment:

1. **Open the Command Palette:** Press `F1`.
2. **Select Python Interpreter:** Type "Python: Select Interpreter" and choose the option.
3. **Enter interpreter path:** If your virtual environment is not listed, select "Enter interpreter path..." and provide the full path to your virtual environment's Python executable: `path_to_your_project/backend/venv/bin/python`

    After selecting the interpreter, you might need to restart your IDE or close and reopen `app.py` for the changes to take effect.
