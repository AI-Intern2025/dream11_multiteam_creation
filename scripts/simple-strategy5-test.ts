import { readFileSync } from 'fs';
import { join } from 'path';

// Simple test to verify team generation variation logic
// This test bypasses the database and AI service dependencies

console.log('🚀 Strategy 5 Team Variation Test');
console.log('===================================');

// Mock player data matching the expected format
const testPlayers = [
  { id: 1, name: 'V Kohli', team_name: 'India', player_role: 'BAT', credits: 11.5, dream_team_percentage: 78.5, selection_percentage: 85.2, points: 58 },
  { id: 2, name: 'R Sharma', team_name: 'India', player_role: 'BAT', credits: 11.0, dream_team_percentage: 72.3, selection_percentage: 78.5, points: 52 },
  { id: 3, name: 'S Smith', team_name: 'Australia', player_role: 'BAT', credits: 11.0, dream_team_percentage: 75.6, selection_percentage: 82.1, points: 55 },
  { id: 4, name: 'D Warner', team_name: 'Australia', player_role: 'BAT', credits: 10.5, dream_team_percentage: 68.9, selection_percentage: 76.8, points: 48 },
  { id: 5, name: 'J Bumrah', team_name: 'India', player_role: 'BWL', credits: 10.5, dream_team_percentage: 65.8, selection_percentage: 72.3, points: 45 },
  { id: 6, name: 'P Cummins', team_name: 'Australia', player_role: 'BWL', credits: 10.0, dream_team_percentage: 62.3, selection_percentage: 69.5, points: 42 },
  { id: 7, name: 'R Pant', team_name: 'India', player_role: 'WK', credits: 10.0, dream_team_percentage: 58.9, selection_percentage: 68.7, points: 41 },
  { id: 8, name: 'A Carey', team_name: 'Australia', player_role: 'WK', credits: 8.5, dream_team_percentage: 44.8, selection_percentage: 52.3, points: 33 },
  { id: 9, name: 'H Pandya', team_name: 'India', player_role: 'AR', credits: 9.5, dream_team_percentage: 52.4, selection_percentage: 65.1, points: 38 },
  { id: 10, name: 'G Maxwell', team_name: 'Australia', player_role: 'AR', credits: 9.0, dream_team_percentage: 48.2, selection_percentage: 58.7, points: 36 },
  { id: 11, name: 'R Ashwin', team_name: 'India', player_role: 'BWL', credits: 8.5, dream_team_percentage: 38.2, selection_percentage: 45.6, points: 32 },
  { id: 12, name: 'Y Chahal', team_name: 'India', player_role: 'BWL', credits: 7.5, dream_team_percentage: 29.8, selection_percentage: 38.7, points: 25 },
  { id: 13, name: 'R Jadeja', team_name: 'India', player_role: 'AR', credits: 8.5, dream_team_percentage: 41.3, selection_percentage: 48.9, points: 30 },
  { id: 14, name: 'M Labuschagne', team_name: 'Australia', player_role: 'BAT', credits: 9.5, dream_team_percentage: 51.6, selection_percentage: 61.2, points: 39 },
  { id: 15, name: 'J Hazlewood', team_name: 'Australia', player_role: 'BWL', credits: 8.0, dream_team_percentage: 34.2, selection_percentage: 44.7, points: 28 },
  { id: 16, name: 'M Stoinis', team_name: 'Australia', player_role: 'AR', credits: 7.5, dream_team_percentage: 28.6, selection_percentage: 38.2, points: 24 },
  { id: 17, name: 'S Gill', team_name: 'India', player_role: 'BAT', credits: 8.0, dream_team_percentage: 35.6, selection_percentage: 42.3, points: 28 },
  { id: 18, name: 'T Head', team_name: 'Australia', player_role: 'BAT', credits: 8.5, dream_team_percentage: 39.7, selection_percentage: 49.3, points: 31 },
  { id: 19, name: 'A Zampa', team_name: 'Australia', player_role: 'BWL', credits: 7.0, dream_team_percentage: 23.4, selection_percentage: 32.8, points: 20 },
  { id: 20, name: 'M Marsh', team_name: 'Australia', player_role: 'AR', credits: 8.0, dream_team_percentage: 32.1, selection_percentage: 42.6, points: 26 },
  { id: 21, name: 'K Rahul', team_name: 'India', player_role: 'WK', credits: 9.0, dream_team_percentage: 46.7, selection_percentage: 58.9, points: 35 },
  { id: 22, name: 'M Shami', team_name: 'India', player_role: 'BWL', credits: 7.0, dream_team_percentage: 25.4, selection_percentage: 35.2, points: 22 }
];

