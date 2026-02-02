import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '@/types/chat';
import MessageBubble from './MessageBubble';
import AssistantTypingBubble from './AssistantTypingBubble';
import AssistantListeningBubble from './AssistantListeningBubble';
import ChatEmptyState from './ChatEmptyState';
import AssistantOrb from './AssistantOrb';
import { Sparkles, AudioWaveform } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isListening?: boolean;
  isTranscribing?: boolean;
  isConversationStarted: boolean;
  onSuggestionClick?: (suggestion: string) => void;
  onVoiceModeClick?: () => void;
  className?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  isListening = false,
  isTranscribing = false,
  isConversationStarted,
  onSuggestionClick,
  onVoiceModeClick,
  className = '',
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isListening, isTranscribing]);

  // Show typing bubble when loading and no streaming message exists
  const showTypingBubble = isLoading && !messages.some(m => m.isStreaming);
  
  // Show empty state in conversation mode when no messages yet
  const showEmptyState = isConversationStarted && messages.length === 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex-1 overflow-y-auto scrollbar-thin',
        className
      )}
    >
      {!isConversationStarted ? (
        <LandingState onSuggestionClick={onSuggestionClick} onVoiceModeClick={onVoiceModeClick} />
      ) : (
        <div className="max-w-4xl mx-auto py-4">
          {/* Empty state placeholder */}
          {showEmptyState && (
            <ChatEmptyState 
              isListening={isListening} 
              isTranscribing={isTranscribing}
            />
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Animated listening bubble */}
          {isListening && !isTranscribing && <AssistantListeningBubble />}

          {/* Transcribing state bubble */}
          {isTranscribing && <AssistantTypingBubble statusText="Transcribing..." />}

          {/* Animated typing bubble */}
          {showTypingBubble && <AssistantTypingBubble />}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

interface LandingStateProps {
  onSuggestionClick?: (suggestion: string) => void;
  onVoiceModeClick?: () => void;
}

const LandingState: React.FC<LandingStateProps> = ({ onSuggestionClick, onVoiceModeClick }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12 animate-fade-in">
      {/* Interactive Orb */}
      <div className="relative mb-8">
        <AssistantOrb
          state="idle"
          size="lg"
          onClick={onVoiceModeClick}
        />
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-pulse-glow shadow-glow">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>

      {/* Title with gradient */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text">
        AI Personal Assistant
      </h1>

      {/* Subtitle */}
      <p className="text-muted-foreground text-center max-w-lg mb-4 text-base md:text-lg leading-relaxed">
        I'm here to help you with tasks, answer questions, and assist with your daily workflow. 
        Just type a message or tap the orb to speak.
      </p>

      {/* Voice mode hint */}
      {onVoiceModeClick && (
        <button
          onClick={onVoiceModeClick}
          className="flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm hover:bg-primary/20 transition-all duration-200 hover:shadow-glow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label="Activate voice mode"
        >
          <AudioWaveform className="w-4 h-4" />
          <span>Try voice mode</span>
        </button>
      )}

      {/* Quick action suggestions */}
      <div className="flex flex-wrap gap-3 justify-center max-w-2xl" role="list" aria-label="Suggested prompts">
        {SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick?.(suggestion.text)}
            className="group px-5 py-3 bg-secondary/50 border border-border/50 rounded-2xl text-sm text-secondary-foreground hover:bg-secondary hover:border-primary/40 hover:shadow-glow-sm transition-all duration-300 cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            style={{ animationDelay: `${index * 100}ms` }}
            role="listitem"
            aria-label={`Suggestion: ${suggestion.text}`}
          >
            <span className="text-lg" aria-hidden="true">{suggestion.icon}</span>
            <span className="group-hover:text-foreground transition-colors">{suggestion.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const SUGGESTIONS = [
  { icon: '💡', text: 'Brainstorm ideas for a project' },
  { icon: '📝', text: 'Help me write an email' },
  { icon: '🔍', text: 'Research a topic for me' },
  { icon: '📊', text: 'Analyze some data' },
  { icon: '🗓️', text: 'Help plan my day' },
];

export default ChatWindow;
