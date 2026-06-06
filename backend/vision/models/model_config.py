#Yolo Model Config
from enum import Enum

class ModelPath(Enum):
    OBJECT = "backend/vision/models/yolov8s.pt"
    GESTURE = "backend/vision/models/yolov8n.pt"
    FACE = "backend/vision/models/yolov8m.pt"