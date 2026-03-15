import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../../lib/auth';
import { mockElections } from '../../lib/elections';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Database, 
  TrendingUp, 
  BarChart3,
  Activity,
  Download,
  FileSpreadsheet,
  PieChart,
  LineChart as LineChartIcon
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
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function CDODashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'cdo') {
      navigate('/');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  if (!user) return null;

  // Analytics data
  const demographicData = [
    { age: '18-25', voters: 25000 },
    { age: '26-35', voters: 45000 },
    { age: '36-50', voters: 55000 },
    { age: '51-65', voters: 38000 },
    { age: '65+', voters: 22000 }
  ];

  const trendData = [
    { month: 'Jan', registrations: 12000, votes: 8500 },
    { month: 'Feb', registrations: 15000, votes: 11000 },
    { month: 'Mar', registrations: 18000, votes: 14500 },
    { month: 'Apr', registrations: 22000, votes: 17000 },
    { month: 'May', registrations: 28000, votes: 21000 },
    { month: 'Jun', registrations: 32000, votes: 25000 }
  ];

  const genderData = [
    { name: 'Male', value: 95000 },
    { name: 'Female', value: 88000 },
    { name: 'Other', value: 2000 }
  ];

  const hourlyPattern = [
    { hour: '6 AM', activity: 120 },
    { hour: '8 AM', activity: 850 },
    { hour: '10 AM', activity: 1200 },
    { hour: '12 PM', activity: 1500 },
    { hour: '2 PM', activity: 1350 },
    { hour: '4 PM', activity: 1600 },
    { hour: '6 PM', activity: 1100 },
    { hour: '8 PM', activity: 450 }
  ];

  return (
    <DashboardLayout
      title="Chief Data Officer Dashboard"
      subtitle="Data Analytics & Insights"
      roleLabel="Chief Data Officer (CDO)"
      roleColor="bg-indigo-600"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-indigo-600 dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Data Points</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">1.2M</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +15% this week
                </p>
              </div>
              <div className="p-4 bg-indigo-100 dark:bg-indigo-900 rounded-xl">
                <Database className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600 dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Analytics Reports</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">247</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Generated this month</p>
              </div>
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600 dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Real-time Streams</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">42</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Active connections</p>
              </div>
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-xl">
                <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600 dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Data Accuracy</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">99.8%</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Quality score</p>
              </div>
              <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="demographics" className="space-y-6">
        <TabsList className="dark:bg-gray-900">
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
        </TabsList>

        {/* Demographics */}
        <TabsContent value="demographics" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Voter Demographics by Age</CardTitle>
                <CardDescription className="dark:text-gray-400">Distribution across age groups</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={demographicData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="age" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        color: '#fff'
                      }} 
                    />
                    <Bar dataKey="voters" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Gender Distribution</CardTitle>
                <CardDescription className="dark:text-gray-400">Voter registration by gender</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Registration & Voting Trends</CardTitle>
              <CardDescription className="dark:text-gray-400">6-month trend analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      color: '#fff'
                    }} 
                  />
                  <Area type="monotone" dataKey="registrations" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="votes" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns */}
        <TabsContent value="patterns" className="space-y-6">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Voting Activity Pattern</CardTitle>
              <CardDescription className="dark:text-gray-400">Hourly voting activity distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={hourlyPattern}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      color: '#fff'
                    }} 
                  />
                  <Line type="monotone" dataKey="activity" stroke="#8b5cf6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <PieChart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Peak Hours</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-1">2-6 PM</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Highest activity</p>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Growth Rate</h3>
                  <p className="text-2xl font-bold text-green-600 mb-1">+24%</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Month over month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Avg Session</h3>
                  <p className="text-2xl font-bold text-purple-600 mb-1">4.2 min</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Per voter</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Exports */}
        <TabsContent value="exports">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Data Exports</CardTitle>
              <CardDescription className="dark:text-gray-400">Download analytics reports and datasets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'Demographics Report', format: 'CSV', size: '2.4 MB', icon: FileSpreadsheet },
                  { title: 'Voting Trends', format: 'XLSX', size: '5.1 MB', icon: LineChartIcon },
                  { title: 'Turnout Analysis', format: 'PDF', size: '1.8 MB', icon: BarChart3 },
                  { title: 'Real-time Data', format: 'JSON', size: '12.3 MB', icon: Database },
                  { title: 'Pattern Analysis', format: 'CSV', size: '3.2 MB', icon: Activity },
                  { title: 'Complete Dataset', format: 'ZIP', size: '45.7 MB', icon: Download }
                ].map((export_item, index) => {
                  const IconComponent = export_item.icon;
                  return (
                    <div key={index} className="p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                            <IconComponent className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold dark:text-white">{export_item.title}</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{export_item.size} • {export_item.format}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
