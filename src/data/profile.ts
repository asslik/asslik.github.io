export const profile = {
  name: 'Hatim Asslik',
  headline: 'Electrical Engineer · Computer Vision, AI & Robotics',
  intro: [
    'Engineer (EHTP Graduate) with research experience at UM6P (Morocco) and UTBM (France), specializing in Computer Vision, Robotics, and Machine Learning.',
    'Currently seeking opportunities in research and R&D to leverage my technical expertise, contribute to innovative projects, and further develop my skills.',
  ],
  description:
    'Hatim Asslik is an electrical engineer working on computer vision, AI and robotics, with research experience in visual SLAM and 3D Gaussian Splatting.',
  // Assembled in the browser so the address is not sitting in the page source.
  email: { user: 'hatimasslik', domain: 'gmail.com' },
  linkedin: 'https://www.linkedin.com/in/hatim-asslik/',
  // Neutral address so the name is not in the URL; visitors still save it under cvName.
  cv: '/cv/cv.pdf',
  cvName: 'Hatim_Asslik_CV.pdf',
};

export const nav = [
  { href: '/research/', label: 'Research' },
  { href: '/projects/', label: 'Projects' },
  { href: '/teaching/', label: 'Teaching' },
  { href: '/media/', label: 'Media' },
  { href: '/cv/', label: 'CV' },
];

export const education = [
  {
    period: 'Oct. 2024 – Nov. 2026',
    title: 'PhD Researcher in Computer Vision and Robotics (Cotutelle)',
    place: 'Mohammed VI Polytechnic University (UM6P) and University of Technology of Belfort-Montbéliard (UTBM)',
  },
  {
    period: '2021 – 2024',
    title: 'Engineering Degree in Electrical Engineering',
    place: 'Hassania School of Public Works (EHTP), Casablanca',
  },
  {
    period: '2019 – 2021',
    title: 'Preparatory Classes (CPGE)',
    place: 'Lycée Mohammed VI d’Excellence (ex LYDEX), Benguerir',
  },
  { period: '2016 – 2019', title: 'Baccalaureate', place: 'Lycée Technique Alfarabi, Salé' },
];

export const skills = [
  {
    group: 'Research',
    items: [
      'Computer Vision', 'Visual SLAM', 'Mobile Robotics', 'Robot Perception', 'Machine Learning', 'Deep Learning',
      '3D Reconstruction', 'RGB-D Vision', '3D Gaussian Splatting', 'NeRF', 'Sensor Fusion',
    ],
  },
  { group: 'Frameworks', items: ['PyTorch', 'TensorFlow', 'OpenCV'] },
  { group: 'Coding', items: ['Python', 'C', 'C++', 'Arduino', 'SQL', 'LaTeX'] },
  { group: 'Languages', items: ['Arabic', 'English', 'French'] },
];

export const awards = [
  { year: '2021', text: 'Ranked 19th out of 600 in the National Common Entrance Exam (CNC), TSI track.' },
  { year: '2019', text: 'Ranked first in the baccalaureate in the Rabat-Salé-Kénitra region, Electrical Sciences track.' },
];
