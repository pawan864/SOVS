import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../../lib/auth';
import { mockElections } from '../../lib/elections';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  MapPin, 
  Users, 
  Vote, 
  BarChart3,
  TrendingUp,
  Eye,
  AlertTriangle,
  CheckCircle,
  Activity,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export function DMDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'dm') {
      navigate('/');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  if (!user) return null;

  // District-specific data
  const districtStats = {
    totalPollingStations: 45,
    activeStations: 42,
    totalVoters: 125000,
    votedCount: 78500,
    turnoutRate: 62.8,
    issues: 3
  };

  const subDistrictData = [
    { name: 'North-A', voters: 25000, voted: 16500, turnout: 66 },
    { name: 'North-B', voters: 28000, voted: 17800, turnout: 63.6 },
    { name: 'North-C', voters: 22000, voted: 13200, turnout: 60 },
    { name: 'North-D', voters: 30000, voted: 19500, turnout: 65 },
    { name: 'North-E', voters: 20000, voted: 11500, turnout: 57.5 }
  ];

  const hourlyTurnout = [
    { time: '08:00', turnout: 5 },
    { time: '10:00', turnout: 15 },
    { time: '12:00', turnout: 28 },
    { time: '14:00', turnout: 42 },
    { time: '16:00', turnout: 55 },
    { time: '18:00', turnout: 62 }
  ];

  return (
    <DashboardLayout
      title="District Manager Dashboard"
      subtitle={user.district || 'District Management'}
      roleLabel="District Manager (DM)"
      roleColor="bg-blue-600"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-600 dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Polling Stations</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{districtStats.totalPollingStations}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {districtStats.activeStations} active
                </p>
              </div>
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600 dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">District Voters</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{districtStats.totalVoters.toLocaleString()}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Registered
                </p>
              </div>
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-xl">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600 dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Turnout Rate</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{districtStats.turnoutRate}%</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  {districtStats.votedCount.toLocaleString()} votes
                </p>
              </div>
              <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <Vote className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-600 dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Issues</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{districtStats.issues}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Requires attention
                </p>
              </div>
              <div className="p-4 bg-amber-100 dark:bg-amber-900 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="dark:bg-gray-900">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subdistricts">Sub-Districts</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Sub-District Performance</CardTitle>
                <CardDescription className="dark:text-gray-400">Turnout comparison across sub-districts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subDistrictData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        color: '#fff'
                      }} 
                    />
                    <Bar dataKey="voted" fill="#3b82f6" name="Votes Cast" />
                    <Bar dataKey="voters" fill="#6b7280" name="Total Voters" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Turnout Trend</CardTitle>
                <CardDescription className="dark:text-gray-400">Real-time turnout tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={hourlyTurnout}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        color: '#fff'
                      }} 
                    />
                    <Line type="monotone" dataKey="turnout" stroke="#10b981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-900 dark:border-gray-800"
                  onClick={() => navigate('/elections')}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-2xl">
                    <Eye className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Monitor Elections</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View live status</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-green-100 dark:bg-green-900 rounded-2xl">
                    <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Station Activity</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Track polling stations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-2xl">
                    <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Generate Report</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">District analytics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sub-Districts */}
        <TabsContent value="subdistricts">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Sub-District Details</CardTitle>
              <CardDescription className="dark:text-gray-400">Performance metrics for each sub-district</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subDistrictData.map((sd, index) => (
                  <div key={index} className="p-4 border dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{sd.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {sd.voted.toLocaleString()} / {sd.voters.toLocaleString()} voters
                        </p>
                      </div>
                      <Badge className={sd.turnout > 60 ? 'bg-green-600' : 'bg-amber-600'}>
                        {sd.turnout}% turnout
                      </Badge>
                    </div>
                    <Progress value={sd.turnout} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring */}
        <TabsContent value="monitoring">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Live Monitoring</CardTitle>
              <CardDescription className="dark:text-gray-400">Real-time polling station status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium dark:text-white">Polling Station #{i + 1}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Location: Sector {String.fromCharCode(65 + i)}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-400">
                      Operational
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">District Reports</CardTitle>
              <CardDescription className="dark:text-gray-400">Generate and download reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'Turnout Summary', desc: 'Overall district performance' },
                  { title: 'Sub-District Analysis', desc: 'Detailed sub-district breakdown' },
                  { title: 'Hourly Activity', desc: 'Voting patterns by time' },
                  { title: 'Issue Log', desc: 'Reported problems and resolutions' }
                ].map((report, index) => (
                  <div key={index} className="p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <Button variant="outline" size="sm">Download</Button>
                    </div>
                    <h3 className="font-semibold dark:text-white mb-1">{report.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{report.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
