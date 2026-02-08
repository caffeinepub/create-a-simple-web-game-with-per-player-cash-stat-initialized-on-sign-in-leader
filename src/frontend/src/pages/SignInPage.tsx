import GameLayout from '../components/GameLayout';
import LoginButton from '../components/LoginButton';
import { Coins } from 'lucide-react';

export default function SignInPage() {
  return (
    <GameLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
          <Coins className="w-24 h-24 text-primary relative animate-pulse" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
          Cash Clicker
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          Start earning cash with every click. Sign in to begin your journey to riches!
        </p>
        
        <LoginButton />
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl">
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold mb-1">Earn Cash</h3>
            <p className="text-sm text-muted-foreground">Click to earn cash instantly</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="text-3xl mb-2">🎁</div>
            <h3 className="font-semibold mb-1">Starter Bonus</h3>
            <p className="text-sm text-muted-foreground">Get $100 after 5 seconds</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold mb-1">Track Progress</h3>
            <p className="text-sm text-muted-foreground">Watch your wealth grow</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
