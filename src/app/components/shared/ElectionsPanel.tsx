/**
 * ElectionsPanel.tsx
 * Drop this into any dashboard (DM, SDM, CDO, Voter) to show
 * elections visible to that role — fetched live from the database.
 *
 * Usage:
 *   import { ElectionsPanel } from '../shared/ElectionsPanel';
 *   <ElectionsPanel />
 */
import { useElections } from './useElections';
import { Badge }        from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Users, Calendar, Activity, Vote, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

const COLORS = ['#1a56db','#7e3af2','#0e9f6e','#ff5a1f','#e3a008','#e11d48','#0891b2'];

export function ElectionsPanel() {
  const { elections, active, upcoming, loading, error, refresh } = useElections();

  if (loading) return (
    <Card>
      <CardContent className="py-12 text-center">
        <RefreshCw className="w-8 h-8 text-blue-500 mx-auto mb-3 animate-spin"/>
        <p className="text-gray-500">Loading elections from database...</p>
      </CardContent>
    </Card>
  );

  if (error) return (
    <Card>
      <CardContent className="py-12 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3"/>
        <p className="text-gray-500 font-medium">Could not load elections</p>
        <p className="text-sm text-gray-400 mb-4">{error}</p>
        <Button variant="outline" onClick={refresh} size="sm"><RefreshCw className="w-4 h-4 mr-2"/>Retry</Button>
      </CardContent>
    </Card>
  );

  if (elections.length === 0) return (
    <Card>
      <CardContent className="py-12 text-center">
        <Vote className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
        <p className="text-gray-500 font-medium">No elections available</p>
        <p className="text-sm text-gray-400">No elections are visible for your role at this time.</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active',   value: active.length,             color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Upcoming', value: upcoming.length,           color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20'  },
          { label: 'Total',    value: elections.length,          color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label} Elections</p>
          </div>
        ))}
      </div>

      {/* Election cards */}
      {elections.map((election, idx) => (
        <Card key={election._id} className="dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
          {/* Status stripe */}
          <div className={`h-1 w-full ${
            election.status === 'active'   ? 'bg-green-500' :
            election.status === 'upcoming' ? 'bg-blue-500'  : 'bg-gray-300'
          }`}/>

          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-base dark:text-white">{election.title}</CardTitle>
                  <Badge variant={election.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {election.status}
                  </Badge>
                </div>
                <CardDescription className="dark:text-gray-400">{election.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3"/>
                {new Date(election.startDate).toLocaleDateString('en-IN')} – {new Date(election.endDate).toLocaleDateString('en-IN')}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3"/>
                {election.turnout.toLocaleString()} / {election.totalVoters.toLocaleString()} voted
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3"/>
                {election.totalVoters > 0 ? ((election.turnout / election.totalVoters) * 100).toFixed(1) : 0}% turnout
              </span>
            </div>
          </CardHeader>

          <CardContent>
            {/* Candidates */}
            {election.candidates.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No candidates added yet.</p>
            ) : (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                  Candidates ({election.candidates.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {election.candidates.map((c, cidx) => {
                    const color = COLORS[(idx + cidx) % COLORS.length];
                    // Calculate vote count from results
                    const votes = election.results?.[c._id] || 0;
                    const pct   = election.turnout > 0 ? ((votes / election.turnout) * 100).toFixed(1) : '0';

                    return (
                      <div key={c._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-sm overflow-hidden"
                          style={{ background: color }}>
                          {c.photo
                            ? <img src={c.photo} alt={c.name} className="w-full h-full object-cover"/>
                            : c.name.charAt(0).toUpperCase()
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold dark:text-white truncate">{c.name}</p>
                          <p className="text-xs text-gray-500 truncate">{c.party}</p>
                          {c.manifesto && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">{c.manifesto}</p>
                          )}
                          {/* Vote progress bar */}
                          {election.status !== 'upcoming' && election.turnout > 0 && (
                            <div className="mt-1.5">
                              <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                                <span>{votes} votes</span>
                                <span>{pct}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }}/>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="w-4 h-4 mr-2"/>Refresh Elections
        </Button>
      </div>
    </div>
  );
}
