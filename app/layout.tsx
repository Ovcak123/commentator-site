// app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import { siteConfig } from "../lib/siteConfig";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },

  description: siteConfig.description,

  applicationName: siteConfig.name,
  creator: siteConfig.name,
  publisher: siteConfig.publisher,

  category: "news",

  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    locale: siteConfig.locale,
  },

  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  referrer: "origin-when-cross-origin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={siteConfig.language}>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${siteConfig.name} RSS Feed`}
          href={`${siteConfig.url}/feed.xml`}
        />
      </head>

      <body className="antialiased">
        <div className="main-shell">{children}</div>

        <footer className="site-footer" role="contentinfo">
          <div className="site-footer-inner text-center">
            © 2026 {siteConfig.legalName}. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}