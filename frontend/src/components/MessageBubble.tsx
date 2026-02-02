import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '@/types/chat';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
  className?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = memo(({ message, className = '' }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const formatTimestamp = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  if (isSystem) {
    return (
      <div className={cn(
        'flex justify-center py-2 animate-message-enter',
        className
      )}>
        <div className="px-4 py-2 bg-muted/50 rounded-full text-sm text-muted-foreground border border-border/50">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex gap-3 py-4 px-4 animate-message-enter',
      isUser ? 'justify-end' : 'justify-start',
      className
    )}>
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 relative">
          <div className={cn(
            'w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30',
            message.isStreaming && 'animate-avatar-pulse'
          )}>
            <Bot className="w-4 h-4 text-primary" />
          </div>
          {message.isStreaming && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full animate-pulse-glow border-2 border-background" />
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        'flex flex-col max-w-[80%] md:max-w-[70%]',
        isUser ? 'items-end' : 'items-start'
      )}>
        <div className={cn(
          'rounded-2xl px-4 py-3 relative transition-all duration-200',
          isUser 
            ? 'bg-chat-user text-chat-user-foreground rounded-br-md' 
            : 'bg-chat-assistant text-chat-assistant-foreground rounded-bl-md border border-border/50',
          message.isStreaming && !isUser && 'animate-bubble-breathe'
        )}>
          {isUser ? (
            <p className="text-sm md:text-base whitespace-pre-wrap break-words">
              {message.content}
            </p>
          ) : (
            <div className="markdown-content text-sm md:text-base">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code: ({ inline, className, children, ...props }: any) => {
                    if (inline) {
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className={cn('block', className)} {...props}>
                        {children}
                      </code>
                    );
                  },
                  a: ({ children, ...props }) => (
                    <a target="_blank" rel="noopener noreferrer" {...props}>
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content || ' '}
              </ReactMarkdown>
            </div>
          )}
          
          {/* Streaming cursor */}
          {message.isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-cursor-blink" />
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {formatTimestamp(message.timestamp)}
        </span>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-glow-sm">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
