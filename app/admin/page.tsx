'use client';

import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Mock services for admin functionality
const fixtureService = {
  uploadCsv: async (file: File) => {
    console.log('Uploading fixture CSV:', file.name);
    // Mock API call
    await new Promise(res => setTimeout(res, 1000));
    return { success: true, message: 'Fixture uploaded successfully.' };
  },
};

const ocrService = {
  processScreenshot: async (file: File) => {
    console.log('Processing lineup screenshot:', file.name);
    await new Promise(res => setTimeout(res, 2000));
    // Mock OCR data
    return {
      success: true,
      players: [
        { id: 1, name: 'Player A', role: 'BAT', credits: 9.0, team: 'TEAM-A', status: 'ok' },
        { id: 2, name: 'Player B', role: 'BOWL', credits: 8.5, team: 'TEAM-B', status: 'ok' },
        { id: 3, name: 'Player C (error)', role: 'AR', credits: '9.5', team: 'TEAM-A', status: 'edit' },
      ],
    };
  },
};

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/login');
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading Admin Dashboard...</div>
      </div>
    );
  }

  const handleFixtureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await fixtureService.uploadCsv(file);
      alert(result.message);
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await ocrService.processScreenshot(file);
      if (result.success) {
        alert('Screenshot processed! Review players in the panel.');
        // In a real app, you'd update state with result.players
      }
    }
  };

  return (
    <div className="container mx-auto p-8 text-foreground">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-4xl font-black mb-4 text-primary">Admin Dashboard</h1>
        <p className="mb-8 text-muted-foreground">Welcome, {user?.username}. Manage fixtures and player data here.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Fixture Management */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-bold mb-4 text-accent">1. Upload Fixture CSV</h2>
            <p className="text-sm text-muted-foreground mb-4">Upload a CSV with upcoming matches.</p>
            <input type="file" accept=".csv" onChange={handleFixtureUpload} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"/>
          </div>

          {/* Lineup Processing */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-bold mb-4 text-accent">2. Upload Lineup Screenshot</h2>
            <p className="text-sm text-muted-foreground mb-4">Upload the Dream11 "Create Team" screenshot.</p>
            <input type="file" accept="image/*" onChange={handleScreenshotUpload} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"/>
          </div>
        </div>

        {/* OCR Review Panel */}
        <div className="mt-8 bg-card p-6 rounded-lg border border-border">
          <h2 className="text-2xl font-bold mb-4 text-accent">3. OCR Review & CRUD Panel</h2>
          <p className="text-sm text-muted-foreground mb-6">Review the data extracted from the screenshot. Edit if necessary and publish the match.</p>
          {/* This would be a dynamic table mapping over OCR results */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-2">Player</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Credits</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Mock data for display */}
                <tr className="border-b border-border/50">
                  <td className="p-2">Player A</td>
                  <td className="p-2">BAT</td>
                  <td className="p-2">9.0</td>
                  <td className="p-2 text-green-400">OK</td>
                  <td className="p-2"></td>
                </tr>
                <tr className="border-b border-border/50 bg-yellow-900/20">
                  <td className="p-2"><input type="text" defaultValue="Player C (error)" className="bg-transparent w-full"/></td>
                  <td className="p-2"><input type="text" defaultValue="AR" className="bg-transparent w-full"/></td>
                  <td className="p-2"><input type="number" defaultValue="9.5" className="bg-transparent w-full"/></td>
                  <td className="p-2 text-yellow-400">Needs Edit</td>
                  <td className="p-2"><button className="text-xs bg-green-600 px-2 py-1 rounded">Save</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="btn-primary">Publish Match</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
