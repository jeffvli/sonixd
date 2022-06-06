from player import AudioPlayer
from flask_socketio import send
from server import app, socketio

player = AudioPlayer()


@app.route("/info")
def get_current_time():
    time = player.get_play_object()
    return time


@socketio.on("queue")
def on_queue(player1_stream_url, player2_stream_url):
    player.set_queue(player1_stream_url, player2_stream_url)


@socketio.on("queue_player1")
def on_queue_player1(stream_url):
    player.set_player1(stream_url)


@socketio.on("queue_player2")
def on_queue_player2(stream_url):
    player.set_player2(stream_url)


@socketio.on("player_play")
def on_play():
    player.start_queue()


@socketio.on("player_pause")
def on_pause():
    player.pause()


@socketio.on("player_stop")
def on_stop():
    player.stop()


@socketio.on("player_next")
def on_next(player1_stream_url, player2_stream_url):
    player.stop()
    player.set_queue(player1_stream_url, player2_stream_url)
    player.start_queue()


@socketio.on("player_previous")
def on_previous(player1_stream_url, player2_stream_url):
    player.stop()
    player.set_queue(player1_stream_url, player2_stream_url)
    player.start_queue()


@socketio.on("player_seek")
def on_seek(seconds):
    player.seek(seconds)
    player.start_queue()


@socketio.on("player_volume")
def on_volume(seconds, volume):
    player.set_volume(volume)
    print(seconds)
    player.seek(seconds)
    player.start_queue()


@socketio.on("connect")
def on_connect():
    print("user connected")


@socketio.on("disconnect")
def test_disconnect():
    print("Client disconnected")
