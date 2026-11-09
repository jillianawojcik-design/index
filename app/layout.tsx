import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Folioform — Your work. Your story. Your future.",
  description:
    "Folioform turns your resume, reports, research and projects into a polished, shareable portfolio website. Built by Jillian Wojcik for ENGR 310.",
  authors: [{ name: "Jillian Wojcik" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Same Google Fonts as the original site (Fraunces + Inter) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
