import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../model"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import Frame
from modelv1 import run_detection
import base64, numpy as np, cv2

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    #
)


@app.post("/frame")
async def receive_frame(data: Frame):
    # 1. Decode — frontend already strips the data URL header before sending
    image_data = base64.b64decode(data.image)

    # 2. Convert to numpy array (for OpenCV/YOLO)
    np_arr = np.frombuffer(image_data, np.uint8)

    # 3. Decode into an actual image frame
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    # 4. Pass to YOLO
    detections = run_detection(frame)

    print(detections)  # see results in terminal

    return {"detections": detections}