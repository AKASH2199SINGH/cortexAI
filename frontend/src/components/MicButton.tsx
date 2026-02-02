import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MicButtonProps {
  isListening: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const MicButton: React.FC<MicButtonProps> = ({
  isListening,
  onClick,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex-shrink-0 p-2.5 rounded-xl transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
        isListening
          ? 'bg-destructive text-destructive-foreground animate-pulse-glow shadow-glow'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
    >
      {isListening ? (
        <MicOff className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  );
};

export default MicButton;
