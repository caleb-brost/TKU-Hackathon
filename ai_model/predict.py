from ultralytics import YOLO
# This file can be used to test our detection network
# simply place your file name in a specified field
# make sure to follow the instructions in README.md
# enjoy :)
task="detect"
model = YOLO("weights.onnx")
results = model("sample_video.mp4", save=True) # place your file name here
