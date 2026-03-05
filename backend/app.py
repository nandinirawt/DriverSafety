from flask import Flask, render_template, Response, jsonify
import cv2
from detection import process_frame

app = Flask(__name__)

camera = cv2.VideoCapture(0)
current_score = 0

def generate_frames():
    global current_score

    while True:
        success, frame = camera.read()
        if not success:
            break

        current_score = process_frame(frame)

        cv2.putText(frame, f"Fatigue Score: {current_score}",
                    (30, 50),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1,
                    (0, 0, 255),
                    2)

        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video')
def video():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/fatigue')
def fatigue():
    return jsonify({"score": current_score})

import atexit

def cleanup():
    camera.release()

atexit.register(cleanup)
if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
    