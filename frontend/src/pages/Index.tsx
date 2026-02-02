// import React, { useState, useCallback, useEffect } from 'react';
// import { Helmet } from 'react-helmet-async';
// import ChatWindow from '@/components/ChatWindow';
// import ChatInput from '@/components/ChatInput';
// import VoiceOverlay from '@/components/VoiceOverlay';
// import { ChatMessage } from '@/types/chat';
// import { OrbState } from '@/components/AssistantOrb';
// import {
//   sendMessage,
//   getOrCreateSessionId,
//   clearSession,
//   generateMessageId
// } from '@/services/chatApi';
// import { RefreshCw, Settings, MessageSquare } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
// import { cn } from '@/lib/utils';
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from '@/components/ui/tooltip';
// import { useIsMobile } from '@/hooks/use-mobile';
// import { useChatSocket } from "@/hooks/useChatSocket";

// const Index: React.FC = () => {
//   // const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [sessionId, setSessionId] = useState<string>('');
//   const [voiceModeOpen, setVoiceModeOpen] = useState(false);
//   const [orbState, setOrbState] = useState<OrbState>('idle');
//   const [liveTranscript, setLiveTranscript] = useState('');
//   const [isTranscribing, setIsTranscribing] = useState(false);

//   const { toast } = useToast();
//   const isMobile = useIsMobile();

//   /** 🔌 WebSocket Hook */
//   const {
//   messages: wsMessages,
//   sendMessage: sendSocketMessage,
//   isStreaming,
//   isConnected,
//   error: socketError,
// } = useChatSocket();

// const messages: ChatMessage[] = wsMessages.map((msg) => ({
//   id: generateMessageId(),
//   role: msg.role,
//   content: msg.content,
//   timestamp: new Date(),
//   isStreaming: msg.role === "assistant" && isStreaming,
// }));

//   const isConversationStarted = messages.length > 0;

//   /** Session init (kept for compatibility) */
//   useEffect(() => {
//     setSessionId(getOrCreateSessionId());
//     if (!isConnected) {
//   toast({
//     title: "Connection Lost",
//     description: "Please wait while reconnecting…",
//     variant: "destructive",
//   });
//   return;
// }
//   }, []);

//   /** 🔄 Sync WebSocket messages → UI ChatMessage */
//   // useEffect(() => {
//   //   if (wsMessages.length === 0) return;

//   //   setMessages(prev => {
//   //     if (prev.length === wsMessages.length) return prev;

//   //     return wsMessages.map((msg, idx) => ({
//   //       id: prev[idx]?.id ?? generateMessageId(),
//   //       role: msg.role,
//   //       content: msg.content,
//   //       timestamp: new Date(),
//   //       isStreaming: msg.role === 'assistant' && isStreaming,
//   //     }));
//   //   });
//   // }, [wsMessages, isStreaming]);

//   /** 🎤 Speech callbacks */
  

//   const handleSpeechResult = useCallback((transcript: string) => {
//     if (!transcript.trim()) return;

//     setIsTranscribing(true);
//     setLiveTranscript('');

//     setTimeout(() => {
//       setIsTranscribing(false);
//       handleSendMessage(transcript.trim());
//       setTimeout(() => setVoiceModeOpen(false), 300);
//     }, 400);
//   }, []);

//   const handleInterimTranscript = useCallback((t: string) => {
//     setLiveTranscript(t);
//   }, []);

//   const handleSpeechError = useCallback((error: string) => {
//     toast({
//       title: 'Voice Input Error',
//       description: error,
//       variant: 'destructive',
//     });
//     setOrbState('idle');
//   }, [toast]);

//   const {
//     isListening,
//     isSupported: isSpeechSupported,
//     startListening,
//     stopListening,
//     interimTranscript,
//   } = useSpeechRecognition({
//     onResult: handleSpeechResult,
//     onInterim: handleInterimTranscript,
//     onError: handleSpeechError,
//   });

