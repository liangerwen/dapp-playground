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
import { __DEV__, WEB_TITLE } from "@/constants";
import { useTheme } from "next-themes";
import { ThemeType } from "@/constants/theme";

const config = getDefaultConfig({
  appName: WEB_TITLE,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  chains: [
    sepolia,
    holesky,
    ...(__DEV__ ? [hardhat] : []),
  ],
  ssr: true,
});

const queryClient = new QueryClient();
const darkStyles = darkTheme();
const lightStyles = lightTheme();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={resolvedTheme === ThemeType.DARK ? darkStyles : lightStyles}
          locale="en"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
