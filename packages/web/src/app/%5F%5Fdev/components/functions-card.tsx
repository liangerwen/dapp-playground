import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { AbiFunction } from "viem";
import ContractFunction from "./contract-function";
import { useContractConfig } from "./contract-config-provider";

export interface FunctionsCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  functions: AbiFunction[];
  type: "read" | "write";
}

const FunctionsCard = ({
  title,
  functions = [],
  className,
  type,
  ...rest
}: FunctionsCardProps) => {
  const { inheritedFunctions } = useContractConfig();
  return (
    <Card className={cn("overflow-hidden flex flex-col", className)} {...rest}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto flex flex-col gap-4">
        {functions.map((i, idx) => (
          <ContractFunction
            key={idx}
            name={i.name}
            inputs={i.inputs}
            inheritedFunctionName={inheritedFunctions[i.name]}
            type={type}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default FunctionsCard;
