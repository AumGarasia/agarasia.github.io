// src/content/projects.ts
export type Project = {
    title: string;
    blurb: string;
    image: string;    // screenshot/jpg/png
    url?: string;
  };
  
  export const PROJECTS: Project[] = [
    {
      title: "Sigma Notebooks",
      blurb:
        "A collaborative notebook experience—fast, shareable, and delightful to author.",
      image: "/images/YamataNoOrochi (1).jpg",
      url: "https://sigma.com/…"
    },
    {
      title: "Realtime Dashboards",
      blurb:
        "High-throughput dashboards with streaming data and sub-second interactions.",
      image: "/images/YamataNoOrochi (1).jpg"
    },
    {
      title: "Design System",
      blurb:
        "A pragmatic component kit with strong accessibility and theme tokens.",
      image: "/images/YamataNoOrochi (1).jpg"
    }
  ];
  
  export const BIO = {
    title: "A little about me",
    text: [
      "Full-stack engineer who loves creative UX and high-polish details.",
      "I listen to a lot of alt / electronic / hip-hop while I build.",
      "Based in AZ; coffee, long walks, and 70bpm breakbeats."
    ]
  };
  