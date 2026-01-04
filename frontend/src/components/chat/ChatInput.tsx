import { useState, useRef, KeyboardEvent } from 'react';
import { Paperclip, ArrowUp, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FileAttachment } from '@/types';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string, attachments: FileAttachment[], filtersEnabled: boolean) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [filtersEnabled, setFiltersEnabled] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSend(message.trim(), attachments, filtersEnabled);
      setMessage('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments: FileAttachment[] = Array.from(files).map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type
      }));
      setAttachments([...attachments, ...newAttachments]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-md text-sm"
            >
              <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-foreground text-xs">{file.name}</span>
              <span className="text-muted-foreground text-xs">({formatFileSize(file.size)})</span>
              <button
                onClick={() => removeAttachment(file.id)}
                className="text-muted-foreground hover:text-foreground transition-colors ml-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input container */}
      <div className="relative bg-card border border-border rounded-xl shadow-soft overflow-hidden">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          disabled={disabled}
          rows={1}
          className={cn(
            "w-full resize-none bg-transparent px-4 py-4 pr-48 text-foreground placeholder:text-muted-foreground/60",
            "focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
            "min-h-[52px] max-h-[200px] text-sm"
          )}
        />
        
        {/* Action buttons */}
        <div className="absolute bottom-2.5 right-3 flex items-center gap-3">
          {/* Filters toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Filters
            </span>
            <Switch
              checked={filtersEnabled}
              onCheckedChange={setFiltersEnabled}
              disabled={disabled}
              className="data-[state=checked]:bg-primary h-5 w-9"
            />
          </div>

          <div className="w-px h-5 bg-border" />

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            variant="send"
            size="sm"
            onClick={handleSend}
            disabled={disabled || (!message.trim() && attachments.length === 0)}
            className="h-8 px-4 text-xs font-medium"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
