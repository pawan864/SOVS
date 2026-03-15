import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../../lib/auth';
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
  CheckCircle,
  AlertCircle,
  Activity,
  Eye,
  FileText,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

export function SDMDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'sdm') {
      navigate('/');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  if (!user) return null;

  const subDistrictStats = {
    pollingStations: 12,
    activeStations: 12,
    totalVoters: 28000,
    votedCount: 17800,
    turnoutRate: 63.6,
    issues: 1
  };

  const stationData = [
    { name: 'Station 1', voters: 2800, voted: 1900 },
    { name: 'Station 2', voters: 2400, voted: 1600 },
    { name: 'Station 3', voters: 2200, voted: 1400 },
    { name: 'Station 4', voters: 2600, voted: 1750 },
    { name: 'Station 5', voters: 2300, voted: 1500 },
    { name: 'Station 6', voters: 2500, voted: 1650 }
  ];

  return (
    <DashboardLayout
      title="Sub-District Manager Dashboard"
      subtitle={user.district || 'Sub-District Operations'}
      roleLabel="Sub-District Manager (SDM)"
      roleColor="bg-green-600"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-green-600 dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Polling Stations</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{subDistrictStats.pollingStations}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">All operational</p>
              </div>
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-xl">
                <MapPin className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600 dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Voters</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{subDistrictStats.totalVoters.toLocaleString()}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Registered
                </p>
              </div>
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600 dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Turnout Rate</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{subDistrictStats.turnoutRate}%</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  {subDistrictStats.votedCount.toLocaleString()} votes
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Issues</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{subDistrictStats.issues}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Minor issues</p>
              </div>
              <div className="p-4 bg-amber-100 dark:bg-amber-900 rounded-xl">
                <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="stations" className="space-y-6">
        <TabsList className="dark:bg-gray-900">
          <TabsTrigger value="stations">Polling Stations</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="stations" className="space-y-6">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Station Performance</CardTitle>
              <CardDescription className="dark:text-gray-400">Voter turnout by polling station</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stationData}>
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
                  <Bar dataKey="voted" fill="#10b981" name="Votes Cast" />
                  <Bar dataKey="voters" fill="#6b7280" name="Total Voters" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Station Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stationData.map((station, i) => {
                  const turnout = ((station.voted / station.voters) * 100).toFixed(1);
                  return (
                    <div key={i} className="p-4 border dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <h3 className="font-semibold dark:text-white">{station.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {station.voted.toLocaleString()} / {station.voters.toLocaleString()} votes
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-600">{turnout}%</Badge>
                      </div>
                      <Progress value={parseFloat(turnout)} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Recent Activity</CardTitle>
              <CardDescription className="dark:text-gray-400">Live updates from polling stations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: '2 min ago', station: 'Station 1', event: 'Voting proceeding normally', type: 'success' },
                  { time: '5 min ago', station: 'Station 3', event: 'High turnout reported', type: 'success' },
                  { time: '12 min ago', station: 'Station 5', event: 'Minor delay resolved', type: 'warning' },
                  { time: '20 min ago', station: 'Station 2', event: 'Queue management active', type: 'info' },
                  { time: '25 min ago', station: 'Station 4', event: 'Lunch break completed', type: 'info' }
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Activity className={`w-5 h-5 mt-0.5 ${
                      activity.type === 'success' ? 'text-green-600' :
                      activity.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium dark:text-white">{activity.station}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{activity.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Sub-District Reports</CardTitle>
              <CardDescription className="dark:text-gray-400">Generate operational reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'Station Summary', desc: 'Performance overview' },
                  { title: 'Turnout Analysis', desc: 'Detailed turnout metrics' },
                  { title: 'Activity Log', desc: 'All station events' },
                  { title: 'Issue Report', desc: 'Problems and resolutions' }
                ].map((report, index) => (
                  <div key={index} className="p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      <Button variant="outline" size="sm">Generate</Button>
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
