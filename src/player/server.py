from flask import Flask, request
from flask_socketio import SocketIO, send, emit
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config["SECRET_KEY"] = "secret!"
socketio = SocketIO(app, cors_allowed_origins="*")
