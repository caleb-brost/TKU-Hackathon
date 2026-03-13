import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Road Damage Tickets",
  description: "Track and route road damage repair jobs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
