import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../lib/auth';
import { mockElections, votingService } from '../lib/elections';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Shield, Vote, BarChart3, ArrowLeft, Search, Calendar, Users, CheckCircle } from 'lucide-react';

export function Elections() {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/');
      return;
    }
    setUser(authService.getCurrentUser());
  }, [navigate]);

  if (!user) return null;

  const filteredElections = mockElections.filter(election => {
    const matchesSearch = election.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         election.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || election.status === filter;
    return matchesSearch && matchesFilter;
  });

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
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">All Elections</h1>
                  <p className="text-xs text-gray-500">Browse and participate in elections</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search elections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                onClick={() => setFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={filter === 'upcoming' ? 'default' : 'outline'}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </Button>
              <Button
                variant={filter === 'ended' ? 'default' : 'outline'}
                onClick={() => setFilter('ended')}
              >
                Ended
              </Button>
            </div>
          </div>
        </div>

        {/* Elections List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredElections.map(election => {
            const hasVoted = votingService.hasVoted(user.id, election.id);
            const turnoutPercentage = election.totalVoters > 0 
              ? (election.turnout / election.totalVoters) * 100 
              : 0;

            return (
              <Card key={election.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant={
                      election.status === 'active' ? 'default' :
                      election.status === 'upcoming' ? 'secondary' :
                      'outline'
                    }>
                      {election.status}
                    </Badge>
                    {hasVoted && (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Voted
                      </Badge>
                    )}
                  </div>
                  <CardTitle>{election.title}</CardTitle>
                  <CardDescription>{election.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {election.status === 'upcoming' 
                          ? `Starts: ${election.startDate.toLocaleDateString()}`
                          : `Ends: ${election.endDate.toLocaleDateString()}`
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{election.candidates.length} candidates</span>
                    </div>
                  </div>

                  {election.status === 'active' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Turnout</span>
                        <span className="font-semibold text-gray-900">
                          {turnoutPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={turnoutPercentage} />
                    </div>
                  )}

                  <div className="flex gap-2">
                    {election.status === 'active' && (
                      <Button
                        className="flex-1"
                        onClick={() => navigate(`/vote/${election.id}`)}
                        disabled={hasVoted}
                      >
                        {hasVoted ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Voted
                          </>
                        ) : (
                          <>
                            <Vote className="w-4 h-4 mr-2" />
                            Vote Now
                          </>
                        )}
                      </Button>
                    )}
                    
                    {(election.status === 'active' || election.status === 'ended') && (
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/results/${election.id}`)}
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {election.status === 'upcoming' && (
                      <Button className="flex-1" disabled>
                        Not Started Yet
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredElections.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
              <Vote className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No elections found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
