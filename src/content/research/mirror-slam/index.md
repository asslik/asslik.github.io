---
title: Mirror-aware Dense RGB-D SLAM
short: Mirror-SLAM
authors: [Hatim Asslik, Mohamed Kas, Youssef Alj, Yassine Ruichek]
venue: Manuscript
status: in-progress
order: 1
theme: Reflective scenes
summary: DepthMirrorNet finds the false depth caused by mirrors and removes it before mapping, so any RGB-D SLAM system can rebuild the correct mirror geometry.
tags: [RGB-D SLAM, Depth Maps, Deep Learning, 3D Vision]
pages: 15
links:
  - { label: Project page, href: "https://mirror-slam.github.io" }
  - { label: Code, href: "https://github.com/mirror-slam/MirrorSLAM" }
  - { label: Dataset, href: "https://drive.google.com/file/d/16VspK0aUh94ZCmRfGLnZLC8CulU5raV6/" }
highlights:
  - { value: "47–63%", label: "lower reconstruction accuracy error than raw depth, across three SLAM systems" }
  - { value: "10,507", label: "training samples in the new DepthMirror Dataset" }
  - { value: "< 2%", label: "change in frame rate when DepthMirrorNet is added" }
resultsIntro: Averages over four ScanNet scenes containing mirrors. Lower is better. Trajectory error improves with ESLAM (4.40 to 4.24 cm) and SplaTAM (4.52 to 4.38 cm), and is higher with NICE-SLAM (5.29 to 5.76 cm).
results:
  - title: Reconstruction accuracy error (cm)
    columns: [SLAM system, Raw depth, With PDNet, With DepthMirrorNet, Change vs raw]
    emphasis: 3
    rows:
      - [NICE-SLAM, "42.11", "36.00", "15.55", "−63%"]
      - [ESLAM, "61.93", "70.66", "27.22", "−56%"]
      - [SplaTAM, "5.31", "5.02", "2.81", "−47%"]
  - title: Hausdorff distance (m)
    columns: [SLAM system, Raw depth, With PDNet, With DepthMirrorNet, Change vs raw]
    emphasis: 3
    rows:
      - [NICE-SLAM, "11.76", "13.69", "7.73", "−34%"]
      - [ESLAM, "2.58", "2.89", "1.99", "−23%"]
      - [SplaTAM, "3.96", "3.93", "1.94", "−51%"]
media:
  - src: ./media/error-maps.jpeg
    alt: Error heatmaps of reconstructions with raw depth and with DepthMirrorNet, showing far fewer high-error regions with DepthMirrorNet.
    caption: Reconstruction error from low (blue) to high (red). High-error regions around mirrors largely disappear.
    kind: result
  - src: ./media/architecture.jpeg
    alt: DepthMirrorNet architecture, from an input depth map through a CNN encoder-decoder and mask refinement to a filtered depth map.
    caption: DepthMirrorNet predicts a mirror mask from depth alone, refines it, and multiplies it with the input to produce filtered depth.
    kind: diagram
  - src: ./media/reconstructions.jpeg
    alt: Grid of 3D room reconstructions from NICE-SLAM, ESLAM and SplaTAM using raw depth, PDNet, DepthMirrorNet and ground truth.
    caption: Reconstructions from three SLAM systems with raw depth, PDNet, DepthMirrorNet and the ground truth.
    kind: result
---

## The problem

Mirrors are common indoors, but they mislead RGB-D sensors. Multipath interference makes infrared depth cameras return incorrect measurements on reflective surfaces. SLAM systems then lose localization and mapping accuracy, and often build ghost geometry or inflated surfaces behind the mirror.

## The approach

The work has two parts. The **DepthMirror Dataset** pairs RGB-D sensor depth maps with binary masks of the measurements corrupted by mirrors. It holds 10,507 training and 6,282 test samples, including depth maps without mirrors to limit false positives.

**DepthMirrorNet** is a CNN encoder-decoder that reads the depth map alone and segments the invalid regions. The mask is refined, then used to remove only the corrupted measurements while valid depth is preserved. Because it acts on the input depth, it can be placed in front of any RGB-D SLAM system.
