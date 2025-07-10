import { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface CricketMatch {
  id: string;
  teams: string;
  date: string;
  time: string;
  format: string;
  venue: string;
  status: string;
}

interface MatchAnalysis {
  matchPrediction: any;
  playerRecommendations: any;
  captaincy: any;
  conditions: any;
  strategy: any;
}

interface EnrichedMatchData {
  match: any;
  analysis: MatchAnalysis;
  players: any[];
  weather: any;
  news: any[];
  lastUpdated: string;
}

export function useCricketMatches() {
  // Use SWR for data fetching and caching
  const { data, error, isLoading, mutate } = useSWR('/api/matches', fetcher, {
    revalidateOnFocus: false
  });

  return {
    matches: data?.success ? data.data : [],
    loading: isLoading,
    error: error ? (error.message || 'Failed to fetch matches') : null,
    refetch: mutate,
  };
}

export function useMatchData(matchId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    () => (matchId ? `/api/matches/${matchId}` : null),
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    data: data?.success ? data.data : null,
    loading: isLoading,
    error: error ? (error.message || 'Failed to fetch match data') : null,
    refetch: mutate,
  };
}

export function useTeamGeneration() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTeams = async (
    matchId: string,
    strategy: string,
    teamCount: number,
    userPreferences?: any
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/teams/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          strategy,
          teamCount,
          userPreferences
        })
      });

      const result = await response.json();

      if (result.success) {
        setTeams(result.data.teams);
        return result.data.teams;
      } else {
        setError(result.error || 'Failed to generate teams');
        return [];
      }
    } catch (err) {
      setError('Network error while generating teams');
      console.error('Error generating teams:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateTeams = (newTeams: any[]) => {
    setTeams(newTeams);
  };

  return { teams, loading, error, generateTeams, updateTeams };
}

export function useChatbot() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (
    message: string,
    matchId?: string,
    context?: any
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          matchId,
          context
        })
      });

      const result = await response.json();

      if (result.success) {
        return result.data.response;
      } else {
        setError(result.error || 'Failed to get response');
        return "I'm sorry, I couldn't process your request at the moment.";
      }
    } catch (err) {
      setError('Network error while sending message');
      console.error('Error sending message:', err);
      return "I'm sorry, there was a network error.";
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading, error };
}