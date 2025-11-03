import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";
import Script from 'next/script';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { HeartedInfluencersProvider } from '../lib/context/HeartedInfluencersContext';
import { QueryProvider } from '../components/providers/QueryProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stride Social Dashboard",
  description: "Professional influencer marketing dashboard for Stride Social",
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      domain={process.env.NEXT_PUBLIC_CLERK_DOMAIN}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
        }
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <QueryProvider>
            <HeartedInfluencersProvider>
              {children}
            </HeartedInfluencersProvider>
          </QueryProvider>
          {/* Google Analytics */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-T68YCYENPE"
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-T68YCYENPE');
            `}
          </Script>
          {/* Vercel Speed Insights */}
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
