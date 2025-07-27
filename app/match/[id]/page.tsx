"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Calendar, MapPin, Clock, Users, Trophy, RefreshCw, Cloud, Thermometer, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import { useMatchData } from '@/hooks/use-cricket-data';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

const strategyCardVariants: Variants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20
    }
  }
};

export default function MatchDetail() {
  const params = useParams();
  const matchId = params?.id as string;
  const [teamCount, setTeamCount] = useState(11);
  const { data: matchData, loading, error } = useMatchData(matchId);

  if (loading) {
    return (
      <div className="min-h-screen main-gradient-bg flex items-center justify-center text-white">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <RefreshCw className="h-12 w-12 text-white/80 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-semibold tracking-wider">Loading Match Details</h2>
          <p className="text-white/60 mt-2">Preparing the pitch...</p>
        </div>
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="min-h-screen main-gradient-bg flex items-center justify-center text-white">
        <div className="text-center p-8 bg-white/10 rounded-2xl shadow-lg backdrop-blur-md">
          <Trophy className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-red-400">Error Loading Match</h2>
          <p className="text-white/60 mt-2">{error || 'Match data could not be found.'}</p>
          <Link href="/">
            <Button className="mt-6 btn-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Matches
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const match = matchData.match;
  const displayDate = new Date(match.match_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const displayTime = match.start_time;
  const venue = match.match_venue;
  const format = match.match_format;
  const weatherDesc = match.weather_condition;

  const strategies = [
    { id: '1', title: 'AI-Guided Assistant', description: 'Interactive chat for personalized recommendations.', icon: '🤖', color: 'from-blue-400 to-blue-600' },
    { id: '2', title: 'Captaincy Rotation', description: 'Core team with strategic captaincy variations.', icon: '👑', color: 'from-purple-400 to-purple-600' },
    { id: '3', title: 'Storyline Prediction', description: 'Teams based on AI-predicted match scenarios.', icon: '📊', color: 'from-green-400 to-green-600' },
    { id: '4', title: 'Core-Hedge Portfolio', description: 'Balanced portfolio of core and differential players.', icon: '⚖️', color: 'from-yellow-400 to-yellow-600' },
    { id: '5', title: 'Stats-Driven Guardrails', description: 'Data-driven selections with statistical guardrails.', icon: '📈', color: 'from-red-400 to-red-600' },
    { id: '6', title: 'Preset Scenarios', description: 'Curated teams for specific match conditions.', icon: '⚙️', color: 'from-gray-400 to-gray-600' },
    { id: '7', title: 'Role-Split Lineups', description: 'Optimized role distribution for balanced teams.', icon: '🎯', color: 'from-indigo-400 to-indigo-600' },
    { id: '8', title: 'Base Team + Edits', description: 'Foundation team with rule-based variations.', icon: '🔧', color: 'from-teal-400 to-teal-600' }
  ];

  return (
    <div className="min-h-screen main-gradient-bg text-white">
      <AnimatePresence>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="container mx-auto px-4 py-8"
        >
          {/* Header */}
          <motion.header variants={itemVariants} className="flex items-center justify-between mb-8">
            <Link href="/">
              <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Matches
              </Button>
            </Link>
            <Badge variant="secondary" className="text-base px-4 py-2 bg-white/10 border-white/20">
              {format || 'T20'}
            </Badge>
          </motion.header>

          {/* Match Title */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight animated-gradient-text">{match.team_name}</h1>
            <p className="text-white/70 mt-2 text-lg">AI-powered team generation</p>
          </motion.div>

          {/* Match Info */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 text-center">
            <div className="bg-white/5 p-4 rounded-xl">
              <Calendar className="h-6 w-6 mx-auto text-white/70 mb-2" />
              <p className="font-semibold">{displayDate}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl">
              <Clock className="h-6 w-6 mx-auto text-white/70 mb-2" />
              <p className="font-semibold">{displayTime}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl">
              <MapPin className="h-6 w-6 mx-auto text-white/70 mb-2" />
              <p className="font-semibold">{venue || 'TBD'}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl">
              <Cloud className="h-6 w-6 mx-auto text-white/70 mb-2" />
              <p className="font-semibold">{weatherDesc || 'N/A'}</p>
            </div>
          </motion.div>

          {/* Team Count Selection */}
          <motion.div variants={itemVariants} className="mb-12">
            <Card className="bg-white/10 border-white/20 shadow-xl backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><Zap className="mr-2 text-yellow-300" />How many teams to generate?</CardTitle>
                <CardDescription className="text-white/60">Select the number of unique teams you want the AI to create.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Input
                    type="number"
                    value={teamCount}
                    onChange={(e) => setTeamCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    min="1"
                    max="100"
                    className="w-full sm:w-32 bg-transparent border-white/30 text-white text-center text-lg h-12"
                  />
                  <div className="flex-1 w-full">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={teamCount}
                      onChange={(e) => setTeamCount(parseInt(e.target.value))}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Strategy Selection */}
          <motion.div variants={itemVariants}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold flex items-center justify-center"><Star className="mr-3 text-yellow-300" />Choose Your Creation Strategy</h2>
              <p className="text-white/70 mt-2">Each strategy offers a unique approach to building your fantasy teams.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {strategies.map((strategy) => (
                <Link key={strategy.id} href={`/match/${matchId}/strategy/${strategy.id}?teams=${teamCount}`} passHref>
                  <motion.div
                    variants={strategyCardVariants}
                    whileHover={{ y: -10, boxShadow: "0px 20px 30px rgba(0,0,0,0.3)" }}
                    className={`relative p-6 rounded-2xl cursor-pointer overflow-hidden text-white bg-gradient-to-br ${strategy.color} shadow-lg h-full flex flex-col`}
                  >
                    <div className="text-4xl mb-4">{strategy.icon}</div>
                    <h3 className="font-bold text-xl mb-2">{strategy.title}</h3>
                    <p className="text-white/80 text-sm flex-grow">{strategy.description}</p>
                    <div className="mt-4 text-right font-bold text-lg">→</div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}