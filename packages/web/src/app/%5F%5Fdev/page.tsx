"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { __DEV__ } from "@/constants";
import contracts, { ChainId } from "@/constants/contracts";
import { notFound } from "next/navigation";
import { AbiFunction } from "viem";
import { useAccount } from "wagmi";
import Tooltip from "@/components/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLayoutConfig } from "@/components/layout";
import FunctionsCard from "./components/functions-card";
import ContractConfigProvider, {
  ContractConfig,
} from "./components/contract-config-provider";

const Dev = () => {
  useLayoutConfig({ className: "flex flex-col overflow-hidden" });
  const { chainId = 31337 } = useAccount();
  const currentContracts = contracts[chainId as ChainId] as Record<
    string,
    ContractConfig
  >;

  const contractNames = Object.keys(currentContracts);

  return (
    <Tabs
      className="flex-1 flex flex-col overflow-hidden"
      defaultValue={contractNames?.[0]}
    >
      <TabsList className="w-full">
        {contractNames.map((name) => (
          <TabsTrigger key={name} value={name} className="flex-1">
            {name}
          </TabsTrigger>
        ))}
      </TabsList>
      {contractNames.map((name: keyof typeof currentContracts) => {
        const { address, abi } = currentContracts[name];
        const writeFunctions = abi.filter(
          (item) => item.type === "function" && item.stateMutability !== "view"
        ) as AbiFunction[];
        const readFunctions = abi.filter(
          (item) => item.type === "function" && item.stateMutability === "view"
        ) as AbiFunction[];
        return (
          <TabsContent
            key={name}
            value={name}
            className="flex-1 overflow-hidden grid grid-cols-5 gap-4"
          >
            <ContractConfigProvider value={currentContracts[name]}>
              <Card className="w-max-full overflow-hidden h-fit" key={address}>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <h3>{name}</h3>
                    <span className="font-normal text-sm">1 ETH</span>
                  </CardTitle>
                  <Tooltip title={address}>
                    <CardDescription className="text-ellipsis overflow-hidden">
                      {address}
                    </CardDescription>
                  </Tooltip>
                </CardHeader>
              </Card>
              <FunctionsCard
                title="Read Functions"
                functions={readFunctions}
                className="col-span-2 flex-1"
                type="read"
              />
              <FunctionsCard
                title="Write Functions"
                functions={writeFunctions}
                className="col-span-2 flex-1"
                type="write"
              />
            </ContractConfigProvider>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default __DEV__ ? Dev : notFound;
