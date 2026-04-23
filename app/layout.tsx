// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commentator",
  description: "Commentary and analysis on politics, technology, and democracy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="main-shell">{children}</div>

        <footer className="site-footer" role="contentinfo">
          <div className="site-footer-inner text-center">
            © 2026 Commentator Media LLC. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
