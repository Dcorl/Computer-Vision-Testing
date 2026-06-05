from tracker import ObjectTracker
from ultralytics import YOLO

model = YOLO("yolov8s.pt")
# Creating Tracker Object
tracker = ObjectTracker()

def run_detection(frame):
    results = model.track(frame, device="mps", persist=True, tracker="bytetrack.yaml")
    #Stores raw detections from current frame
    detections = {}

    for box in results[0].boxes:
        #Track ID contains the tracker assigned id from ultralytics
        track_id = int(box.id[0]) if box.id is not None else None

        #Skip objects without a tracker ID assigned
        if track_id is None:
            continue

        #Stores detections with hashtable and using keys to get information about those objects
        detections[track_id] = {
            "label": model.names[int(box.cls)],
            "confidence": float(box.conf),
            "x1": int(box.xyxy[0][0]),
            "y1": int(box.xyxy[0][1]),
            "x2": int(box.xyxy[0][2]),
            "y2": int(box.xyxy[0][3]),
        }

    #Passes detections thought tracker pipeline for accuracy
    confirmed_detections = tracker.process(detections)

    #Cleans up stalled objects from memory
    tracker.expire()

    #Returns only confirmed objects as a list for the API
    return list(confirmed_detections.values())



