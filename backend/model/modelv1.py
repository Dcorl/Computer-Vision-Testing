from ultralytics import YOLO

model = YOLO("yolov8s.pt")

def run_detection(frame):
    results = model.track(frame, device="mps", persist=True, tracker="bytetrack.yaml")

    detections = []
    for box in results[0].boxes:
        track_id = int(box.id[0]) if box.id is not None else None
        label = model.names[int(box.cls)]
        detections.append({
            "id": track_id,
            "label": f"{label}_{track_id}" if track_id is not None else label,
            "confidence": float(box.conf),
            "x1": int(box.xyxy[0][0]),
            "y1": int(box.xyxy[0][1]),
            "x2": int(box.xyxy[0][2]),
            "y2": int(box.xyxy[0][3]),
        })

    return detections