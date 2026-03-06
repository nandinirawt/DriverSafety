from flask import Flask, Response
from ultralytics import YOLO
import cv2

app = Flask(__name__)

model = YOLO("best.pt")
cap = cv2.VideoCapture(0, cv2.CAP_AVFOUNDATION)

def generate_frames():
    while True:
        success, frame = cap.read()
        if not success:
            break

        results = model(frame)
        frame = results[0].plot()

        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/')
def home():
    return "Camera stream running. Go to /video"

@app.route('/video')
def video():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
   app.run(debug=True, port=5001)