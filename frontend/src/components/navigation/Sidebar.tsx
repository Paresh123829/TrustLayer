import { useState } from 'react';
import { 
  Shield, 
  FileCheck, 
  Activity, 
  User, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DrawerType } from '@/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onOpenDrawer: (drawer: DrawerType) => void;
  activeDrawer: DrawerType;
  sessionActive: boolean;
}

const navItems = [
  { id: 'trust' as DrawerType, label: 'Trust', icon: Shield },
  { id: 'consent' as DrawerType, label: 'Consent', icon: FileCheck },
  { id: 'monitoring' as DrawerType, label: 'Logs', icon: Activity },
];

export function Sidebar({ onOpenDrawer, activeDrawer, sessionActive }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "h-full bg-sidebar flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-lg font-semibold text-sidebar-foreground tracking-tight">
            TrustStack
          </span>
        )}
        {collapsed && (
          <span className="text-lg font-semibold text-sidebar-foreground">
            TS
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeDrawer === item.id ? 'sidebar-active' : 'sidebar'}
            size="default"
            className={cn(
              "transition-all duration-200",
              collapsed ? "justify-center px-0" : "px-3"
            )}
            onClick={() => onOpenDrawer(item.id)}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="ml-3">{item.label}</span>}
          </Button>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="py-4 px-2 space-y-1 border-t border-sidebar-border">
        {/* Session indicator */}
        <div 
          className={cn(
            "flex items-center py-2 text-sm",
            collapsed ? "justify-center px-0" : "px-3"
          )}
        >
          <div className={cn(
            "h-2 w-2 rounded-full shrink-0",
            sessionActive ? "bg-trust-high" : "bg-sidebar-muted"
          )} />
          {!collapsed && (
            <span className="ml-3 text-sidebar-muted">
              {sessionActive ? 'Session Active' : 'No Session'}
            </span>
          )}
        </div>

        <Button
          variant={activeDrawer === 'settings' ? 'sidebar-active' : 'sidebar'}
          size="default"
          className={cn(
            "transition-all duration-200",
            collapsed ? "justify-center px-0" : "px-3"
          )}
          onClick={() => onOpenDrawer('settings')}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="ml-3">Settings</span>}
        </Button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="h-12 flex items-center justify-center border-t border-sidebar-border text-sidebar-muted hover:text-sidebar-foreground transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  );
}
