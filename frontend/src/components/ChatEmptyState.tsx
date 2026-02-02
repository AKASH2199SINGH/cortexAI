import React from 'react';
import { MessageCircle, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatEmptyStateProps {
  isListening?: boolean;
  isTranscribing?: boolean;
  className?: string;
}

const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({
  isListening = false,
  isTranscribing = false,
  className = '',
}) => {
  const getMessage = () => {
    if (isTranscribing) {
      return 'Transcribing your speech...';
    }
    if (isListening) {
      return 'Listening… say something to get started';
    }
    return 'Your conversation will appear here';
  };

  const getIcon = () => {
    if (isListening || isTranscribing) {
      return <Mic className="w-6 h-6 text-primary" />;
    }
    return <MessageCircle className="w-6 h-6 text-muted-foreground/50" />;
  };

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center py-16 animate-fade-in',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className={cn(
        'w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all duration-300',
        isListening || isTranscribing 
          ? 'bg-primary/20 animate-pulse-glow' 
          : 'bg-muted/30'
      )}>
        {getIcon()}
      </div>
      <p className={cn(
        'text-sm text-center max-w-xs transition-colors duration-300',
        isListening || isTranscribing 
          ? 'text-primary' 
          : 'text-muted-foreground/60'
      )}>
        {getMessage()}
      </p>
    </div>
  );
};

export default ChatEmptyState;
