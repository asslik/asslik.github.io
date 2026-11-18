---
title: Smart Irrigation with IoT and Computer Vision
context: AI Movement, UM6P · Research internship
year: "2023"
order: 1
summary: A field system that links soil and climate sensing, automated watering and a camera-equipped mobile robot running a plant-analysis model.
tools: [ESP32, NVIDIA Jetson Nano, MQTT, Node-RED, Computer Vision, CNN]
related:
  - { label: NST-SAM paper, href: /research/nst-sam/ }
media:
  - src: ./media/system.jpeg
    alt: Smart irrigation system with field sensors, a pump, a camera robot with Jetson Nano, cloud model training and a smartphone dashboard.
    caption: System overview, from field sensing and pump control to the mobile robot, cloud training and the smartphone view.
    kind: diagram
  - src: ./media/messaging.jpeg
    alt: Messaging diagram in which an ESP32 module exchanges MQTT messages with a Jetson Nano and a smartphone.
    caption: Sensor values and commands travel over MQTT between the ESP32 module, the Jetson Nano and the smartphone.
    kind: diagram
---

Temperature, humidity and soil-moisture sensors connect to an ESP32 module that also drives a relay and water pump. An NVIDIA Jetson Nano on a mobile robot carries the camera and the machine-learning model, and a smartphone gives access to the system.

The same internship produced **NST-SAM**, the data augmentation architecture published in *Procedia Computer Science*.
