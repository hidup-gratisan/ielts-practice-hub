import { useParams } from "react-router-dom";
import { PartItem } from "@/components/PartItem";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { listeningTest, readingTest, writingTest, speakingTest } from "@/data/testData";
import { Headphones, BookOpen, PenTool, Mic } from "lucide-react";

const TestPage = () => {
  const { testType } = useParams<{ testType: string }>();
  
  const testMap: Record<string, any> = {
    listening: { test: listeningTest, icon: Headphones },
    reading: { test: readingTest, icon: BookOpen },
    writing: { test: writingTest, icon: PenTool },
    speaking: { test: speakingTest, icon: Mic },
  };

  const currentTest = testMap[testType || ""];
  
  if (!currentTest) {
    return <div className="p-8">Test not found</div>;
  }

  const { test, icon: Icon } = currentTest;
  const completedParts = test.parts.filter((p: any) => p.isCompleted).length;
  const progress = (completedParts / test.parts.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-accent/20 rounded-lg">
              <Icon className="h-8 w-8 text-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{test.title}</h1>
              <p className="text-muted-foreground">{test.description}</p>
            </div>
          </div>

          <Card className="p-6 bg-accent/10 border-none">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-foreground">Overall Progress</span>
              <span className="text-sm font-bold text-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {completedParts} of {test.parts.length} parts completed
            </p>
          </Card>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground mb-4">Test Parts</h2>
          {test.parts.map((part: any) => (
            <PartItem
              key={part.id}
              number={part.id}
              title={part.title}
              isCompleted={part.isCompleted}
              isLocked={part.isLocked}
              onClick={() => console.log(`Clicked part ${part.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestPage;
