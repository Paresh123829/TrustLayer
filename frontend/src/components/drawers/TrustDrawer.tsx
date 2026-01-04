import { DrawerWrapper } from './DrawerWrapper';
import { TrustAssessment } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, MinusCircle } from 'lucide-react';

interface TrustDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: TrustAssessment;
}

export function TrustDrawer({ isOpen, onClose, data }: TrustDrawerProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-trust-high bg-trust-high/10';
      case 'medium': return 'text-trust-medium bg-trust-medium/10';
      case 'high': return 'text-trust-low bg-trust-low/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-trust-high';
    if (score >= 50) return 'text-trust-medium';
    return 'text-trust-low';
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-trust-high" />;
      case 'negative': return <AlertCircle className="h-4 w-4 text-trust-low" />;
      default: return <MinusCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <DrawerWrapper isOpen={isOpen} onClose={onClose} title="Trust Assessment">
      <div className="space-y-8">
        {/* Score display */}
        <div className="text-center py-8 bg-secondary rounded-xl">
          <div className={cn("text-5xl font-semibold mb-2", getScoreColor(data.score))}>
            {data.score}%
          </div>
          <div className="text-sm text-muted-foreground mb-4">Trust Score</div>
          <span className={cn(
            "inline-flex px-3 py-1 rounded-full text-sm font-medium capitalize",
            getRiskColor(data.riskLevel)
          )}>
            {data.riskLevel} Risk
          </span>
        </div>

        {/* Explanation */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Analysis Summary</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {data.explanation}
          </p>
        </div>

        {/* Factors */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-4">Contributing Factors</h3>
          <div className="space-y-3">
            {data.factors.map((factor, index) => (
              <div 
                key={index}
                className="p-4 bg-secondary rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getImpactIcon(factor.impact)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">
                      {factor.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {factor.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DrawerWrapper>
  );
}
