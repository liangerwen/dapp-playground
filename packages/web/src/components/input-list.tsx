import { ComponentProps, ForwardedRef, forwardRef } from "react";
import { Button } from "./ui/button";
import { Plus, X } from "lucide-react";
import { Input } from "./ui/input";

export interface InputListProps
  extends Omit<ComponentProps<"input">, "value" | "onChange"> {
  value?: string[];
  onChange?: (value: string[]) => void;
  addText?: string;
}

const InputList = forwardRef(
  (
    { value, onChange, addText, onBlur, ...props }: InputListProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const innerValue = value ?? [""];

    const handleInputChange = (
      event: React.ChangeEvent<HTMLInputElement>,
      index: number
    ) => {
      const newValue = [...innerValue];
      newValue[index] = event.target.value;
      onChange?.(newValue);
    };

    const handleDelete = (index: number) => {
      const newValue = [...innerValue];
      newValue.splice(index, 1);
      onChange?.(newValue);
    };

    return (
      <ul className="flex flex-col gap-2">
        {innerValue.map((item, index) => (
          <li key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => handleInputChange(e, index)}
              {...props}
              onBlur={index === 0 ? onBlur : undefined}
              ref={index === 0 ? ref : undefined}
            />
            {innerValue.length > 1 && (
              <Button
                onClick={() => handleDelete(index)}
                variant="outline"
                className="size-9 rounded-full"
              >
                <X />
              </Button>
            )}
          </li>
        ))}
        <li>
          <Button
            size="sm"
            className="w-full"
            onClick={() => {
              if (!innerValue.includes("")) {
                onChange?.(["", ...innerValue]);
              }
            }}
          >
            <Plus />
            {addText ?? "Add Item"}
          </Button>
        </li>
      </ul>
    );
  }
);

InputList.displayName = "InputList";

export default InputList;
