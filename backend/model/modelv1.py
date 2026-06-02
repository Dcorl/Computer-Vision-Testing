from ultralytics import YOLO

model = YOLO("yolov8s.pt")
results = model("your_image.jpg", device="mps")