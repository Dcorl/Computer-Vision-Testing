#Base class for all modes
from tracker import ObjectTracker
from ultralytics import YOLO
from models.model_config import ModelPath

class BaseMode:
    def __init__(self, yolo_model_path: ModelPath):
        self.model = YOLO(yolo_model_path.value)
        # Creating Tracker Object
        self.tracker = ObjectTracker()

    def run_detection(self, frame):
        results = self.model.track(frame, device="mps", persist=True, tracker="bytetrack.yaml")
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
                "label": self.model.names[int(box.cls)],
                "confidence": float(box.conf),
                "x1": int(box.xyxy[0][0]),
                "y1": int(box.xyxy[0][1]),
                "x2": int(box.xyxy[0][2]),
                "y2": int(box.xyxy[0][3]),
            }

        #Passes detections thought tracker pipeline for accuracy
        confirmed_detections = self.tracker.process(detections)

        #Cleans up stalled objects from memory
        self.tracker.expire()

        #Returns only confirmed objects as a list for the API
        return list(confirmed_detections.values())



