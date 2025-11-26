import { User, Sparkles } from 'lucide-react';
import { Message } from '../types';
import ThinkingProcess from './ThinkingProcess';
import AnswerCard from './AnswerCard';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div key={message.id} className="space-y-4">
          {message.type === 'user' ? (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-slate-300" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium mb-1">You</p>
                <p className="text-slate-300">{message.content}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 space-y-4">
                <p className="text-white font-medium">FinSight AI</p>

                {message.thinking && (
                  <ThinkingProcess
                    steps={message.thinking.steps}
                    isComplete={message.thinking.isComplete}
                  />
                )}

                {message.answer && <AnswerCard answer={message.answer} />}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
