import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { Paperclip } from 'lucide-react';
import { ConfidenceMatrix } from './ConfidenceMatrix';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={cn(
      "flex gap-4 py-5",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex flex-col max-w-2xl",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {message.attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 border border-border rounded-md text-sm"
              >
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-foreground text-xs">{file.name}</span>
                <span className="text-muted-foreground text-xs">
                  ({formatFileSize(file.size)})
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Message content */}
        <div className={cn(
          "px-4 py-3 rounded-xl",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted/50 border border-border text-foreground"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Confidence Matrix for AI responses */}
        {!isUser && message.metrics && (
          <ConfidenceMatrix metrics={message.metrics} />
        )}

        {/* Timestamp */}
        <span className="mt-2 text-[11px] text-muted-foreground">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
