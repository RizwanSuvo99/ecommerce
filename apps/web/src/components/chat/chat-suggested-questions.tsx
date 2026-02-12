'use client';

interface ChatSuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export function ChatSuggestedQuestions({
  questions,
  onSelect,
}: ChatSuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 pl-1">
      {questions.map((question, index) => (
        <button
          key={index}
          onClick={() => onSelect(question)}
          className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs text-teal-700 hover:bg-teal-100 transition-colors text-left"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
