import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Users, Shield, Swords, BarChart2, Sparkles } from 'lucide-react';

// --- MOCK DATA ---
const mockTeamData = {
  'gsw': {
    id: 'gsw', name: 'Golden State Warriors', conference: 'Western', price: 185.34, change: 2.55, changePercent: 1.40, marketCap: "25.B", volume: "1.2M",
    performanceHistory: [ { name: 'Jan', value: 165 }, { name: 'Feb', value: 170 }, { name: 'Mar', value: 175 }, { name: 'Apr', value: 180 }, { name: 'May', value: 182 }, { name: 'Jun', value: 185 } ],
    quantitative: { offensiveRating: 118.2, defensiveRating: 112.5, netRating: 5.7, pace: 101.3, zScoreOffense: 1.8, zScoreDefense: -0.5, rebounds: 43.5, assists: 29.1, turnovers: 14.9 },
    qualitative: { managementStability: 'High', coachingSystem: 'Established', playerMorale: 'Optimistic', marketSentiment: 'Bullish' },
  },
  'lal': {
    id: 'lal', name: 'Los Angeles Lakers', conference: 'Western', price: 172.10, change: -1.20, changePercent: -0.69, marketCap: "22.B", volume: "980K",
    performanceHistory: [ { name: 'Jan', value: 180 }, { name: 'Feb', value: 178 }, { name: 'Mar', value: 175 }, { name: 'Apr', value: 170 }, { name: 'May', value: 173 }, { name: 'Jun', value: 172 } ],
    quantitative: { offensiveRating: 115.6, defensiveRating: 114.8, netRating: 0.8, pace: 102.1, zScoreOffense: 0.9, zScoreDefense: 0.2, rebounds: 45.2, assists: 25.5, turnovers: 13.1 },
    qualitative: { managementStability: 'Medium', coachingSystem: 'New', playerMorale: 'Mixed', marketSentiment: 'Neutral' },
  },
  'bos': {
    id: 'bos', name: 'Boston Celtics', conference: 'Eastern', price: 195.80, change: 3.10, changePercent: 1.61, marketCap: "28.B", volume: "1.5M",
    performanceHistory: [ { name: 'Jan', value: 185 }, { name: 'Feb', value: 188 }, { name: 'Mar', value: 190 }, { name: 'Apr', value: 192 }, { name: 'May', value: 194 }, { name: 'Jun', value: 196 } ],
    quantitative: { offensiveRating: 119.5, defensiveRating: 109.1, netRating: 10.4, pace: 99.8, zScoreOffense: 2.5, zScoreDefense: -2.1, rebounds: 46.1, assists: 27.8, turnovers: 12.5 },
    qualitative: { managementStability: 'Very High', coachingSystem: 'Veteran', playerMorale: 'Excellent', marketSentiment: 'Very Bullish' },
  },
  'bkn': {
      id: 'bkn', name: 'Brooklyn Nets', conference: 'Eastern', price: 145.50, change: -0.75, changePercent: -0.51, marketCap: "18.B", volume: "750K",
      performanceHistory: [ { name: 'Jan', value: 150 }, { name: 'Feb', value: 148 }, { name: 'Mar', value: 147 }, { name: 'Apr', value: 146 }, { name: 'May', value: 145 }, { name: 'Jun', value: 145 } ],
      quantitative: { offensiveRating: 113.1, defensiveRating: 115.2, netRating: -2.1, pace: 98.5, zScoreOffense: -0.2, zScoreDefense: 0.5, rebounds: 40.5, assists: 24.1, turnovers: 14.2 },
      qualitative: { managementStability: 'Low', coachingSystem: 'Developing', playerMorale: 'Uncertain', marketSentiment: 'Bearish' },
  },
  'mil': {
      id: 'mil', name: 'Milwaukee Bucks', conference: 'Eastern', price: 189.90, change: 1.50, changePercent: 0.80, marketCap: "26.B", volume: "1.1M",
      performanceHistory: [ { name: 'Jan', value: 182 }, { name: 'Feb', value: 184 }, { name: 'Mar', value: 186 }, { name: 'Apr', value: 188 }, { name: 'May', value: 190 }, { name: 'Jun', value: 190 } ],
      quantitative: { offensiveRating: 117.8, defensiveRating: 111.9, netRating: 5.9, pace: 100.5, zScoreOffense: 1.7, zScoreDefense: -0.8, rebounds: 47.3, assists: 26.5, turnovers: 13.5 },
      qualitative: { managementStability: 'High', coachingSystem: 'Veteran', playerMorale: 'High', marketSentiment: 'Bullish' },
  }
};


