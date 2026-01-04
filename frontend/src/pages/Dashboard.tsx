import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { TrustDrawer } from '@/components/drawers/TrustDrawer';
import { ConsentDrawer } from '@/components/drawers/ConsentDrawer';
import { MonitoringDrawer } from '@/components/drawers/MonitoringDrawer';
import { SettingsDrawer } from '@/components/drawers/SettingsDrawer';
import { 
  Message, 
  FileAttachment, 
  DrawerType, 
  SessionState 
} from '@/types';
import { 
  mockTrustAssessment, 
  mockConsentData, 
  mockMonitoringEvents,
  mockMessages,
  generateMockMetrics
} from '@/data/mockData';

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [session, setSession] = useState<SessionState>({
    active: true,
    timeRemaining: 1800,
    startedAt: new Date(Date.now() - 300000)
  });

  // Handle theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  const handleSendMessage = async (content: string, attachments: FileAttachment[], filtersEnabled: boolean) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? attachments : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      console.log('📤 Sending message to API:', { message: content, filtersEnabled });
      // Call the real API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content, filtersEnabled }),
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        // Handle blocked responses (403)
        if (response.status === 403 && errorData.blocked) {
          const blockedMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `🚫 ${errorData.message || 'This query was blocked for safety reasons.'}`,
            timestamp: new Date(errorData.timestamp || new Date()),
            metrics: {
              confidence: 0,
              safety: 0,
              truth: 0,
              flagged: true
            }
          };
          setMessages(prev => [...prev, blockedMessage]);
          return;
        }
        
        throw new Error(`Failed to get response: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const aiResponse = await response.json();
      console.log('✅ Received AI response:', aiResponse);
      
      // Map backend metrics to frontend format
      const metrics = aiResponse.metrics ? {
        confidence: aiResponse.metrics.confidenceLevel || aiResponse.metrics.confidence || 0.7,
        safety: 1 - (aiResponse.metrics.riskAssessment || aiResponse.metrics.risk || 0),
        truth: aiResponse.metrics.trustScore || aiResponse.metrics.credibility || 0.8,
        flagged: (aiResponse.metrics.riskAssessment || 0) > 0.7 || (aiResponse.evaluation?.action === 'warn')
      } : undefined;
      
      const aiMessage: Message = {
        id: aiResponse.id,
        role: 'assistant',
        content: aiResponse.content + (aiResponse.evaluation?.action === 'warn' ? `\n\n⚠️ ${aiResponse.evaluation.message}` : ''),
        timestamp: new Date(aiResponse.timestamp),
        metrics: metrics
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      // Fallback to mock response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, there was an error processing your request: ${error instanceof Error ? error.message : 'Unknown error'}. Please make sure the backend server is running on port 3000.`,
        timestamp: new Date(),
        metrics: generateMockMetrics(filtersEnabled)
      };
      setMessages(prev => [...prev, aiMessage]);
    }
  };

  const handleOpenDrawer = (drawer: DrawerType) => {
    setActiveDrawer(drawer);
  };

  const handleCloseDrawer = () => {
    setActiveDrawer(null);
  };

  const handleEndSession = () => {
    setSession({
      active: false,
      timeRemaining: 0,
      startedAt: null
    });
    handleCloseDrawer();
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar 
        onOpenDrawer={handleOpenDrawer}
        activeDrawer={activeDrawer}
        sessionActive={session.active}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Session indicator - top right */}
        <div className="h-11 flex items-center justify-end px-6 border-b border-border/50">
          <div className="flex items-center gap-2 text-xs">
            <div className={`h-1.5 w-1.5 rounded-full ${session.active ? 'bg-trust-low' : 'bg-muted-foreground'}`} />
            <span className="text-muted-foreground font-medium">
              {session.active ? 'Session Active' : 'No Active Session'}
            </span>
          </div>
        </div>

        {/* Chat area */}
        <ChatArea 
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </main>

      {/* Drawers */}
      <TrustDrawer 
        isOpen={activeDrawer === 'trust'}
        onClose={handleCloseDrawer}
        data={mockTrustAssessment}
      />
      <ConsentDrawer 
        isOpen={activeDrawer === 'consent'}
        onClose={handleCloseDrawer}
        data={mockConsentData}
        onEndSession={handleEndSession}
      />
      <MonitoringDrawer 
        isOpen={activeDrawer === 'monitoring'}
        onClose={handleCloseDrawer}
        events={mockMonitoringEvents}
      />
      <SettingsDrawer 
        isOpen={activeDrawer === 'settings'}
        onClose={handleCloseDrawer}
        theme={theme}
        onThemeChange={handleThemeChange}
      />
    </div>
  );
}
