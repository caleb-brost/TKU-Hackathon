from ultralytics import YOLO
# This file can be used to test our detection network,
# simply place your file name in a specified field
# make sure to run "pip install ultralytics --upgrade"
# in your terminal, and then you can simply run this file
# "python3 predict.py" to test our model on your data
# if you don't have your own data, you can run it on the sample_video.mp4
# enjoy :)
task="detect"
model = YOLO("weights.onnx")
results = model("sample_video.mp4", save=True) # place your file name here



# for training, we combined two datasets:
# https://github.com/sekilab/RoadDamageDetector?tab=readme-ov-file (part for United States)
# and
# https://www.kaggle.com/datasets/anggadwisunarto/potholes-detection-yolov8

# for testing used: https://www.kaggle.com/datasets/andrewmvd/pothole-detection
