import { useRef, useEffect } from 'react';
import { Message, FileAttachment } from '@/types';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { Shield } from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (message: string, attachments: FileAttachment[], filtersEnabled: boolean) => void;
}

export function ChatArea({ messages, onSendMessage }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {!hasMessages ? (
          /* Empty state - centered */
          <div className="h-full flex flex-col items-center justify-center px-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-5">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-xl font-medium text-foreground mb-1.5">
              TrustStack
            </h1>
            <p className="text-muted-foreground text-sm text-center max-w-md mb-10">
              AI governance platform for trust assessment, consent management, and monitoring.
            </p>
            <div className="w-full max-w-3xl">
              <ChatInput onSend={onSendMessage} />
            </div>
          </div>
        ) : (
          /* Messages list */
          <div className="max-w-4xl mx-auto px-6 py-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area - fixed at bottom when there are messages */}
      {hasMessages && (
        <div className="border-t border-border bg-background px-6 py-4">
          <ChatInput onSend={onSendMessage} />
        </div>
      )}
    </div>
  );
}
