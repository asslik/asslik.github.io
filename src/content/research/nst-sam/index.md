---
title: "NST-SAM: Approach for Water-Stressed Plant Classification via Neural Style Transfer and Segment Anything Model"
short: NST-SAM
authors: [Hatim Asslik, Youssef Alj]
venue: Procedia Computer Science, vol. 236, pp. 330–337
year: 2024
status: published
order: 3
theme: Data augmentation
summary: A data augmentation architecture that combines Neural Style Transfer with the Segment Anything Model to enlarge scarce plant datasets for water-stress classification.
tags: [Computer Vision, Data Augmentation, CNN, Smart Agriculture]
pages: 8
doi: 10.1016/j.procs.2024.05.038
links:
  - { label: Publisher page, href: "https://doi.org/10.1016/j.procs.2024.05.038" }
bibtex: |
  @article{asslik2024nst,
    title   = {NST-SAM: Approach for Water-Stressed Plant Classification via Neural Style Transfer and Segment Anything Model},
    author  = {Asslik, Hatim and Alj, Youssef},
    journal = {Procedia Computer Science},
    volume  = {236},
    pages   = {330--337},
    year    = {2024},
    publisher = {Elsevier},
    doi     = {10.1016/j.procs.2024.05.038}
  }
highlights:
  - { value: "0.84", label: "F1-score with ResNet50 on the combined dataset, up from 0.75 without augmentation" }
  - { value: "0.92", label: "AUC-ROC with ResNet50 on the combined dataset" }
  - { value: "1,250", label: "images in the combined dataset, built from 949 real images" }
resultsIntro: Test-set results for each training dataset. The combined dataset is also the most balanced between stressed and non-stressed plants.
results:
  - title: Classification performance
    columns: [Training dataset, Images, VGG16 F1, ResNet50 F1, ResNet50 AUC-ROC]
    emphasis: 3
    rows:
      - [Real images only, "949", "0.70", "0.75", "0.90"]
      - [Latent Diffusion augmentation, "1,084", "0.80", "0.77", "0.91"]
      - [NST-SAM augmentation, "1,115", "0.78", "0.80", "0.90"]
      - [NST-SAM + Latent Diffusion, "1,250", "0.81", "0.84", "0.92"]
media:
  - src: ./media/architecture.jpeg
    alt: NST-SAM architecture in which style transfer output is combined with a Segment Anything content mask to generate a new plant image.
    caption: Style transfer changes the plant’s appearance, and a Segment Anything mask decides where that change is applied.
    kind: diagram
---

## The problem

Detecting water stress in plants supports water conservation and better crop yield, and CNN classifiers are well suited to the task. Training them is difficult because no suitable open dataset of water-stressed and healthy plants was available.

## The approach

The study compares two ways of augmenting a dataset of real plant images collected from the internet: Latent Diffusion Models, and **NST-SAM**, a new architecture that uses Neural Style Transfer together with the Segment Anything Model.

Four datasets were built and used to train VGG16 and ResNet50 classifiers. Using both augmentation methods together gave the strongest overall results. NST-SAM works well on specific signs of water stress, and performs poorly on wilting and soil cracking.
