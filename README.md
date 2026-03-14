# TKU-Hackathon

## Inspiration
Inspiration for Pothole Pilot was founded on the desire to have cleaner and safer roads. Many, if not most people have experienced the shock of hitting a pothole or swerving around debris. While these are an inconvenience to people's driving, they also possess a real risk to personal safety and vehicles. Hazards such as potholes and road cracks are a large problem in places like Edmonton, due to the extreme freeze and though cycles. Some solutions have been developed, but many gaps still exist in the efficient and effective maintenance of hazards.

## What it does
Pothole Pilot is a solution to fill these gaps. Unlike other solutions, Pothole Pilot is a fully integrated roadway hazard solution. It operates in five basic steps:

- Hazard detected by dashcam + AI
- Snapshot and GPS location uploaded to database
- Hazard appears on real-time map
- Work tickets generated and prioritized
- Workers complete repairs and update the system

Overall, Pothole Pilot offers an innovative way to mitigate everyday road hazards while contributing to the common good. By improving hazard detection and maintenance efficiency, the system increases the value of taxpayer dollars while remaining financially sustainable.
In this way, Pothole Pilot reflects a commitment to excellence and human flourishing by using technology to care for public infrastructure and improve safety. 


## How we built it
We trained a detection neural network, specifically a YOLOv26s model via Ultralytics. We combined two image datasets: RDD2022 road condition dataset with images from the United States, and a Pothole Detection dataset for a combined total of 7700 images. We then built a backend Node.js sever to take the detections from the AI model via json to create and store a ticket in a Supabase database. From there, we created a frontend via React which displays a Google map API widget of all the logged ticked locations. 

## Challenges we ran into
The hardest challenge we ran into was defiantly training the AI object detection model. We ran multiple training sessions at once to better our chances at a high accuracy model. In the end we achieved a model that performed at 70% precision on our testing data. This could be improved if we had more time to train.   

## Accomplishments that we're proud of
The AI works! That was a huge hurdle to overcome for our team. But we are happy with the results for the time given during this 40 hour hackathon. We also are proud of our Google API integration which hits multiple end points to have a smooth and cohesive viewing ticket experience. Finally we are proud of our business analysis of the project and our pitch to the judges.   

## What we learned
We learned more on training object detection models with such limited time. The famous line goes: garbage in, garbage out which couldn't have held more true in this project. Taking the time to find good reliable labeled data was worth it. Allocating H200 SXM and H100 SXM GPU's through Ultralytics helped us to significantly speed-up the training process, allowing us to run and evaluate multiple training sessions in a limited time.

## What's next for Pothole Pilot
The next step for Pothole Pilot is to run a trial run (or a "pilot" project), to test and prove the concept. With this acquired data, Pothole Pilot can be pitched to the city of Edmonton. From there, the software can expand to detect more hazards such as various forms or debris or flooding. Further expansion can then include venturing into other cities, or even private roadways such as those seen in the forestry industry. When it is feasible, the data collected from Pothole Pilot can be synced with autonomous systems (like a robot), to maintain hazards as needed.


---

## Run project

  cd web
  npm install
  npm run dev

---

## Citations
@inproceedings{arya2022crowdsensing,
  title={Crowdsensing-based Road Damage Detection Challenge (CRDDC’2022)},
  author={Arya, Deeksha and Maeda, Hiroya and Ghosh, Sanjay Kumar and Toshniwal, Durga and Omata, Hiroshi and Kashiyama, Takehiro and Sekimoto, Yoshihide},
  booktitle={2022 IEEE International Conference on Big Data (Big Data)},
  pages={6378--6386},
  year={2022},
  organization={IEEE}
}

@article{arya2022rdd2022,
  title={RDD2022: A multi-national image dataset for automatic Road Damage Detection},
  author={Arya, Deeksha and Maeda, Hiroya and Ghosh, Sanjay Kumar and Toshniwal, Durga and Sekimoto, Yoshihide},
  journal={arXiv preprint arXiv:2209.08538},
  year={2022}
}

@article{arya2021deep,
  title={Deep learning-based road damage detection and classification for multiple countries},
  author={Arya, Deeksha and Maeda, Hiroya and Ghosh, Sanjay Kumar and Toshniwal, Durga and Mraz, Alexander and Kashiyama, Takehiro and Sekimoto, Yoshihide},
  journal={Automation in Construction},
  volume={132},
  pages={103935},
  year={2021},
  publisher={Elsevier}
}

@article{arya2021rdd2020,
  title={RDD2020: An annotated image dataset for automatic road damage detection using deep learning},
  author={Arya, Deeksha and Maeda, Hiroya and Ghosh, Sanjay Kumar and Toshniwal, Durga and Sekimoto, Yoshihide},
  journal={Data in brief},
  volume={36},
  pages={107133},
  year={2021},
  publisher={Elsevier}

@inproceedings{arya2020global,
  title={Global road damage detection: State-of-the-art solutions},
  author={Arya, Deeksha and Maeda, Hiroya and Ghosh, Sanjay Kumar and Toshniwal, Durga and Omata, Hiroshi and Kashiyama, Takehiro and Sekimoto, Yoshihide},
  booktitle={2020 IEEE International Conference on Big Data (Big Data)},
  pages={5533--5539},
  year={2020},
  organization={IEEE}
}