import numpy as np
import simpleaudio as sa

frequency = 1000
fs = 44100
seconds = 0.5

t = np.linspace(0, seconds, int(seconds * fs), False)
tone = np.sin(frequency * t * 2 * np.pi)

audio = tone * (2**15 - 1) / np.max(np.abs(tone))
audio = audio.astype(np.int16)

play_obj = sa.play_buffer(audio, 1, 2, fs)
play_obj.wait_done()