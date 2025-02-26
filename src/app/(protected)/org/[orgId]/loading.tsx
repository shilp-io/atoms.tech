import { Loader2 } from 'lucide-react';

export default function OrgLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center space-y-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-2xl font-bold tracking-tight">Loading organization...</h2>
        <p className="text-muted-foreground">
          We're preparing your organization dashboard
        </p>
      </div>
    </div>
  );
} 