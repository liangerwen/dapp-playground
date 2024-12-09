import type { Metadata } from "next";
import localFont from "next/font/local";
import { cn, parse } from "@/lib/utils";
import { cookies } from "next/headers";
import { THEME_KEY, ThemeType, ThemeProvider } from "@/components/theme";
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
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDark = parse(cookies().get(THEME_KEY)?.value) === ThemeType.DARK;
  return (
    <html lang="en" className={cn({ dark: isDark })}>
      <body
        className={cn(geistSans.variable, geistMono.variable, " bg-secondary")}
      >
        <ThemeProvider>
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