// --- PROBABILITY MODEL ---
const calculateWinProbability = (teamA, teamB, homeTeamId) => {
    if (!teamA || !teamB) return null;
    const HOME_COURT_ADVANTAGE = 2.5;
    let teamAStrength = teamA.quantitative.netRating;
    let teamBStrength = teamB.quantitative.netRating;
    if (teamA.id === homeTeamId) teamAStrength += HOME_COURT_ADVANTAGE;
    else if (teamB.id === homeTeamId) teamBStrength += HOME_COURT_ADVANTAGE;
    const variance = (Math.random() - 0.5) * 2;
    const strengthDifference = (teamAStrength - teamBStrength) + variance;
    const probA = 1 / (1 + Math.exp(-strengthDifference / 5));
    const probB = 1 - probA;
    let insight = `The model favors ${probA > probB ? teamA.name : teamB.name}. `;
    const offRatingDiff = teamA.quantitative.offensiveRating - teamB.quantitative.offensiveRating;
    if (Math.abs(offRatingDiff) > 3) insight += `${offRatingDiff > 0 ? teamA.name : teamB.name}'s significantly higher offensive rating is a key factor. `;
    if (teamA.id === homeTeamId || teamB.id === homeTeamId) insight += `Home court advantage provides a notable edge.`;
    return { [teamA.id]: probA * 100, [teamB.id]: probB * 100, insight };
};

// --- GEMINI API INTEGRATION ---
const generateMatchupAnalysis = async (teamA, teamB, homeTeamId) => {
    const homeTeamName = teamA.id === homeTeamId ? teamA.name : teamB.name;
    const prompt = `Act as an expert sports analyst providing a pre-game briefing for an NBA matchup. Matchup: ${teamA.name} vs. ${teamB.name}. Location: Home game for ${homeTeamName}. Team A Data (${teamA.name}): - Quantitative: ${JSON.stringify(teamA.quantitative)} - Qualitative: ${JSON.stringify(teamA.qualitative)}. Team B Data (${teamB.name}): - Quantitative: ${JSON.stringify(teamB.quantitative)} - Qualitative: ${JSON.stringify(teamB.qualitative)}. Your Task: Write a detailed, narrative-style analysis covering: 1. Overall Matchup Synopsis, 2. Key Strengths & Weaknesses, 3. Strategic X-Factors, 4. Prediction with a final score. Format the response clearly with headings.`;
    try {
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiKey = ""; // Provided by environment
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
        const result = await response.json();
        if (result.candidates?.[0]?.content?.parts?.[0]) return result.candidates[0].content.parts[0].text;
        throw new Error("Unexpected API response structure.");
    } catch (error) {
        console.error("Error generating AI analysis:", error);
        return `An error occurred while generating the analysis: ${error.message}.`;
    }
};