//   /** 🧠 Orb state control */
//   useEffect(() => {
//     if (isTranscribing || isStreaming || isLoading) {
//       setOrbState('thinking');
//     } else if (isListening) {
//       setOrbState('listening');
//     } else {
//       setOrbState('idle');
//     }
//   }, [isListening, isTranscribing, isStreaming, isLoading]);

//   /** ESC close voice */
//   useEffect(() => {
//     const handler = (e: KeyboardEvent) => {
//       if (e.key === 'Escape' && voiceModeOpen) handleCloseVoiceMode();
//     };
//     window.addEventListener('keydown', handler);
//     return () => window.removeEventListener('keydown', handler);
//   }, [voiceModeOpen]);

//   /** 🎤 Mic controls */
//   const handleMicClick = useCallback(() => {
//   if (isStreaming || !isConnected) return;
//   isListening ? stopListening() : startListening();
// }, [isListening, isStreaming, isConnected]);

//   const handleOpenVoiceMode = useCallback(() => {
//     setVoiceModeOpen(true);
//     if (!isListening) startListening();
//   }, [isListening, startListening]);

//   const handleCloseVoiceMode = useCallback(() => {
//     setVoiceModeOpen(false);
//     if (isListening) stopListening();
//     setLiveTranscript('');
//     setIsTranscribing(false);
//     setOrbState('idle');
//   }, [isListening, stopListening]);

//   const handleVoiceMicToggle = useCallback(() => {
//   if (isStreaming || !isConnected) return;
//   isListening ? stopListening() : startListening();
// }, [isListening, isStreaming, isConnected]);

//   /** 💬 SEND MESSAGE — WebSocket */
//   const handleSendMessage = useCallback((content: string) => {
//     if (!content.trim() || isLoading) return;

//     setIsLoading(true);
//     setOrbState('thinking');

//     sendSocketMessage(content.trim());

//     const interval = setInterval(() => {
//       if (!isStreaming) {
//         setIsLoading(false);
//         setOrbState('idle');
//         clearInterval(interval);
//       }
//     }, 100);
//   }, [isLoading, isStreaming, sendSocketMessage]);

//   /** 🔄 New chat (UI reset only) */
//   const handleNewChat = useCallback(() => {
//     const newSessionId = clearSession();
//     setSessionId(newSessionId);
//     // setMessages([]);
//     toast({
//       title: 'New Conversation',
//       description: 'Started a fresh conversation.',
//     });
//   }, [toast]);

//   const handleSuggestionClick = useCallback((text: string) => {
//     handleSendMessage(text);
//   }, [handleSendMessage]);

//   return (
//     <>
//       <Helmet>
//         <title>AI Personal Assistant</title>
//       </Helmet>

//       <div className="flex flex-col h-screen bg-background">
//         {/* Header */}
//         <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-10">
//           <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="rounded-lg bg-primary/20 w-8 h-8 flex items-center justify-center">
//                 <MessageSquare className="w-4 h-4 text-primary" />
//               </div>
//               <div>
//                 <h1 className="text-sm font-semibold">AI Assistant</h1>
//                 <p className="text-xs text-muted-foreground">
//                   {isConversationStarted ? 'In conversation' : 'Always ready'}
//                 </p>
//               </div>
//             </div>

//             <TooltipProvider>
//               <div className="flex gap-2">
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <button onClick={handleNewChat} className="p-2 rounded-lg hover:bg-secondary">
//                       <RefreshCw className="w-4 h-4" />
//                     </button>
//                   </TooltipTrigger>
//                   <TooltipContent>New conversation</TooltipContent>
//                 </Tooltip>

//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <button className="p-2 rounded-lg hover:bg-secondary">
//                       <Settings className="w-4 h-4" />
//                     </button>
//                   </TooltipTrigger>
//                   <TooltipContent>Assistant settings</TooltipContent>
//                 </Tooltip>
//               </div>
//             </TooltipProvider>
//           </div>
//         </header>
//         {socketError && (
//   <div className="text-center text-xs text-destructive py-2">
//     {socketError}
//   </div>
// )}

