"use client";

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function StrategyPage({ 
  params,
  searchParams
}: {
  params: Promise<{ id: string; strategyId: string }>;
  searchParams: Promise<{ teams?: string }>;
}) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const router = useRouter();

  const teamCount = resolvedSearchParams.teams || '10';

  // Redirect to teams page with strategy parameters
  useEffect(() => {
    const queryParams = new URLSearchParams({
      strategy: resolvedParams.strategyId,
      teams: teamCount.toString(),
    });
    router.push(`/match/${resolvedParams.id}/teams?${queryParams}`);
  }, [resolvedParams.id, resolvedParams.strategyId, teamCount, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg">Redirecting to strategy wizard...</div>
        <p className="text-gray-400 mt-2">Please wait while we load your strategy.</p>
      </div>
    </div>
  );
}
