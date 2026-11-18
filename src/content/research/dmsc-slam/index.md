---
title: "DMSC-SLAM: Dynamic Dense Monocular 3DGS SLAM via Motion, Semantic Priors and Scene Consistency"
short: DMSC-SLAM
authors: [Hatim Asslik, Mohamed Kas, Youssef Alj, Yassine Ruichek]
venue: Manuscript
status: in-progress
order: 2
theme: Dynamic scenes
summary: A dense monocular 3D Gaussian Splatting SLAM system that combines motion, semantic and scene-consistency cues to keep moving objects out of tracking and mapping.
tags: [Monocular SLAM, 3D Gaussian Splatting, Dynamic Scenes, Optical Flow]
pages: 7
highlights:
  - { value: "1.5–1.65×", label: "the frame rate of WildGS-SLAM on the two evaluation datasets" }
  - { value: "2.48 cm", label: "average trajectory error on Bonn RGB-D Dynamic (WildGS-SLAM: 2.46 cm)" }
  - { value: "10.94 MB", label: "average scene model size (WildGS-SLAM: 11.45 MB)" }
resultsIntro: Comparison with WildGS-SLAM. ATE is the absolute trajectory error, where lower is better. FPS is the processing rate, where higher is better.
results:
  - title: Tracking and runtime
    columns: [Dataset, WildGS-SLAM ATE (cm), DMSC-SLAM ATE (cm), WildGS-SLAM FPS, DMSC-SLAM FPS]
    emphasis: 4
    rows:
      - [Wild-SLAM MoCap, "0.53", "0.64", "0.26", "0.40"]
      - [Bonn RGB-D Dynamic, "2.46", "2.48", "0.26", "0.43"]
media:
  - src: ./media/pipeline.png
    alt: DMSC-SLAM pipeline combining a motion mask from compensated optical flow, a scene-consistency mask, depth estimation, DROID-style pose tracking and a 3D Gaussian Splatting map.
    caption: The dynamic-object mask is the union of a motion mask and a scene-consistency mask restricted to well-reconstructed regions.
    kind: diagram
---

## The problem

Classical SLAM assumes a static world, so moving objects corrupt both the estimated trajectory and the map. Each single cue has a blind spot: scene-consistency checks fail where the map is still under-reconstructed, motion signals miss a person who has stopped moving, and semantics cannot tell whether an object is actually moving.

## The approach

DMSC-SLAM combines these cues so that each covers the limits of the others.

- **Motion prior.** XFeat keypoints, LighterGlue matching and a RANSAC homography compensate camera ego-motion. RAFT optical flow then highlights independently moving objects.
- **Motion and semantics.** Edges of the compensated flow select which semantic instances belong in the motion mask.
- **Scene consistency.** SSIM between the observed and rendered images reveals what disagrees with the 3D Gaussian map, refined with semantic segmentation.
- **Scene confidence.** A confidence map from Gaussian opacity limits the consistency cue to well-reconstructed regions.

Pose tracking builds on DROID-SLAM and relies on static pixels, while the 3D Gaussian Splatting map is optimized using the resulting static masks.
