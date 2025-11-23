import { CheckCircle2, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PartItemProps {
  number: number;
  title: string;
  isCompleted: boolean;
  isLocked: boolean;
  onClick?: () => void;
}

export function PartItem({ number, title, isCompleted, isLocked, onClick }: PartItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-lg border transition-all",
        isCompleted && "bg-success/10 border-success",
        !isCompleted && !isLocked && "bg-card border-border hover:border-accent hover:bg-accent/5",
        isLocked && "bg-muted/30 border-border opacity-60 cursor-not-allowed"
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          {number}.
        </span>
        <span className={cn(
          "font-medium",
          isCompleted && "text-success",
          !isCompleted && !isLocked && "text-foreground",
          isLocked && "text-muted-foreground"
        )}>
          {title}
        </span>
      </div>
      
      <div>
        {isCompleted && <CheckCircle2 className="h-5 w-5 text-success" />}
        {!isCompleted && !isLocked && <Circle className="h-5 w-5 text-muted-foreground" />}
        {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
      </div>
    </button>
  );
}
