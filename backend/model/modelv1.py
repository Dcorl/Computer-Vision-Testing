from ultralytics import YOLO

model = YOLO("yolov8s.pt")

def run_detection(frame):
    results = model(frame, device="mps")

    detections = []
    for box in results[0].boxes:
        # xyxy format: top-left (x1, y1) and bottom-right (x2, y2) corner coordinates
        detections.append({
            "label": model.names[int(box.cls)],
            "confidence": float(box.conf),
            "x1": int(box.xyxy[0][0]),
            "y1": int(box.xyxy[0][1]),
            "x2": int(box.xyxy[0][2]),
            "y2": int(box.xyxy[0][3]),
        })

    return detections