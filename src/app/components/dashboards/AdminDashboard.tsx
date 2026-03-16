import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { authService, User } from '../../lib/auth';
import { toast } from 'sonner';
import {
  Shield, LogOut, Users, Vote, Activity, Settings,
  BarChart3, AlertTriangle, CheckCircle, Clock,
  Database, Lock, RefreshCw, Download, Eye,
} from 'lucide-react';

const ELECTION_DATA = {
  totalVoters: 125000,
  votesCast: 87340,
  activePollingStations: 248,
  flaggedIncidents: 3,
};

const CANDIDATES = [
  { name: 'Candidate A', party: 'Party Alpha',  votes: 28450, color: '#1a56db' },
  { name: 'Candidate B', party: 'Party Beta',   votes: 24100, color: '#7e3af2' },
  { name: 'Candidate C', party: 'Party Gamma',  votes: 18900, color: '#0e9f6e' },
  { name: 'Candidate D', party: 'Party Delta',  votes: 10200, color: '#ff5a1f' },
  { name: 'Candidate E', party: 'Independent',  votes: 5690,  color: '#e3a008' },
];

const SYSTEM_LOGS = [
  { msg: 'Blockchain sync completed',        time: '2 min ago',  type: 'success' },
  { msg: 'New voter batch verified (1,200)',  time: '8 min ago',  type: 'info'    },
  { msg: 'Incident flagged at booth #112',   time: '22 min ago', type: 'warning' },
  { msg: 'Admin login: Raj Sharma',          time: '1 hr ago',   type: 'info'    },
  { msg: 'Election phase activated',         time: '2 hr ago',   type: 'success' },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'logs' | 'settings'>('overview');
  const [electionActive, setElectionActive] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    const u: User | null = raw ? JSON.parse(raw) : null;
    if (!u || u.role !== 'admin') { navigate('/', { replace: true }); return; }
    setUser(u);
  }, []);

  const logout = () => { authService.logout(); navigate('/', { replace: true }); };

  const totalVotes = CANDIDATES.reduce((s, c) => s + c.votes, 0);
  const turnout = ((ELECTION_DATA.votesCast / ELECTION_DATA.totalVoters) * 100).toFixed(1);

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* NAV */}
      <nav style={{ background: '#1e293b', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={22} color="#60a5fa" />
          <span style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>SecureVote Pro</span>
          <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 20, background: '#dc2626', color: '#fff', fontSize: 11, fontWeight: 600 }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>{user.name}</span>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>

        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Registered Voters', value: ELECTION_DATA.totalVoters.toLocaleString(), icon: <Users size={20} />, accent: '#1a56db', bg: '#eff6ff' },
            { label: 'Votes Cast',               value: ELECTION_DATA.votesCast.toLocaleString(),  icon: <Vote size={20} />,  accent: '#0e9f6e', bg: '#f0fdf4' },
            { label: 'Voter Turnout',             value: `${turnout}%`,                             icon: <BarChart3 size={20} />, accent: '#7e3af2', bg: '#f5f3ff' },
            { label: 'Flagged Incidents',         value: ELECTION_DATA.flaggedIncidents.toString(), icon: <AlertTriangle size={20} />, accent: '#dc2626', bg: '#fef2f2' },
          ].map((c, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.accent, flexShrink: 0 }}>{c.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 500 }}>{c.label}</p>
                <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 700, color: '#1e293b' }}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 24, width: 'fit-content' }}>
          {(['overview', 'results', 'logs', 'settings'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: activeTab === tab ? '#fff' : 'transparent', color: activeTab === tab ? '#1e293b' : '#64748b', boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', textTransform: 'capitalize' }}>
              {tab}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Live Vote Tally</h3>
              {CANDIDATES.map((c, i) => {
                const pct = ((c.votes / totalVotes) * 100).toFixed(1);
                return (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>{c.name}</span>
                      <span style={{ fontSize: 13, color: '#64748b' }}>{c.votes.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: c.color, borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>System Health</h3>
              {[
                { label: 'Blockchain Node',     status: 'Online',  ok: true },
                { label: 'Vote Encryption',     status: 'Active',  ok: true },
                { label: 'Audit Logger',         status: 'Active',  ok: true },
                { label: 'Incident at #112',     status: 'Review',  ok: false },
                { label: 'Backup Sync',          status: 'Active',  ok: true },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
                  <span style={{ fontSize: 13, color: '#1e293b' }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: s.ok ? '#dcfce7' : '#fef3c7', color: s.ok ? '#15803d' : '#92400e' }}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {activeTab === 'results' && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Full Results Table</h3>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                <Download size={14} /> Export
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Rank', 'Candidate', 'Party', 'Votes', 'Share', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...CANDIDATES].sort((a, b) => b.votes - a.votes).map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: i === 0 ? '#16a34a' : '#64748b' }}>#{i + 1}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1e293b' }}>{c.name}</td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>{c.party}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1e293b' }}>{c.votes.toLocaleString()}</td>
                    <td style={{ padding: '12px 14px', color: '#1e293b' }}>{((c.votes / totalVotes) * 100).toFixed(1)}%</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: i === 0 ? '#dcfce7' : '#f1f5f9', color: i === 0 ? '#15803d' : '#64748b' }}>
                        {i === 0 ? 'Leading' : 'Running'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* LOGS */}
        {activeTab === 'logs' && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>System Audit Log</h3>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', cursor: 'pointer', fontSize: 13 }}>
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SYSTEM_LOGS.map((log, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: log.type === 'success' ? '#16a34a' : log.type === 'warning' ? '#d97706' : '#3b82f6' }} />
                  <span style={{ flex: 1, fontSize: 13, color: '#1e293b' }}>{log.msg}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Election Controls</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#1e293b' }}>Election Status</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Currently {electionActive ? 'Active' : 'Paused'}</p>
                  </div>
                  <button
                    onClick={() => { setElectionActive(!electionActive); toast.success(`Election ${electionActive ? 'paused' : 'activated'}`); }}
                    style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: electionActive ? '#fef2f2' : '#dcfce7', color: electionActive ? '#dc2626' : '#16a34a', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                  >
                    {electionActive ? 'Pause' : 'Activate'}
                  </button>
                </div>
                {[
                  { label: 'Force Blockchain Sync', icon: <Database size={14} />, action: () => toast.success('Blockchain synced') },
                  { label: 'Lock All Booths',       icon: <Lock size={14} />,     action: () => toast.success('All booths locked') },
                  { label: 'Export Full Report',    icon: <Download size={14} />, action: () => toast.success('Report exported') },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.action} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                    {btn.icon} {btn.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Admin Info</h3>
              {[
                { label: 'Name',        value: user.name },
                { label: 'Email',       value: user.email },
                { label: 'Role',        value: 'System Administrator' },
                { label: 'Clearance',   value: 'Level 5 — Full Access' },
                { label: 'Session',     value: 'Active' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>{r.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
