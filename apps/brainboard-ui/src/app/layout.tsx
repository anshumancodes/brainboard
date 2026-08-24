import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-dm-serif",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Brainboard - Think. Sketch. Build.",
    template: "%s - Brainboard",
  },
  description:
    "Brainboard is a collaborative whiteboard for thinking, sketching, planning, and building ideas together in real time.",
  applicationName: "Brainboard",
  keywords: [
    "Brainboard",
    "collaborative whiteboard",
    "online whiteboard",
    "brainstorming",
    "visual collaboration",
    "team collaboration",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSerifDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#071014] font-sans text-[#f4f1e9]">
        {children}
      </body>
    </html>
  );
}
