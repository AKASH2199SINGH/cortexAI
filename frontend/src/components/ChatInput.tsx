import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Loader2, AudioWaveform, AudioLines } from 'lucide-react';
import { cn } from '@/lib/utils';
import MicButton from './MicButton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isListening?: boolean;
  isTranscribing?: boolean;
  onMicClick?: () => void;
  onVoiceModeClick?: () => void;
  showMic?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  isListening = false,
  isTranscribing = false,
  onMicClick,
  onVoiceModeClick,
  showMic = true,
  disabled = false,
  placeholder = 'Type your message...',
  className = '',
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isLoading && !disabled && !isListening && !isTranscribing) {
      onSendMessage(trimmedMessage);
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = message.trim().length > 0 && !isLoading && !disabled && !isListening && !isTranscribing;
  const inputDisabled = disabled || isLoading || isListening || isTranscribing;

  const getPlaceholder = () => {
    if (isTranscribing) return 'Transcribing...';
    if (isListening) return 'Listening...';
    return placeholder;
  };

  return (
    <div className={cn(
      'border-t border-border bg-background/80 backdrop-blur-xl',
      // Safe area padding for mobile devices
      'pb-[env(safe-area-inset-bottom)]',
      className
    )}>
      <div className="max-w-4xl mx-auto px-4 py-4">
        <TooltipProvider delayDuration={300}>
          <div className={cn(
            'flex items-end gap-3 bg-surface-elevated rounded-2xl border border-border/50 p-3 transition-all duration-200',
            'focus-within:border-primary/50 focus-within:shadow-glow-sm',
            isListening && 'border-primary/50 shadow-glow-sm bg-primary/5',
            isTranscribing && 'border-accent/50 shadow-glow-sm'
          )}>
            {/* Mic Button */}
            {showMic && onMicClick && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <MicButton
                      isListening={isListening}
                      onClick={onMicClick}
                      disabled={isLoading || isTranscribing}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{isListening ? 'Stop listening' : 'Voice input'}</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Voice Mode Button */}
            {showMic && onVoiceModeClick && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onVoiceModeClick}
                    disabled={isLoading || isTranscribing}
                    className={cn(
                      'flex-shrink-0 p-2.5 rounded-xl transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
                      'bg-primary/20 text-primary hover:bg-primary/30 hover:shadow-glow-sm',
                      (isLoading || isTranscribing) && 'opacity-50 cursor-not-allowed'
                    )}
                    aria-label="Open voice mode"
                  >
                    <AudioWaveform className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Voice mode</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={getPlaceholder()}
                disabled={inputDisabled}
                rows={1}
                className={cn(
                  'w-full bg-transparent resize-none outline-none',
                  'text-foreground placeholder:text-muted-foreground',
                  'text-sm md:text-base leading-relaxed',
                  'scrollbar-thin max-h-[200px]',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  (isListening || isTranscribing) && 'placeholder:text-primary'
                )}
                aria-label="Message input"
              />
              
              {/* Waveform indicator when listening */}
              {isListening && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1" aria-hidden="true">
                  <AudioLines className="w-4 h-4 text-primary animate-pulse" />
                </div>
              )}
            </div>

            {/* Send Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleSubmit}
                  disabled={!canSend}
                  className={cn(
                    'flex-shrink-0 p-2.5 rounded-xl transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
                    canSend 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-sm hover:shadow-glow' 
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isListening || isTranscribing ? (
                    <AudioLines className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{isLoading ? 'Sending...' : 'Send message'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        {/* Helper text - hide on mobile for cleaner UI */}
        <p className="hidden sm:block text-xs text-muted-foreground text-center mt-2">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Enter</kbd> to send, 
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono ml-1">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
