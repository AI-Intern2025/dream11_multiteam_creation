"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, Users, Trophy, Target, BarChart3, Calendar, Award } from 'lucide-react';
import Link from 'next/link';

const mockHistoricalData = [
  { match: 'ENG vs IND', date: '2024-01-10', teams: 15, winRate: 23.5, bestRank: 1245, avgRank: 8567 },
  { match: 'PAK vs NZ', date: '2024-01-08', teams: 12, winRate: 18.2, bestRank: 2134, avgRank: 9234 },
  { match: 'AUS vs SA', date: '2024-01-05', teams: 20, winRate: 31.8, bestRank: 567, avgRank: 6543 },
];

const mockTopStrategies = [
  { strategy: 'AI-Guided Chatbot', usage: 45, successRate: 28.5 },
  { strategy: 'Same XI, Different Captains', usage: 35, successRate: 22.1 },
  { strategy: 'Score & Storyline Prediction', usage: 20, successRate: 19.8 },
];

export default function AnalyticsPage() {
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
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                <p className="text-gray-300">Performance insights and historical data</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="historical">Historical</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 from last week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Teams Created</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">187</div>
                  <p className="text-xs text-muted-foreground">+15 from last week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Win Rate</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24.2%</div>
                  <p className="text-xs text-muted-foreground">+3.1% from last week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Best Rank</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">567</div>
                  <p className="text-xs text-muted-foreground">All-time best</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Performance</CardTitle>
                  <CardDescription>Last 5 matches performance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Win Rate Trend</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">+5.2%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Avg Rank Improvement</span>
                      <Badge variant="default" className="bg-blue-100 text-blue-800">+1,234</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Strategy Effectiveness</span>
                      <Badge variant="default" className="bg-purple-100 text-purple-800">High</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Players</CardTitle>
                  <CardDescription>Most successful players in your teams</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Virat Kohli', 'Joe Root', 'Jasprit Bumrah'].map((player, index) => (
                      <div key={player} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="font-medium">{player}</span>
                        </div>
                        <Badge variant="outline">{85 - index * 5}% success</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Historical Tab */}
          <TabsContent value="historical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Match History</CardTitle>
                <CardDescription>Historical performance across all matches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Match</th>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Teams</th>
                        <th className="text-left p-3">Win Rate</th>
                        <th className="text-left p-3">Best Rank</th>
                        <th className="text-left p-3">Avg Rank</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockHistoricalData.map((match, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{match.match}</td>
                          <td className="p-3">{match.date}</td>
                          <td className="p-3">{match.teams}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {match.winRate}%
                            </Badge>
                          </td>
                          <td className="p-3 font-medium">{match.bestRank.toLocaleString()}</td>
                          <td className="p-3">{match.avgRank.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategies Tab */}
          <TabsContent value="strategies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Strategy Performance</CardTitle>
                <CardDescription>Compare effectiveness of different team creation strategies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTopStrategies.map((strategy, index) => (
                    <div key={strategy.strategy} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold">{strategy.strategy}</h3>
                          <p className="text-sm text-gray-500">{strategy.usage}% usage rate</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{strategy.successRate}%</div>
                        <div className="text-sm text-gray-500">Success Rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Long-term performance analysis and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Trend Analysis</h3>
                  <p className="text-gray-500">Detailed trend charts and predictive analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}