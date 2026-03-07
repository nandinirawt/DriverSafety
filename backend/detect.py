import os
import threading
import time
import cv2
from ultralytics import YOLO

model = YOLO("best.pt")
print(model.names)

last_alert_time = 0

def play_alert():
    os.system("afplay beep.mp3")

def detect_potholes(frame):

    global last_alert_time

    results = model(frame)

    annotated_frame = results[0].plot()

    for box in results[0].boxes:
        class_id = int(box.cls[0])
        label = model.names[class_id]

        if label == "pothole":
            current_time = time.time()

            if current_time - last_alert_time > 3:
                print("⚠️ Pothole detected!")
                threading.Thread(target=play_alert).start()
                last_alert_time = current_time

    return annotated_frame