// --- UI COMPONENTS ---
const TeamStockCard = ({ team, onSelect }) => {
  const isPositive = team.change >= 0;
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700/50 transition-all duration-300 border border-gray-700" onClick={() => onSelect(team.id)}>
      <div className="flex justify-between items-start">
        <div><h2 className="text-xl font-bold text-white">{team.name}</h2><p className="text-sm text-gray-400">{team.conference} Conference</p></div>
        <div className={`text-lg font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>${team.price.toFixed(2)}</div>
      </div>
      <div className="h-24 mt-4 -mx-4"><ResponsiveContainer width="100%" height="100%"><LineChart data={team.performanceHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><Line type="monotone" dataKey="value" stroke={isPositive ? '#4ade80' : '#f87171'} strokeWidth={2} dot={false} /><YAxis domain={['dataMin - 5', 'dataMax + 5']} hide={true} /></LineChart></ResponsiveContainer></div>
      <div className="flex justify-between items-center mt-2 text-sm"><div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>{isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}<span>{team.change.toFixed(2)} ({team.changePercent.toFixed(2)}%)</span></div><div className="text-gray-400">Vol: <span className="font-semibold text-gray-300">{team.volume}</span></div></div>
    </div>
  );
};

const TeamDetailView = ({ team, onBack }) => {
    const [activeTab, setActiveTab] = useState('technical');
    const renderContent = () => {
        switch(activeTab) {
            case 'technical': return (<div><h3 className="text-lg font-bold mb-2 text-indigo-400">Performance Chart (6-Month)</h3><div className="h-64 w-full bg-gray-900/50 p-2 rounded-md"><ResponsiveContainer width="100%" height="100%"><LineChart data={team.performanceHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#4A5568" /><XAxis dataKey="name" stroke="#A0AEC0" /><YAxis stroke="#A0AEC0" domain={['dataMin - 10', 'dataMax + 10']}/><Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} /><Legend /><Line type="monotone" dataKey="value" name="Team Performance Index" stroke="#6366F1" strokeWidth={2} activeDot={{ r: 8 }}/></LineChart></ResponsiveContainer></div></div>);
            case 'quantitative':
                const zScoreData = [{ name: 'Offense', zScore: team.quantitative.zScoreOffense, fill: '#8884d8' }, { name: 'Defense', zScore: team.quantitative.zScoreDefense, fill: '#82ca9d' }];
                return (<div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><h3 className="text-lg font-bold mb-2 text-teal-400">Core Analytics</h3><ul className="space-y-2"><li className="flex justify-between p-2 bg-gray-900/50 rounded"><span><Swords className="inline mr-2"/>Offensive Rating:</span> <span className="font-mono">{team.quantitative.offensiveRating}</span></li><li className="flex justify-between p-2 bg-gray-900/50 rounded"><span><Shield className="inline mr-2"/>Defensive Rating:</span> <span className="font-mono">{team.quantitative.defensiveRating}</span></li><li className="flex justify-between p-2 bg-gray-900/50 rounded"><span><TrendingUp className="inline mr-2"/>Net Rating:</span> <span className="font-mono">{team.quantitative.netRating}</span></li><li className="flex justify-between p-2 bg-gray-900/50 rounded"><span>Pace:</span> <span className="font-mono">{team.quantitative.pace}</span></li></ul></div><div><h3 className="text-lg font-bold mb-2 text-teal-400">Z-Score Analysis (vs. League Avg)</h3><div className="h-56 w-full bg-gray-900/50 p-2 rounded-md"><ResponsiveContainer width="100%" height="100%"><BarChart data={zScoreData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#4A5568"/><XAxis type="number" stroke="#A0AEC0" /><YAxis type="category" dataKey="name" stroke="#A0AEC0" width={60}/><Tooltip contentStyle={{ backgroundColor: '#1A202C' }} /><Bar dataKey="zScore" name="Standard Deviations from Mean" barSize={20} /></BarChart></ResponsiveContainer></div></div></div>);
            case 'qualitative': return (<div><h3 className="text-lg font-bold mb-2 text-amber-400">Organizational Factors</h3><div className="space-y-3"><div className="p-3 bg-gray-900/50 rounded"><strong>Management Stability:</strong> <span className="text-gray-300">{team.qualitative.managementStability}</span></div><div className="p-3 bg-gray-900/50 rounded"><strong>Coaching System:</strong> <span className="text-gray-300">{team.qualitative.coachingSystem}</span></div><div className="p-3 bg-gray-900/50 rounded"><strong>Player Morale:</strong> <span className="text-gray-300">{team.qualitative.playerMorale}</span></div><div className="p-3 bg-gray-900/50 rounded"><strong>Market Sentiment:</strong> <span className="text-gray-300">{team.qualitative.marketSentiment}</span></div></div></div>);
            default: return null;
        }
    };
    
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
        <button onClick={onBack} className="mb-4 text-sm text-indigo-400 hover:text-indigo-300">&larr; Back to Market Overview</button>
        <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">{team.name}</h2><div className="text-right"><p className={`text-2xl font-bold ${team.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>${team.price.toFixed(2)}</p><p className={`text-sm ${team.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{team.change.toFixed(2)} ({team.changePercent.toFixed(2)}%)</p></div></div>
        <div className="border-b border-gray-600 mb-4"><nav className="flex space-x-1 md:space-x-4"><button onClick={() => setActiveTab('technical')} className={`py-2 px-1 md:px-2 border-b-2 ${activeTab === 'technical' ? 'border-indigo-400 text-indigo-300' : 'border-transparent text-gray-400 hover:border-gray-500'}`}>Technical</button><button onClick={() => setActiveTab('quantitative')} className={`py-2 px-1 md:px-2 border-b-2 ${activeTab === 'quantitative' ? 'border-teal-400 text-teal-300' : 'border-transparent text-gray-400 hover:border-gray-500'}`}>Quantitative</button><button onClick={() => setActiveTab('qualitative')} className={`py-2 px-1 md:px-2 border-b-2 ${activeTab === 'qualitative' ? 'border-amber-400 text-amber-300' : 'border-transparent text-gray-400 hover:border-gray-500'}`}>Qualitative</button></nav></div>
        {renderContent()}
      </div>
    );
};

const MatchupView = ({ teams, onBack }) => {
    const [teamAId, setTeamAId] = useState(Object.keys(teams)[0]);
    const [teamBId, setTeamBId] = useState(Object.keys(teams)[1]);
    const [homeTeamId, setHomeTeamId] = useState(teamAId);
    const [isGenerating, setIsGenerating] = useState(false);
    const [analysisResult, setAnalysisResult] = useState("");
    const teamA = teams[teamAId], teamB = teams[teamBId];
    const probabilityResult = useMemo(() => calculateWinProbability(teamA, teamB, homeTeamId), [teamA, teamB, homeTeamId]);
    const radarData = [{ subject: 'Offense', A: teamA.quantitative.offensiveRating, B: teamB.quantitative.offensiveRating, fullMark: 125 }, { subject: 'Defense', A: 125 - teamA.quantitative.defensiveRating, B: 125 - teamB.quantitative.defensiveRating, fullMark: 25 }, { subject: 'Pace', A: teamA.quantitative.pace, B: teamB.quantitative.pace, fullMark: 105 }, { subject: 'Rebounds', A: teamA.quantitative.rebounds, B: teamB.quantitative.rebounds, fullMark: 50 }, { subject: 'Assists', A: teamA.quantitative.assists, B: teamB.quantitative.assists, fullMark: 30 }];
    const handleGenerateAnalysis = async () => { setIsGenerating(true); setAnalysisResult(""); const result = await generateMatchupAnalysis(teamA, teamB, homeTeamId); setAnalysisResult(result); setIsGenerating(false); };
    return (
        <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg border border-gray-700">
            <button onClick={onBack} className="mb-4 text-sm text-indigo-400 hover:text-indigo-300">&larr; Back to Market Overview</button>
            <h2 className="text-3xl font-bold text-center mb-6">Matchup Analysis & Probability</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"><select value={teamAId} onChange={e => { setTeamAId(e.target.value); if (homeTeamId === teamAId) setHomeTeamId(e.target.value); setAnalysisResult(''); }} className="bg-gray-900 border border-gray-600 rounded-md p-2 w-full">{Object.values(teams).filter(t => t.id !== teamBId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select><select value={teamBId} onChange={e => { setTeamBId(e.target.value); if (homeTeamId === teamBId) setHomeTeamId(e.target.value); setAnalysisResult(''); }} className="bg-gray-900 border border-gray-600 rounded-md p-2 w-full">{Object.values(teams).filter(t => t.id !== teamAId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-900/50 p-6 rounded-xl"><h3 className="text-xl font-semibold text-center text-indigo-300 mb-4">Win Probability Forecast</h3><div className="flex w-full h-8 bg-gray-700 rounded-full overflow-hidden mb-2"><div className="bg-green-500 flex items-center justify-center font-bold" style={{ width: `${probabilityResult?.[teamA.id]}%` }}>{Math.round(probabilityResult?.[teamA.id])}%</div><div className="bg-blue-500 flex items-center justify-center font-bold" style={{ width: `${probabilityResult?.[teamB.id]}%` }}>{Math.round(probabilityResult?.[teamB.id])}%</div></div><div className="flex justify-between text-sm mb-4"><span className="font-bold text-green-400">{teamA.name}</span><span className="font-bold text-blue-400">{teamB.name}</span></div><div className="text-center mb-4 text-sm text-gray-400">Home Team: <button onClick={() => setHomeTeamId(teamA.id)} className={`mx-2 px-2 py-1 rounded ${homeTeamId === teamA.id ? 'bg-indigo-600' : 'bg-gray-600'}`}>{teamA.name}</button><button onClick={() => setHomeTeamId(teamB.id)} className={`px-2 py-1 rounded ${homeTeamId === teamB.id ? 'bg-indigo-600' : 'bg-gray-600'}`}>{teamB.name}</button></div><p className="text-center text-gray-300 italic p-3 bg-gray-800 rounded-md"><strong>Model Insight:</strong> {probabilityResult?.insight}</p></div>
                <div className="h-96"><h3 className="text-xl font-semibold text-center text-teal-300 mb-4">Head-to-Head Stat Comparison</h3><ResponsiveContainer width="100%" height="100%"><RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}><PolarGrid stroke="#4A5568" /><PolarAngleAxis dataKey="subject" stroke="#A0AEC0" /><PolarRadiusAxis angle={30} domain={[0, 'dataMax + 10']} tick={false} axisLine={false} /><Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} /><Legend /><Radar name={teamA.name} dataKey="A" stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.5} /><Radar name={teamB.name} dataKey="B" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.5} /></RadarChart></ResponsiveContainer></div>
            </div>
            <div className="bg-gray-900/50 p-6 rounded-xl"><h3 className="text-xl font-semibold text-center text-amber-300 mb-4">Pre-Game AI Briefing</h3><div className="text-center mb-6"><button onClick={handleGenerateAnalysis} disabled={isGenerating} className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors mx-auto"><Sparkles size={18} />{isGenerating ? 'Generating Analysis...' : '✨ Generate AI Briefing'}</button></div>{isGenerating && <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-400"></div></div>}{analysisResult && <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap p-4 bg-gray-800 rounded-md">{analysisResult}</div>}</div>
        </div>
    );
};

const App = () => {
  const [view, setView] = useState('market');
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const handleSelectTeam = (id) => { setSelectedTeamId(id); setView('teamDetail'); };
  const handleBackToMarket = () => { setSelectedTeamId(null); setView('market'); };
  const selectedTeam = selectedTeamId ? mockTeamData[selectedTeamId] : null;

  const renderView = () => {
      switch (view) {
          case 'matchup': return <MatchupView teams={mockTeamData} onBack={handleBackToMarket} />;
          case 'teamDetail': return <TeamDetailView team={selectedTeam} onBack={handleBackToMarket} />;
          case 'market': default: return (<><div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-semibold text-gray-300">Market Overview</h2><button onClick={() => setView('matchup')} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"><BarChart2 size={18} />Matchup Analysis</button></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Object.values(mockTeamData).map((team) => (<TeamStockCard key={team.id} team={team} onSelect={handleSelectTeam}/>))}</div></>);
      }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <header className="bg-gray-800/30 backdrop-blur-md sticky top-0 z-10 p-4 border-b border-gray-700"><div className="max-w-7xl mx-auto"><h1 className="text-3xl font-bold text-white">Sports Analytics Platform</h1><p className="text-gray-400">Applying Financial-Grade Analysis to Sports</p></div></header>
      <main className="p-4 md:p-6 max-w-7xl mx-auto">{renderView()}</main>
    </div>
  );
};

export default App;
