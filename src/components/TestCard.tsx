import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface TestCardProps {
  title: string;
  description: string;
  progress: number;
  totalParts: number;
  completedParts: number;
  icon: LucideIcon;
  link: string;
  accentColor?: string;
}

export function TestCard({
  title,
  description,
  progress,
  totalParts,
  completedParts,
  icon: Icon,
  link,
  accentColor = "bg-accent"
}: TestCardProps) {
  return (
    <Card className={`p-6 ${accentColor} border-none hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-background/50 rounded-lg">
            <Icon className="h-6 w-6 text-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <p className="text-sm text-foreground/70">{description}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm text-foreground">
          <span>Progress</span>
          <span className="font-medium">{completedParts}/{totalParts} parts completed</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <Link to={link}>
        <Button className="w-full bg-foreground text-accent hover:bg-foreground/90">
          Continue
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </Card>
  );
}
