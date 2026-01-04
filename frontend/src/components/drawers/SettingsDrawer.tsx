import { DrawerWrapper } from './DrawerWrapper';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

export function SettingsDrawer({ isOpen, onClose, theme, onThemeChange }: SettingsDrawerProps) {
  const themeOptions: { value: 'light' | 'dark' | 'system'; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
  ];

  return (
    <DrawerWrapper isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-8">
        {/* Appearance */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-4">Appearance</h3>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onThemeChange(option.value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200",
                  theme === option.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-primary/50"
                )}
              >
                {option.icon}
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* About */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-4">About TrustStack</h3>
          <div className="p-4 bg-secondary rounded-xl space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm text-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Build</span>
              <span className="text-sm text-foreground">2024.01</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-secondary rounded-xl">
          <p className="text-sm text-muted-foreground leading-relaxed">
            TrustStack provides enterprise-grade AI governance with trust assessment, 
            consent management, and comprehensive monitoring capabilities.
          </p>
        </div>
      </div>
    </DrawerWrapper>
  );
}
