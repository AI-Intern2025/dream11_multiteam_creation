import { useState, useEffect } from 'react';

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
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/matches');
      const result = await response.json();

      if (result.success) {
        // Data is already transformed by the API endpoint
        setMatches(result.data);
      } else {
        setError(result.error || 'Failed to fetch matches');
      }
    } catch (err) {
      setError('Network error while fetching matches');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  return { matches, loading, error, refetch: fetchMatches };
}

export function useMatchData(matchId: string) {
  const [data, setData] = useState<EnrichedMatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (matchId) {
      fetchMatchData();
    }
  }, [matchId]);

  const fetchMatchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/matches/${matchId}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch match data');
      }
    } catch (err) {
      setError('Network error while fetching match data');
      console.error('Error fetching match data:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchMatchData };
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

  return { teams, loading, error, generateTeams };
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