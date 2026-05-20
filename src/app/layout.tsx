import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { FYProvider } from "@/lib/fy-context";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "o2h Travel App | Travel & Expense Management",
  description:
    "AI-powered travel and expense management platform for o2h group employees",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased`}>
        <AuthProvider>
          <FYProvider>{children}</FYProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
