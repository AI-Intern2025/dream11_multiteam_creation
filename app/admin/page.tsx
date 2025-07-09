"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Users, Calendar, FileText, Settings, Home, Eye, Edit, Trash2, CheckCircle, AlertCircle, Database, Shield } from 'lucide-react';
import Link from 'next/link';
import UserNav from '@/components/user-nav';

// Mock data
const mockFixtures = [
  { id: 1, teams: 'ENG vs IND', date: '2024-01-15', format: 'Test', status: 'published', ocrStatus: 'completed', nlData: true },
  { id: 2, teams: 'PAK vs NZ', date: '2024-01-16', format: 'ODI', status: 'configured', ocrStatus: 'pending', nlData: false },
  { id: 3, teams: 'AUS vs SA', date: '2024-01-17', format: 'T20', status: 'draft', ocrStatus: 'not_started', nlData: false },
];

const mockPlayers = [
  { id: 1, name: 'Virat Kohli', team: 'IND', role: 'BAT', credits: 11.5, selection: 85, ocrVerified: true },
  { id: 2, name: 'Joe Root', team: 'ENG', role: 'BAT', credits: 10.5, selection: 78, ocrVerified: true },
  { id: 3, name: 'Jasprit Bumrah', team: 'IND', role: 'BOWL', credits: 9.5, selection: 65, ocrVerified: false },
  { id: 4, name: 'Ben Stokes', team: 'ENG', role: 'ALL', credits: 9.0, selection: 72, ocrVerified: true },
  { id: 5, name: 'Rishabh Pant', team: 'IND', role: 'WK', credits: 9.0, selection: 68, ocrVerified: true },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('fixtures');
  const [selectedFixture, setSelectedFixture] = useState<number | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoteLoading, setPromoteLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    if (session.user?.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchUsers();
    }
  }, [session]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const updateUserRole = async (userId: string, role: 'user' | 'admin') => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role }),
      });
      
      if (response.ok) {
        fetchUsers(); // Refresh the users list
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const promoteUserByEmail = async () => {
    if (!promoteEmail.trim()) return;
    
    setPromoteLoading(true);
    try {
      const response = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: promoteEmail.trim() }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`Successfully promoted ${promoteEmail} to admin!`);
        setPromoteEmail('');
        fetchUsers(); // Refresh the users list
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Error promoting user. Please try again.');
    } finally {
      setPromoteLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session || session.user?.role !== 'admin') {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="gradient-bg text-white shadow-xl">
        <div className="container mx-auto px-4 py-6">            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Settings className="h-8 w-8 text-red-400" />
                <div>
                  <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                  <p className="text-gray-300">Manage fixtures, players, and match data</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <UserNav />
                <Link href="/">
                  <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
            <TabsTrigger value="ocr">OCR & Classification</TabsTrigger>
            <TabsTrigger value="players">Player CRUD</TabsTrigger>
            <TabsTrigger value="nldata">Natural Language Data</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          {/* Fixtures Tab */}
          <TabsContent value="fixtures" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Fixture Management</CardTitle>
                    <CardDescription>Upload CSV fixtures and configure matches</CardDescription>
                  </div>
                  <Button className="btn-primary">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Fixture CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockFixtures.map((fixture) => (
                    <div key={fixture.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-semibold">{fixture.teams}</div>
                          <div className="text-sm text-gray-500">{fixture.date} • {fixture.format}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={fixture.status === 'published' ? 'default' : fixture.status === 'configured' ? 'secondary' : 'outline'}>
                          {fixture.status}
                        </Badge>
                        {fixture.status === 'published' && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Live
                          </Badge>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {fixture.status !== 'published' && (
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OCR & Classification Tab */}
          <TabsContent value="ocr" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>OCR & Classification</CardTitle>
                    <CardDescription>Upload Dream11 screenshots and verify extracted data</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Fixture Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Fixture</label>
                    <select 
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={selectedFixture || ''}
                      onChange={(e) => setSelectedFixture(Number(e.target.value))}
                    >
                      <option value="">Choose a fixture...</option>
                      {mockFixtures.map((fixture) => (
                        <option key={fixture.id} value={fixture.id}>
                          {fixture.teams} - {fixture.date}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Screenshot Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Upload Dream11 Lineup Screenshot</h3>
                    <p className="text-gray-500 mb-4">Upload the "Create Team" page showing all players, credits, and roles</p>
                    <Button className="btn-primary">
                      Choose Screenshot
                    </Button>
                  </div>
                  
                  {/* OCR Results */}
                  {selectedFixture && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center">
                            <Database className="mr-2 h-4 w-4" />
                            OCR Extraction Results
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Players Detected:</span>
                              <span className="font-medium">22</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Credits Extracted:</span>
                              <span className="font-medium">22/22</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Roles Classified:</span>
                              <span className="font-medium">22/22</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Selection % Found:</span>
                              <span className="font-medium">20/22</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Verification Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">All values read correctly?</span>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" className="text-green-600 border-green-600">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Yes
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600 border-red-600">
                                  <AlertCircle className="mr-1 h-3 w-3" />
                                  No
                                </Button>
                              </div>
                            </div>
                            <Button className="w-full btn-primary">
                              Publish Match
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Player CRUD Tab */}
          <TabsContent value="players" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Player CRUD Panel</CardTitle>
                    <CardDescription>Review and edit extracted player data</CardDescription>
                  </div>
                  <Button className="btn-primary">
                    <Users className="mr-2 h-4 w-4" />
                    Add Player
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Player</th>
                        <th className="text-left p-3">Team</th>
                        <th className="text-left p-3">Role</th>
                        <th className="text-left p-3">Credits</th>
                        <th className="text-left p-3">Selection %</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockPlayers.map((player) => (
                        <tr key={player.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            {player.ocrVerified ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                          </td>
                          <td className="p-3 font-medium">{player.name}</td>
                          <td className="p-3">{player.team}</td>
                          <td className="p-3">
                            <Badge variant="outline">{player.role}</Badge>
                          </td>
                          <td className="p-3">{player.credits}</td>
                          <td className="p-3">{player.selection}%</td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Natural Language Data Tab */}
          <TabsContent value="nldata" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Natural Language Match Data</CardTitle>
                <CardDescription>Upload pitch reports, form summaries, and storyline notes for AI knowledge base</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Match</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                      <option>Choose a match...</option>
                      {mockFixtures.map((fixture) => (
                        <option key={fixture.id} value={fixture.id}>
                          {fixture.teams} - {fixture.date}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Pitch Report</label>
                    <textarea
                      className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Pitch conditions, weather forecast, ground dimensions..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Form Summary</label>
                    <textarea
                      className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Recent player form, team performance, injury updates..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Storyline Notes</label>
                    <textarea
                      className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Key narratives, head-to-head records, tactical insights..."
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button className="btn-primary">
                      <FileText className="mr-2 h-4 w-4" />
                      Save to Knowledge Base
                    </Button>
                    <Button variant="outline">
                      Clear
                    </Button>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Shield className="mr-2 h-5 w-5" />
                      User Management
                    </CardTitle>
                    <CardDescription>Manage user accounts and assign roles</CardDescription>
                  </div>
                  <Button onClick={fetchUsers} disabled={loadingUsers}>
                    <Users className="mr-2 h-4 w-4" />
                    {loadingUsers ? 'Loading...' : 'Refresh Users'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No users found. Users will appear here after they sign in.
                    </div>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.email?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{user.email}</div>
                            <div className="text-sm text-gray-500">
                              Joined: {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={user.role === 'admin' ? 'destructive' : 'secondary'}
                            className={user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}
                          >
                            {user.role}
                          </Badge>
                          <div className="flex space-x-2">
                            {user.role === 'admin' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateUserRole(user.id, 'user')}
                                disabled={user.id === session.user?.id}
                              >
                                Remove Admin
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateUserRole(user.id, 'admin')}
                              >
                                Make Admin
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user roles and permissions</CardDescription>
                  </div>
                  <Button onClick={fetchUsers} disabled={loadingUsers} className="btn-primary">
                    <Users className="mr-2 h-4 w-4" />
                    {loadingUsers ? 'Loading...' : 'Refresh Users'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Promote User by Email Section */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-blue-800">Promote User to Admin</h3>
                  <p className="text-sm text-blue-600 mb-3">
                    Enter the Google email address of a user who has already signed in to promote them to admin.
                  </p>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      placeholder="user@gmail.com"
                      value={promoteEmail}
                      onChange={(e) => setPromoteEmail(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={promoteLoading}
                    />
                    <Button
                      onClick={promoteUserByEmail}
                      disabled={promoteLoading || !promoteEmail.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {promoteLoading ? 'Promoting...' : 'Promote to Admin'}
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  {loadingUsers ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading users...</p>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No users found</p>
                    </div>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium">{user.name || 'Unknown User'}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">
                              Joined: {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? (
                              <>
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </>
                            ) : (
                              'User'
                            )}
                          </Badge>
                          {user.role === 'admin' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserRole(user.id, 'user')}
                              disabled={user.email === session?.user?.email} // Can't demote yourself
                            >
                              Demote to User
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => updateUserRole(user.id, 'admin')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Promote to Admin
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}