import cv2
import mediapipe as mp
from scipy.spatial import distance as dist
import time
import pyttsx3
import threading


# ---------------- VOICE ALERT ----------------
def speak_async(message):
    def run():
        engine = pyttsx3.init()
        engine.setProperty('rate',150)
        engine.say(message)
        engine.runAndWait()
    threading.Thread(target=run, daemon=True).start()


# ---------------- MEDIAPIPE ----------------
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    refine_landmarks=False,
    max_num_faces=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)


# ---------------- GLOBAL VARIABLES ----------------
fatigue_score = 0
eye_counter = 0
yawn_counter = 0
attention_counter = 0

last_voice_time = 0
last_decay_time = time.time()

frame_counter = 0


# ---------------- EYE ASPECT RATIO ----------------
def calculate_ear(eye):
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)


# ---------------- MOUTH ASPECT RATIO ----------------
def calculate_mar(mouth):
    A = dist.euclidean(mouth[1], mouth[3])
    B = dist.euclidean(mouth[0], mouth[2])
    if B == 0:
        return 0
    return A / B


# ---------------- MAIN PROCESS ----------------
def process_frame(frame):

    global fatigue_score, eye_counter, yawn_counter, attention_counter
    global last_voice_time, last_decay_time, frame_counter

    frame_counter += 1

    # Ignore first frames while camera stabilizes
    if frame_counter < 25:
        return fatigue_score

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(frame_rgb)

    h, w, _ = frame.shape

    if results.multi_face_landmarks:

        for face_landmarks in results.multi_face_landmarks:

            # -------- EYE DETECTION --------
            eye_ids = [33,160,158,133,153,144]

            eye_points = []
            for idx in eye_ids:
                x = int(face_landmarks.landmark[idx].x * w)
                y = int(face_landmarks.landmark[idx].y * h)
                eye_points.append((x,y))

            ear = calculate_ear(eye_points)

            if ear < 0.20:
                eye_counter += 1
            else:
                if eye_counter > 0:
                    eye_counter -= 1

            if eye_counter > 15:
                fatigue_score += 3
                eye_counter = 0


            # -------- YAWN DETECTION --------
            mouth_ids = [13,14,78,308]

            mouth_points = []
            for idx in mouth_ids:
                x = int(face_landmarks.landmark[idx].x * w)
                y = int(face_landmarks.landmark[idx].y * h)
                mouth_points.append((x,y))

            mar = calculate_mar(mouth_points)

            if mar > 1.1:
                yawn_counter += 1
            else:
                if yawn_counter > 0:
                    yawn_counter -= 1

            if yawn_counter > 25:
                fatigue_score += 2
                yawn_counter = 0
                print("Yawn detected")


            # -------- DRIVER ATTENTION MONITOR --------
            nose = face_landmarks.landmark[1]

            nose_x = nose.x
            nose_y = nose.y

            # detect driver looking away
            if nose_x < 0.32 or nose_x > 0.68 or nose_y > 0.72:
                attention_counter += 1
            else:
                attention_counter = 0

            # trigger distraction
            if attention_counter >= 35:
                fatigue_score += 2
                attention_counter = 0
                print("Driver distracted")


    # -------- NATURAL FATIGUE DECAY --------
    if time.time() - last_decay_time > 1:
        fatigue_score = max(0, fatigue_score - 1)
        last_decay_time = time.time()


    # -------- VOICE ALERT --------
    if fatigue_score >= 6:
        if time.time() - last_voice_time > 4:
            speak_async("Warning. You appear drowsy. Please stay alert.")
            last_voice_time = time.time()


    return round(fatigue_score,2)