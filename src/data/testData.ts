export interface TestPart {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  parts: TestPart[];
}

export const listeningTest: Test = {
  id: "listening",
  title: "Listening Test",
  description: "Develop your listening comprehension skills",
  parts: [
    { id: 1, title: "Social Conversation", description: "Listen to everyday conversations", isCompleted: true, isLocked: false },
    { id: 2, title: "Workplace Discussion", description: "Professional dialogue practice", isCompleted: true, isLocked: false },
    { id: 3, title: "Academic Lecture - Part 1", description: "University-level content", isCompleted: false, isLocked: false },
    { id: 4, title: "Academic Lecture - Part 2", description: "Advanced academic topics", isCompleted: false, isLocked: false },
    { id: 5, title: "Monologue Practice", description: "Single speaker comprehension", isCompleted: false, isLocked: true },
    { id: 6, title: "Group Discussion", description: "Multiple speakers interaction", isCompleted: false, isLocked: true },
    { id: 7, title: "Interview Skills", description: "Question and answer format", isCompleted: false, isLocked: true },
    { id: 8, title: "Final Assessment", description: "Comprehensive listening test", isCompleted: false, isLocked: true },
  ]
};

export const readingTest: Test = {
  id: "reading",
  title: "Reading Test",
  description: "Enhance your reading comprehension abilities",
  parts: [
    { id: 1, title: "Skimming Techniques", description: "Quick reading strategies", isCompleted: false, isLocked: false },
    { id: 2, title: "Scanning Practice", description: "Finding specific information", isCompleted: false, isLocked: false },
    { id: 3, title: "Academic Passages", description: "University-level texts", isCompleted: false, isLocked: false },
    { id: 4, title: "Argument Analysis", description: "Critical reading skills", isCompleted: false, isLocked: true },
    { id: 5, title: "Data Interpretation", description: "Charts and graphs", isCompleted: false, isLocked: true },
    { id: 6, title: "Multiple Choice Questions", description: "Question type practice", isCompleted: false, isLocked: true },
    { id: 7, title: "True/False/Not Given", description: "Advanced comprehension", isCompleted: false, isLocked: true },
    { id: 8, title: "Final Assessment", description: "Comprehensive reading test", isCompleted: false, isLocked: true },
  ]
};

export const writingTest: Test = {
  id: "writing",
  title: "Writing Test",
  description: "Master academic and formal writing skills",
  parts: [
    { id: 1, title: "Essay Structure", description: "Introduction to essay format", isCompleted: false, isLocked: false },
    { id: 2, title: "Task 1: Graphs & Charts", description: "Describing visual data", isCompleted: false, isLocked: false },
    { id: 3, title: "Task 1: Process Diagrams", description: "Explaining processes", isCompleted: false, isLocked: false },
    { id: 4, title: "Task 2: Opinion Essays", description: "Express your viewpoint", isCompleted: false, isLocked: true },
    { id: 5, title: "Task 2: Discussion Essays", description: "Balanced arguments", isCompleted: false, isLocked: true },
    { id: 6, title: "Task 2: Problem-Solution", description: "Analytical writing", isCompleted: false, isLocked: true },
    { id: 7, title: "Advanced Vocabulary", description: "Enhance your writing", isCompleted: false, isLocked: true },
    { id: 8, title: "Final Assessment", description: "Complete writing test", isCompleted: false, isLocked: true },
  ]
};

export const speakingTest: Test = {
  id: "speaking",
  title: "Speaking Test",
  description: "Practice spoken English and fluency",
  parts: [
    { id: 1, title: "Part 1: Introduction", description: "Personal questions", isCompleted: false, isLocked: false },
    { id: 2, title: "Part 1: Familiar Topics", description: "Everyday conversations", isCompleted: false, isLocked: false },
    { id: 3, title: "Part 2: Long Turn Preparation", description: "Speaking for 2 minutes", isCompleted: false, isLocked: false },
    { id: 4, title: "Part 2: Practice Topics", description: "Describe experiences", isCompleted: false, isLocked: true },
    { id: 5, title: "Part 3: Abstract Discussion", description: "Complex ideas", isCompleted: false, isLocked: true },
    { id: 6, title: "Pronunciation Practice", description: "Improve clarity", isCompleted: false, isLocked: true },
    { id: 7, title: "Fluency Development", description: "Speak naturally", isCompleted: false, isLocked: true },
    { id: 8, title: "Final Assessment", description: "Complete speaking test", isCompleted: false, isLocked: true },
  ]
};

export const allTests = [listeningTest, readingTest, writingTest, speakingTest];
