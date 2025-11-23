import { useParams, useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listeningTest, readingTest, writingTest, speakingTest } from "@/data/testData";
import { Headphones, BookOpen, PenTool, Mic, ArrowLeft, X, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

const TestPage = () => {
  const { testType } = useParams<{ testType: string }>();
  const navigate = useNavigate();
  const [showProgress, setShowProgress] = useState(true);
  
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

  // Split parts into units (4 parts per unit)
  const unit1Parts = test.parts.slice(0, 4);
  const unit2Parts = test.parts.slice(4, 8);
  
  const unit1Progress = (unit1Parts.filter(p => p.isCompleted).length / unit1Parts.length) * 100;
  const unit2Progress = (unit2Parts.filter(p => p.isCompleted).length / unit2Parts.length) * 100;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Content Area - Left Side */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-4">The Dawn of the Internet</h1>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-foreground/80 mb-4">
              Before we explore the history of {test.title.toLowerCase()}, let's take a quick look at how the internet itself came to be.
            </p>
            
            <p className="text-foreground/80 mb-4">
              The inception of the internet can be traced back to the computer science experiments during the Cold War era. In the 1960s, the United States Department of Defense through the Advanced Research Projects Agency (ARPA) developed a distributed network system called ARPANET. This network was designed to maintain communication even in the aftermath of a nuclear attack. Over decades, networking technology evolved through three phases: web1.0, web2.0, and web3.0, gradually morphing into today's internet.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Web1.0 Phase</h2>
            
            <p className="text-foreground/80 mb-4">
              The era of Web1.0 was ushered in during the early 1990s with the invention of the World Wide Web (WWW). Web1.0 represented the early stage of the internet, characterized by static web pages where content was created and managed by webmasters, and users were primarily receivers of information.
            </p>
            
            <p className="text-foreground/80 mb-4">
              Typical products of the Web1.0 era included portal websites such as Yahoo and Netscape, which aggregated and distributed news, sports, and entertainment. Users could consume various types of information on these sites but interaction was limited. These platforms did not support user content publishing or participation in comments.
            </p>
            
            <p className="text-foreground/80 mb-4">
              Web1.0 solved the problem of information sharing and dissemination, enabling text, images, and later multimedia content to spread rapidly worldwide. For example, during the 9/11 terrorist attacks in 2001, people worldwide could access information about these events through the internet almost instantaneously.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Panel - Right Side */}
      {showProgress && (
        <div className="w-[480px] border-l border-border bg-background p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-muted rounded-lg">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-bold text-foreground">{test.title}</h2>
            </div>
            <button
              onClick={() => setShowProgress(false)}
              className="p-1 hover:bg-muted rounded-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Unit 1 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Unit 1 - {test.title} Basics</h3>
              <span className="text-sm font-medium text-muted-foreground">{Math.round(unit1Progress)}%</span>
            </div>
            <Progress value={unit1Progress} className="h-2 mb-4" />
            
            <div className="space-y-2">
              {unit1Parts.map((part: any) => (
                <div
                  key={part.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{part.id}.</span>
                    <span className="text-sm text-foreground">{part.title}</span>
                  </div>
                  {part.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Unit 2 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Unit 2 - Advanced {test.title}</h3>
              <span className="text-sm font-medium text-muted-foreground">{Math.round(unit2Progress)}%</span>
            </div>
            <Progress value={unit2Progress} className="h-2 mb-4" />
            
            <div className="space-y-2">
              {unit2Parts.map((part: any) => (
                <div
                  key={part.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{part.id}.</span>
                    <span className="text-sm text-foreground">{part.title}</span>
                  </div>
                  {part.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Found a bug?{" "}
              <a href="#" className="text-primary hover:underline">
                Report
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-64 right-0 bg-background border-t border-border p-4">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === 0
                    ? "w-8 bg-accent"
                    : "w-8 bg-muted"
                }`}
              />
            ))}
          </div>

          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            Check Answer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
