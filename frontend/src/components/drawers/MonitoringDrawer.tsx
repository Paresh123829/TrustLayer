import { DrawerWrapper } from './DrawerWrapper';
import { MonitoringEvent } from '@/types';
import { cn } from '@/lib/utils';
import { MessageSquare, Shield, FileCheck, Eye, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface MonitoringDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  events: MonitoringEvent[];
}

export function MonitoringDrawer({ isOpen, onClose, events }: MonitoringDrawerProps) {
  const getEventIcon = (type: MonitoringEvent['type']) => {
    switch (type) {
      case 'query': return MessageSquare;
      case 'policy_check': return Shield;
      case 'consent_validation': return FileCheck;
      case 'response_evaluation': return Eye;
      default: return MessageSquare;
    }
  };

  const getStatusIcon = (status: MonitoringEvent['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-trust-high" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-trust-medium" />;
      case 'error': return <XCircle className="h-4 w-4 text-trust-low" />;
      default: return <CheckCircle className="h-4 w-4 text-trust-high" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatRelativeTime = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return formatTime(date);
  };

  return (
    <DrawerWrapper isOpen={isOpen} onClose={onClose} title="Activity Monitoring">
      <div className="space-y-6">
        {/* Event count */}
        <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
          <span className="text-sm text-muted-foreground">Total Events</span>
          <span className="text-2xl font-semibold text-foreground">{events.length}</span>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-4">Event Timeline</h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

            {/* Events */}
            <div className="space-y-4">
              {events.map((event, index) => {
                const Icon = getEventIcon(event.type);
                return (
                  <div key={event.id} className="relative flex gap-4 pl-10">
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute left-2 top-2 w-4 h-4 rounded-full bg-card border-2 flex items-center justify-center",
                      event.status === 'success' && "border-trust-high",
                      event.status === 'warning' && "border-trust-medium",
                      event.status === 'error' && "border-trust-low"
                    )}>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        event.status === 'success' && "bg-trust-high",
                        event.status === 'warning' && "bg-trust-medium",
                        event.status === 'error' && "bg-trust-low"
                      )} />
                    </div>

                    {/* Event card */}
                    <div className="flex-1 p-4 bg-secondary rounded-lg">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground capitalize">
                            {event.type.replace('_', ' ')}
                          </span>
                        </div>
                        {getStatusIcon(event.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.message}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(event.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DrawerWrapper>
  );
}
