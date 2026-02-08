import { ReactNode } from 'react';
import LoginButton from './LoginButton';
import { Coins } from 'lucide-react';
import { SiCaffeine } from 'react-icons/si';

interface GameLayoutProps {
  children: ReactNode;
}

export default function GameLayout({ children }: GameLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coins className="w-8 h-8 text-primary" strokeWidth={2} />
            <h1 className="text-xl md:text-2xl font-bold">Cash Clicker</h1>
          </div>
          <LoginButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2 flex-wrap">
            © 2026. Built with 
            <span className="text-destructive">♥</span> 
            using 
            <a 
              href="https://caffeine.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors font-medium"
            >
              <SiCaffeine className="w-4 h-4" />
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
