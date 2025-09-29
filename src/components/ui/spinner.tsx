import { cn } from "./utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps extends React.ComponentProps<"div"> {
  size?: "sm" | "md" | "lg";
}

function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <Loader2 className={cn("animate-spin text-gray-400", sizeClasses[size])} />
    </div>
  );
}

export { Spinner };