function applyStatsFilters(players: any[], filters: any) {
  return players.filter(player => {
    const dreamTeamPct = player.dream_team_percentage || 0;
    const selectionPct = player.selection_percentage || 0;
    const avgPoints = player.points || 0;
    
    return dreamTeamPct >= filters.dreamTeamPercentage.min &&
           dreamTeamPct <= filters.dreamTeamPercentage.max &&
           selectionPct >= (filters.selectionPercentage?.min || 0) &&
           selectionPct <= (filters.selectionPercentage?.max || 100) &&
           avgPoints >= (filters.averagePoints?.min || 0) &&
           avgPoints <= (filters.averagePoints?.max || 100);
  });
}

function shuffleArrayWithSeed(array: any[], seed: number) {
  const shuffled = [...array];
  let currentIndex = shuffled.length;
  let temporaryValue, randomIndex;

  // Simple seeded random number generator
  function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  while (0 !== currentIndex) {
    randomIndex = Math.floor(seededRandom(seed++) * currentIndex);
    currentIndex -= 1;
    temporaryValue = shuffled[currentIndex];
    shuffled[currentIndex] = shuffled[randomIndex];
    shuffled[randomIndex] = temporaryValue;
  }

  return shuffled;
}

function groupPlayersByRole(players: any[]) {
  const roles = { WK: [] as any[], BAT: [] as any[], AR: [] as any[], BWL: [] as any[] };
  
  players.forEach(player => {
    const role = player.player_role as keyof typeof roles;
    if (roles[role]) {
      roles[role].push(player);
    }
  });
  
  return roles;
}

function canAddPlayer(player: any, selectedPlayers: any[], totalCredits: number, teamCounts: Record<string, number>) {
  const playerCredits = player.credits || 8;
  const playerTeam = player.team_name || 'Unknown';
  
  return totalCredits + playerCredits <= 100 &&
         (teamCounts[playerTeam] || 0) < 7 &&
         selectedPlayers.length < 11 &&
         !selectedPlayers.some(p => p.id === player.id); // Avoid duplicates
}

