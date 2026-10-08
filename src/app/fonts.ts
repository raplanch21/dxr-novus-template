import {
  Geist,
  Geist_Mono,
  Inter,
  Source_Serif_4,
  Space_Mono,
} from "next/font/google";

export const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

/** Daily brief title and section labels. Variable, so one italic file covers every weight. */
export const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  style: "italic",
});

export const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: "400",
});
