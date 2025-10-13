import { StatsData } from "@/components/stats/stats-container";

 export const mockData: StatsData = {
    views: {
      day: Array.from({ length: 24 }, (_, i) => ({ label: `${i}:00`, value: Math.floor(Math.random() * 200) })),
      week: Array.from({ length: 7 }, (_, i) => ({ label: `Day ${i + 1}`, value: Math.floor(Math.random() * 800) })),
      month: Array.from({ length: 30 }, (_, i) => ({ label: `D${i + 1}`, value: Math.floor(Math.random() * 1000) })),
      year: Array.from({ length: 12 }, (_, i) => ({ label: `M${i + 1}`, value: Math.floor(Math.random() * 2000) })),
    },
    browsers: {
      day: [
        { name: "Chrome", value: 60 },
        { name: "Firefox", value: 20 },
        { name: "Edge", value: 10 },
        { name: "Safari", value: 10 },
      ],
      week: [
        { name: "Chrome", value: 300 },
        { name: "Firefox", value: 200 },
        { name: "Edge", value: 150 },
        { name: "Safari", value: 120 },
      ],
      month: [
        { name: "Chrome", value: 900 },
        { name: "Firefox", value: 700 },
        { name: "Edge", value: 450 },
        { name: "Safari", value: 400 },
      ],
      year: [
        { name: "Chrome", value: 2500 },
        { name: "Firefox", value: 1600 },
        { name: "Edge", value: 900 },
        { name: "Safari", value: 850 },
      ],
    },
    os: {
      day: [
        { name: "Windows", value: 40 },
        { name: "macOS", value: 30 },
        { name: "Linux", value: 10 },
        { name: "Android", value: 20 },
      ],
      week: [
        { name: "Windows", value: 200 },
        { name: "macOS", value: 150 },
        { name: "Linux", value: 80 },
        { name: "Android", value: 100 },
      ],
      month: [
        { name: "Windows", value: 900 },
        { name: "macOS", value: 700 },
        { name: "Linux", value: 250 },
        { name: "Android", value: 400 },
      ],
      year: [
        { name: "Windows", value: 2500 },
        { name: "macOS", value: 1800 },
        { name: "Linux", value: 1000 },
        { name: "Android", value: 1200 },
      ],
    },
    referrers: {
      day: [
        { name: "Google", value: 80 },
        { name: "Twitter", value: 40 },
        { name: "Facebook", value: 30 },
        { name: "LinkedIn", value: 20 },
      ],
      week: [
        { name: "Google", value: 400 },
        { name: "Twitter", value: 200 },
        { name: "Facebook", value: 150 },
        { name: "LinkedIn", value: 120 },
      ],
      month: [
        { name: "Google", value: 900 },
        { name: "Twitter", value: 600 },
        { name: "Facebook", value: 300 },
        { name: "LinkedIn", value: 250 },
      ],
      year: [
        { name: "Google", value: 2000 },
        { name: "Twitter", value: 1400 },
        { name: "Facebook", value: 800 },
        { name: "LinkedIn", value: 700 },
      ],
    },
    map: {
      day: [
        { id: "IN", value: 80 },
        { id: "US", value: 50 },
        { id: "DE", value: 30 },
        { id: "GB", value: 20 },
      ],
      week: [
        { id: "IN", value: 200 },
        { id: "US", value: 150 },
        { id: "DE", value: 100 },
        { id: "GB", value: 80 },
      ],
      month: [
        { id: "IN", value: 500 },
        { id: "US", value: 400 },
        { id: "DE", value: 300 },
        { id: "GB", value: 200 },
      ],
      year: [
        { id: "IN", value: 1500 },
        { id: "US", value: 1200 },
        { id: "DE", value: 800 },
        { id: "GB", value: 600 },
      ],
    },
  };