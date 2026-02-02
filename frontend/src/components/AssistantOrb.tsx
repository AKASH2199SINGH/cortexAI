import React from 'react';
import { Bot, Mic, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface AssistantOrbProps {
  state: OrbState;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const AssistantOrb: React.FC<AssistantOrbProps> = ({
  state,
  onClick,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const getStateIcon = () => {
    switch (state) {
      case 'listening':
        return <Mic className={cn(iconSizes[size], 'text-primary-foreground')} />;
      case 'speaking':
        return <Volume2 className={cn(iconSizes[size], 'text-primary-foreground')} />;
      default:
        return <Bot className={cn(iconSizes[size], 'text-primary-foreground')} />;
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Outer ripple effects */}
      <div
        className={cn(
          'absolute inset-0 rounded-full transition-all duration-500',
          state === 'listening' && 'animate-orb-ripple-1',
          state === 'speaking' && 'animate-orb-speak-ripple'
        )}
        style={{
          background: state !== 'idle' 
            ? 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)' 
            : 'none',
        }}
      />
      <div
        className={cn(
          'absolute inset-0 rounded-full transition-all duration-500',
          state === 'listening' && 'animate-orb-ripple-2'
        )}
        style={{
          background: state === 'listening' 
            ? 'radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)' 
            : 'none',
        }}
      />

      {/* Main orb */}
      <button
        onClick={onClick}
        className={cn(
          'relative rounded-full flex items-center justify-center transition-all duration-300',
          'focus:outline-none focus:ring-4 focus:ring-primary/30',
          sizeClasses[size],
          // Base state
          state === 'idle' && 'bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-glow animate-orb-idle',
          // Listening state
          state === 'listening' && 'bg-gradient-to-br from-primary via-accent to-primary shadow-orb-listening animate-orb-listening',
          // Thinking state  
          state === 'thinking' && 'bg-gradient-to-br from-primary via-primary/80 to-accent animate-orb-thinking',
          // Speaking state
          state === 'speaking' && 'bg-gradient-to-br from-primary via-accent to-primary shadow-orb-speaking animate-orb-speaking'
        )}
      >
        {/* Inner glow */}
        <div
          className={cn(
            'absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent',
            state === 'listening' && 'animate-pulse'
          )}
        />

        {/* Icon */}
        <div className="relative z-10">
          {getStateIcon()}
        </div>

        {/* Thinking spinner overlay */}
        {state === 'thinking' && (
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white/40 animate-spin" />
        )}
      </button>

      {/* Waveform for speaking */}
      {state === 'speaking' && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-1 h-6">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full animate-waveform"
              style={{
                animationDelay: `${i * 0.08}s`,
                height: '100%',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AssistantOrb;
