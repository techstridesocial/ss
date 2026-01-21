import React from "react";
import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";
import Script from 'next/script';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { HeartedInfluencersProvider } from '../lib/context/HeartedInfluencersContext';
import { QueryProvider } from '../components/providers/QueryProvider';
import { ErrorTrackingProvider } from '../components/providers/ErrorTrackingProvider';
import { SessionTimeoutProvider } from '../components/providers/SessionTimeoutProvider';

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
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
        }
      }}
    >
      <html lang="en">
        <body className="antialiased font-sans">
          <ErrorTrackingProvider>
            <QueryProvider>
              <HeartedInfluencersProvider>
                <SessionTimeoutProvider>
                  {children}
                </SessionTimeoutProvider>
              </HeartedInfluencersProvider>
            </QueryProvider>
          </ErrorTrackingProvider>
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
