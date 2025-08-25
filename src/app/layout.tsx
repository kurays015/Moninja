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
