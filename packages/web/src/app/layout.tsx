import type { Metadata } from "next";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import { Web3Provider } from "@/components/web3";
import { WEB_TITLE } from "@/constants";
import Nav from "@/components/nav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

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
        className={cn(geistSans.variable, geistMono.variable, " bg-secondary")}
      >
        <ThemeProvider enableSystem>
          <Web3Provider>
            <TooltipProvider delayDuration={300}>
              <div className={cn("w-full flex flex-col items-center h-screen")}>
                <Nav />
                <div className="flex-1 overflow-auto w-full flex flex-col items-center">
                  <main
                    className={cn(
                      geistSans.className,
                      geistMono.className,
                      "p-5 flex-grow w-full"
                    )}
                  >
                    {children}
                  </main>
                  <footer className="w-full h-16 bg-background text-secondary-foreground flex items-center justify-center flex-shrink-0">
                    <p>
                      Copyright ©2021 - {new Date().getFullYear()} By{" "}
                      {WEB_TITLE}
                    </p>
                  </footer>
                </div>
              </div>
              <Toaster />
            </TooltipProvider>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
