import type { PortfolioContent } from "../lib/portfolio";

// Sample portfolio for the demo account. Jordan Rivera is a fictional student;
// the content shows what a finished Folioform portfolio looks like.
export const DEMO_PORTFOLIO: PortfolioContent = {
  headline: "Biomedical Engineering · B.S. expected May 2027",
  intro:
    "Biomedical engineering student focused on wearable sensors and the signal processing that makes their data trustworthy. I like projects that go from a breadboard to a validated measurement, and I write up results so a reviewer can check every number.",
  skills: [
    "MATLAB",
    "Python (NumPy, SciPy)",
    "Arduino / ESP32 firmware",
    "Analog filter design",
    "SolidWorks",
    "COMSOL Multiphysics",
    "Statistical analysis (ANOVA, t-tests)",
    "Technical writing",
  ],
  experience: [
    {
      role: "Undergraduate Research Assistant",
      organization: "Wearable Sensing Lab",
      dates: "Jan 2026 – present",
      highlights: [
        "Built a bench test rig that logs accelerometer and heart-rate data on one shared clock.",
        "Wrote MATLAB scripts that flag motion artifacts, cutting manual data review time roughly in half.",
      ],
    },
    {
      role: "Engineering Orientation Mentor",
      organization: "College of Engineering",
      dates: "Aug 2025 – present",
      highlights: [
        "Mentor a group of 25 first-year engineering students through their first semester.",
        "Co-run weekly study sessions for introductory programming.",
      ],
    },
  ],
  projects: [
    {
      title: "Wrist-worn heart-rate monitor",
      summary:
        "Designed a photoplethysmography (PPG) front end and ESP32 firmware, then compared readings against a chest-strap reference during rest and walking.",
      result: "Within 3 bpm of the reference at rest",
      tags: ["ESP32", "Analog design", "MATLAB"],
    },
    {
      title: "ECG arrhythmia classifier",
      summary:
        "Filtered 150 ECG recordings, detected R-peaks with an adaptive threshold, and trained a k-nearest-neighbors model on heart-rate-variability features.",
      result: "94% cross-validation accuracy",
      tags: ["Signal processing", "Machine learning"],
    },
    {
      title: "Knee brace hinge redesign",
      summary:
        "Modeled three hinge geometries in SolidWorks and ran finite-element stress analysis to choose a lighter design that kept a 2× safety factor.",
      result: "18% lighter, same safety factor",
      tags: ["SolidWorks", "FEA"],
    },
  ],
};
