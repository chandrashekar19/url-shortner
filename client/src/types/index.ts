
export type Period = "day" | "week" | "month" | "year";


export interface StatsData {
  views: Record<Period, { label: string; value: number }[]>;
  browsers: Record<Period, { name: string; value: number }[]>;
  os: Record<Period, { name: string; value: number }[]>;
  referrers: Record<Period, { name: string; value: number }[]>;
  map: Record<Period, { id: string; value: number }[]>;
}