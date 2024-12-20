import type { Metadata } from "next";
import "@/styles/globals.css";
import Navigation from "@/components/Navigation";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Fleet Management System",
  description: "Vehicle and Project Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
