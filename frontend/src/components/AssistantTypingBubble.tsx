import React from 'react';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssistantTypingBubbleProps {
  className?: string;
  statusText?: string;
}

const AssistantTypingBubble: React.FC<AssistantTypingBubbleProps> = ({ 
  className = '',
  statusText = 'Thinking...'
}) => {
  return (
    <div 
      className={cn(
        'flex gap-3 py-4 px-4 animate-message-enter',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={statusText}
    >
      {/* Animated Avatar */}
      <div className="flex-shrink-0 relative">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 animate-avatar-pulse">
          <Bot className="w-4 h-4 text-primary" aria-hidden="true" />
        </div>
        {/* Active indicator */}
        <span 
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full animate-pulse-glow border-2 border-background" 
          aria-hidden="true"
        />
      </div>

      {/* Typing bubble */}
      <div className="flex flex-col items-start max-w-[80%] md:max-w-[70%]">
        <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-chat-assistant border border-border/50 animate-bubble-breathe">
          <div className="flex items-center gap-1.5">
            {/* Animated dots */}
            <div className="flex items-center gap-1" aria-hidden="true">
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-typing-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-typing-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-typing-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground mt-1 px-1 animate-fade-in">
          {statusText}
        </span>
      </div>
    </div>
  );
};

export default AssistantTypingBubble;
