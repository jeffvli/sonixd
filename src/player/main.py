from server import app, socketio
from player import *
import routes

if __name__ == "__main__":

    try:
        app.debug = True
        socketio.run(app, use_reloader=True)
    except Exception:
        print(Exception)
