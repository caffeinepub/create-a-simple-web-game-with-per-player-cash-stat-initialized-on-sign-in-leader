import { useState } from 'react';
import { useEnforceAdminLeadership } from '../hooks/useEnforceAdminLeadership';
import { useIsCallerAdmin } from '../hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Crown, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLeaderboardControls() {
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { mutate: enforceLeadership, isPending, isSuccess, error } = useEnforceAdminLeadership();
  const [showSuccess, setShowSuccess] = useState(false);

  // Don't render anything if not admin or still loading
  if (isAdminLoading || !isAdmin) {
    return null;
  }

  const handleEnforceLeadership = () => {
    enforceLeadership(undefined, {
      onSuccess: () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      },
    });
  };

  return (
    <Card className="w-full border-accent/30 bg-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          <Crown className="w-5 h-5" />
          Admin Controls
        </CardTitle>
        <CardDescription>
          Ensure you remain the top player on the leaderboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleEnforceLeadership}
          disabled={isPending}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enforcing Leadership...
            </>
          ) : (
            <>
              <Crown className="w-4 h-4 mr-2" />
              Enforce Admin Leadership
            </>
          )}
        </Button>

        {showSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-400">
              Successfully enforced admin leadership!
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">
              {error.message || 'Failed to enforce admin leadership'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
