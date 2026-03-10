from flask import Flask, Response, request, jsonify, render_template
from flask_cors import CORS
import cv2
import numpy as np
from detect import detect_potholes
from ultralytics import YOLO
from datetime import datetime
fatigue_score_global = 0
behavior_log = []

from detection import process_frame   # drowsiness detection

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

# ---------------- MODELS ----------------
road_model = YOLO("best.pt")  # pothole / road detection

driver_cap = cv2.VideoCapture(0, cv2.CAP_AVFOUNDATION)

driver_cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
driver_cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

if not driver_cap.isOpened():
    print("❌ Driver camera failed to open")


# ---------------- HOME PAGE ----------------
@app.route("/")
def home():
    return render_template("index.html")

# ---------------- EMERGENCY LOCATOR API ----------------
@app.route("/emergency_locations")
def emergency_locations():

    locations = [
        {"name": "SMS Hospital Jaipur", "type": "hospital", "lat": 26.9124, "lon": 75.7873},
        {"name": "Jaipur Police Station", "type": "police", "lat": 26.9155, "lon": 75.8180},
        {"name": "Indian Oil Petrol Pump", "type": "fuel", "lat": 26.8890, "lon": 75.7890}
    ]

    return jsonify(locations)
# ---------------- DRIVER MONITORING STREAM ----------------
def generate_frames():

    global fatigue_score_global
    global behavior_log

    while True:

        success, frame = driver_cap.read()

        if not success:
            print("❌ Failed to read frame")
            continue

        # run drowsiness detection
        fatigue_score = process_frame(frame)
        fatigue_score_global = fatigue_score

        # -------- Behavior Detection --------
        if fatigue_score > 70:
            behavior_log.append({
                "time": datetime.now().strftime("%H:%M:%S.%f")[:-3],
                "event": "Driver Drowsy Detected",
                "severity": "danger"
            })

        elif fatigue_score > 40:
            behavior_log.append({
                "time": datetime.now().strftime("%H:%M:%S.%f")[:-3],
                "event": "Driver Getting Sleepy",
                "severity": "warning"
            })

        else:
            behavior_log.append({
                "time": datetime.now().strftime("%H:%M:%S.%f")[:-3],
                "event": "Driver Alert",
                "severity": "safe"
            })

        # keep only last 20 logs
        behavior_log[:] = behavior_log[-20:]

        cv2.putText(
            frame,
            f"Fatigue Score: {fatigue_score}",
            (30, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
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
# ---------------- FATIGUE DATA API ----------------
@app.route("/fatigue")
def fatigue():
    global fatigue_score_global

    status = "Alert"
    if fatigue_score_global > 70:
        status = "Drowsy"

    return jsonify({
        "fatigue": fatigue_score_global,
        "status": status
    })
@app.route("/behavior_log")
def get_behavior_log():
    global behavior_log
    return jsonify(behavior_log)


# ---------------- START SERVER ----------------
if __name__ == "__main__":
    print("🚗 AI Driver Safety Server Running...")
    app.run(host="127.0.0.1", port=5001, debug=True)