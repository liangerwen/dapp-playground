import { cn } from "@/lib/utils";
import { LoaderPinwheel } from "lucide-react";
import { ComponentProps } from "react";

const Loading = ({
  loading,
  className,
  children,
  ...rest
}: ComponentProps<"div"> & { loading?: boolean }) => {
  if (!loading) return children;
  return (
    <div
      className={cn(
        "size-full flex justify-center items-center text-gray-400 gap-1",
        className
      )}
      {...rest}
    >
      <LoaderPinwheel size={16} className="animate-spin" />
      <p>Loading...</p>
    </div>
  );
};

export default Loading;
