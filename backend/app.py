from flask_cors import CORS
from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2
import numpy as np

app = Flask(__name__)
CORS(app)

model = YOLO("yolov8n.pt")

@app.route("/detect", methods=["POST"])
def detect():
    file = request.files["frame"]
    npimg = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    results = model(frame)

    detections = []

    for r in results:
        for box in r.boxes:
            conf = float(box.conf[0])
            if conf < 0.5:
                continue

            cls = int(box.cls[0])
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            detections.append({
                "class": model.names[cls],
                "confidence": conf,
                "box": [x1, y1, x2, y2]
            })

    return jsonify(detections)

if __name__ == "__main__":
    print("🔥 Starting AI server...")
    app.run(host="127.0.0.1", port=5000, debug=True)