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
        self.current_song_id = 0
        self.next_song_id = 1
        self.start_time = 0
        self.pause_time = 0
        self.volume = 0.2
        self.status = "stopped"
        self.files = []
        self.stream = self.audio.open(
            format=pyaudio.paInt16,
            channels=2,  # use ffprobe to get this from the file beforehand
            rate=44100,  # use ffprobe to get this from the file beforehand
            output=True,
        )

    def lookup(self, id):
        result = next(v["url"] for v in self.files if v["id"] == id)
        return result

    def set_volume(self, vol):
        self.volume = vol

    def play(self):
        if self.stream == None:
            self.stream = self.audio.open(
                format=pyaudio.paInt16,
                channels=2,
                rate=44100,
                output=True,
            )

        song = subprocess.Popen(
            [
                "ffmpeg.exe",
                "-i",
                self.lookup(self.current_song_id),
                "-loglevel",
                "panic",
                "-ss",
                str(self.pause_time),
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

        self.stream.start_stream()
        data = song.stdout.read(CHUNK)
        self.start_time = time.time()

        while len(data) > 0 and self.status == "playing":
            self.stream.write(data)
            data = song.stdout.read(CHUNK)

        if True and self.status == "playing":
            thread = threading.Thread(target=self.emit_finished)
            thread.start()
            self.current_song_id = self.next_song_id
            self.index = self.index + 1
            self.pause_time = 0
        else:
            return

    def emit_finished(self):
        socketio.emit("play", self.get_play_object())

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
        self.stream.stop_stream()
        self.stream.close()
        self.stream = self.audio.open(
            format=pyaudio.paInt16,
            channels=2,  # use ffprobe to get this from the file beforehand
            rate=44100,  # use ffprobe to get this from the file beforehand
            output=True,
        )

    def get_play_object(self):
        obj = {
            "index": self.index,
            "status": self.status,
            "start_time": self.start_time,
            "current_time": time.time() - self.start_time + self.pause_time
            if self.status == "playing"
            else self.pause_time,
        }

        print(obj)
        return obj

    def next(self):
        self.index = self.index + 1
