from player import AudioPlayer
from flask_socketio import send
from server import app, socketio

player = AudioPlayer()


@app.route("/play", methods=["POST"])
def play():
    player.start_queue()
    return "playing"


@app.route("/pause", methods=["POST"])
def pause():
    player.pause()
    return "paused"


@app.route("/set-volume", methods=["POST"])
def set_volume():
    player.set_volume(1.0)
    player.stop()
    player.start_queue()
    return "hello"


# @app.route("/queue", methods=["POST"])
# def set_queue():
#     if request.method == "POST":
#         print(request.get_json())
#         return request.get_json()


@app.route("/info")
def get_current_time():
    time = player.get_play_object()
    return time


# @app.route("/get")
# def get_song():
#     time = player.lookup(0)
#     return time


@app.route("/set-next", methods=["POST"])
def get_song():
    time = player.lookup(0)
    return time


@socketio.on("message")
def handle_message(message):
    print("Message:" + message)
    send(message)


@socketio.on("connect")
def on_connect():
    print("user connected")


@socketio.on("disconnect")
def test_disconnect():
    print("Client disconnected")
