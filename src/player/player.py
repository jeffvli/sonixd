import pyaudio
import subprocess
import threading
import time
from server import socketio

CHUNK = 1024


class AudioPlayer:
    def __init__(self):
        self.audio = pyaudio.PyAudio()
        self.index = 0
        self.start_time = 0
        self.pause_time = 0
        self.volume = 0.3
        self.status = "stopped"
        self.current_player = 1
        self.player1_stream_url = ""
        self.player2_stream_url = ""
        self.player1_song = None
        self.player2_song = None
        self.stream = self.audio.open(
            format=pyaudio.paInt16,
            channels=2,
            rate=44100,
            output=True,
        )

    def set_volume(self, volume):
        self.volume = volume

    def seek(self, seconds):
        self.stop()
        if self.current_player == 1:
            self.player1_song = subprocess.Popen(
                [
                    "ffmpeg.exe",
                    "-i",
                    self.player1_stream_url,
                    "-loglevel",
                    "panic",
                    "-ss",
                    str(seconds),
                    "-vn",
                    "-f",
                    "s16le",
                    "-af",
                    f"volume=replaygain=album, volume={self.volume}",
                    "pipe:1",
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            self.player2_song = subprocess.Popen(
                [
                    "ffmpeg.exe",
                    "-i",
                    self.player2_stream_url,
                    "-loglevel",
                    "panic",
                    "-vn",
                    "-f",
                    "s16le",
                    "-af",
                    f"volume=replaygain=album, volume={self.volume}",
                    "pipe:1",
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
        else:
            self.player2_song = subprocess.Popen(
                [
                    "ffmpeg.exe",
                    "-i",
                    self.player2_stream_url,
                    "-loglevel",
                    "panic",
                    "-ss",
                    str(seconds),
                    "-vn",
                    "-f",
                    "s16le",
                    "-af",
                    f"volume=replaygain=album, volume={self.volume}",
                    "pipe:1",
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            self.player1_song = subprocess.Popen(
                [
                    "ffmpeg.exe",
                    "-i",
                    self.player1_stream_url,
                    "-loglevel",
                    "panic",
                    "-vn",
                    "-f",
                    "s16le",
                    "-af",
                    f"volume=replaygain=album, volume={self.volume}",
                    "pipe:1",
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )

    def set_queue(self, player1_stream_url, player2_stream_url):
        self.stop()
        self.current_player = 1
        self.player1_stream_url = player1_stream_url
        self.player2_stream_url = player2_stream_url
        self.player1_song = subprocess.Popen(
            [
                "ffmpeg.exe",
                "-i",
                self.player1_stream_url,
                "-loglevel",
                "panic",
                "-vn",
                "-f",
                "s16le",
                "-af",
                f"volume=replaygain=album, volume={self.volume}",
                "pipe:1",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        self.player2_song = subprocess.Popen(
            [
                "ffmpeg.exe",
                "-i",
                self.player2_stream_url,
                "-loglevel",
                "panic",
                "-vn",
                "-f",
                "s16le",
                "-af",
                f"volume=replaygain=album, volume={self.volume}",
                "pipe:1",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

    def set_player1(self, stream_url):
        self.player1_stream_url = stream_url
        self.player1_song = subprocess.Popen(
            [
                "ffmpeg.exe",
                "-i",
                stream_url,
                "-loglevel",
                "panic",
                "-vn",
                "-f",
                "s16le",
                "-af",
                f"volume=replaygain=album, volume={self.volume}",
                "pipe:1",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

    def set_player2(self, stream_url):
        self.player2_stream_url = stream_url
        self.player1_song = subprocess.Popen(
            [
                "ffmpeg.exe",
                "-i",
                stream_url,
                "-loglevel",
                "panic",
                "-vn",
                "-f",
                "s16le",
                "-af",
                f"volume=replaygain=album, volume={self.volume}",
                "pipe:1",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

    def play(self):
        song = self.player1_song if self.current_player == 1 else self.player2_song
        data = (
            self.player1_song if self.current_player == 1 else self.player2_song
        ).stdout.read(CHUNK)
        self.start_time = time.time()

        try:
            while len(data) > 0 and self.status == "playing":
                self.stream.write(data)
                data = song.stdout.read(CHUNK)

        except:
            print("error")

        if True and self.status == "playing":
            thread = threading.Thread(
                target=self.emit_finished(current_player=self.current_player)
            )
            thread.start()
            self.pause_time = 0

            if self.current_player == 1:
                self.current_player = 2
            else:
                self.current_player = 1

        else:
            return

    def emit_finished(self, current_player):
        if current_player == 1:
            socketio.emit("queue_player1")
        else:
            socketio.emit("queue_player2")

    def play_queue(self):
        while self.status == "playing":
            self.play()

        # Capture the timestamp on stop so we can resume
        self.pause_time = time.time() - self.start_time + self.pause_time

    def play_loop(self):
        while self.status == "playing":
            self.play()

    def start_queue(self):
        self.status = "playing"
        audio_thread = threading.Thread(target=self.play_queue, daemon=True)
        audio_thread.start()

    def start_loop(self):
        self.status = "playing"
        audio_thread = threading.Thread(target=self.play_loop, daemon=True)
        audio_thread.start()

    def pause(self):
        self.status = "paused"

    def stop(self):
        self.status = "stopped"
        self.start_time = 0
        self.pause_time = 0
        self.stream.stop_stream()
        self.stream.close()
        self.stream = self.audio.open(
            format=pyaudio.paInt16,
            channels=2,
            rate=44100,
            output=True,
        )

    def get_play_object(self):
        obj = {
            "player1_stream_url": self.player1_stream_url,
            "player2_stream_url": self.player2_stream_url,
            "current_player": self.current_player,
            "volume": self.volume,
            "status": self.status,
            "start_time": self.start_time,
            "current_time": time.time() - self.start_time + self.pause_time
            if self.status == "playing"
            else self.pause_time,
        }

        print(obj)
        return obj
