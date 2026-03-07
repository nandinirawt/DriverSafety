from flask import Flask, Response, request, jsonify, render_template
from flask_cors import CORS
import cv2
import numpy as np
from detect import detect_potholes
from ultralytics import YOLO

from detection import process_frame   # drowsiness detection

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

# ---------------- MODELS ----------------
road_model = YOLO("best.pt")  # pothole / road detection

cap = cv2.VideoCapture(0, cv2.CAP_AVFOUNDATION)


# ---------------- HOME PAGE ----------------
@app.route("/")
def home():
    return render_template("index.html")


# ---------------- DRIVER MONITORING STREAM ----------------
def generate_frames():

    while True:

        success, frame = cap.read()
        if not success:
            break

        # Run drowsiness detection
        fatigue_score = process_frame(frame)

        cv2.putText(
            frame,
            f"Fatigue Score: {fatigue_score}",
            (30,40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0,0,255),
            2
        )

        ret, buffer = cv2.imencode(".jpg", frame)
        frame = buffer.tobytes()

        yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")


@app.route("/video")
def video():
    return Response(generate_frames(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")


# ---------------- ROAD DETECTION API ----------------
@app.route("/detect", methods=["POST"])
def detect():

    file = request.files["frame"]
    npimg = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    results = road_model(frame)

    detections = []

    for r in results:
        for box in r.boxes:

            conf = float(box.conf[0])
            if conf < 0.5:
                continue

            cls = int(box.cls[0])
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            detections.append({
                "class": road_model.names[cls],
                "confidence": conf,
                "box": [x1, y1, x2, y2]
            })

    return jsonify(detections)


# ---------------- START SERVER ----------------
if __name__ == "__main__":
    print("🚗 AI Driver Safety Server Running...")
    app.run(host="127.0.0.1", port=5000, debug=True)