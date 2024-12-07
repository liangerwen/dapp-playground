"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import {
  sepolia,
  hardhat,
  holesky,
} from "viem/chains";
import { useTheme } from "./theme";
import { ThemeType } from "./theme";
import { WEB_TITLE } from "@/constants";

const config = getDefaultConfig({
  appName: WEB_TITLE,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  chains: [
    sepolia,
    holesky,
    ...(process.env.NODE_ENV === "development" ? [hardhat] : []),
  ],
  ssr: true,
});

const queryClient = new QueryClient();
const darkStyles = darkTheme();
const lightStyles = lightTheme();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={theme === ThemeType.DARK ? darkStyles : lightStyles}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
