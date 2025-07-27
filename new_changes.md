1st review:
Admin Panel:
Upload fixture CSV Not working
Choose Screenshot not working
Admin panel none of the buttons seem to be working!
User flow:
1st page:
Allow more teams
AI - Guided Assistant:
Shorter questions - dont tell them why you are asking yet [or can you show that collapsed?]
Team A vs Team B [Should be <Home team short name> vs <Away team short name>]
Close contest / Hard to predict are the same options.
Close contest is good. Hard to predict i think you mean - "i'm not sure?"
Nudge users in this case "id like to see some stats"
Show past form and then help them decide?
Show what % of users are picking what option
Conflicting questions
E.g. if i say Top order focus
How can I also answer "Team A Collapses Early" for instance
"For detailed player recommendations, additional analysis data would be needed."
What else will be needed here? Ideally can we build this layer in?
The entire smart captain thing - can go - we should build based on the Q&A from the users
Your Match Insights Summary: This section is great, very neat!
Teams Created should be easier to consume
Example the SS i took should have similar meta data compared to Dream11 / Cricbuzz11!
Split by player roles
Split by teams players belong to
Additional stuff is great, but also
Ideally should be pull based vs upfront [UX wise - so accordian etc]
Search for teams, captains and players should be a drop down and it should highlight the teams that they player belongs to
I did a dummy vibe coding version long ago, you can check the flow for what im talking about there
:gear: Multi-Team Generator (Fantasy Sports Tool) - https://claude.ai/public/artifacts/6c86e74e-a7d2-4886-b9a0-b304ae20a212
Similarly the UX for bulk swap we can take from there!

Same XI, different captains
Can we have an OCR Image recognition based on a Screenshot
Not able to generate 15 teams
Will share more feedback on this flow once I am able to! (edited) 
Screenshot 2025-07-20 at 11.48.13 PM.png
 
Screenshot 2025-07-20 at 11.48.13 PM.png


11:52
Score & Storyline Prediction:
Instead of input fields where the user has to put the exact score, allow for ranges
Example: Runs = Under 120, 120 to 160, 160 to 190, 190+. We can even have a what % of users picked what
AI Analysis of the pitch and form should come on the same page where i make my prediction
UI When seeing a team [of 11 players] - should show which team the players belong to
How many WK, BAT, AR, BOWL
Tested an extreme example:
ENG = 300/1
PAK = 100/10
Expected:
England players in each team >= 7
This didnt quite work [We need to chat about creating a custom gpt] (edited) 
Screenshot 2025-07-20 at 11.50.36 PM.png
 Core, Hedge, Differential
Players I choose should show up in the core box
Captain priority is cool!
Number to teams to create is something I have already put at the start of my flow so i dont need to put this again
The players I chose as Core hedge and differential --> I dont rememember after i generate --> So that context needs to carry forward [Will also give users the confidence that teams are created as per their choice / inputs]
Analysis section [we can do a table]
Joe root = 8/15 teams, 3/15 C, 1/15 VC, Core/Hedge/Differential

Stats-Driven Guardrails
I should have a min and a max in the guardrails- currently its a min only
I should have the option to apply the stats at a player level [so this is a filter] OR a team level
Team level: Sum of stat of all 11 players / 11 should be in the min / max range
I should have the option to give player & team level stats
We can remove the credit range thing






12:04
Presets
I Chose a bowling preset where it said ill get 5+ bowlers, but very few of the 15 teams i made had 5+ bowlers!
Its important to carry the feedback loop forward and for the user to be able to verify the team

Role-Split Lineups Configuration
I picked Team A High Total, Team B Collapse
Wouldnt the Bowlers of team A do well here [& wont they be lower order?]
Show the output as a pivot
Top Order - Team A = 4, B = 1
Middle Order - Team A = 1, B = 1
Lower Order - Team A = 3, B = 1
Done for the scenario picked ^^ as a n example

Base team + edit flow
By optimising Selection % what do we mean
Do we want a safer team or a more differential team?
If safer, will we remove the least selected by players and replace with players we dont have that have a high selected by?
Guardrails
Max should be for each category [WK, AR] & ideally show the list of players too [Maybe behind a click]

