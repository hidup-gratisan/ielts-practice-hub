import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Clock, Award } from "lucide-react";
import { allTests } from "@/data/testData";

const ProgressPage = () => {
  const totalParts = allTests.reduce((acc, test) => acc + test.parts.length, 0);
  const completedParts = allTests.reduce(
    (acc, test) => acc + test.parts.filter(p => p.isCompleted).length,
    0
  );
  const overallProgress = (completedParts / totalParts) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Progress</h1>
          <p className="text-muted-foreground">Track your IELTS preparation journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-accent/20 border-none">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-5 w-5 text-accent-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{Math.round(overallProgress)}%</p>
          </Card>

          <Card className="p-6 bg-blue-50 border-none">
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Completed</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{completedParts}/{totalParts}</p>
          </Card>

          <Card className="p-6 bg-green-50 border-none">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Study Time</span>
            </div>
            <p className="text-3xl font-bold text-foreground">12h</p>
          </Card>

          <Card className="p-6 bg-purple-50 border-none">
            <div className="flex items-center gap-3 mb-2">
              <Award className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-muted-foreground">Achievements</span>
            </div>
            <p className="text-3xl font-bold text-foreground">3</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Test Progress Breakdown</h2>
          <div className="space-y-6">
            {allTests.map((test) => {
              const completed = test.parts.filter(p => p.isCompleted).length;
              const progress = (completed / test.parts.length) * 100;
              
              return (
                <div key={test.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-foreground">{test.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {completed}/{test.parts.length} parts
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProgressPage;
