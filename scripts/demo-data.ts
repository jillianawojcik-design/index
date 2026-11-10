import type { PortfolioContent } from "../lib/portfolio";

// Sample portfolio for the demo account (demo@demo.com). Jordan Rivera is a
// fictional student; this content shows the full case-study format.
export const DEMO_SLUG = "jordan-rivera";

export const DEMO_PORTFOLIO: PortfolioContent = {
  version: 2,
  name: "Jordan Rivera",
  headline: "Biomedical Engineer — Wearable Sensing & Biosignal Processing",
  targetRole: "Medical device R&D engineering",
  location: "State College, PA",
  intro:
    "I build wearable sensors and the signal processing that makes their measurements trustworthy, then validate them against a reference before I call them done.",
  about:
    "I'm a biomedical engineering student who likes the whole path from a breadboard to a validated number. My projects have run from analog front-end design and ESP32 firmware to MATLAB analysis and finite-element modeling, and most of them end with a comparison against a reference instrument. I'm looking for a medical device R&D role where I can keep doing verification-minded hardware and signal-processing work.",
  contact: {
    email: "demo@demo.com",
    linkedin: "",
    github: "",
    website: "",
  },
  highlights: [
    { value: "±3 bpm", label: "Heart-rate agreement with a chest-strap reference at rest" },
    { value: "94%", label: "Cross-validation accuracy of my ECG arrhythmia classifier" },
    { value: "18%", label: "Mass reduction in a knee-brace hinge at the same 2× safety factor" },
    { value: "25", label: "First-year engineering students mentored each semester" },
  ],
  focusAreas: ["Wearable sensors", "Biosignal processing", "Analog front-end design", "Verification & validation"],
  skills: [
    { category: "Signal processing & analysis", items: ["MATLAB", "Python (NumPy, SciPy)", "Digital filtering", "R-peak detection", "k-NN classification", "ANOVA & t-tests"] },
    { category: "Hardware & firmware", items: ["ESP32", "Arduino C++", "PPG front-end design", "Op-amp filter design", "Soldering & breadboarding", "Oscilloscope"] },
    { category: "Modeling & CAD", items: ["SolidWorks", "Finite-element analysis", "COMSOL Multiphysics"] },
    { category: "Lab & documentation", items: ["Test protocols", "Bench validation", "Technical reports", "Requirements tracing"] },
  ],
  experience: [
    {
      role: "Undergraduate Research Assistant",
      organization: "Wearable Sensing Lab",
      location: "State College, PA",
      dates: "Jan 2026 – present",
      summary: "Support data collection and analysis for wrist-worn physiological sensing studies.",
      highlights: [
        "Built a bench rig that logs accelerometer and heart-rate data on one shared clock.",
        "Wrote MATLAB scripts that flag motion artifacts, cutting manual data review time roughly in half.",
      ],
    },
    {
      role: "Engineering Orientation Mentor",
      organization: "College of Engineering",
      location: "",
      dates: "Aug 2025 – present",
      summary: "",
      highlights: [
        "Mentor a group of 25 first-year engineering students through their first semester.",
        "Co-run weekly study sessions for introductory programming.",
      ],
    },
  ],
  projects: [
    {
      slug: "wrist-worn-heart-rate-monitor",
      title: "Wrist-worn heart-rate monitor",
      context: "Biomedical Instrumentation · Spring 2026",
      status: "Completed",
      role: "Hardware, firmware & validation lead (team of 3)",
      summary:
        "Designed a PPG front end and ESP32 firmware for a wrist-worn heart-rate monitor, then validated it against a chest-strap reference during rest and walking.",
      tags: ["Wearables", "PPG", "Embedded"],
      challenge:
        "Optical heart-rate sensing at the wrist is convenient but noisy: ambient light and arm motion corrupt the photoplethysmography (PPG) signal. The course brief asked for a low-cost wrist device whose readings could be shown to agree with an accepted reference.",
      objectives: [
        "Detect heart rate from a wrist PPG signal in real time on a microcontroller.",
        "Agree with a chest-strap reference within ±5 bpm at rest.",
        "Report agreement during walking as well as at rest.",
      ],
      contributions: [
        "Designed the analog front end: transimpedance amplifier and band-pass filtering for the photodiode signal.",
        "Wrote the ESP32 firmware for sampling, peak detection and on-device heart-rate calculation.",
        "Wrote the validation protocol and the MATLAB comparison against the chest-strap reference.",
      ],
      approach: [
        "Selected a green-LED reflective PPG sensor and designed a transimpedance stage with a 0.5–4 Hz band-pass to cover 30–240 bpm.",
        "Sampled the conditioned signal on an ESP32 and detected beats with an adaptive threshold that tracks signal amplitude.",
        "Computed heart rate from a rolling window of beat-to-beat intervals and logged it alongside the reference strap.",
        "Compared the two recordings in MATLAB using mean absolute difference for rest and walking segments.",
      ],
      tools: ["ESP32", "Arduino C++", "Op-amp filter design", "MATLAB", "Oscilloscope"],
      designDecisions: [
        "Adaptive rather than fixed peak threshold, because PPG amplitude changed with skin contact and wrist position.",
        "Band-pass corners chosen from the physiological heart-rate range to suppress baseline drift and high-frequency noise.",
      ],
      validation: [
        "Simultaneous recordings with a chest-strap heart-rate monitor as the reference.",
        "Separate analysis of resting and walking segments so motion effects were visible rather than averaged away.",
      ],
      results: [
        { value: "±3 bpm", label: "Agreement with the chest-strap reference at rest" },
        { value: "Rest + walking", label: "Both conditions recorded and compared against the reference" },
      ],
      impact:
        "The device met the resting accuracy target and made the effect of motion on wrist PPG measurable, which set up motion-artifact handling as the next design problem.",
    },
    {
      slug: "ecg-arrhythmia-classifier",
      title: "ECG arrhythmia classifier",
      context: "Signal processing course project · 2026",
      status: "Completed",
      role: "Individual project",
      summary:
        "Built a MATLAB pipeline that cleans ECG recordings, finds each heartbeat and classifies recordings as normal or abnormal, reaching 94% cross-validation accuracy.",
      tags: ["Signal processing", "Machine learning", "Cardiology"],
      challenge:
        "Raw ECG recordings carry baseline wander and noise, and R-peak amplitude varies between recordings, so a fixed threshold misses beats. The task was to classify 150 recordings as normal or abnormal using features that a clinician could interpret.",
      objectives: [
        "Remove baseline wander without distorting QRS complexes.",
        "Detect R-peaks reliably across recordings with different amplitudes.",
        "Classify recordings using interpretable heart-rate-variability features.",
      ],
      contributions: ["Designed and implemented the full pipeline, from filtering to classification and evaluation."],
      approach: [
        "High-pass filtered each recording to remove baseline wander.",
        "Detected R-peaks with an adaptive threshold scaled to each recording.",
        "Computed R–R interval features, including mean heart rate and heart-rate variability.",
        "Trained a k-nearest-neighbors classifier and evaluated it with cross-validation.",
      ],
      tools: ["MATLAB", "Digital filtering", "k-NN classification"],
      designDecisions: [
        "Chose interpretable R–R features over raw-waveform features so each prediction could be explained physiologically.",
      ],
      validation: ["Cross-validation on the 150 labeled recordings."],
      results: [
        { value: "94%", label: "Cross-validation accuracy" },
        { value: "150", label: "ECG recordings processed" },
      ],
      impact:
        "Showed that a small set of physiologically meaningful features can separate normal and abnormal recordings with high accuracy on this dataset.",
    },
    {
      slug: "knee-brace-hinge-redesign",
      title: "Knee brace hinge redesign",
      context: "Mechanical design project · Fall 2025",
      status: "Completed",
      role: "CAD and analysis (team of 4)",
      summary:
        "Modeled three hinge geometries in SolidWorks and used finite-element analysis to pick a design 18% lighter at the same 2× safety factor.",
      tags: ["Orthopedic devices", "FEA", "CAD"],
      challenge:
        "The existing hinge on a hinged knee brace was heavier than needed. The team was asked to reduce mass without reducing the safety factor under the specified loading.",
      objectives: ["Reduce hinge mass.", "Keep a safety factor of at least 2 under the specified load case."],
      contributions: [
        "Built the three candidate hinge geometries in SolidWorks.",
        "Set up and ran the finite-element stress analysis for each candidate.",
      ],
      approach: [
        "Modeled three alternative hinge geometries in SolidWorks.",
        "Applied the specified load case and ran finite-element stress analysis on each.",
        "Compared peak stress and safety factor against mass to select a design.",
      ],
      tools: ["SolidWorks", "Finite-element analysis"],
      designDecisions: ["Selected the lightest geometry that still met the 2× safety factor rather than the lowest-stress option."],
      validation: ["Safety factor checked for every candidate against the required minimum of 2."],
      results: [
        { value: "18%", label: "Lighter than the original hinge" },
        { value: "2×", label: "Safety factor maintained" },
      ],
      impact: "",
    },
  ],
  education: [
    {
      institution: "Penn State University",
      degree: "B.S. Biomedical Engineering",
      dates: "Expected May 2027",
      details: ["Coursework: Biomedical Instrumentation, Signal Processing, Biomechanics, Numerical Methods"],
    },
  ],
  certifications: [{ name: "MathWorks Onramp: Signal Processing", issuer: "MathWorks", date: "" }],
  publications: [],
  accomplishments: ["Engineering Orientation Mentor, College of Engineering"],
  suggestions: [
    "Add a LinkedIn URL so employers can reach you directly.",
    "Add a photo or diagram from your heart-rate monitor build (your own image).",
    "Report the walking-condition agreement for the heart-rate monitor if you measured it.",
  ],
};
