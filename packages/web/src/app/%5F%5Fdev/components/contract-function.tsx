import Tooltip from "@/components/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ThemeType } from "@/constants/theme";
import useWriteContract from "@/hooks/use-write-contract";
import { isPlainObject, getTypeof } from "@/lib/utils";
import { CircleHelp } from "lucide-react";
import { useTheme } from "next-themes";
import { useRef, useState } from "react";
import ReactJson from "react-json-view";
import { AbiParameter } from "viem";
import { useContractConfig } from "./contract-config-provider";
import { readContract } from "viem/actions";

// bytesxxx toBytes(xxx).length === xxx
// address 0x1234567890abcdef1234567890abcdef12345678
// uintxxx 0~2**xxx-1
// intxxx -2**(xxx-1) ~ 2**(xxx-1)-1
// bool true/false
// string "xxx"

type AbiParameterTuple = Extract<
  AbiParameter,
  { type: "tuple" | `tuple[${string}]` }
>;

const isTuble = (item: AbiParameter): item is AbiParameterTuple =>
  item.type === "tuple";

const isTupleArray = (item: AbiParameter): item is AbiParameterTuple =>
  item.type.startsWith("tuple[");

const theme = {
  [ThemeType.LIGHT]: {
    bigint: "rgb(38, 139, 210)",
    number: "rgb(38, 139, 210)",
    string: "rgb(203, 75, 22)",
    boolean: "rgb(42, 161, 152)",
    null: "rgb(220, 50, 47)",
    undefined: "rgb(88, 110, 117)",
  },
  [ThemeType.DARK]: {
    bigint: "rgb(177, 89, 40)",
    number: "rgb(177, 89, 40)",
    string: "rgb(230, 85, 13)",
    boolean: "rgb(117, 107, 177)",
    null: "rgb(220, 160, 96)",
    undefined: "rgb(183, 184, 185)",
  },
};

type ThemeMode = keyof typeof theme;
type ValueType = keyof (typeof theme)[ThemeMode];

const noop = () => {};

export interface ContractFunctionProps {
  name: string;
  inputs: readonly AbiParameter[];
  inheritedFunctionName?: string;
  type: "read" | "write";
}

const ContractFunction = ({
  inputs,
  inheritedFunctionName,
  name,
  type,
}: ContractFunctionProps) => {
  const { resolvedTheme = ThemeType.LIGHT } = useTheme();
  const { address, abi } = useContractConfig();
  const writeContract = useWriteContract();

  const [outputs, setOutputs] = useState(null);

  const jsonInputRef = useRef<{ state: { src: object | any[] } } | null>(null);

  const generateInput = (abis: readonly AbiParameter[]): any[] => {
    const ret = abis.reduce<any[]>((pre, cur) => {
      if (isTuble(cur)) {
        return [...pre, generateInput(cur.components)];
      }
      if (isTupleArray(cur)) {
        return [...pre, [generateInput(cur.components)]];
      }
      return [...pre, cur.type];
    }, []);
    return ret;
  };

  const renderInput = (abis: readonly AbiParameter[]) => (
    <ReactJson
      name={false}
      src={generateInput(abis)}
      theme={resolvedTheme === ThemeType.DARK ? "brewer" : "rjv-default"}
      onAdd={noop}
      onDelete={noop}
      onEdit={noop}
      ref={jsonInputRef}
    />
  );

  const renderOutput = (outputs: any) => {
    if (isPlainObject(outputs) || Array.isArray(outputs)) {
      return (
        <ReactJson
          name={false}
          src={outputs}
          theme={resolvedTheme === ThemeType.DARK ? "brewer" : "rjv-default"}
        />
      );
    }
    const type = getTypeof(outputs) as ValueType;
    return (
      <Label
        style={{
          color: theme[resolvedTheme as ThemeMode]?.[type],
        }}
      >
        {JSON.stringify(outputs) ?? "undefined"}
      </Label>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 items-center">
        <Badge variant="secondary">{name}</Badge>
        {inheritedFunctionName && (
          <Tooltip title={inheritedFunctionName}>
            <CircleHelp className="cursor-pointer text-gray-500" size={16} />
          </Tooltip>
        )}
      </div>
      <div className="flex gap-2 pl-2">
        <Label>inputs: </Label> {renderInput(inputs)}
      </div>
      <div className="flex gap-2 pl-2">
        <Label>outputs: </Label>
        {renderOutput(outputs)}
      </div>
      <Button
        onClick={async () => {
          const args = jsonInputRef.current?.state.src as readonly any[];
          const exec = (
            type === "read" ? readContract : writeContract
          ) as typeof writeContract;
          const data = await exec({
            address,
            abi,
            functionName: name,
            args,
          });
          setOutputs(data);
        }}
        size="sm"
        variant="secondary"
      >
        Send
      </Button>
    </div>
  );
};

export default ContractFunction;
