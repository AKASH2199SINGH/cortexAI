import React from 'react';

interface TypingIndicatorProps {
  className?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-1.5 px-4 py-3 ${className}`}>
      <div className="flex items-center gap-1">
        <span 
          className="w-2 h-2 rounded-full bg-primary animate-typing-dot"
          style={{ animationDelay: '0ms' }}
        />
        <span 
          className="w-2 h-2 rounded-full bg-primary animate-typing-dot-delayed-1"
        />
        <span 
          className="w-2 h-2 rounded-full bg-primary animate-typing-dot-delayed-2"
        />
      </div>
      <span className="text-sm text-muted-foreground ml-2">
        Assistant is thinking...
      </span>
    </div>
  );
};

export default TypingIndicator;
