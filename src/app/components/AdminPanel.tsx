import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../lib/auth';
import { mockElections } from '../lib/elections';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Shield, 
  ArrowLeft, 
  Plus,
  Settings,
  Users,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Calendar,
  Lock,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminPanel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      navigate('/');
      return;
    }
    
    if (!currentUser.isAdmin) {
      toast.error('Access Denied', {
        description: 'You do not have admin privileges'
      });
      navigate('/dashboard');
      return;
    }
    
    setUser(currentUser);
  }, [navigate]);

  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    totalVoters: 0
  });

  const handleCreateElection = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newElection.title || !newElection.description || !newElection.startDate || !newElection.endDate) {
      toast.error('Please fill in all fields');
      return;
    }

    toast.success('Election created successfully!', {
      description: 'The new election is now available'
    });

    // Reset form
    setNewElection({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      totalVoters: 0
    });
  };

  if (!user) return null;

  // Calculate statistics
  const totalElections = mockElections.length;
  const activeElections = mockElections.filter(e => e.status === 'active').length;
  const totalVoters = mockElections.reduce((sum, e) => sum + e.totalVoters, 0);
  const totalVotesCast = mockElections.reduce((sum, e) => sum + e.turnout, 0);

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
                <div className="p-2 bg-purple-600 rounded-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-xs text-gray-500">Manage elections and security</p>
                </div>
              </div>
            </div>
            <Badge variant="default" className="bg-purple-600">
              <Shield className="w-3 h-3 mr-1" />
              Administrator
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Elections</p>
                  <p className="text-3xl font-bold text-gray-900">{totalElections}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Elections</p>
                  <p className="text-3xl font-bold text-gray-900">{activeElections}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Registered Voters</p>
                  <p className="text-3xl font-bold text-gray-900">{totalVoters.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Votes Cast</p>
                  <p className="text-3xl font-bold text-gray-900">{totalVotesCast.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="elections" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="elections">Elections</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Manage Elections */}
          <TabsContent value="elections">
            <Card>
              <CardHeader>
                <CardTitle>Manage Elections</CardTitle>
                <CardDescription>View and manage all elections in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockElections.map(election => (
                    <div
                      key={election.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{election.title}</h3>
                          <Badge variant={
                            election.status === 'active' ? 'default' :
                            election.status === 'upcoming' ? 'secondary' :
                            'outline'
                          }>
                            {election.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{election.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {election.startDate.toLocaleDateString()} - {election.endDate.toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {election.turnout} / {election.totalVoters} votes
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/results/${election.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create New Election */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Election</CardTitle>
                <CardDescription>Set up a new election with all necessary details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateElection} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Election Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., 2026 Presidential Election"
                      value={newElection.title}
                      onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the purpose and scope of this election..."
                      value={newElection.description}
                      onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
                      required
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newElection.startDate}
                        onChange={(e) => setNewElection({ ...newElection, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newElection.endDate}
                        onChange={(e) => setNewElection({ ...newElection, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalVoters">Total Eligible Voters</Label>
                    <Input
                      id="totalVoters"
                      type="number"
                      placeholder="10000"
                      value={newElection.totalVoters || ''}
                      onChange={(e) => setNewElection({ ...newElection, totalVoters: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                      After creating the election, you'll be able to add candidates and configure security settings.
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Election
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Overview</CardTitle>
                  <CardDescription>System security status and configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">Encryption Active</p>
                        <p className="text-sm text-green-700">256-bit AES encryption enabled</p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-600">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">Blockchain Verification</p>
                        <p className="text-sm text-green-700">All votes verified on blockchain</p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-600">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">Two-Factor Authentication</p>
                        <p className="text-sm text-green-700">2FA required for all users</p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-600">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">Audit Logging</p>
                        <p className="text-sm text-green-700">All actions tracked and logged</p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-600">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">DDoS Protection</p>
                        <p className="text-sm text-green-700">Advanced threat protection enabled</p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-600">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Features</CardTitle>
                  <CardDescription>Platform security capabilities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold">End-to-End Encryption</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        All votes are encrypted from the moment they're cast until final tabulation
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold">Anonymous Voting</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Voter identity is completely separated from their vote choice
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold">Blockchain Verification</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Every vote is recorded on an immutable blockchain ledger
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold">Multi-Party Verification</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Independent observers can verify election integrity
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
