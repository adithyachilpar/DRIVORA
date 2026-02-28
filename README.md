# DRIVORA 🚗
### AI-Based Adaptive Driver Drowsiness Detection & Alert System

> *"Because the road doesn't pause when your eyes do."*

## What It Does
DRIVORA is a real-time driver vigilance system that uses your webcam to detect drowsiness before it causes an accident. Unlike generic systems, DRIVORA builds a personal baseline for each driver in the first 30 seconds — so alerts are based on your normal, not a hardcoded average.

## How To Run
**1. Install dependencies**
```bash
pip install opencv-python numpy pyttsx3
```
**2. Run**
```bash
python main.py
```
**3.** Sit in front of your webcam. First 30 seconds builds your baseline. Then real-time detection begins. Press `Q` to quit.

## How It Works
| Step | What Happens |
|------|-------------|
| Capture | Webcam records face in real time |
| Analyze | OpenCV detects eyes and face frame by frame |
| Learn | Personal EAR baseline built in first 30 seconds |
| Alert | Multi-level alerts triggered based on vigilance score |

## Alert Levels
| Level | Trigger | Response |
|-------|---------|----------|
| Level 1 | Eyes closed 15+ consecutive frames | Audio beep |
| Level 2 | Severe drowsiness detected | Voice warning |
| Level 3 (roadmap) | No response to Level 2 | Auto-SMS emergency contact |

## Tech Stack
- Python · OpenCV · NumPy · pyttsx3

## Demo Video
▶ [Watch Demo](https://drive.google.com/file/d/1nQTDPVqGf8kMqc8njFGQV9NoNOBbn7EW/view?usp=drive_link)
PPT(https://docs.google.com/presentation/d/13LoCdAoxrrGO961cXUB8EvEseO9uuHCu/edit?usp=drive_link&ouid=100723159922975968796&rtpof=true&sd=true)

## Team
Hackathon 2025 — Open Theme — Road Safety Innovation