//         {/* Chat */}
//         <ChatWindow
//           messages={messages}
//           isLoading={isLoading}
//           isListening={isListening && !voiceModeOpen}
//           isTranscribing={isTranscribing && !voiceModeOpen}
//           isConversationStarted={isConversationStarted}
//           onSuggestionClick={handleSuggestionClick}
//           onVoiceModeClick={isSpeechSupported ? handleOpenVoiceMode : undefined}
//         />

//         {/* Input */}
//         <ChatInput
//           onSendMessage={handleSendMessage}
//           isLoading={isLoading}
//           isListening={isListening && !voiceModeOpen}
//           isTranscribing={isTranscribing && !voiceModeOpen}
//           onMicClick={isSpeechSupported ? handleMicClick : undefined}
//           onVoiceModeClick={isSpeechSupported ? handleOpenVoiceMode : undefined}
//           showMic={isSpeechSupported}
//           placeholder={isConversationStarted ? "Type your message..." : "Ask me anything..."}
//         />

//         {/* Voice Overlay */}
//         <VoiceOverlay
//           isOpen={voiceModeOpen}
//           onClose={handleCloseVoiceMode}
//           orbState={orbState}
//           transcript={liveTranscript || interimTranscript}
//           isListening={isListening}
//           isTranscribing={isTranscribing}
//           onMicToggle={handleVoiceMicToggle}
//           showEscHint={!isMobile}
//         />
//       </div>
//     </>
//   );
// };

// export default Index;


