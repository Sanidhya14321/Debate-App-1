import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "md", 
  className,
  text 
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-4", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], "mb-2")}/>
      {text && (
        <p className="text-base text-muted-foreground animate-pulse text-center px-2">{text}</p>
      )}
    </div>
  );
};

interface LoadingPageProps {
  title?: string;
  description?: string;
  className?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  title = "Loading...",
  description,
  className
}) => {
  return (
    <div className={cn("min-h-[400px] flex items-center justify-center p-8 bg-dark-gradient", className)}>
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        <LoadingSpinner size="lg" />
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-base max-w-md mx-auto">{description}</p>
        )}
      </div>
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  text = "Loading..."
}) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-md mx-auto">
            <LoadingSpinner text={text} />
          </div>
        </div>
      )}
    </div>
  );
};