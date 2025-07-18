"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Calendar, MapPin, Clock, Users, Trophy, RefreshCw, Cloud, Thermometer } from 'lucide-react';
import Link from 'next/link';
import { useMatchData } from '@/hooks/use-cricket-data';
import { useParams } from 'next/navigation';

export default function MatchDetail() {
  const params = useParams();
  const matchId = params?.id as string;
  const [teamCount, setTeamCount] = useState(10);
  const { data: matchData, loading, error } = useMatchData(matchId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <div className="text-gray-500 text-lg">Loading match details...</div>
          <p className="text-gray-400 mt-2">Please wait while match details are retrieved</p>
        </div>
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg">Error loading match data</div>
          <p className="text-gray-400 mt-2">{error || 'Match not found'}</p>
          <Link href="/">
            <Button className="mt-4">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const match = matchData.match;
  // Neon DB fields mapping
  const rawMatch = match;
  const displayDate = new Date(rawMatch.match_date).toLocaleDateString();
  const displayTime = rawMatch.start_time;
  const venue = rawMatch.match_venue;
  const format = rawMatch.match_format;
  const weatherDesc = rawMatch.weather_condition;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="gradient-bg text-white shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">{rawMatch.team_name}</h1>
                <p className="text-gray-300">AI-powered team creation with live data</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {format || 'T20'}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Match Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-red-500" />
              <span>Match Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{displayDate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{displayTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{venue || 'TBD'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm">0 Teams Created</span>
              </div>
              {rawMatch.weather_condition && (
                <div className="flex items-center space-x-2">
                  <Cloud className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{weatherDesc || 'N/A'}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis appears when a strategy is selected, not on initial load */}

        {/* Team Count Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How many teams would you like to create?</CardTitle>
            <CardDescription>AI will generate optimized teams based on live data and analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                value={teamCount}
                onChange={(e) => setTeamCount(parseInt(e.target.value) || 1)}
                min="1"
                max="100"
                className="w-32"
              />
              <div className="flex space-x-2">
                {[5, 10, 15, 20].map((count) => (
                  <Button
                    key={count}
                    variant={teamCount === count ? "default" : "outline"}
                    onClick={() => setTeamCount(count)}
                    className="px-4 py-2"
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategy Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Team Creation Strategy</CardTitle>
            <CardDescription>Each strategy uses AI analysis and live data for optimal team creation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: 'ai-guided',
                  title: 'AI-Guided Assistant',
                  description: 'Interactive AI chatbot with live match insights and personalized recommendations',
                  icon: '🤖',
                  color: 'bg-blue-50 border-blue-200'
                },
                {
                  id: 'same-xi',
                  title: 'Same XI, Different Captains',
                  description: 'AI-optimized core team with strategic captaincy variations',
                  icon: '👑',
                  color: 'bg-purple-50 border-purple-200'
                },
                {
                  id: 'differential',
                  title: 'Score & Storyline Prediction',
                  description: 'Teams based on AI match predictions and expected storylines',
                  icon: '📊',
                  color: 'bg-green-50 border-green-200'
                },
                {
                  id: 'core-hedge',
                  title: 'Core-Hedge Player Selection',
                  description: 'Balanced portfolio with AI-identified core and differential players',
                  icon: '⚖️',
                  color: 'bg-yellow-50 border-yellow-200'
                },
                {
                  id: 'stats-driven',
                  title: 'Stats-Driven Guardrails',
                  description: 'Data-driven selection with AI-powered statistical guardrails',
                  icon: '📈',
                  color: 'bg-red-50 border-red-200'
                },
                {
                  id: 'preset-scenarios',
                  title: 'Preset Scenarios',
                  description: 'AI-curated scenarios based on match conditions and analysis',
                  icon: '⚙️',
                  color: 'bg-gray-50 border-gray-200'
                },
                {
                  id: 'role-split',
                  title: 'Role-Split Lineups',
                  description: 'Optimized role distribution based on AI match analysis',
                  icon: '🎯',
                  color: 'bg-indigo-50 border-indigo-200'
                },
                {
                  id: 'base-edit',
                  title: 'Base Team + Rule-Based Edits',
                  description: 'AI-generated base team with intelligent rule-based variations',
                  icon: '🔧',
                  color: 'bg-teal-50 border-teal-200'
                }
              ].map((strategy) => (
                <Link key={strategy.id} href={`/match/${matchId}/teams?strategy=${strategy.id}&teams=${teamCount}`}>
                  <Card className={`card-hover cursor-pointer ${strategy.color} border-2 hover:shadow-lg`}>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-3xl mb-3">{strategy.icon}</div>
                        <h3 className="font-semibold text-lg mb-2">{strategy.title}</h3>
                        <p className="text-sm text-gray-600">{strategy.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}