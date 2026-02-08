import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <button
      onClick={handleAuth}
      disabled={isLoggingIn}
      className={`
        inline-flex items-center gap-2 px-4 md:px-6 py-2 rounded-full font-medium transition-all duration-200
        ${isAuthenticated 
          ? 'bg-secondary hover:bg-secondary/80 text-secondary-foreground' 
          : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {isLoggingIn ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="hidden md:inline">Logging in...</span>
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Logout</span>
        </>
      ) : (
        <>
          <LogIn className="w-4 h-4" />
          <span>Login</span>
        </>
      )}
    </button>
  );
}
