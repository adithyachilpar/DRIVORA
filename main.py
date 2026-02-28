import cv2
import numpy as np
import time
import winsound
import pyttsx3
import threading

# ─── INIT TTS ───────────────────────────────────────
engine = pyttsx3.init()
engine.setProperty('rate', 150)

# ─── LOAD HAAR CASCADES (built into OpenCV) ─────────
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
eye_cascade  = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

# ─── CONSTANTS ──────────────────────────────────────
BASELINE_DURATION = 30
CONSEC_FRAMES     = 15
EYE_ABSENT_RATIO  = 0.75
YAWN_WINDOW       = 300

# ─── STATE ──────────────────────────────────────────
baseline_scores   = []
baseline_score    = None
threshold_score   = None
drowsy_counter    = 0
yawn_counter      = 0
yawn_timestamps   = []
last_alert_time   = 0
session_start     = time.time()
log_lines         = []
voice_busy        = False

# ─── HELPERS ────────────────────────────────────────
def beep():
    threading.Thread(target=lambda: winsound.Beep(880, 400), daemon=True).start()

def speak(text):
    global voice_busy
    if voice_busy:
        return
    def run():
        global voice_busy
        voice_busy = True
        engine.say(text)
        engine.runAndWait()
        voice_busy = False
    threading.Thread(target=run, daemon=True).start()

def log(msg):
    ts   = time.strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    log_lines.append(line)
    print(line)

def draw_ui(frame, status, color, eye_score, score, elapsed):
    h, w = frame.shape[:2]

    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, 70), (20, 20, 20), -1)
    cv2.addWeighted(overlay, 0.65, frame, 0.35, 0, frame)

    cv2.putText(frame, f"STATUS: {status}", (15, 48),
                cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 2)
    cv2.putText(frame, f"Vigilance: {score}/100", (w - 230, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 1)
    cv2.putText(frame, f"Eye Score: {eye_score:.2f}", (w - 230, 56),
                cv2.FONT_HERSHEY_SIMPLEX, 0.55, (160, 160, 160), 1)

    overlay2 = frame.copy()
    cv2.rectangle(overlay2, (0, h - 55), (w, h), (20, 20, 20), -1)
    cv2.addWeighted(overlay2, 0.65, frame, 0.35, 0, frame)

    if baseline_score is None:
        remaining = max(0, int(BASELINE_DURATION - (time.time() - session_start)))
        cv2.putText(frame, f"Building your personal baseline... {remaining}s  (keep eyes open naturally)",
                    (15, h - 28), cv2.FONT_HERSHEY_SIMPLEX, 0.58, (0, 200, 255), 1)
    else:
        mins = int(elapsed // 60)
        secs = int(elapsed % 60)
        cv2.putText(frame,
                    f"Session: {mins:02}:{secs:02}   Yawns: {yawn_counter}   Baseline: {baseline_score:.2f}",
                    (15, h - 28), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 180, 180), 1)

    bar_w     = int((score / 100) * (w - 30))
    bar_color = (0, 220, 80) if score > 60 else (0, 165, 255) if score > 35 else (0, 0, 220)
    cv2.rectangle(frame, (15, h - 12), (w - 15, h - 4), (50, 50, 50), -1)
    cv2.rectangle(frame, (15, h - 12), (15 + bar_w, h - 4), bar_color, -1)

# ─── MAIN LOOP ──────────────────────────────────────
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

log("DRIVORA started — building personal baseline for 30 seconds. Keep your eyes open naturally.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame   = cv2.flip(frame, 1)
    h, w    = frame.shape[:2]
    elapsed = time.time() - session_start
    gray    = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    status    = "NO FACE"
    color     = (150, 150, 150)
    eye_score = 0.0
    score     = 100

    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(120, 120))

    for (fx, fy, fw, fh) in faces:
        cv2.rectangle(frame, (fx, fy), (fx + fw, fy + fh), (100, 100, 100), 1)

        roi_gray  = gray[fy:fy + fh//2, fx:fx + fw]
        roi_color = frame[fy:fy + fh//2, fx:fx + fw]

        eyes      = eye_cascade.detectMultiScale(roi_gray, scaleFactor=1.1, minNeighbors=8, minSize=(25, 25))
        eye_score = min(len(eyes) / 2.0, 1.0)

        for (ex, ey, ew, eh) in eyes:
            cv2.rectangle(roi_color, (ex, ey), (ex + ew, ey + eh), (0, 220, 80), 1)

        if elapsed < BASELINE_DURATION:
            baseline_scores.append(eye_score)
            status = "CALIBRATING"
            color  = (0, 200, 255)
            score  = 100

        else:
            if baseline_score is None:
                baseline_score  = float(np.mean(baseline_scores)) if baseline_scores else 0.8
                threshold_score = baseline_score * EYE_ABSENT_RATIO
                log(f"Baseline set — Eye score: {baseline_score:.3f}  Threshold: {threshold_score:.3f}")

            score = int(min(100, max(0, (eye_score / max(baseline_score, 0.1)) * 100)))
            now   = time.time()

            if eye_score < threshold_score:
                drowsy_counter += 1
            else:
                drowsy_counter = 0

            cooldown = now - last_alert_time

            if drowsy_counter >= CONSEC_FRAMES * 2:
                status = "ALERT! PULL OVER"
                color  = (0, 0, 255)
                if cooldown > 8:
                    log("LEVEL 2 ALERT — Voice warning triggered")
                    speak("Danger! Severe drowsiness detected. Please pull over immediately.")
                    last_alert_time = now

            elif drowsy_counter >= CONSEC_FRAMES or score < 40:
                status = "DROWSY"
                color  = (0, 80, 255)
                if cooldown > 5:
                    log("LEVEL 1 ALERT — Beep triggered")
                    beep()
                    last_alert_time = now

            elif score >= 70:
                status = "NORMAL"
                color  = (0, 200, 80)
            else:
                status = "MILD FATIGUE"
                color  = (0, 165, 255)

        break

    draw_ui(frame, status, color, eye_score, score, elapsed)
    cv2.imshow("DRIVORA — Driver Vigilance System", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

if log_lines:
    with open("session_log.txt", "w") as f:
        f.write(f"DRIVORA Session Log — {time.strftime('%Y-%m-%d %H:%M')}\n")
        f.write("=" * 50 + "\n")
        for line in log_lines:
            f.write(line + "\n")
    print("Session log saved to session_log.txt")