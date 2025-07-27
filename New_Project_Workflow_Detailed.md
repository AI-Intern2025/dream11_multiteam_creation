
# New Project Workflow: Multi-Team Fantasy Cricket Generator

## Table of Contents
1. [Project Overview](#project-overview)
2. [Updated Overall Workflow](#updated-overall-workflow)
3. [Detailed Strategy Workflows](#detailed-strategy-workflows)
    - [AI-Guided Conversational Assistant (Strategy 1)](#ai-guided-conversational-assistant-strategy-1)
    - [Same XI, Different Captains (Strategy 2)](#same-xi-different-captains-strategy-2)
    - [Score & Storyline Prediction (Strategy 3)](#score-storyline-prediction-strategy-3)
    - [Core, Hedge, Differential (Strategy 4)](#core-hedge-differential-strategy-4)
    - [Stats-Driven Guardrails (Strategy 5)](#stats-driven-guardrails-strategy-5)
    - [Preset Scenarios (Strategy 6)](#preset-scenarios-strategy-6)
    - [Role-Split Lineups (Strategy 7)](#role-split-lineups-strategy-7)
    - [Base Team + Rule-Based Edits (Strategy 8)](#base-team-rule-based-edits-strategy-8)
4. [New Functionalities and Features](#new-functionalities-and-features)

---

## Project Overview

The **Dream11 Multi-Team Creator** allows users to generate multiple optimized fantasy cricket teams. The tool utilizes AI-driven recommendations based on a variety of strategies and user preferences to create teams while adhering to the constraints of Dream11's fantasy rules. The new updates aim to simplify the user flow, provide more control over team generation, and add flexibility in captain/vice-captain assignment. These updates will give users the ability to create optimized teams without having to...

With recent suggestions from mentors, several updates have been made to improve the workflow, enhance the UX, and refine the strategy logic for team generation. These updates provide more control, customization, and flexibility for the users.

### Key Updates:
- Simplified user flow to reduce overwhelming choices
- Added **OCR image recognition** for team selection via screenshots
- Enhanced feedback loop for post-creation review
- Detailed player, team, and role breakdowns to match Dream11 standards
- Integration of **Custom GPT model** for improved AI-driven team generation

---

## Updated Overall Workflow

### **1. User Login and Match Selection**
- **Login**: Users log into the system and browse upcoming cricket matches.
- **Match Selection**: Users select a match (e.g., India vs Australia) for which they want to create fantasy teams.

### **2. Team Generation Setup**
- **How Many Teams?**: Users are asked how many teams they want to create.
  
- **How to Create Teams?**: Users select how they want the system to generate teams from a simplified set of options:
  1. **AI Chatbot**: Engage with an AI assistant for personalized recommendations.
  2. **Score Prediction**: Generate teams based on predicted scores for each team.
  3. **Stats Guardrails**: Apply statistical filters (e.g., Dream Team %, selection %, etc.) for team generation.
  4. **Preset Scenarios**: Select from predefined scenarios (e.g., high-scoring, death-over specialists).
  5. **Same XI, Different Captains**: Keep the same 11 players and rotate captain/vice-captain choices.
  6. **Core, Hedge, Differential**: Select core players and apply hedge and differential player combinations.
  7. **Base Team + Rule-Based Edits**: Start with a base team and apply rule-based player swaps.

### **3. Team Generation and AI Processing**
- **AI Processing**: The system processes the inputs using AI and generates multiple teams (up to 100). Each team is then validated to ensure it complies with Dream11’s fantasy rules (total credits ≤ 100, 11 players per team, etc.).
- **Post-Generation Review**: Users can verify the generated teams, make adjustments, and validate the team’s alignment with their inputs.

### **4. Export and Final Adjustments**
- Once users are satisfied with the generated teams, they can export the results for use on Dream11 or modify details like captain/vice-captain assignments.
- **Bulk Swap Option**: A feature allowing users to bulk swap players across teams, ensuring convenience during final tweaks.

---

## Detailed Strategy Workflows

### **1. AI-Guided Conversational Assistant (Strategy 1)**

**User Interaction**:
- Users start a conversation with an AI assistant that asks a series of questions, such as:
  1. "What is your predicted match outcome?" 
  2. "Which key players do you want to focus on?" 
  3. "What is your risk appetite for this match?"
- The AI captures these insights and processes them to guide the team generation.

**AI Processing**:
- The AI uses the conversation history and insights to understand the user’s preferences and generate teams accordingly.
- Example workflow: 
  - **User Input**: "India will win, high-scoring match, focus on top-order batsmen."
  - **AI Response**: Based on this input, the AI generates teams with a focus on Indian top-order batsmen and adjusts other players to balance the risk and predicted score.

**New Changes**:
- **Shorter Questions**: Questions are simplified to avoid overwhelming the user with details.
- **Handling Conflicting Inputs**: The AI handles conflicting inputs intelligently. For example, if the user selects "Top-order focus" and "Team A collapses early", the AI would interpret the situation and prioritize players accordingly.
- **Match Insights**: Match insights (pitch/weather, past form, etc.) will be shown alongside team generation results.

---

### **2. Same XI, Different Captains (Strategy 2)**

**User Interaction**:
- Users select exactly 11 players they want to keep in every team.
- They define how captain/vice-captain roles should be distributed, e.g., "Babar Azam as captain in 40% of teams, Rizwan in 30%, and Shaheen in 20%."

**AI Processing**:
- The system generates multiple teams, keeping the player selection constant but rotating the captain and vice-captain combinations as defined by the user.
- **Captain Distribution**: The system uses **permutation combinations** to ensure that no two teams have the same captain/vice-captain combination.

**New Changes**:
- **OCR Image Recognition**: Users can upload screenshots of their teams, and the system will automatically detect and fill the selected XI.
- **More Teams**: Users can now generate up to **100 teams** for larger-scale contests.
- **Random Captain and VC Distribution**: The system will ensure no two teams have the same captain and vice-captain using a random distribution based on permutation formulas. This will eliminate any repetitions and ensure more varied team compositions.
- **Context Persistence**: Once players are selected, the system retains the context for core, hedge, and differential players across all generated teams, offering greater confidence to users about the team choices.

**Example**: If a user selects 10 teams, the system will ensure that for each team, the captain and vice-captain combinations are unique. For instance, if the captain of Team 1 is Babar Azam, the vice-captain could be Rizwan; for Team 2, the captain might be Rizwan, and the vice-captain might be Shaheen. The permutation formula ensures these combinations are unique.

---

### **3. Score & Storyline Prediction (Strategy 3)**

**User Interaction**:
- Users predict match outcomes (e.g., "India 120-160 runs, Pakistan 100-150 runs") using **range inputs** rather than exact scores.
- The system analyzes the match context (weather, pitch, venue) and generates teams based on the predicted match scenario.

**AI Processing**:
- The system generates teams by applying AI analysis of predicted match outcomes. 
  - **Example Workflow**: 
    - **User Input**: "India 120-160 runs, Pakistan 100-150 runs."
    - **AI Response**: Teams are generated with a heavier focus on Indian batsmen and Pakistani bowlers, considering the expected match flow.

**New Changes**:
- **Range Inputs**: Users select ranges instead of exact scores (e.g., "120-160 runs", "Under 120 runs").
- **Match Insights**: Insights such as pitch/weather and past form will be displayed on the same page as the user’s prediction to help guide team generation.
- **Team Breakdown**: Role distributions (BAT, AR, WK, BWL) will be clearly marked for each team generated.

**Example**: For a match where India is expected to score 120-160 runs, the system will generate teams that have a higher focus on Indian batsmen and Pakistani bowlers, considering the expected match flow.

---

### **4. Core, Hedge, Differential (Strategy 4)**

**User Interaction**:
- Users select players to be categorized as **core**, **hedge**, or **differential**.
  - **Core players** are the foundation of the team.
  - **Hedge players** are mixed in for balance.
  - **Differential players** are high-risk, high-reward players added for variety.
  
**AI Processing**:
- The system generates teams based on these selections, ensuring that core players are included in most teams, while hedge and differential players are added to create diversity.
  
**New Changes**:
- **Context Persistence**: The system remembers the selected core, hedge, and differential players after team generation, reassuring users that their preferences have been respected.
- **Captain/VC Distribution**: The system now provides a breakdown of how many times each player appears as captain/vice-captain across teams, offering more insights.

**Example**:
- **User Input**: "Core: Virat Kohli, Rohit Sharma, KL Rahul; Hedge: Shikhar Dhawan, Ravindra Jadeja; Differential: Rishabh Pant."
- The system generates teams with a high concentration of core players and less frequent use of hedge and differential players. The system also ensures a distribution of captain and vice-captain roles according to the user’s preferences.

---

### **5. Stats-Driven Guardrails (Strategy 5)**

**User Interaction**:
- Users define **guardrails** (e.g., selection %, Dream Team %, etc.) for player selection.
- These filters are applied either at the **player level** or **team level** to generate teams that meet the defined criteria.

**AI Processing**:
- Teams are generated with strict adherence to the user-defined filters, ensuring the selection of players within the defined statistical ranges.

**New Changes**:
- **Min/Max Ranges**: Users can now define both minimum and maximum values for stats, giving them more control.
- **Player/Team Level Stats**: Users can choose whether to apply filters at the player level (individual stats) or team level (average stats for all players).

**Example**:
- **User Input**: "Selection % between 30%-70%, Dream Team % between 40%-60%."
- The system generates teams where each player’s selection and Dream Team percentages fall within these ranges.

---

### **6. Preset Scenarios (Strategy 6)**

**User Interaction**:
- Users select from predefined **scenarios** (e.g., “High Scoring Match” or “All-Rounder Heavy”) that define the team’s strategic approach.

**AI Processing**:
- Teams are created according to the selected scenario, ensuring the user’s preferences are applied consistently across multiple teams.

**New Changes**:
- **User Verification**: After teams are generated, users can verify and adjust them based on the selected scenario.
- The system ensures that the teams meet the scenario’s constraints (e.g., "Team A must have 5+ batsmen").

**Example**: If the user selects "All-Rounder Heavy", the system will generate teams with more all-rounders, ensuring at least 4 all-rounders in each team.

---

### **7. Role-Split Lineups (Strategy 7)**

**User Interaction**:
- Users configure exact **role splits** (e.g., 3 top-order batsmen, 2 spinners).
- The system then generates teams adhering strictly to these splits.

**AI Processing**:
- Teams are generated with the exact role composition as defined by the user.
- The system ensures a **high diversity score** across teams to prevent repetition.

**New Changes**:
- **Pivot-based Output**: Results are shown in a pivot-style format, displaying how players are distributed across roles in each team.

**Example**:
- **User Input**: "3 top-order batsmen, 2 spinners, 3 pacers."
- The system generates teams with exactly this configuration while ensuring the teams differ enough to maintain diversity.

---

### **8. Base Team + Rule-Based Edits (Strategy 8)**

**User Interaction**:
- Users select a **base team** and apply rule-based **edits** (e.g., swapping 1-2 players or making edits based on risk tolerance).

**AI Processing**:
- The system generates multiple variations of the base team, making swaps as per the user-defined rules (minor, moderate, or major edits).

**New Changes**:
- **Guardrails for Each Role**: Users can define max limits for player roles (e.g., max 3 bowlers), and the system will show selected players for each role behind a click.

**Example**:
- **User Input**: "Start with base team, perform minor edits, and swap 2 players."
- The system generates multiple variations of the base team, adjusting players based on user preferences and role constraints.

---

## New Functionalities and Features

- **Custom GPT Integration**: A custom GPT model interprets user input and generates teams in a human-readable Markdown format, ensuring that all Dream11 constraints are respected.

- **Post-Creation Feedback Loop**: After generating teams, users can review and adjust them as needed. This ensures that all user preferences are respected, and no mistakes were made during the generation process.

- **Team Verification**: Users can verify that the generated teams meet their constraints and make adjustments such as swapping captains or making bulk changes across teams.

---

This document provides a detailed explanation of each strategy and the workflow changes, including improvements in the AI generation process, user customization, and the integration of new features like OCR image recognition and random captain/vice-captain distribution. Let me know if you need any further revisions or additional details!

