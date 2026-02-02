import React from 'react';
import { Bot, AudioLines } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssistantListeningBubbleProps {
  className?: string;
}

const AssistantListeningBubble: React.FC<AssistantListeningBubbleProps> = ({
  className = '',
}) => {
  return (
    <div 
      className={cn('flex items-start gap-3 px-4 mb-4 animate-message-enter', className)}
      role="status"
      aria-live="polite"
      aria-label="Assistant is listening"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 animate-pulse-glow">
        <Bot className="w-4 h-4 text-primary" aria-hidden="true" />
      </div>

      {/* Listening bubble */}
      <div className="max-w-[80%] md:max-w-[70%]">
        <div className="bg-surface-elevated border border-primary/40 rounded-2xl rounded-tl-md px-5 py-4 shadow-glow-sm">
          <div className="flex items-center gap-3">
            {/* Waveform animation */}
            <div className="flex items-center gap-1 h-6" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full animate-waveform"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    height: '100%',
                  }}
                />
              ))}
            </div>
            
            <span className="text-sm text-muted-foreground">Listening...</span>
            
            <AudioLines className="w-4 h-4 text-primary animate-pulse" aria-hidden="true" />
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-1.5 ml-2">
          Speak now – I'm listening
        </p>
      </div>
    </div>
  );
};

export default AssistantListeningBubble;
