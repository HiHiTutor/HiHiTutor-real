import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HiHiTutor - 香港補習平台",
  description: "香港最大的補習配對平台，提供一對一補習、小組補習、網上補習等服務。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-HK">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
