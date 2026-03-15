import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { authService } from '../lib/auth';
import { mockElections, votingService } from '../lib/elections';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Shield, 
  ArrowLeft, 
  BarChart3, 
  TrendingUp,
  Users,
  Award,
  PieChart
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Results() {
  const navigate = useNavigate();
  const { electionId } = useParams<{ electionId: string }>();
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/');
      return;
    }
    setUser(authService.getCurrentUser());
  }, [navigate]);

  if (!user || !electionId) return null;

  const election = mockElections.find(e => e.id === electionId);
  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Election not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get current results
  const currentResults = votingService.getResults(electionId);
  
  // Merge with mock results for display
  const mergedResults = { ...election.results };
  Object.keys(currentResults).forEach(candidateId => {
    mergedResults[candidateId] = (mergedResults[candidateId] || 0) + currentResults[candidateId];
  });

  // Calculate total votes
  const totalVotes = Object.values(mergedResults).reduce((sum, votes) => sum + votes, 0);

  // Prepare data for charts
  const chartData = election.candidates.map(candidate => ({
    name: candidate.name,
    votes: mergedResults[candidate.id] || 0,
    percentage: totalVotes > 0 ? ((mergedResults[candidate.id] || 0) / totalVotes * 100).toFixed(1) : '0.0',
    party: candidate.party,
    photo: candidate.photo
  })).sort((a, b) => b.votes - a.votes);

  const winner = chartData[0];
  const turnoutPercentage = election.totalVoters > 0 
    ? ((totalVotes / election.totalVoters) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Election Results</h1>
                  <p className="text-xs text-gray-500">Real-time vote counting</p>
                </div>
              </div>
            </div>
            <Badge variant={election.status === 'active' ? 'default' : 'secondary'}>
              {election.status === 'active' ? 'Live Results' : 'Final Results'}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Election Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{election.title}</CardTitle>
            <CardDescription>{election.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{totalVotes.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Votes Cast</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{turnoutPercentage}%</p>
                <p className="text-sm text-gray-600">Voter Turnout</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{election.totalVoters.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Eligible Voters</p>
              </div>
              
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <Award className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{election.candidates.length}</p>
                <p className="text-sm text-gray-600">Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leading Candidate */}
        {totalVotes > 0 && (
          <Card className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-amber-500" />
                <CardTitle>Currently Leading</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <img
                  src={winner.photo}
                  alt={winner.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900">{winner.name}</h2>
                  <p className="text-gray-600 mb-3">{winner.party}</p>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-4xl font-bold text-blue-600">{winner.votes.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">votes</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-green-600">{winner.percentage}%</p>
                      <p className="text-sm text-gray-600">of total</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Visualization */}
        <Tabs defaultValue="bar" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="bar">
              <BarChart3 className="w-4 h-4 mr-2" />
              Bar Chart
            </TabsTrigger>
            <TabsTrigger value="pie">
              <PieChart className="w-4 h-4 mr-2" />
              Pie Chart
            </TabsTrigger>
            <TabsTrigger value="list">
              <Users className="w-4 h-4 mr-2" />
              Detailed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bar">
            <Card>
              <CardHeader>
                <CardTitle>Vote Distribution</CardTitle>
                <CardDescription>Compare votes received by each candidate</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="votes" fill="#3b82f6" name="Votes Received" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pie">
            <Card>
              <CardHeader>
                <CardTitle>Vote Share</CardTitle>
                <CardDescription>Percentage breakdown of total votes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsPie>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="votes"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <div className="space-y-4">
              {chartData.map((candidate, index) => {
                const votePercentage = parseFloat(candidate.percentage);
                
                return (
                  <Card key={candidate.name}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-3xl font-bold text-gray-400 w-8">
                            #{index + 1}
                          </div>
                          
                          <img
                            src={candidate.photo}
                            alt={candidate.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
                            <p className="text-sm text-gray-600">{candidate.party}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-3xl font-bold text-gray-900">
                            {candidate.votes.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">votes</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Vote Share</span>
                          <span className="font-semibold text-gray-900">{candidate.percentage}%</span>
                        </div>
                        <Progress value={votePercentage} className="h-3" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Security Notice */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Verified Results</h3>
                <p className="text-sm text-blue-800">
                  All votes are encrypted, verified on blockchain, and counted in real-time. 
                  The integrity of these results is guaranteed by cryptographic proofs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
