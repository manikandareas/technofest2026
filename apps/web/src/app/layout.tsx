import type { Metadata, Viewport } from "next";
import { DM_Sans, Press_Start_2P, Space_Mono } from "next/font/google";
import "@livekit/components-styles";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const pressStart2P = Press_Start_2P({
  variable: "--font-press-start",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "PixelAid",
    template: "%s | PixelAid",
  },
  description: "Responsive PWA medical simulation for dokter koas.",
  manifest: "/manifest.webmanifest",
  applicationName: "PixelAid",
  appleWebApp: {
    capable: true,
    title: "PixelAid",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${dmSans.variable} ${spaceMono.variable} ${pressStart2P.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
