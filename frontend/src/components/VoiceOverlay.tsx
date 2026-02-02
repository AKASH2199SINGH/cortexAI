import React, { useEffect, useState } from 'react';
import { X, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import AssistantOrb, { OrbState } from './AssistantOrb';

interface VoiceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  orbState: OrbState;
  transcript: string;
  isListening: boolean;
  isTranscribing?: boolean;
  onMicToggle: () => void;
  showEscHint?: boolean;
}

const VoiceOverlay: React.FC<VoiceOverlayProps> = ({
  isOpen,
  onClose,
  orbState,
  transcript,
  isListening,
  isTranscribing = false,
  onMicToggle,
  showEscHint = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const getStatusText = () => {
    if (isTranscribing) {
      return 'Transcribing...';
    }
    switch (orbState) {
      case 'listening':
        return 'Listening...';
      case 'thinking':
        return 'Processing...';
      case 'speaking':
        return 'Speaking...';
      default:
        return 'Tap to speak';
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl transition-all duration-300',
        // Safe area padding for mobile
        'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
        'px-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Voice input mode"
    >
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div 
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full transition-all duration-700',
            orbState === 'listening' && 'bg-primary/10 animate-pulse',
            orbState === 'speaking' && 'bg-accent/10 animate-pulse',
            (orbState === 'thinking' || isTranscribing) && 'bg-primary/5'
          )}
          style={{
            filter: 'blur(100px)',
          }}
        />
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-label="Close voice mode"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Assistant Orb */}
        <AssistantOrb
          state={isTranscribing ? 'thinking' : orbState}
          size="xl"
          onClick={onMicToggle}
        />

        {/* Status text */}
        <div className="text-center" role="status" aria-live="polite">
          <p className={cn(
            'text-xl font-medium transition-all duration-300',
            orbState === 'listening' && !isTranscribing && 'text-primary',
            orbState === 'speaking' && 'text-accent',
            (orbState === 'thinking' || isTranscribing) && 'text-muted-foreground',
            orbState === 'idle' && !isTranscribing && 'text-foreground'
          )}>
            {getStatusText()}
          </p>
        </div>

        {/* Live transcript */}
        {transcript && !isTranscribing && (
          <div className="max-w-lg text-center animate-fade-in" aria-live="polite">
            <p className="text-lg text-foreground/90 leading-relaxed">
              "{transcript}"
            </p>
          </div>
        )}

        {/* Mic control button */}
        <button
          onClick={onMicToggle}
          disabled={isTranscribing}
          className={cn(
            'mt-4 px-6 py-3 rounded-full flex items-center gap-3 font-medium transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-primary/50',
            isTranscribing && 'opacity-50 cursor-not-allowed',
            isListening && !isTranscribing
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5" />
              <span>Stop Listening</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>Start Listening</span>
            </>
          )}
        </button>
      </div>

      {/* Bottom hint - only show on desktop */}
      {showEscHint && (
        <p className="absolute bottom-8 text-sm text-muted-foreground">
          Press <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">Esc</kbd> to close
        </p>
      )}
    </div>
  );
};

export default VoiceOverlay;
