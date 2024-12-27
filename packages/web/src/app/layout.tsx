import type { Metadata } from "next";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import { Web3Provider } from "@/components/web3";
import { WEB_TITLE } from "@/constants";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import LayoutProvider from "@/components/layout";

import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: WEB_TITLE,
  description:
    "This is a playground for developing decentralized applications (dapps) using various blockchain technologies.For study use only.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          geistSans.className,
          geistMono.className,
          " bg-secondary"
        )}
      >
        <ThemeProvider enableSystem>
          <Web3Provider>
            <TooltipProvider delayDuration={300}>
              <LayoutProvider>{children}</LayoutProvider>
              <Toaster />
            </TooltipProvider>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
