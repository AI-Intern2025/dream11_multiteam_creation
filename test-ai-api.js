// Test script for AI Analysis API
const testAIAnalysis = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/ai-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        team1: 'Mumbai Indians',
        team2: 'Chennai Super Kings',
        format: 'T20',
        venue: 'Wankhede Stadium',
        pitch: 'Flat',
        weather: 'Clear',
        userPredictions: {
          teamA: { runsExpected: 'high', wicketsConceded: 'medium' },
          teamB: { runsExpected: 'medium', wicketsConceded: 'high' }
        }
      }),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const result = await response.json();
    console.log('AI Analysis Result:');
    console.log(JSON.stringify(result, null, 2));
    
    // Try to parse the analysis
    try {
      const parsedAnalysis = JSON.parse(result.analysis);
      console.log('\nParsed Analysis:');
      console.log(JSON.stringify(parsedAnalysis, null, 2));
    } catch (parseError) {
      console.log('\nAnalysis text (not JSON):');
      console.log(result.analysis);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testAIAnalysis();
