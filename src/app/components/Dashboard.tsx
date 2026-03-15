import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../lib/auth';
import { mockElections, votingService } from '../lib/elections';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Vote, BarChart3, CheckCircle, Clock, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';

export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/');
      return;
    }
    
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Redirect non-voters to their specific dashboards
    if (currentUser && currentUser.role !== 'voter') {
      switch (currentUser.role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'dm':
          navigate('/dm-dashboard');
          break;
        case 'sdm':
          navigate('/sdm-dashboard');
          break;
        case 'cdo':
          navigate('/cdo-dashboard');
          break;
      }
    }
  }, [navigate]);

  if (!user) return null;

  const activeElections = mockElections.filter(e => e.status === 'active');
  const upcomingElections = mockElections.filter(e => e.status === 'upcoming');
  const endedElections = mockElections.filter(e => e.status === 'ended');

  const votedCount = activeElections.filter(e => votingService.hasVoted(user.id, e.id)).length;

  return (
    <DashboardLayout
      title="Voter Dashboard"
      subtitle="Participate in Democratic Elections"
      roleLabel="Voter"
      roleColor="bg-blue-600"
    >
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-600 dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Elections</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeElections.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Vote className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600 dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Votes Cast</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{votedCount}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600 dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{upcomingElections.length}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-600 dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{endedElections.length}</p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <BarChart3 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-900 dark:border-gray-800" onClick={() => navigate('/elections')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-2xl">
                <Vote className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">View Elections</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Browse and participate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-900 dark:border-gray-800" onClick={() => navigate('/results/election-1')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-2xl">
                <BarChart3 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">View Results</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Real-time analytics</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">My Votes</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">View history</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Elections */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Active Elections</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {activeElections.map(election => {
              const hasVoted = votingService.hasVoted(user.id, election.id);
              const turnoutPercentage = (election.turnout / election.totalVoters) * 100;

              return (
                <Card key={election.id} className="dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl dark:text-white">{election.title}</CardTitle>
                        <CardDescription className="dark:text-gray-400">{election.description}</CardDescription>
                      </div>
                      <Badge variant={hasVoted ? "default" : "secondary"} className={hasVoted ? "bg-green-600" : ""}>
                        {hasVoted ? "Voted" : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Ends: {election.endDate.toLocaleDateString()}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Voter Turnout</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {election.turnout.toLocaleString()} / {election.totalVoters.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={turnoutPercentage} />
                      <p className="text-xs text-gray-500 dark:text-gray-400">{turnoutPercentage.toFixed(1)}% participation</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => navigate(`/vote/${election.id}`)}
                        disabled={hasVoted}
                      >
                        {hasVoted ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Vote Submitted
                          </>
                        ) : (
                          <>
                            <Vote className="w-4 h-4 mr-2" />
                            Cast Vote
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/results/${election.id}`)}
                        className="dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {upcomingElections.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Upcoming Elections</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {upcomingElections.map(election => (
                <Card key={election.id} className="dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xl dark:text-white">{election.title}</CardTitle>
                    <CardDescription className="dark:text-gray-400">{election.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Starts: {election.startDate.toLocaleDateString()}</span>
                    </div>
                    <Badge variant="outline" className="mt-4 dark:border-gray-700">
                      Coming Soon
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
