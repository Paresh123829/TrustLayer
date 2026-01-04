import { useState, useEffect } from 'react';
import { DrawerWrapper } from './DrawerWrapper';
import { ConsentData } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Clock, FileText, Database, Info } from 'lucide-react';

interface ConsentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: ConsentData;
  onEndSession: () => void;
}

export function ConsentDrawer({ isOpen, onClose, data, onEndSession }: ConsentDrawerProps) {
  const [timeRemaining, setTimeRemaining] = useState(data.retentionTime);

  useEffect(() => {
    if (!data.sessionActive) return;
    
    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [data.sessionActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    const mins = Math.floor(diff / 60);
    if (mins < 1) return 'Just started';
    if (mins === 1) return '1 minute';
    return `${mins} minutes`;
  };

  const scopeIcons: Record<string, React.ReactNode> = {
    'Text input': <FileText className="h-4 w-4" />,
    'Uploaded documents': <Database className="h-4 w-4" />,
    'Session metadata': <Info className="h-4 w-4" />,
  };

  return (
    <DrawerWrapper isOpen={isOpen} onClose={onClose} title="Data Usage & Consent">
      <div className="space-y-8">
        {/* Session status */}
        <div className="p-4 bg-secondary rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Session Status</span>
            <span className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              data.sessionActive 
                ? "bg-trust-high/10 text-trust-high" 
                : "bg-muted text-muted-foreground"
            )}>
              <span className={cn(
                "h-1.5 w-1.5 rounded-full",
                data.sessionActive ? "bg-trust-high" : "bg-muted-foreground"
              )} />
              {data.sessionActive ? 'Active' : 'Expired'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Active for {formatDuration(data.sessionStarted)}
            </span>
          </div>
        </div>

        {/* Retention countdown */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Data Retention</h3>
          <div className="p-4 bg-secondary rounded-xl text-center">
            <div className="text-3xl font-semibold text-foreground mb-1">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-muted-foreground">
              Time until data deletion
            </div>
          </div>
        </div>

        {/* Purpose */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Processing Purpose</h3>
          <p className="text-sm text-muted-foreground leading-relaxed p-4 bg-secondary rounded-xl">
            {data.purpose}
          </p>
        </div>

        {/* Data scope */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Data Scope</h3>
          <div className="space-y-2">
            {data.dataScope.map((scope, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
              >
                <span className="text-muted-foreground">
                  {scopeIcons[scope] || <Info className="h-4 w-4" />}
                </span>
                <span className="text-sm text-foreground">{scope}</span>
              </div>
            ))}
          </div>
        </div>

        {/* End session button */}
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={onEndSession}
          disabled={!data.sessionActive}
        >
          End Session & Delete Data
        </Button>
      </div>
    </DrawerWrapper>
  );
}
