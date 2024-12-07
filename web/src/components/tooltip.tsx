import { TooltipArrow, TooltipProps } from "@radix-ui/react-tooltip";
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import { ReactNode } from "react";

const Tooltip = ({
  title,
  children,
  className,
  ...props
}: TooltipProps & { title?: ReactNode; className?: string }) => {
  if (!title) return children;
  return (
    <ShadcnTooltip {...props}>
      <TooltipTrigger asChild>
        <div className={className}>{children}</div>
      </TooltipTrigger>
      <TooltipContent>
        <TooltipArrow />
        {title}
      </TooltipContent>
    </ShadcnTooltip>
  );
};

export default Tooltip;
