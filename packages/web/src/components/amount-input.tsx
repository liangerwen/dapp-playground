import { ComponentProps, ForwardedRef, forwardRef } from "react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "@/lib/utils";
import { parseUnits } from "viem";

type Value = { value?: string; unit?: "wei" | "gwei" | "ether" };

export interface AmountInputProps
  extends Omit<ComponentProps<"input">, "value" | "onChange"> {
  value?: Value;
  onChange?: (value: Value) => void;
  inputClassName?: string;
}

const AmountInput = forwardRef(
  (
    { value, onChange, className, inputClassName, ...rest }: AmountInputProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <div className={cn("flex gap-2", className)}>
        <Input
          type="number"
          className={cn("flex-1", inputClassName)}
          value={value?.value}
          onChange={(event) =>
            onChange?.({ ...value, value: event.target.value })
          }
          {...rest}
          ref={ref}
        />
        <Select
          value={value?.unit}
          onValueChange={(unit: "wei" | "gwei" | "ether") =>
            onChange?.({ ...value, unit })
          }
        >
          <SelectTrigger className="w-[4.6875rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wei">Wei</SelectItem>
            <SelectItem value="gwei">Gwei</SelectItem>
            <SelectItem value="ether">Ether</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
);

AmountInput.displayName = "AmountInput";

const steps = {
  wei: 1,
  gwei: 9,
  ether: 18,
};

export const parseAmount = (value: Value) => {
  const { unit, value: amount } = value ?? {};
  return amount ? parseUnits(amount, steps[unit!] ?? 1) : BigInt(0);
};

export default AmountInput;
