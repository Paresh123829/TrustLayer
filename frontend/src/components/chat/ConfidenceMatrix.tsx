import { ConfidenceMetrics } from '@/types';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface ConfidenceMatrixProps {
  metrics: ConfidenceMetrics;
}

export function ConfidenceMatrix({ metrics }: ConfidenceMatrixProps) {
  const getColorClass = (value: number) => {
    if (value >= 80) return 'text-trust-low';
    if (value >= 50) return 'text-trust-medium';
    return 'text-trust-high';
  };

  const items = [
    { label: 'CONFIDENCE', value: metrics.confidence },
    { label: 'SAFETY', value: metrics.safety },
    { label: 'TRUTH', value: metrics.truth },
  ];

  return (
    <div className="mt-3 space-y-2">
      <div className="flex divide-x divide-border border border-border rounded-lg overflow-hidden bg-card/50">
        {items.map((item) => (
          <div key={item.label} className="flex-1 px-4 py-3 text-center">
            <div className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              {item.label}
            </div>
            <div className={cn("text-base font-semibold mt-1", getColorClass(item.value))}>
              {item.value}%
            </div>
          </div>
        ))}
      </div>
      
      {metrics.flagged && (
        <div className="flex items-center justify-center gap-1.5 px-3 py-2 bg-trust-high/10 border border-trust-high/20 rounded-lg">
          <AlertCircle className="h-3.5 w-3.5 text-trust-high" />
          <span className="text-xs font-medium text-trust-high uppercase tracking-wide">
            Flagged
          </span>
        </div>
      )}
    </div>
  );
}
