# AI Model for Pothole Pilot

Welcome!
This is our AI computer vision model for detection of Longitudinal Cracks, Transverse Cracks, Aligator Cracks, and Potholes based off of Ultralytics YOLOv26n.

## To test our model:
Make sure to run:

```
pip install ultralytics --upgrade
```

in your terminal, and then you can simply run this file:

```
python3 predict.py
```

to test our model on your data. If you don't have your own data, you can run it on the sample_video.mp4 that is already there by default.

If you don't want to run anything, but wish to see how our networks performs on a video, we already ran the test on sample_video.mp4 and you can find the results in the "runs" folder

## AI Settings
epochs=100 
batch=16 
imgsz=640

Cloud-Trained on GPU: H200 SXM rented through https://platform.ultralytics.com/


For training, we combined two datasets:
https://github.com/sekilab/RoadDamageDetector?tab=readme-ov-file (part for United States),
and
https://www.kaggle.com/datasets/anggadwisunarto/potholes-detection-yolov8


For testing we used: https://www.kaggle.com/datasets/andrewmvd/pothole-detection



### Feel free to take some pictures of potholes and cracks in your neighbourhood and test our network! enjoy :)