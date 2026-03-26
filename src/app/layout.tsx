import type { Metadata } from "next";
import ThemeProvider from "@/components/ThemeProvider";
import { getAppColor } from '@/lib/utils';
import "./globals.css";

export const metadata: Metadata = {
  title: "Local Calendar",
  description: "A personal calendar",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning> 
      {/* suppressHydrationWarning prevents errors when switching themes */}
          <body className={`antialiased ${getAppColor('BG')} ${getAppColor('TEXT')}`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