his is awesome - just went through all the flows on creation of multiple teams and dropping where i thought we can add some more value to the users.
I feel like the feedback loop from creation should persist to the post creation steps to make the experience more meaningful
Check out the search and bulk swap options
Try increase # of teams created to 100!
1 main problem is:
Creating teams based on the inputs [1 mis-selection = loss of faith from the users]
Going through the documentation to suggest how we can improve the input --> Output (edited) 
Also since we were stuck on:
How do we get AI to create the teams based on the inputs, sharing some thoughts
We can create a custom GPT or Gem in Gemini [Via the browser UI]
We call the Gem / Custom GPT via Code [I've seen some examples of where they do this in N8N - believe this uses langchain but not a techie so please check
Prompt for Custom GPT (JSON Input, Table Output)
You are an expert Fantasy Cricket Team Generation AI. Your sole purpose is to function as a powerful and precise engine. You will receive a single JSON payload containing a user's request for fantasy cricket teams. Your task is to analyze this payload, adhere strictly to the chosen strategy and constraints, generate the requested teams, and then present your final output in a specific, human-readable Markdown table format.
Core Mission:
Parse Input: Receive and fully comprehend the incoming JSON request.
Input should have details of the match
Players, Role, Team, Dream Team %, Select by %
Head to head records
Pitch conditions
Input should have details of the teams the user wants to create
Apply Strategy: Execute the logic for the specific strategy_id provided in the request.
Enforce Rules: Ensure every team generated is valid according to the universal fantasy cricket rules.
Format Output: Present the generated teams using the required two-part Markdown table structure. You must not respond with JSON.
Universal Fantasy Cricket Rules (MUST be applied to EVERY team):
11 Players: Each team must have exactly 11 players.
Credit Limit: The total credit value of the 11 players must not exceed 100.
Team Combination: You must adhere to the standard fantasy cricket team composition rules:
Wicket-Keepers (WK): 0-10
Batsmen (BAT): 0-10
All-Rounders (AR): 0-10
Bowlers (BOWL): 0-10
Max Players from One Team: A maximum of 10 players can be selected from a single real-world team.
Diversity: In a multi-team response, no two teams can be identical combinations of 11 players.
Strategy Implementation Guide:
You must interpret the strategy_details object based on the strategy_id. Here is your guide:
(The 8 strategy implementation guides from the previous prompt remain unchanged here. They instruct the AI on how to think about creating the teams.)
If strategy_id is AI_CONVERSATIONAL: Analyze the match_storyline, predicted_winner, and key_players...
If strategy_id is SAME_XI_DIFF_C_VC: This is a strict, non-negotiable instruction. Use the exact player_xi and only vary the C/VC...
If strategy_id is SCORE_PREDICTION: Focus on the team_1_prediction and team_2_prediction objects...
If strategy_id is CORE_HEDGE: Use the player_groups. The core players are the foundation...
If strategy_id is STATS_GUARDRAILS: This is a purely data-driven task. Filter the player pool based on player_filters...
If strategy_id is PRESET_SCENARIO: Access your internal knowledge about the given preset_id...
If strategy_id is ROLE_SPLIT: This is a strict composition rule. Every team MUST have the exact roles specified...
If strategy_id is BASE_TEAM_EDIT: Start every team generation process with the user's base_team...
Required Output Format:
Your final response MUST NOT be JSON. It must be a single, well-formatted text response using Markdown tables. The response must be structured into the two parts below, exactly as described.
Part 1: Master Player Roster
This section must be a single Markdown table that provides a consolidated view of all unique players selected across all the teams you generated.
Columns: The first three columns must be Player Name, Role, and Team. Subsequent columns must represent each generated team (e.g., Team 1 (C/VC), Team 2 (C/VC), etc.).
Cell Values: In the team columns, use the following indicators:
'C' for the team's Captain.
'VC' for the team's Vice-Captain.
'Yes' for any other player selected in the team.
'No' if the player is not in that team's lineup.
Part 2: Individual Team Breakdowns
This section must provide a detailed breakdown for each individual team you generated.
Structure: For each team, create a level-3 subheading (e.g., ### Team 1).
Reasoning: Immediately under the subheading, provide a brief, one-sentence Reasoning: that explains the strategic thought behind that specific team's composition.
Team Table: Following the reasoning, create a Markdown table for that team with three columns: Player Name, Role, and Team. List all 11 players.
Captain/Vice-Captain: Clearly mark the Captain and Vice-Captain within the Player Name column using (C) and (VC) suffixes (e.g., 'Suryakumar Yadav (C)').


Also UX feedback:
Having 8 options at the outset it overwhelming!
Shall we try:
How many teams do you want to create?
How do you want to create these?
Based on a broad story line
AI Chatbot
Score Prediction
Stats Guardrails
Preset Scenarios
Considering all my detailed inputs
Same XI, Different C & VC
Core Hedge
Base team + Edits
Adds 1 click but reduces complexity of choice i feel!

Example of the Correct Final Output Format:
Certainly. Here are the 3 teams generated based on your request.

---

## **Sheet 1: Master Player Roster**

| Player Name         | Role | Team | Team 1 (C/VC) | Team 2 (C/VC) | Team 3 (C/VC) |
| :------------------ | :--- | :--- | :-----------: | :-----------: | :-----------: |
| **Suryakumar Yadav**| BAT  | MI   |       C       |      Yes      |      VC       |
| **Hardik Pandya** | AR   | MI   |      VC       |       C       |      Yes      |
| **Ishan Kishan** | WK   | MI   |      Yes      |      Yes      |      Yes      |
| **Ravindra Jadeja** | AR   | CSK  |      Yes      |      VC       |       C       |
| **Ruturaj Gaikwad** | BAT  | CSK  |      Yes      |      Yes      |      Yes      |
| ... (and so on for all other selected players) ... | ...  | ...  | ...           | ...           | ...           |

---

## **Sheet 2: Individual Team Breakdowns**

### **Team 1**
Reasoning: This team is built around the core MI duo as C/VC, expecting them to deliver a strong all-round performance.

| Player Name         | Role | Team |
| :------------------ | :--- | :--- |
| **Suryakumar Yadav (C)** | BAT  | MI   |
| **Hardik Pandya (VC)** | AR   | MI   |
| Ishan Kishan        | WK   | MI   |
| Ruturaj Gaikwad     | BAT  | CSK  |
| ... (7 more players) ... | ...  | ...  |

### **Team 2**
Reasoning: This variation shifts the captaincy to Pandya and hedges with Jadeja as VC, balancing the risk between the two top all-rounders.

| Player Name         | Role | Team |
| :------------------ | :--- | :--- |
| **Hardik Pandya (C)** | AR   | MI   |
| **Ravindra Jadeja (VC)** | AR   | CSK  |
| ... (9 more players) ... | ...  | ...  |

### **Team 3**
Reasoning: A CSK-focused team that backs Jadeja for a man-of-the-match performance, with Yadav as a safe VC option.

| Player Name         | Role | Team |
| :------------------ | :--- | :--- |
| **Ravindra Jadeja (C)** | AR   | CSK  |
| **Suryakumar Yadav (VC)** | BAT  | MI   |
| ... (9 more players) ... | ...  | ...  |
(edited)
3:02
Comprehensive Input Payload Structure: The input will be a single JSON object with two main keys: match_context and generation_request.

{
  // Part 1: All the objective data about the match, players, and conditions.
  "match_context": {
    "match_info": {
      "match_id": "TEAM1vTEAM2_YYYYMMDD",
      "match_description": "String describing the match (e.g., 'IPL 2025 Final')",
      "venue": "Stadium Name, City",
      "team_1": { "id": "TEAM1_ID", "name": "Team 1 Name" },
      "team_2": { "id": "TEAM2_ID", "name": "Team 2 Name" }
    },
    "player_pool": [
      {
        "player_id": "string_unique_id",
        "player_name": "Player Name",
        "team_id": "TEAM1_ID",
        "role": "WK / BAT / AR / BOWL",
        "credits": 9.5,
        "stats": {
          "dream_team_percentage": 65.5,
          "selection_by_percentage": 88.2
        }
      }
    ],
    "venue_details": {
      "pitch_report": "A detailed text description of the pitch conditions, how it behaves, and who it might favor.",
      "avg_first_innings_score": 185,
      "head_to_head_records": {
        "summary": "Text summary of recent matches between the two teams.",
        "top_performers_h2h": [
          { "player_id": "string_unique_id", "stat_line": "Brief description of their performance in H2H matches." }
        ]
      }
    }
  },

  // Part 2: The user's specific request for team creation.
  "generation_request": {
    "num_teams_to_generate": 5,
    "strategy_id": "AI_CONVERSATIONAL", // or any of the 8 strategies
    "strategy_details": {
      // This object's structure changes based on the strategy_id
    }
  }
}


Nikhil Lalvani
  3:09 AM
Some example payloads
{
  "schema_version": "1.0",
  "meta": {
    "request_id": "8eaa9714-2af1-4ce8-9d3e-6e77e0d3b8d1",
    "timestamp_utc": "2025-07-22T09:30:00Z",
    "match_id": "IND-SA-T20-2025-08-15",
    "num_teams": 10,
    "output_style": "ranked-list",
    "validate_dream11_rules": true
  },
  "context": {
    "match_conditions": {
      "venue": "Wankhede Stadium, Mumbai",
      "pitch_type": "flat",
      "weather": "clear",
      "innings_order": ["IND", "SA"]
    },
    "player_pool": [
      {"id":"PLY_IND_01","name":"Virat Kohli","team":"IND","role":"BAT","credits":10.0,"avg_points":62.1,"dream_team_pct":64,"recent_form":[74,55,39,81,61]},
      {"id":"PLY_IND_02","name":"Rohit Sharma","team":"IND","role":"BAT","credits":9.5,"avg_points":57.3,"dream_team_pct":59,"recent_form":[14,110,42,7,89]},
      {"id":"PLY_IND_03","name":"Suryakumar Yadav","team":"IND","role":"BAT","credits":9.0,"avg_points":56.4,"dream_team_pct":51,"recent_form":[2,37,83,64,19]},
      {"id":"PLY_IND_04","name":"KL Rahul","team":"IND","role":"WK","credits":9.0,"avg_points":48.0,"dream_team_pct":46,"recent_form":[20,33,27,71,41]},
      {"id":"PLY_IND_05","name":"Hardik Pandya","team":"IND","role":"AR","credits":9.5,"avg_points":61.7,"dream_team_pct":54,"recent_form":[62,38,45,59,78]},
      {"id":"PLY_IND_06","name":"Ravindra Jadeja","team":"IND","role":"AR","credits":9.0,"avg_points":52.9,"dream_team_pct":48,"recent_form":[46,30,57,49,32]},
      {"id":"PLY_IND_07","name":"Jasprit Bumrah","team":"IND","role":"BOWL","credits":9.0,"avg_points":60.2,"dream_team_pct":66,"recent_form":[29,101,42,56,73]},
      {"id":"PLY_IND_08","name":"Yuzvendra Chahal","team":"IND","role":"BOWL","credits":8.5,"avg_points":47.5,"dream_team_pct":43,"recent_form":[33,64,12,51,37]},
      {"id":"PLY_SA_01","name":"Quinton de Kock","team":"SA","role":"WK","credits":9.0,"avg_points":58.6,"dream_team_pct":57,"recent_form":[82,15,61,48,64]},
      {"id":"PLY_SA_02","name":"Aiden Markram","team":"SA","role":"BAT","credits":9.0,"avg_points":49.9,"dream_team_pct":40,"recent_form":[29,42,51,11,69]},
      {"id":"PLY_SA_03","name":"David Miller","team":"SA","role":"BAT","credits":8.5,"avg_points":45.3,"dream_team_pct":33,"recent_form":[18,75,24,36,52]},
      {"id":"PLY_SA_05","name":"Marco Jansen","team":"SA","role":"AR","credits":8.5,"avg_points":49.7,"dream_team_pct":46,"recent_form":[22,61,44,39,72]},
      {"id":"PLY_SA_06","name":"Kagiso Rabada","team":"SA","role":"BOWL","credits":9.0,"avg_points":57.7,"dream_team_pct":60,"recent_form":[31,71,45,67,53]},
      {"id":"PLY_SA_07","name":"Anrich Nortje","team":"SA","role":"BOWL","credits":8.5,"avg_points":46.8,"dream_team_pct":39,"recent_form":[28,60,41,34,50]}
    ]
  },
  "global_constraints": {
    "max_players_per_real_team": 10,
    "credit_cap": 100,
    "role_min_max": { "WK": [0, 10], "BAT": [0, 10], "AR": [0, 10], "BOWL": [0, 10] }
  },
  "strategy": {
    "type": "AI_CHAT",
    "parameters": {
      "conversation_summary": "User expects power-play fireworks, wants aggressive batting focus with two death-over strike bowlers; risk appetite medium-high; prefers Kohli or de Kock as primary captain options."
    }
  }
}
3:09
{
  "schema_version": "1.0",
  "meta": {
    "request_id": "70a0f583-06c8-4d2a-b3ff-a952fbba2f23",
    "timestamp_utc": "2025-07-22T09:32:00Z",
    "match_id": "AUS-ENG-ODI-2025-09-10",
    "num_teams": 6,
    "output_style": "table",
    "validate_dream11_rules": true
  },
  "context": {
    "match_conditions": {
      "venue": "Lord's, London",
      "pitch_type": "true",
      "weather": "overcast",
      "innings_order": ["ENG", "AUS"]
    },
    "player_pool": [
      {"id":"PLY_AUS_01","name":"David Warner","team":"AUS","role":"BAT","credits":9.5,"avg_points":61.0,"dream_team_pct":66,"recent_form":[77,12,103,51,43]},
      {"id":"PLY_AUS_02","name":"Travis Head","team":"AUS","role":"BAT","credits":9.0,"avg_points":57.2,"dream_team_pct":58,"recent_form":[89,44,29,60,70]},
      {"id":"PLY_AUS_03","name":"Steve Smith","team":"AUS","role":"BAT","credits":9.5,"avg_points":54.1,"dream_team_pct":55,"recent_form":[41,57,39,72,46]},
      {"id":"PLY_AUS_05","name":"Glenn Maxwell","team":"AUS","role":"AR","credits":9.5,"avg_points":63.4,"dream_team_pct":70,"recent_form":[102,41,58,75,88]},
      {"id":"PLY_AUS_06","name":"Alex Carey","team":"AUS","role":"WK","credits":8.5,"avg_points":44.9,"dream_team_pct":38,"recent_form":[29,36,48,23,51]},
      {"id":"PLY_AUS_07","name":"Pat Cummins","team":"AUS","role":"BOWL","credits":9.0,"avg_points":56.7,"dream_team_pct":62,"recent_form":[38,74,43,61,58]},
      {"id":"PLY_ENG_01","name":"Jos Buttler","team":"ENG","role":"WK","credits":10.0,"avg_points":68.2,"dream_team_pct":72,"recent_form":[90,47,83,66,52]},
      {"id":"PLY_ENG_02","name":"Jonny Bairstow","team":"ENG","role":"BAT","credits":9.0,"avg_points":55.5,"dream_team_pct":57,"recent_form":[32,78,65,22,59]},
      {"id":"PLY_ENG_03","name":"Joe Root","team":"ENG","role":"BAT","credits":9.5,"avg_points":60.3,"dream_team_pct":63,"recent_form":[71,60,54,49,67]},
      {"id":"PLY_ENG_04","name":"Ben Stokes","team":"ENG","role":"AR","credits":9.5,"avg_points":66.1,"dream_team_pct":69,"recent_form":[85,48,97,56,75]},
      {"id":"PLY_ENG_05","name":"Mark Wood","team":"ENG","role":"BOWL","credits":8.5,"avg_points":50.6,"dream_team_pct":48,"recent_form":[28,63,45,52,41]}
    ]
  },
  "global_constraints": {
    "max_players_per_real_team": 10,
    "credit_cap": 100,
    "role_min_max": { "WK": [0, 10], "BAT": [0, 10], "AR": [0, 10], "BOWL": [0, 10] }
  },
  "strategy": {
    "type": "SAME_XI_DIFF_CAPT",
    "parameters": {
      "fixed_xi": ["PLY_ENG_01","PLY_ENG_02","PLY_ENG_03","PLY_ENG_04","PLY_ENG_05", "PLY_AUS_01","PLY_AUS_02","PLY_AUS_03","PLY_AUS_05","PLY_AUS_06","PLY_AUS_07"],
      "captain_mix": { "PLY_ENG_01": 40, "PLY_AUS_05": 35, "PLY_AUS_01": 25 },
      "vice_captain_mix": { "PLY_ENG_04": 50, "PLY_AUS_02": 50 }
    }
  }
}
3:11
{
  "schema_version": "1.0",
  "meta": {
    "request_id": "d9fa5286-cb8b-4784-a6df-320d88fe3464",
    "timestamp_utc": "2025-07-22T09:34:00Z",
    "match_id": "PAK-NZ-T20-2025-08-20",
    "num_teams": 12,
    "output_style": "raw-json",
    "validate_dream11_rules": true
  },
  "context": {
    "match_conditions": {
      "venue": "Eden Park, Auckland",
      "pitch_type": "drop-in",
      "weather": "breezy",
      "innings_order": ["NZ", "PAK"]
    },
    "player_pool": [
      {"id":"PLY_PAK_01","name":"Babar Azam","team":"PAK","role":"BAT","credits":9.5,"avg_points":64.2,"dream_team_pct":68,"recent_form":[91,33,74,56,81]},
      {"id":"PLY_PAK_02","name":"Mohammad Rizwan","team":"PAK","role":"WK","credits":9.5,"avg_points":61.8,"dream_team_pct":65,"recent_form":[67,52,83,44,59]},
      {"id":"PLY_PAK_03","name":"Fakhar Zaman","team":"PAK","role":"BAT","credits":8.5,"avg_points":50.2,"dream_team_pct":46,"recent_form":[19,45,72,38,55]},
      {"id":"PLY_PAK_04","name":"Iftikhar Ahmed","team":"PAK","role":"AR","credits":8.5,"avg_points":48.6,"dream_team_pct":43,"recent_form":[29,64,40,37,46]},
      {"id":"PLY_PAK_05","name":"Shadab Khan","team":"PAK","role":"AR","credits":9.0,"avg_points":55.7,"dream_team_pct":60,"recent_form":[61,42,53,57,65]},
      {"id":"PLY_PAK_06","name":"Shaheen Afridi","team":"PAK","role":"BOWL","credits":9.0,"avg_points":63.9,"dream_team_pct":71,"recent_form":[38,74,65,92,56]},
      {"id":"PLY_PAK_07","name":"Haris Rauf","team":"PAK","role":"BOWL","credits":8.5,"avg_points":52.5,"dream_team_pct":49,"recent_form":[35,61,27,57,55]},
      {"id":"PLY_NZ_01","name":"Devon Conway","team":"NZ","role":"WK","credits":9.0,"avg_points":60.1,"dream_team_pct":62,"recent_form":[76,41,66,60,57]},
      {"id":"PLY_NZ_02","name":"Kane Williamson","team":"NZ","role":"BAT","credits":9.5,"avg_points":58.7,"dream_team_pct":59,"recent_form":[51,66,49,70,55]},
      {"id":"PLY_NZ_03","name":"Glenn Phillips","team":"NZ","role":"BAT","credits":8.5,"avg_points":52.8,"dream_team_pct":47,"recent_form":[33,70,48,61,52]},
      {"id":"PLY_NZ_04","name":"Mitchell Santner","team":"NZ","role":"AR","credits":8.5,"avg_points":50.4,"dream_team_pct":48,"recent_form":[28,58,46,54,42]},
      {"id":"PLY_NZ_05","name":"Tim Southee","team":"NZ","role":"BOWL","credits":8.5,"avg_points":54.6,"dream_team_pct":52,"recent_form":[46,69,37,61,60]},
      {"id":"PLY_NZ_06","name":"Trent Boult","team":"NZ","role":"BOWL","credits":9.0,"avg_points":62.3,"dream_team_pct":67,"recent_form":[71,45,73,69,52]},
      {"id":"PLY_NZ_07","name":"Lockie Ferguson","team":"NZ","role":"BOWL","credits":8.0,"avg_points":49.8,"dream_team_pct":44,"recent_form":[24,66,38,41,60]}
    ]
  },
  "global_constraints": {
    "max_players_per_real_team": 1,
    "credit_cap": 100,
    "role_min_max": { "WK": [0, 10], "BAT": [0, 10], "AR": [0, 10], "BOWL": [0, 10] }
  },
  "strategy": {
    "type": "CORE_HEDGE",
    "parameters": {
      "captain_pool": ["PLY_PAK_01","PLY_NZ_02","PLY_PAK_06"],
      "vice_captain_pool": ["PLY_NZ_01","PLY_PAK_05","PLY_NZ_06"],
      "core_players": ["PLY_PAK_01","PLY_PAK_02","PLY_NZ_02","PLY_PAK_05","PLY_NZ_06","PLY_PAK_06"],
      "hedge_players": ["PLY_NZ_01","PLY_NZ_03","PLY_PAK_03","PLY_NZ_04"],
      "differentials": ["PLY_PAK_04","PLY_NZ_07","PLY_PAK_07"],
      "distribution": { "core_only_safe": 15, "core_plus_hedge": 50, "core_plus_diff": 35 }
    }
  }
}
3:11
{
  "schema_version": "1.0",
  "meta": {
    "request_id": "3f2c2bae-d181-41ab-9ad0-6f3d106eb7e0",
    "timestamp_utc": "2025-07-22T09:36:00Z",
    "match_id": "WI-SL-T20-2025-08-25",
    "num_teams": 8,
    "output_style": "ranked-list",
    "validate_dream11_rules": true
  },
  "context": {
    "match_conditions": {
      "venue": "Port of Spain, Trinidad",
      "pitch_type": "slow",
      "weather": "humid",
      "innings_order": ["SL", "WI"]
    },
    "player_pool": [
      {"id":"PLY_WI_01","name":"Nicholas Pooran","team":"WI","role":"WK","credits":9.0,"avg_points":59.1,"dream_team_pct":60,"recent_form":[80,41,65,52,57]},
      {"id":"PLY_WI_02","name":"Brandon King","team":"WI","role":"BAT_TOP","credits":8.5,"avg_points":50.3,"dream_team_pct":46,"recent_form":[33,70,28,60,40]},
      {"id":"PLY_WI_03","name":"Rovman Powell","team":"WI","role":"BAT_MID","credits":8.5,"avg_points":47.4,"dream_team_pct":42,"recent_form":[22,64,41,36,55]},
      {"id":"PLY_WI_04","name":"Andre Russell","team":"WI","role":"AR","credits":9.5,"avg_points":68.7,"dream_team_pct":72,"recent_form":[98,53,63,86,83]},
      {"id":"PLY_WI_05","name":"Akeal Hosein","team":"WI","role":"SPIN","credits":8.5,"avg_points":53.5,"dream_team_pct":49,"recent_form":[44,61,46,55,61]},
      {"id":"PLY_WI_06","name":"Alzarri Joseph","team":"WI","role":"PACE","credits":8.5,"avg_points":52.9,"dream_team_pct":48,"recent_form":[46,65,39,54,60]},
      {"id":"PLY_SL_01","name":"Kusal Mendis","team":"SL","role":"WK","credits":9.0,"avg_points":56.2,"dream_team_pct":58,"recent_form":[61,48,57,66,49]},
      {"id":"PLY_SL_02","name":"Pathum Nissanka","team":"SL","role":"BAT_TOP","credits":8.5,"avg_points":49.9,"dream_team_pct":45,"recent_form":[29,71,38,52,59]},
      {"id":"PLY_SL_03","name":"Charith Asalanka","team":"SL","role":"BAT_MID","credits":8.5,"avg_points":48.1,"dream_team_pct":44,"recent_form":[26,68,40,47,49]},
      {"id":"PLY_SL_04","name":"Wanindu Hasaranga","team":"SL","role":"SPIN","credits":9.5,"avg_points":66.8,"dream_team_pct":70,"recent_form":[90,51,72,68,63]},
      {"id":"PLY_SL_05","name":"Matheesha Pathirana","team":"SL","role":"PACE","credits":8.0,"avg_points":45.7,"dream_team_pct":40,"recent_form":[35,58,23,48,55]},
      {"id":"PLY_SL_06","name":"Maheesh Theekshana","team":"SL","role":"SPIN","credits":8.5,"avg_points":52.3,"dream_team_pct":49,"recent_form":[42,63,50,46,60]}
    ]
  },
  "global_constraints": {
    "max_players_per_real_team": 10,
    "credit_cap": 100,
    "role_min_max": { "WK": [0, 10], "BAT": [0, 10], "AR": [0, 10], "BOWL": [0, 10] }
  },
  "strategy": {
    "type": "ROLE_SPLIT",
    "parameters": {
      "exact_roles": { "WK": 1, "BAT_TOP": 2, "BAT_MID": 2, "AR": 1, "SPIN": 2, "PACE": 3 },
      "diversity_level": "high",
      "prioritize_form": true,
      "balance_credits": true
    }
  }
}