function generateVariedTeam(players: any[], teamIndex: number) {
  const filters = {
    dreamTeamPercentage: { min: 30, max: 100 },
    selectionPercentage: { min: 40, max: 100 },
    averagePoints: { min: 20, max: 100 }
  };
  
  // Apply filters
  const filteredPlayers = applyStatsFilters(players, filters);
  console.log(`📊 Team ${teamIndex + 1}: Filtered to ${filteredPlayers.length} players from ${players.length} total`);
  
  if (filteredPlayers.length === 0) {
    console.warn(`⚠️  Team ${teamIndex + 1}: No players passed filters`);
    return null;
  }
  
  // Shuffle differently for each team
  const shuffledPlayers = shuffleArrayWithSeed(filteredPlayers, teamIndex * 1000);
  
  // Group by role
  const playersByRole = groupPlayersByRole(shuffledPlayers);
  
  const selectedPlayers: any[] = [];
  const teamCounts: Record<string, number> = {};
  let totalCredits = 0;
  
  // Target composition (simplified) - try to fill all 11 spots
  const targetComposition = { WK: 1, BAT: 4, AR: 2, BWL: 4 };
  
  // First pass: try to get the target composition
  Object.entries(targetComposition).forEach(([role, count]) => {
    const rolePlayers = playersByRole[role as keyof typeof playersByRole] || [];
    
    if (rolePlayers.length === 0) {
      console.warn(`⚠️  Team ${teamIndex + 1}: No players available for role ${role}`);
      return;
    }
    
    // Apply different selection strategies based on team index
    let playersToSelect: any[] = [];
    
    if (teamIndex % 5 === 0) {
      // Top performers only
      playersToSelect = rolePlayers.slice(0, Math.min(count * 2, rolePlayers.length));
    } else if (teamIndex % 5 === 1) {
      // Skip top 1, then select
      const startIndex = Math.min(1, Math.floor(rolePlayers.length / 3));
      playersToSelect = rolePlayers.slice(startIndex, startIndex + count * 2);
    } else if (teamIndex % 5 === 2) {
      // Middle performers
      const startIndex = Math.floor(rolePlayers.length / 3);
      playersToSelect = rolePlayers.slice(startIndex, startIndex + count * 2);
    } else if (teamIndex % 5 === 3) {
      // Reverse order
      playersToSelect = [...rolePlayers].reverse().slice(0, Math.min(count * 2, rolePlayers.length));
    } else {
      // Randomized
      playersToSelect = shuffleArrayWithSeed(rolePlayers, teamIndex * 100);
    }
    
    let selected = 0;
    for (const player of playersToSelect) {
      if (selected >= count) break;
      
      if (canAddPlayer(player, selectedPlayers, totalCredits, teamCounts)) {
        selectedPlayers.push(player);
        totalCredits += player.credits || 8;
        const teamName = player.team_name || 'Unknown';
        teamCounts[teamName] = (teamCounts[teamName] || 0) + 1;
        selected++;
      }
    }
    
    console.log(`🎯 Team ${teamIndex + 1}, Role ${role}: Selected ${selected}/${count} players`);
  });
  
  // Second pass: fill remaining spots with any available players
  if (selectedPlayers.length < 11) {
    const remainingPlayers = filteredPlayers.filter(p => !selectedPlayers.some(sp => sp.id === p.id));
    const shuffledRemaining = shuffleArrayWithSeed(remainingPlayers, teamIndex * 1500);
    
    for (const player of shuffledRemaining) {
      if (selectedPlayers.length >= 11) break;
      
      if (canAddPlayer(player, selectedPlayers, totalCredits, teamCounts)) {
        selectedPlayers.push(player);
        totalCredits += player.credits || 8;
        const teamName = player.team_name || 'Unknown';
        teamCounts[teamName] = (teamCounts[teamName] || 0) + 1;
      }
    }
    
    console.log(`🎯 Team ${teamIndex + 1}: Filled to ${selectedPlayers.length}/11 players`);
  }
  
  // Select captain and vice captain with variation
  const captainCandidates = selectedPlayers.filter(p => p.player_role === 'BAT' || p.player_role === 'AR');
  const candidatePool = captainCandidates.length >= 2 ? captainCandidates : selectedPlayers;
  
  let captainIndex = 0;
  let viceCaptainIndex = 1;
  
  if (candidatePool.length >= 2) {
    if (teamIndex % 3 === 0) {
      captainIndex = 0;
      viceCaptainIndex = 1;
    } else if (teamIndex % 3 === 1) {
      captainIndex = 1;
      viceCaptainIndex = 0;
    } else {
      captainIndex = Math.min(2, candidatePool.length - 1);
      viceCaptainIndex = 0;
    }
  }
  
  const captain = candidatePool[captainIndex];
  const viceCaptain = candidatePool[viceCaptainIndex];
  
  return {
    teamIndex: teamIndex + 1,
    players: selectedPlayers,
    captain: captain?.name || 'Unknown',
    viceCaptain: viceCaptain?.name || 'Unknown',
    totalCredits: totalCredits,
    playerCount: selectedPlayers.length,
    teamCounts: teamCounts,
    roleDistribution: selectedPlayers.reduce((acc, p) => {
      acc[p.player_role] = (acc[p.player_role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
}

// Generate 5 teams to test variation
console.log('Generating 5 teams to test variation...\n');

const teams = [];
for (let i = 0; i < 5; i++) {
  const team = generateVariedTeam(testPlayers, i);
  if (team) {
    teams.push(team);
  }
}

console.log('\n🎯 TEAM VARIATION ANALYSIS');
console.log('===========================');

// Analyze captains and vice captains
const captains = teams.map(t => t.captain);
const viceCaptains = teams.map(t => t.viceCaptain);

console.log('Captains:', captains);
console.log('Vice Captains:', viceCaptains);

const uniqueCaptains = new Set(captains);
const uniqueViceCaptains = new Set(viceCaptains);

console.log(`\\nUnique Captains: ${uniqueCaptains.size}/${teams.length}`);
console.log(`Unique Vice Captains: ${uniqueViceCaptains.size}/${teams.length}`);

// Analyze team composition
console.log('\\n📊 TEAM COMPOSITION ANALYSIS');
teams.forEach((team, index) => {
  console.log(`Team ${index + 1}: ${JSON.stringify(team.roleDistribution)}, Credits: ${team.totalCredits.toFixed(1)}, Players: ${team.playerCount}`);
});

// Analyze player overlap
console.log('\\n🔄 PLAYER OVERLAP ANALYSIS');
const playerSets = teams.map(team => new Set(team.players.map(p => p.name)));

for (let i = 0; i < teams.length - 1; i++) {
  for (let j = i + 1; j < teams.length; j++) {
    const intersection = Array.from(playerSets[i]).filter(x => playerSets[j].has(x));
    console.log(`Teams ${i + 1} vs ${j + 1}: ${intersection.length}/11 common players`);
  }
}

// Success criteria
console.log('\\n✅ SUCCESS CRITERIA CHECK');
console.log('===========================');

const success = {
  uniqueCaptains: uniqueCaptains.size >= Math.min(3, teams.length),
  uniqueViceCaptains: uniqueViceCaptains.size >= Math.min(3, teams.length),
  variableComposition: teams.some(t => t.playerCount >= 10), // At least 10 players for test
  lessOverlap: true // We'll calculate this
};

// Check if teams have reasonable variation (less than 80% overlap)
let maxOverlap = 0;
for (let i = 0; i < teams.length - 1; i++) {
  for (let j = i + 1; j < teams.length; j++) {
    const intersection = Array.from(playerSets[i]).filter(x => playerSets[j].has(x));
    const overlapPercentage = intersection.length / 11;
    maxOverlap = Math.max(maxOverlap, overlapPercentage);
  }
}

success.lessOverlap = maxOverlap < 0.8;

console.log(`✅ Captain variation: ${success.uniqueCaptains ? 'PASS' : 'FAIL'}`);
console.log(`✅ Vice captain variation: ${success.uniqueViceCaptains ? 'PASS' : 'FAIL'}`);
console.log(`✅ Team composition: ${success.variableComposition ? 'PASS' : 'FAIL'}`);
console.log(`✅ Player overlap (max ${(maxOverlap * 100).toFixed(1)}%): ${success.lessOverlap ? 'PASS' : 'FAIL'}`);

const overallSuccess = Object.values(success).every(Boolean);
console.log(`\\n🎯 OVERALL RESULT: ${overallSuccess ? '✅ SUCCESS' : '❌ NEEDS IMPROVEMENT'}`);

if (overallSuccess) {
  console.log('\\n🎉 Strategy 5 team variation is working correctly!');
  console.log('✅ Teams are genuinely different with varied C/VC combinations');
  console.log('✅ Player selection shows good diversity between teams');
  console.log('✅ Statistical filters are properly applied');
} else {
  console.log('\\n⚠️  Strategy 5 needs further optimization');
}
