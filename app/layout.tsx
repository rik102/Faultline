import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FailureLab",
  description: "Synthetic human failure simulation for pre-release UX testing."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
