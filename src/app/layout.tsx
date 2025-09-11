import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import Providers from "./providers";
import { ToastContainer } from "react-toastify";
import Kurays from "../components/Kurays";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moninja",
  description:
    "MONINJA is a fast-paced slicing game inspired by the classic Fruit Ninja, but with a unique twist — instead of fruits, you’ll slash through Monanimals, quirky and mystical creatures that leap across your screen. Armed with razor-sharp reflexes, you’ll swipe to cut, chain combos, and unleash frenzy modes for massive scores.",
  creator: "Kurays",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative w-full h-screen overflow-hidden select-none game-area`}
      >
        <Providers>{children}</Providers>
        <ToastContainer position="bottom-right" />
        <Kurays />
      </body>
    </html>
  );
}
