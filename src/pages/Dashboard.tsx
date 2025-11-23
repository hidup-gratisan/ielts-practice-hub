import { TestCard } from "@/components/TestCard";
import { Headphones, BookOpen, PenTool, Mic } from "lucide-react";
import { listeningTest, readingTest, writingTest, speakingTest } from "@/data/testData";

const Dashboard = () => {
  const getProgress = (test: typeof listeningTest) => {
    const completed = test.parts.filter(p => p.isCompleted).length;
    return {
      progress: (completed / test.parts.length) * 100,
      completedParts: completed,
      totalParts: test.parts.length
    };
  };

  const listeningProgress = getProgress(listeningTest);
  const readingProgress = getProgress(readingTest);
  const writingProgress = getProgress(writingTest);
  const speakingProgress = getProgress(speakingTest);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">IELTS Test Preparation</h1>
          <p className="text-muted-foreground">Choose a test to continue your preparation journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TestCard
            title="Listening Test"
            description="Develop your listening comprehension"
            progress={listeningProgress.progress}
            totalParts={listeningProgress.totalParts}
            completedParts={listeningProgress.completedParts}
            icon={Headphones}
            link="/listening"
            accentColor="bg-accent/20"
          />
          
          <TestCard
            title="Reading Test"
            description="Enhance your reading abilities"
            progress={readingProgress.progress}
            totalParts={readingProgress.totalParts}
            completedParts={readingProgress.completedParts}
            icon={BookOpen}
            link="/reading"
            accentColor="bg-blue-50"
          />
          
          <TestCard
            title="Writing Test"
            description="Master academic writing skills"
            progress={writingProgress.progress}
            totalParts={writingProgress.totalParts}
            completedParts={writingProgress.completedParts}
            icon={PenTool}
            link="/writing"
            accentColor="bg-green-50"
          />
          
          <TestCard
            title="Speaking Test"
            description="Practice spoken English fluency"
            progress={speakingProgress.progress}
            totalParts={speakingProgress.totalParts}
            completedParts={speakingProgress.completedParts}
            icon={Mic}
            link="/speaking"
            accentColor="bg-purple-50"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