import React, { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import ChatWindow from '@/components/ChatWindow';
import ChatInput from '@/components/ChatInput';
import VoiceOverlay from '@/components/VoiceOverlay';
import { ChatMessage } from '@/types/chat';
import { OrbState } from '@/components/AssistantOrb';
import {
  getOrCreateSessionId,
  clearSession,
} from '@/services/chatApi';
import { RefreshCw, Settings, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { useChatSocket } from "@/hooks/useChatSocket";

const Index: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  const { toast } = useToast();
  const isMobile = useIsMobile();

  /** 🔌 WebSocket Hook */
  const {
    messages: wsMessages,
    sendMessage: sendSocketMessage,
    isStreaming,
    isConnected,
    error: socketError,
  } = useChatSocket();

  /** ✅ SAFE message mapping (NO random IDs) */
  const messages: ChatMessage[] = wsMessages.map((msg, index) => ({
    id: `${msg.role}-${index}`,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(),
    isStreaming: msg.role === "assistant" && isStreaming,
  }));

  const isConversationStarted = messages.length > 0;

  /** ✅ Session init (ONLY once) */
  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  /** ✅ Connection toast (SAFE) */
  useEffect(() => {
    if (!isConnected) {
      toast({
        title: "Connection Lost",
        description: "Please wait while reconnecting…",
        variant: "destructive",
      });
    }
  }, [isConnected, toast]);

  /** 🎤 Speech callbacks */
  const handleSpeechResult = useCallback((transcript: string) => {
    if (!transcript.trim() || !isConnected) return;

    setIsTranscribing(true);
    setLiveTranscript('');

    setTimeout(() => {
      setIsTranscribing(false);
      handleSendMessage(transcript.trim());
      setTimeout(() => setVoiceModeOpen(false), 300);
    }, 400);
  }, [isConnected]);

  const handleInterimTranscript = useCallback((t: string) => {
    setLiveTranscript(t);
  }, []);

  const handleSpeechError = useCallback((error: string) => {
    toast({
      title: 'Voice Input Error',
      description: error,
      variant: 'destructive',
    });
    setOrbState('idle');
  }, [toast]);

  const {
    isListening,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    interimTranscript,
  } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onInterim: handleInterimTranscript,
    onError: handleSpeechError,
  });

  /** 🧠 Orb state */
  useEffect(() => {
    if (isTranscribing || isStreaming || isLoading) {
      setOrbState('thinking');
    } else if (isListening) {
      setOrbState('listening');
    } else {
      setOrbState('idle');
    }
  }, [isListening, isTranscribing, isStreaming, isLoading]);

  /** ESC close voice */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && voiceModeOpen) handleCloseVoiceMode();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [voiceModeOpen]);

  /** 🎤 Mic controls */
  const handleMicClick = useCallback(() => {
    if (isStreaming || !isConnected) return;
    isListening ? stopListening() : startListening();
  }, [isListening, isStreaming, isConnected]);

  const handleOpenVoiceMode = useCallback(() => {
    setVoiceModeOpen(true);
    if (!isListening) startListening();
  }, [isListening, startListening]);

  const handleCloseVoiceMode = useCallback(() => {
    setVoiceModeOpen(false);
    if (isListening) stopListening();
    setLiveTranscript('');
    setIsTranscribing(false);
    setOrbState('idle');
  }, [isListening, stopListening]);

  const handleVoiceMicToggle = useCallback(() => {
    if (isStreaming || !isConnected) return;
    isListening ? stopListening() : startListening();
  }, [isListening, isStreaming, isConnected]);

  /** 💬 SEND MESSAGE — WebSocket */
  const handleSendMessage = useCallback((content: string) => {
    if (!content.trim() || isLoading || !isConnected) return;

    setIsLoading(true);
    setOrbState('thinking');

    sendSocketMessage(content.trim());

    const interval = setInterval(() => {
      if (!isStreaming) {
        setIsLoading(false);
        setOrbState('idle');
        clearInterval(interval);
      }
    }, 100);
  }, [isLoading, isStreaming, isConnected, sendSocketMessage]);

  /** 🔄 New chat */
  const handleNewChat = useCallback(() => {
    const newSessionId = clearSession();
    setSessionId(newSessionId);
    toast({
      title: 'New Conversation',
      description: 'Started a fresh conversation.',
    });
  }, [toast]);

  const handleSuggestionClick = useCallback((text: string) => {
    handleSendMessage(text);
  }, [handleSendMessage]);

  return (
    <>
      <Helmet>
        <title>AI Personal Assistant</title>
      </Helmet>

      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/20 w-8 h-8 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-semibold">AI Assistant</h1>
                <p className="text-xs text-muted-foreground">
                  {isConversationStarted ? 'In conversation' : 'Always ready'}
                </p>
              </div>
            </div>

            <TooltipProvider>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={handleNewChat} className="p-2 rounded-lg hover:bg-secondary">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>New conversation</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-2 rounded-lg hover:bg-secondary">
                      <Settings className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Assistant settings</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </header>

        {socketError && (
          <div className="text-center text-xs text-destructive py-2">
            {socketError}
          </div>
        )}

        {/* Chat */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          isListening={isListening && !voiceModeOpen}
          isTranscribing={isTranscribing && !voiceModeOpen}
          isConversationStarted={isConversationStarted}
          onSuggestionClick={handleSuggestionClick}
          onVoiceModeClick={isSpeechSupported ? handleOpenVoiceMode : undefined}
        />

        {/* Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isListening={isListening && !voiceModeOpen}
          isTranscribing={isTranscribing && !voiceModeOpen}
          onMicClick={isSpeechSupported ? handleMicClick : undefined}
          onVoiceModeClick={isSpeechSupported ? handleOpenVoiceMode : undefined}
          showMic={isSpeechSupported}
          placeholder={isConversationStarted ? "Type your message..." : "Ask me anything..."}
        />

        {/* Voice Overlay */}
        <VoiceOverlay
          isOpen={voiceModeOpen}
          onClose={handleCloseVoiceMode}
          orbState={orbState}
          transcript={liveTranscript || interimTranscript}
          isListening={isListening}
          isTranscribing={isTranscribing}
          onMicToggle={handleVoiceMicToggle}
          showEscHint={!isMobile}
        />
      </div>
    </>
  );
};

export default Index;
