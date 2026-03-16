/* ===== Responsive additions ===== */
const responsiveStyles = `
.voter-container{
  width:100%;
  max-width:1400px;
  margin:auto;
  padding:clamp(12px,3vw,32px);
}

.voter-stats{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:14px;
}

.voter-candidates{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
  gap:14px;
}

.voter-candidate-card{
  display:flex;
  align-items:center;
  justify-content:space-between;
  flex-wrap:wrap;
  gap:10px;
}

.vote-btn{
  padding:8px 18px;
  border-radius:8px;
  border:none;
  font-weight:600;
  font-size:13px;
}

@media (max-width:768px){
  .voter-candidate-card{
    flex-direction:column;
    align-items:flex-start;
  }
  .vote-btn{
    width:100%;
  }
}

@media (max-width:480px){
  .voter-stats{
    grid-template-columns:1fr;
  }
}
`;
/* ===== End responsive additions ===== */


import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  Vote, CheckCircle, Clock, FileText, LogOut,
  Activity, ShieldCheck, Users, Timer, BarChart3,
  User, RefreshCw, Edit2, Save, X, AlertCircle,
  MessageSquare, Flag, Send, ChevronDown, ChevronUp,
  BarChart2, TrendingUp, Award, Eye, Sun, Moon, Bell,
  Info, Zap, AlertTriangle, Trash2,
} from 'lucide-react';

const API = 'https://sovs-backend-bf8j.onrender.com/api';

interface LocationVal {
  state?: string; district?: string; subdistrict?: string; locality?: string; label?: string;
}
interface VoterUser {
  _id?: string;
  id?: string;
  name: string;
  role: string;
  voterId?: string;
  aadhaarNumber?: string;
  eciCardNumber?: string;
  voterLocation?: LocationVal;
}
interface Election {
  _id: string;
  title: string;
  status: string;
  candidates: Candidate[];
  totalVoters: number;
  turnout: number;
  location?: any;
}
interface Candidate {
  _id: string;
  name: string;
  party: string;
}
interface FeedbackItem {
  _id: string;
  type: 'feedback' | 'complaint';
  subject: string;
  message: string;
  category: string;
  targetRole?: string;
  status: string;
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
  createdAt: string;
}

interface NoticeItem {
  _id: string;
  subject: string;
  message: string;
  type: 'info' | 'warning' | 'urgent' | 'action_required';
  isRead: boolean;
  createdAt: string;
  senderName?: string;
}

// ── Per-election vote record ──────────────────────────────────────
interface VoteRecord {
  voted: boolean;
  candidateName: string;
  hash: string;
  time: string;
  title: string;
}

const COLORS = ['#1a56db','#7e3af2','#0e9f6e','#ff5a1f','#e3a008','#e11d48','#0891b2'];

const CATEGORIES = ['General','EVM Issue','Booth Issue','Staff Behaviour','Process Issue','Other'];

// ── AreaElectionsPreview — shows elections for selected area inside picker ──
function AreaElectionsPreview({ areaFilter, locStates, locDistricts, locSubdistricts, locLocalities, token, isDark, border, bgCard2, textPri, textSec, textMuted }: any) {
  const [areaElections, setAreaElections] = useState<any[]>([]);
  const [loading, setLoading]             = useState(false);

  useEffect(() => {
    if (!areaFilter?.state) return;
    setLoading(true);
    const tk = token || localStorage.getItem('token');
    fetch('https://sovs-backend-bf8j.onrender.com/api/elections', { headers: { Authorization: `Bearer ${tk}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const filtered = d.data.filter((e: any) => {
            const el = e.location;
            if (!el || (!el.state && !el.district && !el.subdistrict && !el.locality)) return true;
            if (areaFilter.locality    && el.locality)    return el.locality.toString()    === areaFilter.locality;
            if (areaFilter.subdistrict && el.subdistrict) return el.subdistrict.toString() === areaFilter.subdistrict;
            if (areaFilter.district    && el.district)    return el.district.toString()    === areaFilter.district;
            if (areaFilter.state       && el.state)       return el.state.toString()       === areaFilter.state;
            return false;
          });
          setAreaElections(filtered);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [areaFilter?.state, areaFilter?.district, areaFilter?.subdistrict, areaFilter?.locality]);

  if (loading) return (
    <div style={{ padding:'12px', textAlign:'center', color:textMuted, fontSize:12 }}>Loading elections for this area...</div>
  );

  if (areaElections.length === 0) return (
    <div style={{ padding:'14px 16px', background: isDark?'rgba(245,158,11,0.08)':'#fffbeb', borderRadius:12, border:`1px solid ${isDark?'rgba(245,158,11,0.2)':'#fde68a'}`, fontSize:12, color: isDark?'#fbbf24':'#92400e' }}>
      ℹ️ No elections found for this area yet. Admin can create elections with area restrictions.
    </div>
  );

  return (
    <div>
      <p style={{ margin:'0 0 8px', fontSize:11, fontWeight:700, color:textMuted, textTransform:'uppercase', letterSpacing:'0.8px' }}>
        🗳️ Elections in this Area ({areaElections.length})
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {areaElections.map((e: any) => (
          <div key={e._id} className="area-election-row" style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:bgCard2, borderRadius:12, border:`1px solid ${border}`, transition:'all 0.18s ease' }}>
            <div style={{ width:36, height:36, borderRadius:10, background: e.status==='active'?'rgba(34,197,94,0.15)':'rgba(100,116,139,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:18 }}>{e.status==='active'?'🟢':e.status==='upcoming'?'🟡':'⚫'}</span>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ margin:0, fontSize:13, fontWeight:600, color:textPri, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.title}</p>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:2 }}>
                <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background: e.status==='active'?'rgba(34,197,94,0.15)':e.status==='upcoming'?'rgba(245,158,11,0.15)':'rgba(100,116,139,0.15)', color: e.status==='active'?'#16a34a':e.status==='upcoming'?'#d97706':'#64748b', fontWeight:600 }}>
                  {e.status.toUpperCase()}
                </span>
                <span style={{ fontSize:11, color:textMuted }}>{e.candidates?.length || 0} candidates</span>
                {e.location?.label && <span style={{ fontSize:11, color:'#6366f1' }}>📍 {e.location.label}</span>}
              </div>
            </div>
            <span style={{ fontSize:11, color:textMuted, flexShrink:0 }}>
              {new Date(e.endDate).toLocaleDateString('en-IN')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VoterDashboard() {
  const navigate = useNavigate();

  const [user, setUser]                   = useState<VoterUser | null>(null);
  const [elections, setElections]         = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);

  // ── Per-election voted map (replaces flat hasVoted/votedFor booleans) ──
  const [votedMap, setVotedMap] = useState<Record<string, VoteRecord>>({});

  // Derive current election's vote state
  const currentVoteRecord = selectedElection ? votedMap[selectedElection._id] : undefined;
  const hasVoted    = !!currentVoteRecord?.voted;
  const votedFor    = currentVoteRecord?.candidateName || '';

  // For receipt tab — show the first voted election, or current selection
  const [receiptElectionId, setReceiptElectionId] = useState<string>('');
  const receiptRecord = receiptElectionId ? votedMap[receiptElectionId] : undefined;

  // legacy single-field states kept only for receipt display & download
  const [voteHash, setVoteHash]           = useState('');
  const [voteTime, setVoteTime]           = useState('');
  const [electionTitle, setElectionTitle] = useState('');

  const [activeTab, setActiveTab]         = useState<'vote'|'results'|'activity'|'receipt'|'feedback'|'notices'>('vote');

  // ── dark mode ────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') return document.documentElement.classList.contains('dark');
    return false;
  });
  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    next ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
  };

  // ── unread notices count ──────────────────────────────────────────
  const [unreadNotices, setUnreadNotices] = useState(0);
  const [confirming, setConfirming]       = useState<Candidate | null>(null);
  const [timeLeft, setTimeLeft]           = useState(14400);
  const [casting, setCasting]             = useState(false);
  const [verifying, setVerifying]         = useState(true);
  const [loading, setLoading]             = useState(false);

  // voter location
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locStates,       setLocStates]       = useState<any[]>([]);
  const [locDistricts,    setLocDistricts]    = useState<any[]>([]);
  const [locSubdistricts, setLocSubdistricts] = useState<any[]>([]);
  const [locLocalities,   setLocLocalities]   = useState<any[]>([]);
  const [selectedLoc,     setSelectedLoc]     = useState<LocationVal>({});
  const [savingLoc,       setSavingLoc]       = useState(false);

  // name edit
  const [editingName, setEditingName]     = useState(false);
  const [newName, setNewName]             = useState('');
  const [savingName, setSavingName]       = useState(false);

  // ── live results state ───────────────────────────────────────────
  const [resultsElections, setResultsElections]   = useState<any[]>([]);
  const [selectedResultElection, setSelectedResultElection] = useState<any>(null);
  const [liveResults, setLiveResults]             = useState<any>(null);
  const [loadingResults, setLoadingResults]       = useState(false);
  const [resultsRefreshCount, setResultsRefreshCount] = useState(0);

  // results area filter
  const [resStates,       setResStates]       = useState<any[]>([]);
  const [resDistricts,    setResDistricts]    = useState<any[]>([]);
  const [resSubdistricts, setResSubdistricts] = useState<any[]>([]);
  const [resLocalities,   setResLocalities]   = useState<any[]>([]);
  const [resAreaFilter,   setResAreaFilter]   = useState<any>({});
  const [resAreaLabel,    setResAreaLabel]    = useState('');

  // ── feedback/complaint state ──────────────────────────────────
  const [feedbackTab, setFeedbackTab]     = useState<'submit'|'history'>('submit');
  const [feedbackType, setFeedbackType]   = useState<'feedback'|'complaint'>('feedback');
  const [fbSubject, setFbSubject]         = useState('');
  const [fbMessage, setFbMessage]         = useState('');
  const [fbCategory, setFbCategory]       = useState('General');
  const [fbTargetRole, setFbTargetRole]   = useState<'dm'|'sdm'|'cdo'|'admin'>('dm');
  const [fbElection, setFbElection]       = useState('');
  const [submittingFb, setSubmittingFb]   = useState(false);
  const [myFeedbacks, setMyFeedbacks]     = useState<FeedbackItem[]>([]);
  const [loadingFb, setLoadingFb]         = useState(false);
  const [expandedFb, setExpandedFb]       = useState<string | null>(null);

  // ── notices state ─────────────────────────────────────────────
  const [notices, setNotices]             = useState<NoticeItem[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [expandedNotice, setExpandedNotice] = useState<string | null>(null);

  // ── fetch elections ───────────────────────────────────────────
  const fetchElections = async (token: string) => {
    try {
      const res  = await fetch(`${API}/elections`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        const active = data.data.filter((e: Election) => e.status === 'active');
        setElections(active);
        if (active.length > 0) setSelectedElection(active[0]);
        return active;
      }
    } catch {}
    return [];
  };

  // ── check vote status — now checks ALL elections and builds a map ──
  const checkVoteStatus = async (token: string, electionList: Election[]) => {
    if (!electionList || electionList.length === 0) return;
    const newMap: Record<string, VoteRecord> = {};

    for (const election of electionList) {
      try {
        const res  = await fetch(`${API}/votes/has-voted/${election._id}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success && data.hasVoted) {
          try {
            const rRes  = await fetch(`${API}/votes/receipt/${election._id}`, { headers: { Authorization: `Bearer ${token}` } });
            const rData = await rRes.json();
            if (rData.success && rData.receipt) {
              newMap[election._id] = {
                voted:         true,
                candidateName: rData.receipt.candidateName || 'Recorded',
                hash:          rData.receipt.hash || '',
                time:          rData.receipt.castAt
                  ? new Date(rData.receipt.castAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                  : '',
                title: rData.receipt.electionTitle || election.title,
              };
              continue;
            }
          } catch {}
          newMap[election._id] = {
            voted: true, candidateName: 'Recorded',
            hash: '', time: '', title: election.title,
          };
        }
      } catch {}
    }

    setVotedMap(newMap);

    // Set receipt tab to first voted election
    const firstVoted = electionList.find(e => newMap[e._id]?.voted);
    if (firstVoted) {
      const v = newMap[firstVoted._id];
      setReceiptElectionId(firstVoted._id);
      setVoteHash(v.hash);
      setVoteTime(v.time);
      setElectionTitle(v.title);
      setActiveTab('receipt');
    } else {
      setActiveTab('vote');
    }
  };

  // ── fetch my feedbacks ────────────────────────────────────────
  const fetchMyFeedbacks = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoadingFb(true);
    try {
      const res  = await fetch(`${API}/feedback/my`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setMyFeedbacks(data.data);
    } catch {}
    setLoadingFb(false);
  };

  // ── fetch notices ─────────────────────────────────────────────
  const fetchNotices = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoadingNotices(true);
    try {
      const res  = await fetch(`${API}/notices/my`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setNotices(data.data);
        setUnreadNotices(data.data.filter((n: NoticeItem) => !n.isRead).length);
      }
    } catch {}
    setLoadingNotices(false);
  };

  // ── mark a notice as read ────────────────────────────────────
  const markNoticeRead = async (noticeId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`${API}/notices/${noticeId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotices(prev => prev.map(n => n._id === noticeId ? { ...n, isRead: true } : n));
      setUnreadNotices(prev => Math.max(0, prev - 1));
    } catch {}
  };

  // ── mark all notices as read ─────────────────────────────────
  const markAllRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`${API}/notices/mark-all-read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotices(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotices(0);
    } catch {}
  };

  // ── fetch elections for results (all active+ended) ─────────────
  const fetchResultsElections = async (areaFilter?: any) => {
    const token = localStorage.getItem('token');
    try {
      const res  = await fetch(`${API}/elections`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        let list = data.data.filter((e: any) => e.status === 'active' || e.status === 'ended');
        if (areaFilter && (areaFilter.state || areaFilter.district || areaFilter.subdistrict || areaFilter.locality)) {
          list = list.filter((e: any) => {
            const el = e.location;
            if (!el || (!el.state && !el.district && !el.subdistrict && !el.locality)) return true;
            if (areaFilter.locality    && el.locality)    return el.locality.toString()    === areaFilter.locality;
            if (areaFilter.subdistrict && el.subdistrict) return el.subdistrict.toString() === areaFilter.subdistrict;
            if (areaFilter.district    && el.district)    return el.district.toString()    === areaFilter.district;
            if (areaFilter.state       && el.state)       return el.state.toString()       === areaFilter.state;
            return true;
          });
        }
        setResultsElections(list);
        if (list.length > 0 && !selectedResultElection) setSelectedResultElection(list[0]);
        else if (list.length > 0 && selectedResultElection) {
          const stillExists = list.find((e: any) => e._id === selectedResultElection._id);
          if (stillExists) setSelectedResultElection(stillExists);
          else setSelectedResultElection(list[0]);
        }
      }
    } catch {}
  };

  // ── fetch live results for selected election ──────────────────
  const fetchLiveResults = async (electionId: string) => {
    setLoadingResults(true);
    try {
      const token = localStorage.getItem('token');
      const res  = await fetch(`${API}/elections/${electionId}/results`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setLiveResults(data.data);
    } catch {}
    setLoadingResults(false);
  };

  // ── area cascade for results ──────────────────────────────────
  const fetchResDistricts    = async (id: string) => { const r = await fetch(`${API}/locations?type=district&parent=${id}`);    const d = await r.json(); if(d.success) setResDistricts(d.data);    setResSubdistricts([]); setResLocalities([]); };
  const fetchResSubdistricts = async (id: string) => { const r = await fetch(`${API}/locations?type=subdistrict&parent=${id}`); const d = await r.json(); if(d.success) setResSubdistricts(d.data); setResLocalities([]); };
  const fetchResLocalities   = async (id: string) => { const r = await fetch(`${API}/locations?type=locality&parent=${id}`);    const d = await r.json(); if(d.success) setResLocalities(d.data); };

  const handleResAreaChange = (level: string, id: string, lists: any) => {
    let next: any = { ...resAreaFilter };
    if (level === 'state')            { next = { state: id }; setResDistricts([]); setResSubdistricts([]); setResLocalities([]); fetchResDistricts(id); }
    else if (level === 'district')    { next = { ...next, district: id, subdistrict: undefined, locality: undefined }; setResSubdistricts([]); setResLocalities([]); fetchResSubdistricts(id); }
    else if (level === 'subdistrict') { next = { ...next, subdistrict: id, locality: undefined }; setResLocalities([]); fetchResLocalities(id); }
    else if (level === 'locality')    { next = { ...next, locality: id }; }
    setResAreaFilter(next);
    const parts: string[] = [];
    if (level === 'state' || next.state)             { const s = resStates.find((x:any)=>x._id===(level==='state'?id:next.state));             if(s) parts.push(s.name); }
    if ((level === 'district' || next.district) && level !== 'state')     { const d = resDistricts.find((x:any)=>x._id===(level==='district'?id:next.district));       if(d) parts.push(d.name); }
    if ((level === 'subdistrict' || next.subdistrict) && !['state','district'].includes(level)) { const s = resSubdistricts.find((x:any)=>x._id===(level==='subdistrict'?id:next.subdistrict)); if(s) parts.push(s.name); }
    if (level === 'locality' && next.locality)        { const l = resLocalities.find((x:any)=>x._id===id); if(l) parts.push(l.name); }
    setResAreaLabel(parts.join(' › '));
    setSelectedResultElection(null);
    setLiveResults(null);
    fetchResultsElections(next);
  };

  // ── auth guard ────────────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem('user');
    const parsed: VoterUser | null = raw ? JSON.parse(raw) : null;
    if (!parsed || parsed.role !== 'voter') { navigate('/', { replace: true }); return; }
    setUser(parsed); setNewName(parsed.name);
    if (parsed.voterLocation) setSelectedLoc(parsed.voterLocation);
    fetch(`${API}/locations?type=state`).then(r => r.json()).then(d => { if(d.success) setLocStates(d.data); }).catch(() => {});
    fetch(`${API}/locations?type=state`).then(r => r.json()).then(d => { if(d.success) setResStates(d.data); }).catch(() => {});

    const tk = localStorage.getItem('token');
    if (tk) {
      fetch(`${API}/notices/my`, { headers: { Authorization: `Bearer ${tk}` } })
        .then(r => r.json())
        .then(d => { if (d.success) setUnreadNotices(d.data.filter((n: any) => !n.isRead).length); })
        .catch(() => {});
    }

    // Reset all vote state
    setVotedMap({});
    setVoteHash(''); setVoteTime(''); setElectionTitle(''); setReceiptElectionId('');

    const token = localStorage.getItem('token');
    if (!token) { setVerifying(false); return; }
    const init = async () => {
      setVerifying(true);
      const electionList = await fetchElections(token);
      await checkVoteStatus(token, electionList);
      setVerifying(false);
    };
    init();
  }, [navigate]);

  // countdown
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  // fetch feedbacks when tab opens
  useEffect(() => {
    if (activeTab === 'feedback' && feedbackTab === 'history') fetchMyFeedbacks();
  }, [activeTab, feedbackTab]);

  // fetch notices when notices tab opens
  useEffect(() => {
    if (activeTab === 'notices') fetchNotices();
  }, [activeTab]);

  // fetch results elections when results tab opens
  useEffect(() => {
    if (activeTab === 'results') {
      fetchResultsElections(resAreaFilter);
    }
  }, [activeTab]);

  // auto-refresh live results every 10s when viewing results tab
  useEffect(() => {
    if (activeTab !== 'results' || !selectedResultElection) return;
    fetchLiveResults(selectedResultElection._id);
    const interval = setInterval(() => {
      fetchLiveResults(selectedResultElection._id);
      setResultsRefreshCount(c => c + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab, selectedResultElection?._id]);

  const fmt = (s: number) => {
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  // ── location cascade ──────────────────────────────────────────
  const fetchLocDistricts    = async (id: string) => { const r = await fetch(`${API}/locations?type=district&parent=${id}`);    const d = await r.json(); if(d.success) setLocDistricts(d.data);    setLocSubdistricts([]); setLocLocalities([]); };
  const fetchLocSubdistricts = async (id: string) => { const r = await fetch(`${API}/locations?type=subdistrict&parent=${id}`); const d = await r.json(); if(d.success) setLocSubdistricts(d.data); setLocLocalities([]); };
  const fetchLocLocalities   = async (id: string) => { const r = await fetch(`${API}/locations?type=locality&parent=${id}`);    const d = await r.json(); if(d.success) setLocLocalities(d.data); };

  const handleLocChange = (level: string, id: string, list: any[]) => {
    let next: LocationVal = { ...selectedLoc };
    if (level === 'state')            { next = { state: id }; setLocDistricts([]); setLocSubdistricts([]); setLocLocalities([]); fetchLocDistricts(id); }
    else if (level === 'district')    { next = { ...next, district: id, subdistrict: undefined, locality: undefined }; setLocSubdistricts([]); setLocLocalities([]); fetchLocSubdistricts(id); }
    else if (level === 'subdistrict') { next = { ...next, subdistrict: id, locality: undefined }; setLocLocalities([]); fetchLocLocalities(id); }
    else if (level === 'locality')    { next = { ...next, locality: id }; }
    setSelectedLoc(next);
  };

  // ── save location ─────────────────────────────────────────────
  const handleSaveLocation = async () => {
    if (!user) return;
    setSavingLoc(true);
    const parts: string[] = [];
    if (selectedLoc.state)       { const s = locStates.find((x:any)=>x._id===selectedLoc.state);             if(s) parts.push(s.name); }
    if (selectedLoc.district)    { const d = locDistricts.find((x:any)=>x._id===selectedLoc.district);       if(d) parts.push(d.name); }
    if (selectedLoc.subdistrict) { const s = locSubdistricts.find((x:any)=>x._id===selectedLoc.subdistrict); if(s) parts.push(s.name); }
    if (selectedLoc.locality)    { const l = locLocalities.find((x:any)=>x._id===selectedLoc.locality);      if(l) parts.push(l.name); }
    const label = parts.join(', ');
    const locWithLabel = { ...selectedLoc, label };
    try {
      const token  = localStorage.getItem('token');
      const userId = user._id || user.id;
      const res    = await fetch(`${API}/users/${userId}/update-location`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ voterLocation: locWithLabel }) });
      const data   = await res.json();
      if (data.success) {
        const updated = { ...user, voterLocation: locWithLabel } as VoterUser;
        setUser(updated); localStorage.setItem('user', JSON.stringify(updated)); localStorage.setItem('currentUser', JSON.stringify(updated));
        toast.success('📍 Location saved!');
        setShowLocationPicker(false);
        const token2 = localStorage.getItem('token');
        if (token2) {
          const el = await fetchElections(token2);
          await checkVoteStatus(token2, el);
        }
      } else { toast.error(data.message || 'Failed to save location'); }
    } catch { toast.error('Cannot reach server'); }
    setSavingLoc(false);
  };

  const isVoterAreaMatch = (election: Election): boolean => {
    const el = (election as any).location;
    const vl = user?.voterLocation;
    if (!el || (!el.state && !el.district && !el.subdistrict && !el.locality)) return true;
    if (!vl || !vl.state) return false;
    if (el.locality    && vl.locality)    return el.locality?.toString()    === vl.locality?.toString();
    if (el.subdistrict && vl.subdistrict) return el.subdistrict?.toString() === vl.subdistrict?.toString();
    if (el.district    && vl.district)    return el.district?.toString()    === vl.district?.toString();
    if (el.state       && vl.state)       return el.state?.toString()       === vl.state?.toString();
    return false;
  };

  const handleRefresh = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    // Reset all vote state
    setVotedMap({});
    setVoteHash(''); setVoteTime(''); setElectionTitle(''); setReceiptElectionId('');
    const el = await fetchElections(token);
    await checkVoteStatus(token, el);
    setLoading(false);
    toast.success('Refreshed from database');
  };

  const handleSaveName = async () => {
    if (!newName.trim()) { toast.error('Name cannot be empty'); return; }
    if (newName.trim() === user?.name) { setEditingName(false); return; }
    setSavingName(true);
    try {
      const token  = localStorage.getItem('token');
      const userId = user?._id || user?.id;
      await fetch(`${API}/users/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: newName.trim() }) });
    } catch {}
    const updated = { ...user, name: newName.trim() } as VoterUser;
    setUser(updated); localStorage.setItem('user', JSON.stringify(updated)); localStorage.setItem('currentUser', JSON.stringify(updated));
    toast.success('Name updated!'); setEditingName(false); setSavingName(false);
  };

  const confirmVote = async () => {
    if (!confirming || !user || !selectedElection) return;
    setCasting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) { toast.error('Not authenticated'); setCasting(false); return; }
      const res  = await fetch(`${API}/votes/cast`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ electionId: selectedElection._id, candidateId: confirming._id }) });
      const data = await res.json();
      if (data.success) {
        const newRecord: VoteRecord = {
          voted:         true,
          candidateName: confirming.name,
          hash:          data.receipt?.hash || '',
          time:          new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          title:         selectedElection.title,
        };
        // Update per-election map — other elections are NOT affected
        setVotedMap(prev => ({ ...prev, [selectedElection._id]: newRecord }));
        // Update receipt state
        setReceiptElectionId(selectedElection._id);
        setVoteHash(newRecord.hash);
        setVoteTime(newRecord.time);
        setElectionTitle(newRecord.title);
        setConfirming(null);
        setActiveTab('receipt');
        toast.success(`✅ Vote cast for ${confirming.name}!`);
      } else if (data.message?.includes('already voted')) {
        toast.error('You have already voted in this election!');
        await handleRefresh();
        setConfirming(null);
      } else if (data.notEligible) {
        toast.error('🚫 ' + data.message, { duration: 6000 }); setConfirming(null);
      } else if (data.areaLocked) {
        toast.error('🚫 ' + data.message, { duration: 6000 }); setConfirming(null);
      } else { toast.error(data.message || 'Failed to cast vote'); }
    } catch { toast.error('Cannot reach server'); }
    setCasting(false);
  };

  // ── submit feedback / complaint ───────────────────────────────
  const handleSubmitFeedback = async () => {
    if (!fbSubject.trim() || !fbMessage.trim()) { toast.error('Subject and message are required'); return; }
    setSubmittingFb(true);
    try {
      const token = localStorage.getItem('token');
      const body: any = {
        type:     feedbackType,
        subject:  fbSubject.trim(),
        message:  fbMessage.trim(),
        category: fbCategory,
      };
      if (feedbackType === 'complaint') body.targetRole = fbTargetRole;
      if (fbElection) {
        body.electionId    = fbElection;
        body.electionTitle = elections.find(e => e._id === fbElection)?.title || '';
      }
      const res  = await fetch(`${API}/feedback`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        toast.success(feedbackType === 'complaint' ? '✅ Complaint submitted!' : '✅ Feedback submitted! Thank you.');
        setFbSubject(''); setFbMessage(''); setFbCategory('General'); setFbElection('');
        setFeedbackTab('history');
        fetchMyFeedbacks();
      } else { toast.error(data.message || 'Failed to submit'); }
    } catch { toast.error('Cannot reach server'); }
    setSubmittingFb(false);
  };

  const downloadReceipt = () => {
    if (!user) return;
    const rec = receiptElectionId ? votedMap[receiptElectionId] : undefined;
    const displayTitle     = rec?.title     || electionTitle;
    const displayCandidate = rec?.candidateName || '';
    const displayTime      = rec?.time      || voteTime;
    const displayHash      = rec?.hash      || voteHash;
    const lines = [
      '╔══════════════════════════════════════╗',
      '║        SECUREVOTE PRO  RECEIPT       ║',
      '╚══════════════════════════════════════╝',
      '',
      `  Voter ID    : ${user.voterId || user._id}`,
      `  Voter Name  : ${user.name}`,
      user.aadhaarNumber ? `  Aadhaar No. : ${user.aadhaarNumber}` : '',
      user.eciCardNumber ? `  ECI Card    : ${user.eciCardNumber}` : '',
      `  Election    : ${displayTitle}`,
      `  Candidate   : ${displayCandidate}`,
      `  Status      : VOTE RECORDED IN DATABASE`,
      `  Timestamp   : ${displayTime}`,
      `  Hash        : ${displayHash}`,
      '',
      '  Stored in votes collection.',
      '  Blockchain-verified. Immutable.',
    ].filter(Boolean).join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = `receipt_${user.voterId||user.id}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const logout = () => {
    localStorage.removeItem('user'); localStorage.removeItem('token'); localStorage.removeItem('currentUser');
    navigate('/', { replace: true });
  };

  const statusColor = (s: string) => {
    if (s === 'Resolved')  return { bg: '#dcfce7', color: '#15803d' };
    if (s === 'Reviewed')  return { bg: '#dbeafe', color: '#1d4ed8' };
    if (s === 'Dismissed') return { bg: '#fee2e2', color: '#dc2626' };
    return { bg: '#fef3c7', color: '#92400e' };
  };

  // ── any election voted? (for nav badge / global display) ─────
  const anyVoted     = Object.values(votedMap).some(v => v.voted);
  const votedCount   = Object.values(votedMap).filter(v => v.voted).length;

  if (verifying) return (
    <div style={{ minHeight:'100vh', background: isDark?'#0f172a':'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ width:48, height:48, borderRadius:'50%', border:`4px solid ${isDark?'#1e293b':'#e2e8f0'}`, borderTopColor:'#1a56db', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <p style={{ color: isDark?'#94a3b8':'#64748b', fontSize:14, fontWeight:500 }}>Checking vote status from database...</p>
    </div>
  );

  if (!user) return null;

  const activities = [
    { icon:<ShieldCheck size={16}/>, text:'Election started',              time:'1 hour ago',     color:'#0e9f6e' },
    { icon:<Users       size={16}/>, text:'Voters actively casting votes', time:'45 minutes ago', color:'#1a56db' },
    { icon:<BarChart3   size={16}/>, text:'High turnout detected',         time:'20 minutes ago', color:'#7e3af2' },
    { icon:<Activity    size={16}/>, text:'Live results being processed',  time:'5 minutes ago',  color:'#ff5a1f' },
  ];

  const dk = isDark;
  const bg        = dk ? '#0f172a' : '#f8fafc';
  const bgCard    = dk ? '#1e293b' : '#ffffff';
  const bgCard2   = dk ? '#273549' : '#f8fafc';
  const border    = dk ? '#334155' : '#e2e8f0';
  const textPri   = dk ? '#f1f5f9' : '#1e293b';
  const textSec   = dk ? '#94a3b8' : '#64748b';
  const textMuted = dk ? '#64748b' : '#94a3b8';
  const navBg     = dk ? '#1e293b' : '#ffffff';
  const inputBg   = dk ? '#273549' : '#ffffff';
  const hoverBg   = dk ? '#273549' : '#f1f5f9';

  return (
    <div style={{ minHeight:'100vh', background:bg, fontFamily:"'Segoe UI',sans-serif", transition:'background 0.3s ease, color 0.3s ease' }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(8px)  } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideIn { from { opacity:0; transform:translateX(-8px) } to { opacity:1; transform:translateX(0) } }
        @keyframes ping    { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(2);opacity:0} }

        button, a, [role="button"] { transition: all 0.18s ease !important; }

        .nav-icon-btn { transition: all 0.18s ease !important; }
        .nav-icon-btn:hover { background: #3b82f6 !important; color: #fff !important; border-color: #3b82f6 !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.3) !important; }

        .dark-toggle:hover { transform: rotate(15deg) scale(1.1) !important; box-shadow: 0 4px 14px rgba(26,86,219,0.4) !important; }
        .logout-btn:hover { background: #fef2f2 !important; border-color: #fca5a5 !important; color: #dc2626 !important; transform: translateY(-1px); }
        .refresh-btn:hover { background: #eff6ff !important; border-color: #93c5fd !important; color: #1a56db !important; transform: translateY(-1px); }
        .bell-btn:hover { background: #fef3c7 !important; border-color: #fcd34d !important; color: #d97706 !important; transform: translateY(-1px); }

        .voter-tab-btn:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important; }

        .voter-card-hover { transition: all 0.2s ease !important; }
        .voter-card-hover:hover { transform: translateY(-3px) !important; box-shadow: 0 10px 28px rgba(0,0,0,0.13) !important; }

        .voter-candidate-card { transition: all 0.2s ease !important; }
        .voter-candidate-card:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(26,86,219,0.14) !important; border-color: #1a56db !important; }

        .vote-btn:hover { transform: scale(1.05) !important; box-shadow: 0 4px 14px rgba(0,0,0,0.2) !important; }
        .vote-btn:active { transform: scale(0.97) !important; }

        .election-pill:hover { transform: translateY(-1px) !important; box-shadow: 0 3px 10px rgba(26,86,219,0.15) !important; }

        .btn-primary:hover { opacity: 0.92; transform: translateY(-1px) !important; box-shadow: 0 6px 18px rgba(26,86,219,0.3) !important; }
        .btn-primary:active { transform: translateY(0) !important; }
        .btn-secondary:hover { background: #eff6ff !important; border-color: #93c5fd !important; color: #1a56db !important; transform: translateY(-1px); }
        .btn-danger:hover { opacity: 0.9; transform: translateY(-1px) !important; box-shadow: 0 4px 14px rgba(220,38,38,0.25) !important; }

        .fb-type-card:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 16px rgba(0,0,0,0.1) !important; }
        .role-btn:hover { transform: scale(1.04) !important; box-shadow: 0 3px 10px rgba(0,0,0,0.12) !important; }
        .fb-history-item:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.08) !important; transform: translateX(2px) !important; }

        .loc-pill:hover { transform: scale(1.04) translateY(-1px) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important; }
        .download-btn:hover { background: #eff6ff !important; border-color: #93c5fd !important; color: #1a56db !important; transform: translateY(-1px); }
        .id-card-btn:hover { background: rgba(255,255,255,0.35) !important; transform: scale(1.05) !important; }
        .set-area-btn:hover { background: rgba(255,255,255,0.3) !important; transform: translateY(-1px) !important; }
        .results-refresh:hover { background: #eff6ff !important; border-color: #93c5fd !important; color: #1a56db !important; }
        .area-election-row:hover { transform: translateX(4px) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important; }
        .fb-expand-row:hover { background: var(--hover-bg, rgba(0,0,0,0.03)) !important; }

        .submit-btn:hover { opacity: 0.92; transform: translateY(-1px) !important; box-shadow: 0 6px 20px rgba(0,0,0,0.2) !important; }
        .submit-btn:disabled { opacity: 0.5 !important; transform: none !important; box-shadow: none !important; cursor: not-allowed !important; }

        .confirm-vote-btn:hover { box-shadow: 0 6px 20px rgba(26,86,219,0.35) !important; transform: translateY(-1px) !important; }
        .confirm-vote-btn:disabled { opacity: 0.65 !important; transform: none !important; }
        .cancel-btn:hover { background: #f1f5f9 !important; }
        .text-link:hover { text-decoration: underline; opacity: 0.8; }
      `}</style>

      {/* NAV */}
      <nav style={{ background:navBg, borderBottom:`1px solid ${border}`, padding:'0 20px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, boxShadow: dk?'0 1px 0 #334155':'0 1px 0 #e2e8f0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#1a56db,#7e3af2)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(26,86,219,0.3)' }}>
            <ShieldCheck size={20} color="#fff"/>
          </div>
          <div>
            <span style={{ fontWeight:800, fontSize:15, color:textPri, letterSpacing:'-0.3px' }}>SecureVote Pro</span>
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block', animation:'pulse 2s infinite' }}/>
              <span style={{ fontSize:10, color:'#22c55e', fontWeight:600 }}>LIVE</span>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {/* Vote status pill — shows per-election status */}
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:20, background: hasVoted?'rgba(34,197,94,0.12)':'rgba(245,158,11,0.12)', border: `1px solid ${hasVoted?'rgba(34,197,94,0.3)':'rgba(245,158,11,0.3)'}` }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background: hasVoted?'#22c55e':'#f59e0b', display:'inline-block' }}/>
            <span style={{ fontSize:12, fontWeight:600, color: hasVoted?'#15803d':'#92400e' }}>
              {hasVoted ? `Voted (${selectedElection?.title?.substring(0,18)}...)` : votedCount > 0 ? `Voted ${votedCount} election${votedCount>1?'s':''}` : 'Not Voted'}
            </span>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:10, background:hoverBg }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#1a56db,#7e3af2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, color:'#fff', flexShrink:0 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ lineHeight:1.2 }}>
              <p style={{ margin:0, fontSize:12, fontWeight:600, color:textPri }}>{user.name}</p>
              {user.voterId && <p style={{ margin:0, fontSize:10, color:textMuted, fontFamily:'monospace' }}>{user.voterId}</p>}
            </div>
          </div>

          <button onClick={() => { setActiveTab('notices'); fetchNotices(); }}
            className="nav-icon-btn bell-btn" style={{ position:'relative', width:36, height:36, borderRadius:10, border:`1px solid ${border}`, background:bgCard, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:textSec }}>
            <Bell size={16}/>
            {unreadNotices > 0 && (
              <span style={{ position:'absolute', top:-4, right:-4, width:16, height:16, borderRadius:'50%', background:'#ef4444', color:'#fff', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {unreadNotices}
              </span>
            )}
          </button>

          <button onClick={handleRefresh} disabled={loading}
            className="nav-icon-btn refresh-btn" style={{ width:36, height:36, borderRadius:10, border:`1px solid ${border}`, background:bgCard, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:textSec }}>
            <RefreshCw size={15} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }}/>
          </button>

          <button onClick={toggleDark}
            className="dark-toggle" style={{ width:36, height:36, borderRadius:10, border:`1px solid ${border}`, background: dk?'#1a56db':'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color: dk?'#fff':'#64748b', boxShadow: dk?'0 2px 8px rgba(26,86,219,0.3)':'none', transition:'all 0.2s ease' }}>
            {dk ? <Sun size={16}/> : <Moon size={16}/>}
          </button>

          <button onClick={logout}
            className="logout-btn" style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:10, border:`1px solid ${border}`, background:bgCard, color:'#ef4444', cursor:'pointer', fontSize:12, fontWeight:600 }}>
            <LogOut size={13}/> Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:980, margin:'0 auto', padding:'24px 20px' }}>

        {/* IDENTITY CARD */}
        <div style={{ background:'linear-gradient(135deg,#1a56db,#7e3af2)', borderRadius:16, padding:'20px 24px', marginBottom:24, color:'#fff', boxShadow:'0 8px 32px rgba(26,86,219,0.25)', animation:'fadeIn 0.4s ease' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:54, height:54, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <User size={28} color="#fff"/>
              </div>
              <div>
                {editingName ? (
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => { if(e.key==='Enter') handleSaveName(); if(e.key==='Escape'){setEditingName(false);setNewName(user.name);} }}
                      style={{ border:'none', borderBottom:'2px solid rgba(255,255,255,0.8)', background:'transparent', color:'#fff', fontSize:17, fontWeight:700, outline:'none', width:200 }}/>
                    <button onClick={handleSaveName} disabled={savingName} className="id-card-btn" style={{ background:'rgba(255,255,255,0.3)', border:'none', borderRadius:6, padding:'4px 10px', cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', gap:4, fontSize:12 }}>
                      <Save size={12}/>{savingName?'...':'Save'}
                    </button>
                    <button onClick={() => {setEditingName(false); setNewName(user.name);}} className="id-card-btn" style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:6, padding:'4px 8px', cursor:'pointer', color:'#fff' }}>
                      <X size={12}/>
                    </button>
                  </div>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <p style={{ margin:0, fontSize:18, fontWeight:700 }}>{user.name}</p>
                    <button onClick={() => setEditingName(true)} className="id-card-btn" style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:6, padding:'3px 8px', cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', gap:4, fontSize:11 }}>
                      <Edit2 size={10}/> Edit
                    </button>
                  </div>
                )}
                <p style={{ margin:'0 0 8px', fontSize:12, opacity:0.75 }}>{user.voterId} · Registered Voter</p>
                {user.aadhaarNumber && (
                  <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.18)', borderRadius:8, padding:'5px 12px', marginRight:8 }}>
                    <span style={{ fontSize:14 }}>🪪</span>
                    <div>
                      <p style={{ margin:0, fontSize:10, opacity:0.75 }}>AADHAAR NUMBER</p>
                      <p style={{ margin:0, fontSize:13, fontWeight:700, letterSpacing:1 }}>{user.aadhaarNumber}</p>
                    </div>
                  </div>
                )}
                {user.eciCardNumber && (
                  <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.18)', borderRadius:8, padding:'5px 12px' }}>
                    <span style={{ fontSize:14 }}>🗳️</span>
                    <div>
                      <p style={{ margin:0, fontSize:10, opacity:0.75 }}>ECI CARD NUMBER</p>
                      <p style={{ margin:0, fontSize:13, fontWeight:700, letterSpacing:1 }}>{user.eciCardNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <button onClick={() => setShowLocationPicker(true)}
                className="set-area-btn" style={{ marginBottom:8, display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.18)', border:'none', borderRadius:8, padding:'5px 12px', cursor:'pointer', color:'#fff', fontSize:12, fontWeight:500 }}>
                📍 {user.voterLocation?.label ? user.voterLocation.label.split(',')[0] + '...' : 'Set Your Area'}
              </button>
              <p style={{ margin:'0 0 4px', fontSize:11, opacity:0.7 }}>VOTE STATUS</p>
              <div style={{ background: hasVoted?'rgba(22,163,74,0.3)':'rgba(255,255,255,0.15)', borderRadius:10, padding:'8px 16px', border: hasVoted?'1px solid rgba(22,163,74,0.5)':'1px solid rgba(255,255,255,0.3)' }}>
                <p style={{ margin:0, fontSize:16, fontWeight:700 }}>
                  {hasVoted ? '✅ Vote Cast' : votedCount > 0 ? `✅ ${votedCount} Vote${votedCount>1?'s':''} Cast` : '⏳ Not Voted'}
                </p>
                {hasVoted && votedFor && <p style={{ margin:'2px 0 0', fontSize:12, opacity:0.85 }}>for {votedFor}</p>}
                {hasVoted && selectedElection?.title && <p style={{ margin:'2px 0 0', fontSize:11, opacity:0.7 }}>{selectedElection.title}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:14, marginBottom:24 }}>
          {[
            { label:'Active Elections', value:String(elections.length),  icon:<Activity size={20}/>, accent:'#0e9f6e', bg: dk?'rgba(14,159,110,0.15)':'#f0fdf4' },
            { label:'My Vote Status',   value: hasVoted?`✓ ${votedFor}`:votedCount>0?`✓ ${votedCount} election${votedCount>1?'s':''}`: 'Not Voted', icon:<Vote size={20}/>, accent: hasVoted||votedCount>0?'#0e9f6e':'#f59e0b', bg: hasVoted||votedCount>0?(dk?'rgba(14,159,110,0.15)':'#f0fdf4'):(dk?'rgba(245,158,11,0.15)':'#fffbeb') },
            { label:'Candidates',       value: String(selectedElection?.candidates?.length || 0), icon:<Users size={20}/>, accent:'#1a56db', bg: dk?'rgba(26,86,219,0.15)':'#eff6ff' },
            { label:'Time Remaining',   value:fmt(timeLeft), icon:<Timer size={20}/>, accent:'#ff5a1f', bg: dk?'rgba(255,90,31,0.15)':'#fff7ed' },
          ].map((c,i) => (
            <div key={i} className="voter-card-hover" style={{ background:bgCard, borderRadius:14, border:`1px solid ${border}`, padding:'16px 18px', display:'flex', alignItems:'center', gap:14, cursor:'default' }}>
              <div style={{ width:44, height:44, borderRadius:12, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', color:c.accent, flexShrink:0 }}>{c.icon}</div>
              <div>
                <p style={{ margin:0, fontSize:11, color:textSec, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>{c.label}</p>
                <p style={{ margin:'3px 0 0', fontSize:16, fontWeight:800, color:c.accent }}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* STATUS BANNER — per selected election */}
        {hasVoted ? (
          <div style={{ background: dk?'rgba(22,163,74,0.12)':'#f0fdf4', border:`1px solid ${dk?'rgba(22,163,74,0.3)':'#86efac'}`, borderRadius:14, padding:'14px 20px', display:'flex', alignItems:'center', gap:12, marginBottom:24, animation:'slideIn 0.3s ease' }}>
            <div style={{ width:36, height:36, borderRadius:10, background: dk?'rgba(22,163,74,0.2)':'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <CheckCircle size={18} color="#16a34a"/>
            </div>
            <div>
              <p style={{ margin:0, fontWeight:700, color:'#15803d', fontSize:14 }}>✅ Vote Confirmed & Recorded</p>
              <p style={{ margin:'2px 0 0', color: dk?'#4ade80':'#166534', fontSize:13 }}>
                You voted for <strong>{votedFor}</strong> in <em>{selectedElection?.title}</em>
                {elections.length > 1 && votedCount < elections.length && (
                  <span style={{ marginLeft:8, color: dk?'#fbbf24':'#92400e', fontWeight:600 }}>
                    · {elections.length - votedCount} more election{elections.length-votedCount>1?'s':''} available
                  </span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ background: dk?'rgba(245,158,11,0.12)':'#fffbeb', border:`1px solid ${dk?'rgba(245,158,11,0.3)':'#fcd34d'}`, borderRadius:14, padding:'14px 20px', display:'flex', alignItems:'center', gap:12, marginBottom:24, animation:'slideIn 0.3s ease' }}>
            <div style={{ width:36, height:36, borderRadius:10, background: dk?'rgba(245,158,11,0.2)':'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Clock size={18} color="#d97706"/>
            </div>
            <div>
              <p style={{ margin:0, fontWeight:700, color: dk?'#fbbf24':'#92400e', fontSize:14 }}>
                ⏳ {votedCount > 0 ? `You have voted in ${votedCount} election${votedCount>1?'s':''} — this election is pending` : 'You have not voted yet'}
              </p>
              <p style={{ margin:'2px 0 0', color: dk?'#f59e0b':'#b45309', fontSize:13 }}>Select a candidate below to cast your vote securely.</p>
            </div>
          </div>
        )}

        {/* ELECTION SELECTOR */}
        {elections.length > 1 && (
          <div style={{ marginBottom:20 }}>
            <p style={{ margin:'0 0 8px', fontSize:13, fontWeight:600, color:textPri }}>Select Election:</p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {elections.map(e => {
                const elVoted = !!votedMap[e._id]?.voted;
                return (
                  <button key={e._id} onClick={() => setSelectedElection(e)} className="election-pill"
                    style={{ padding:'8px 16px', borderRadius:10, border: selectedElection?._id===e._id ? '2px solid #1a56db' : `1px solid ${border}`, background: selectedElection?._id===e._id ? (dk?'rgba(26,86,219,0.2)':'#eff6ff') : bgCard, color: selectedElection?._id===e._id ? '#1a56db' : textPri, cursor:'pointer', fontSize:13, fontWeight:600, transition:'all 0.15s ease', display:'flex', alignItems:'center', gap:6 }}>
                    {elVoted && <CheckCircle size={13} color="#16a34a"/>}
                    {e.title}
                    {elVoted && <span style={{ fontSize:11, color:'#16a34a' }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TABS */}
        <div style={{ display:'flex', gap:4, background: dk?'#273549':'#f1f5f9', borderRadius:12, padding:4, marginBottom:24, width:'fit-content', flexWrap:'wrap', boxShadow: dk?'inset 0 1px 0 rgba(255,255,255,0.05)':'inset 0 1px 3px rgba(0,0,0,0.04)' }}>
          {(['vote','results','activity','receipt','feedback','notices'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="voter-tab-btn"
              style={{ padding:'8px 18px', borderRadius:9, border:'none', cursor:'pointer', fontSize:13, fontWeight:600, background: activeTab===tab?(dk?'#1e293b':'#fff'):'transparent', color: activeTab===tab?textPri:textSec, boxShadow: activeTab===tab?(dk?'0 1px 4px rgba(0,0,0,0.4)':'0 1px 4px rgba(0,0,0,0.1)'):'none', transition:'all 0.15s ease', display:'flex', alignItems:'center', gap:6 }}>
              {tab==='vote'     ? <><Vote          size={13}/>Cast Vote</>
             : tab==='results'  ? <><BarChart2     size={13}/>Live Results</>
             : tab==='activity' ? <><Activity      size={13}/>Activity</>
             : tab==='receipt'  ? <><FileText      size={13}/>My Receipt</>
             : tab==='notices'  ? <>
                 <Bell size={13}/>Notices
                 {unreadNotices > 0 && (
                   <span style={{ minWidth:16, height:16, borderRadius:'50%', background:'#ef4444', color:'#fff', fontSize:9, fontWeight:700, display:'inline-flex', alignItems:'center', justifyContent:'center', padding:'0 3px' }}>
                     {unreadNotices}
                   </span>
                 )}
               </>
             :                    <><MessageSquare size={13}/>Feedback & Complaints</>}
            </button>
          ))}
        </div>

        {/* ── CAST VOTE TAB ── */}
        {activeTab==='vote' && (
          <div>
            {elections.length === 0 ? (
              <div style={{ background:bgCard, borderRadius:14, border:`1px solid ${border}`, padding:'40px', textAlign:'center' }}>
                <AlertCircle size={40} color="#94a3b8" style={{ marginBottom:12 }}/>
                <p style={{ margin:0, fontWeight:600, fontSize:15, color:textSec }}>No active elections</p>
                <p style={{ margin:'8px 0 0', fontSize:13, color:textMuted }}>{user?.voterLocation?.label ? `No elections found for your area: ${user.voterLocation.label}` : 'There are no active elections at the moment.'}</p>
              </div>
            ) : !selectedElection ? null : (() => {
              const areaMatch  = isVoterAreaMatch(selectedElection);
              const hasLocation = !!(selectedElection.location?.state || selectedElection.location?.district || selectedElection.location?.subdistrict || selectedElection.location?.locality);
              // Per-election vote state
              const thisElectionVoted  = !!votedMap[selectedElection._id]?.voted;
              const thisElectionVotedFor = votedMap[selectedElection._id]?.candidateName || '';
              return (
                <>
                  <div style={{ marginBottom:16 }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                      <div>
                        <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:textPri }}>{selectedElection.title}</h2>
                        {selectedElection.location?.label && <p style={{ margin:'3px 0 2px', fontSize:12, color:'#6366f1' }}>📍 {selectedElection.location.label}</p>}
                        <p style={{ margin:'4px 0 0', fontSize:13, color:textSec }}>
                          {thisElectionVoted ? `✅ You already voted for "${thisElectionVotedFor}" in this election.` : 'Select a candidate below.'}
                        </p>
                      </div>
                      <button onClick={() => setShowLocationPicker(true)} className="btn-secondary"
                        style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${border}`, background:bgCard2, color:textSec, cursor:'pointer', fontSize:12, fontWeight:500, display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                        📍 {user?.voterLocation?.label ? user.voterLocation.label.split(',')[0] : 'Set Area'}
                      </button>
                    </div>
                  </div>

                  {hasLocation && !user?.voterLocation?.label && !thisElectionVoted && (
                    <div style={{ background:'#fef3c7', border:'1px solid #fcd34d', borderRadius:12, padding:'20px 24px', marginBottom:16, display:'flex', alignItems:'center', gap:16 }}>
                      <span style={{ fontSize:32 }}>🗺️</span>
                      <div style={{ flex:1 }}>
                        <p style={{ margin:0, fontWeight:700, fontSize:15, color:'#92400e' }}>Set your area to see candidates</p>
                        <p style={{ margin:'4px 0 8px', fontSize:13, color:'#b45309' }}>This election is for <strong>{selectedElection.location?.label}</strong>.</p>
                        <button onClick={() => setShowLocationPicker(true)} className="submit-btn"
                          style={{ padding:'8px 20px', borderRadius:8, border:'none', background:'#d97706', color:'#fff', cursor:'pointer', fontWeight:600, fontSize:13 }}>📍 Set My Area Now</button>
                      </div>
                    </div>
                  )}

                  {hasLocation && user?.voterLocation?.label && !areaMatch && !thisElectionVoted && (
                    <div style={{ background:'#fef2f2', border:'2px solid #fca5a5', borderRadius:12, padding:'24px', marginBottom:16, textAlign:'center' }}>
                      <div style={{ fontSize:48, marginBottom:12 }}>🚫</div>
                      <p style={{ margin:0, fontWeight:700, fontSize:17, color:'#dc2626' }}>Not Allowed to Vote Here</p>
                      <p style={{ margin:'8px 0 16px', fontSize:14, color:'#ef4444' }}>This election is for <strong>{selectedElection.location?.label}</strong>. Your area: <strong>{user.voterLocation?.label}</strong></p>
                      <button onClick={() => setShowLocationPicker(true)} className="btn-danger"
                        style={{ padding:'8px 20px', borderRadius:8, border:'1px solid #fca5a5', background: dk?'rgba(220,38,38,0.1)':'#fff', color:'#dc2626', cursor:'pointer', fontWeight:600, fontSize:13 }}>📍 Update My Area</button>
                    </div>
                  )}

                  {(areaMatch || !hasLocation) && (
                    <>
                      {hasLocation && areaMatch && user?.voterLocation?.label && !thisElectionVoted && (
                        <div style={{ background: dk?'rgba(22,163,74,0.12)':'#f0fdf4', border:`1px solid ${dk?'rgba(22,163,74,0.3)':'#86efac'}`, borderRadius:10, padding:'10px 16px', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                          <CheckCircle size={16} color="#16a34a"/>
                          <span style={{ fontSize:13, color:'#15803d', fontWeight:500 }}>✅ Your area matches — you are eligible to vote here</span>
                        </div>
                      )}
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
                        {selectedElection.candidates.map((c, idx) => {
                          const color    = COLORS[idx % COLORS.length];
                          const isMyVote = thisElectionVoted && thisElectionVotedFor === c.name;
                          return (
                            <div key={c._id} className="voter-candidate-card"
                              style={{ background:bgCard, border: isMyVote?`2px solid ${color}`:`1px solid ${border}`, borderRadius:14, padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', opacity: thisElectionVoted&&!isMyVote?0.45:1 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                                <div style={{ width:44, height:44, borderRadius:'50%', background:color+'18', border:`2px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:16, color, flexShrink:0 }}>{c.name.charAt(0)}</div>
                                <div>
                                  <p style={{ margin:0, fontWeight:600, fontSize:15, color:textPri }}>{c.name}</p>
                                  <p style={{ margin:'2px 0 0', fontSize:12, color:textSec }}>{c.party}</p>
                                </div>
                              </div>
                              {isMyVote ? (
                                <div style={{ display:'flex', alignItems:'center', gap:6, color:'#16a34a', fontSize:13, fontWeight:600 }}><CheckCircle size={16}/> Voted</div>
                              ) : (
                                <button
                                  disabled={thisElectionVoted}
                                  onClick={() => setConfirming(c)}
                                  className="vote-btn"
                                  style={{ padding:'8px 18px', borderRadius:8, background: thisElectionVoted?'#f1f5f9':color, color: thisElectionVoted?'#94a3b8':'#fff', border:'none', cursor: thisElectionVoted?'not-allowed':'pointer', fontWeight:600, fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
                                  <Vote size={14}/> Vote
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* ── LIVE RESULTS TAB ── */}
        {activeTab==='results' && (
          <div>
            <div style={{ marginBottom:20 }}>
              <h2 style={{ margin:'0 0 4px', fontSize:18, fontWeight:700, color:textPri }}>📊 Live Election Results</h2>
              <p style={{ margin:0, fontSize:13, color:textSec }}>Select your area to see elections and live vote counts · Auto-refreshes every 10s</p>
            </div>

            {/* Area Selector */}
            <div style={{ background:bgCard, borderRadius:14, border:`1px solid ${border}`, padding:'20px 24px', marginBottom:20 }}>
              <p style={{ margin:'0 0 12px', fontSize:13, fontWeight:700, color:textPri }}>📍 Filter by Area</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:12 }}>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:600, color:textSec, marginBottom:4 }}>🏛️ STATE</label>
                  <select value={resAreaFilter.state||''} onChange={e => handleResAreaChange('state', e.target.value, {})}
                    style={{ width:'100%', border:`1px solid ${border}`, borderRadius:8, padding:'8px 10px', fontSize:13, outline:'none', background:inputBg, color:textPri }}>
                    <option value="">All States</option>
                    {resStates.map((s:any) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:600, color:textSec, marginBottom:4 }}>🏙️ DISTRICT</label>
                  <select value={resAreaFilter.district||''} onChange={e => handleResAreaChange('district', e.target.value, {})}
                    disabled={!resAreaFilter.state}
                    style={{ width:'100%', border:`1px solid ${border}`, borderRadius:8, padding:'8px 10px', fontSize:13, outline:'none', background: resAreaFilter.state?inputBg:bgCard2, color:textPri, opacity: resAreaFilter.state?1:0.6 }}>
                    <option value="">{resAreaFilter.state ? 'All Districts' : '— select state'}</option>
                    {resDistricts.map((d:any) => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:600, color:textSec, marginBottom:4 }}>🏘️ SUB-DISTRICT</label>
                  <select value={resAreaFilter.subdistrict||''} onChange={e => handleResAreaChange('subdistrict', e.target.value, {})}
                    disabled={!resAreaFilter.district}
                    style={{ width:'100%', border:`1px solid ${border}`, borderRadius:8, padding:'8px 10px', fontSize:13, outline:'none', background: resAreaFilter.district?inputBg:bgCard2, color:textPri, opacity: resAreaFilter.district?1:0.6 }}>
                    <option value="">{resAreaFilter.district ? 'All Sub-Districts' : '— select district'}</option>
                    {resSubdistricts.map((s:any) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:600, color:textSec, marginBottom:4 }}>📍 LOCALITY</label>
                  <select value={resAreaFilter.locality||''} onChange={e => handleResAreaChange('locality', e.target.value, {})}
                    disabled={!resAreaFilter.subdistrict}
                    style={{ width:'100%', border:`1px solid ${border}`, borderRadius:8, padding:'8px 10px', fontSize:13, outline:'none', background: resAreaFilter.subdistrict?inputBg:bgCard2, color:textPri, opacity: resAreaFilter.subdistrict?1:0.6 }}>
                    <option value="">{resAreaFilter.subdistrict ? 'All Localities' : '— select sub-district'}</option>
                    {resLocalities.map((l:any) => <option key={l._id} value={l._id}>{l.name}</option>)}
                  </select>
                </div>
              </div>
              {resAreaLabel && (
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'#eff6ff', borderRadius:8, border:'1px solid #bfdbfe' }}>
                  <span style={{ fontSize:13, color:'#1d4ed8', fontWeight:600 }}>📍 {resAreaLabel}</span>
                  <button onClick={() => { setResAreaFilter({}); setResAreaLabel(''); setResDistricts([]); setResSubdistricts([]); setResLocalities([]); setSelectedResultElection(null); setLiveResults(null); fetchResultsElections({}); }}
                    style={{ marginLeft:'auto', fontSize:11, color:textSec, background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Election Selector */}
            {resultsElections.length === 0 ? (
              <div style={{ background:bgCard, borderRadius:14, border:`1px solid ${border}`, padding:'40px', textAlign:'center' }}>
                <BarChart2 size={40} color="#94a3b8" style={{ marginBottom:12 }}/>
                <p style={{ margin:0, fontWeight:600, fontSize:15, color:textSec }}>No elections found</p>
                <p style={{ margin:'8px 0 0', fontSize:13, color:textMuted }}>
                  {resAreaLabel ? `No elections for ${resAreaLabel}` : 'No active or completed elections yet.'}
                </p>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
                  {resultsElections.map((e:any) => (
                    <button key={e._id}
                      onClick={() => { setSelectedResultElection(e); setLiveResults(null); fetchLiveResults(e._id); }}
                      style={{ padding:'8px 16px', borderRadius:20, border: selectedResultElection?._id===e._id?'2px solid #1a56db':'1px solid #e2e8f0', background: selectedResultElection?._id===e._id?'#1a56db':'#fff', color: selectedResultElection?._id===e._id?'#fff':'#374151', cursor:'pointer', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ width:8, height:8, borderRadius:'50%', background: e.status==='active'?'#22c55e':'#94a3b8', display:'inline-block' }}/>
                      {e.title.length > 30 ? e.title.substring(0,28)+'...' : e.title}
                      <span style={{ fontSize:11, opacity:0.8 }}>· {e.status}</span>
                    </button>
                  ))}
                </div>

                {selectedResultElection && (
                  <div style={{ background:bgCard, borderRadius:14, border:`1px solid ${border}`, padding:'24px' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
                      <div>
                        <h3 style={{ margin:'0 0 4px', fontSize:17, fontWeight:700, color:textPri }}>{selectedResultElection.title}</h3>
                        {selectedResultElection.location?.label && <p style={{ margin:'0 0 4px', fontSize:12, color:'#6366f1' }}>📍 {selectedResultElection.location.label}</p>}
                        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, background: selectedResultElection.status==='active'?'#dcfce7':'#f1f5f9', color: selectedResultElection.status==='active'?'#15803d':'#64748b', fontSize:12, fontWeight:600 }}>
                            {selectedResultElection.status==='active' && <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block', animation:'ping 1s infinite' }}/>}
                            {selectedResultElection.status==='active' ? '🔴 LIVE' : '✅ Final'}
                          </span>
                          {liveResults && (
                            <span style={{ fontSize:12, color:textSec }}>
                              {liveResults.totalVotesCast} votes cast · {liveResults.turnoutPercent}% turnout
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:11, color:textMuted }}>Auto-refresh {resultsRefreshCount > 0 ? `· updated ${resultsRefreshCount}x` : ''}</span>
                        <button onClick={() => fetchLiveResults(selectedResultElection._id)}
                          className="results-refresh" style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 12px', borderRadius:8, border:`1px solid ${border}`, background:bgCard2, color:textSec, cursor:'pointer', fontSize:12 }}>
                          <RefreshCw size={12}/> Refresh
                        </button>
                      </div>
                    </div>

                    {loadingResults && !liveResults ? (
                      <div style={{ textAlign:'center', padding:'40px', color:textMuted }}>
                        <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #e2e8f0', borderTopColor:'#1a56db', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }}/>
                        <p style={{ fontSize:13 }}>Loading results...</p>
                      </div>
                    ) : liveResults ? (() => {
                      const candidates = liveResults.candidates || [];
                      const results    = liveResults.results || {};
                      const total      = liveResults.totalVotesCast || 0;
                      const maxVotes   = Math.max(...candidates.map((c:any) => results[c._id] || 0), 1);
                      const sorted     = [...candidates].sort((a:any, b:any) => (results[b._id]||0) - (results[a._id]||0));
                      const COLORS_RES = ['#1a56db','#7e3af2','#0e9f6e','#ff5a1f','#e3a008','#e11d48','#0891b2'];
                      return (
                        <div>
                          {total > 0 && sorted.length > 0 && (
                            <div style={{ background:'linear-gradient(135deg,#fef3c7,#fde68a)', border:'1px solid #f59e0b', borderRadius:12, padding:'14px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
                              <Award size={24} color="#d97706"/>
                              <div>
                                <p style={{ margin:0, fontSize:11, fontWeight:600, color:'#92400e', textTransform:'uppercase' }}>
                                  {selectedResultElection.status==='active' ? '🔴 Currently Leading' : '🏆 Winner'}
                                </p>
                                <p style={{ margin:'2px 0 0', fontSize:16, fontWeight:700, color:'#78350f' }}>
                                  {sorted[0].name} · {sorted[0].party}
                                  <span style={{ fontSize:13, fontWeight:500, color:'#92400e', marginLeft:8 }}>
                                    {results[sorted[0]._id]||0} votes ({total > 0 ? ((results[sorted[0]._id]||0)/total*100).toFixed(1) : 0}%)
                                  </span>
                                </p>
                              </div>
                            </div>
                          )}
                          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                            {sorted.map((c:any, idx:number) => {
                              const votes   = results[c._id] || 0;
                              const pct     = total > 0 ? (votes / total * 100).toFixed(1) : '0';
                              const barPct  = maxVotes > 0 ? (votes / maxVotes * 100) : 0;
                              const color   = COLORS_RES[idx % COLORS_RES.length];
                              const isLeader = idx === 0 && total > 0;
                              return (
                                <div key={c._id} style={{ padding:'14px 16px', borderRadius:12, border:`1px solid ${isLeader?color+'40':border}`, background: isLeader?color+'08':(dk?'#273549':'#f8fafc') }}>
                                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                                    <div style={{ width:40, height:40, borderRadius:'50%', background:color+'18', border:`2px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color, fontSize:15, flexShrink:0 }}>
                                      {c.photo ? <img src={c.photo} alt={c.name} style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }}/> : c.name.charAt(0)}
                                    </div>
                                    <div style={{ flex:1, minWidth:0 }}>
                                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                        <p style={{ margin:0, fontWeight:700, fontSize:14, color:textPri }}>{c.name}</p>
                                        {isLeader && <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:20, background:color, color:'#fff' }}>LEADING</span>}
                                      </div>
                                      <p style={{ margin:0, fontSize:12, color:textSec }}>{c.party}</p>
                                    </div>
                                    <div style={{ textAlign:'right', flexShrink:0 }}>
                                      <p style={{ margin:0, fontSize:18, fontWeight:800, color }}>{votes}</p>
                                      <p style={{ margin:0, fontSize:11, color:textMuted }}>{pct}%</p>
                                    </div>
                                  </div>
                                  <div style={{ height:8, background: dk?'#334155':'#e2e8f0', borderRadius:20, overflow:'hidden' }}>
                                    <div style={{ height:'100%', width:`${barPct}%`, background:`linear-gradient(90deg,${color},${color}cc)`, borderRadius:20, transition:'width 0.6s ease' }}/>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginTop:20 }}>
                            {[
                              { label:'Total Votes Cast', value: total.toLocaleString(),                      color:'#1a56db' },
                              { label:'Voter Turnout',    value: `${liveResults.turnoutPercent}%`,             color:'#0e9f6e' },
                              { label:'Total Eligible',   value: (liveResults.totalVoters||0).toLocaleString(), color:'#7e3af2' },
                            ].map((s,i) => (
                              <div key={i} style={{ textAlign:'center', padding:'12px', background:bgCard2, borderRadius:10, border:`1px solid ${border}` }}>
                                <p style={{ margin:0, fontSize:20, fontWeight:800, color:s.color }}>{s.value}</p>
                                <p style={{ margin:'2px 0 0', fontSize:11, color:textMuted, fontWeight:500 }}>{s.label}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })() : (
                      <div style={{ textAlign:'center', padding:'40px', color:textMuted }}>
                        <Eye size={36} style={{ marginBottom:12 }}/>
                        <p style={{ fontSize:13, fontWeight:600 }}>Click an election above to see results</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab==='activity' && (
          <div>
            <h2 style={{ margin:'0 0 16px', fontSize:18, fontWeight:700, color:textPri }}>Voting Activity</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {activities.map((a,i) => (
                <div key={i} style={{ background:bgCard, border:`1px solid ${border}`, borderRadius:12, padding:'16px 20px', display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:a.color+'15', display:'flex', alignItems:'center', justifyContent:'center', color:a.color, flexShrink:0 }}>{a.icon}</div>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:0, fontWeight:500, fontSize:14, color:textPri }}>{a.text}</p>
                    <p style={{ margin:'2px 0 0', fontSize:12, color:textMuted }}>{a.time}</p>
                  </div>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:a.color }}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RECEIPT TAB ── */}
        {activeTab==='receipt' && (
          <div>
            <h2 style={{ margin:'0 0 4px', fontSize:18, fontWeight:700, color:textPri }}>Vote Receipt</h2>
            <p style={{ margin:'0 0 16px', fontSize:13, color:textSec }}>Fetched from votes collection in database</p>

            {/* Election selector for receipt when voted in multiple */}
            {Object.keys(votedMap).filter(id => votedMap[id].voted).length > 1 && (
              <div style={{ marginBottom:16 }}>
                <p style={{ margin:'0 0 8px', fontSize:13, fontWeight:600, color:textPri }}>Select Election Receipt:</p>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {elections.filter(e => votedMap[e._id]?.voted).map(e => (
                    <button key={e._id}
                      onClick={() => {
                        setReceiptElectionId(e._id);
                        setVoteHash(votedMap[e._id].hash);
                        setVoteTime(votedMap[e._id].time);
                        setElectionTitle(votedMap[e._id].title);
                      }}
                      className="election-pill"
                      style={{ padding:'7px 14px', borderRadius:10, border: receiptElectionId===e._id?'2px solid #0e9f6e':`1px solid ${border}`, background: receiptElectionId===e._id?(dk?'rgba(14,159,110,0.2)':'#f0fdf4'):bgCard, color: receiptElectionId===e._id?'#0e9f6e':textPri, cursor:'pointer', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
                      <CheckCircle size={12} color="#16a34a"/> {e.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {Object.values(votedMap).some(v => v.voted) ? (() => {
              const rec = receiptElectionId ? votedMap[receiptElectionId] : Object.values(votedMap).find(v => v.voted);
              if (!rec) return null;
              return (
                <div style={{ background:bgCard, border:`1px solid ${border}`, borderRadius:16, padding:'28px', maxWidth:480 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, paddingBottom:20, borderBottom:`1px dashed ${border}` }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <CheckCircle size={20} color="#16a34a"/>
                    </div>
                    <div>
                      <p style={{ margin:0, fontWeight:700, fontSize:15, color:'#15803d' }}>Vote Stored ✅</p>
                      <p style={{ margin:0, fontSize:12, color:textSec }}>Immutable · Blockchain-verified</p>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    {[
                      { label:'Voter ID',   value: user.voterId || user._id },
                      { label:'Voter Name', value: user.name },
                      ...(user.aadhaarNumber ? [{ label:'Aadhaar No.', value: user.aadhaarNumber }] : []),
                      ...(user.eciCardNumber ? [{ label:'ECI Card',    value: user.eciCardNumber  }] : []),
                      { label:'Election',   value: rec.title     || 'N/A' },
                      { label:'Candidate',  value: rec.candidateName || 'Recorded' },
                      { label:'Status',     value: 'CONFIRMED' },
                      { label:'Timestamp',  value: rec.time      || 'N/A' },
                      { label:'Hash',       value: rec.hash ? rec.hash.substring(0,28)+'...' : 'N/A' },
                    ].map((row,i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom: i<7?`1px solid ${border}`:'none', paddingBottom:8 }}>
                        <span style={{ fontSize:13, color:textSec, fontWeight:500 }}>{row.label}</span>
                        <span style={{ fontSize:13, fontWeight:600, background: row.label==='Status'?'#dcfce7':'transparent', color: row.label==='Status'?'#15803d':textPri, padding: row.label==='Status'?'2px 10px':'0', borderRadius: row.label==='Status'?20:0 }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={downloadReceipt} className="download-btn"
                    style={{ marginTop:24, width:'100%', padding:'10px 0', borderRadius:10, border:`1px solid ${border}`, background:bgCard2, color:textPri, cursor:'pointer', fontWeight:600, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    <FileText size={15}/> Download Receipt
                  </button>
                </div>
              );
            })() : (
              <div style={{ background:bgCard, border:`1px solid ${border}`, borderRadius:16, padding:'40px 28px', textAlign:'center', maxWidth:400 }}>
                <Clock size={40} color="#e3a008" style={{ marginBottom:12 }}/>
                <p style={{ margin:0, fontWeight:600, fontSize:15, color:'#92400e' }}>No vote found</p>
                <p style={{ margin:'8px 0 20px', fontSize:13, color:textSec }}>Cast your vote first.</p>
                <button onClick={() => setActiveTab('vote')} className="btn-primary"
                  style={{ padding:'10px 24px', borderRadius:10, background:'#1a56db', color:'#fff', border:'none', cursor:'pointer', fontWeight:600, fontSize:13, display:'inline-flex', alignItems:'center', gap:8 }}>
                  <Vote size={14}/> Go to Voting
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── FEEDBACK & COMPLAINTS TAB ── */}
        {activeTab==='feedback' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div>
                <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:textPri }}>Feedback & Complaints</h2>
                <p style={{ margin:'4px 0 0', fontSize:13, color:textSec }}>Submit feedback or raise a complaint to the concerned authority</p>
              </div>
            </div>

            <div style={{ display:'flex', gap:4, background: dk?'#273549':'#f1f5f9', borderRadius:10, padding:4, marginBottom:24, width:'fit-content' }}>
              <button onClick={() => setFeedbackTab('submit')} style={{ padding:'8px 20px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:500, background: feedbackTab==='submit'?'#fff':'transparent', color: feedbackTab==='submit'?'#1e293b':'#64748b', boxShadow: feedbackTab==='submit'?'0 1px 3px rgba(0,0,0,0.1)':'none' }}>
                <span style={{ display:'flex', alignItems:'center', gap:6 }}><Send size={13}/> Submit New</span>
              </button>
              <button onClick={() => { setFeedbackTab('history'); fetchMyFeedbacks(); }} style={{ padding:'8px 20px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:500, background: feedbackTab==='history'?'#fff':'transparent', color: feedbackTab==='history'?'#1e293b':'#64748b', boxShadow: feedbackTab==='history'?'0 1px 3px rgba(0,0,0,0.1)':'none' }}>
                <span style={{ display:'flex', alignItems:'center', gap:6 }}><Clock size={13}/> My History ({myFeedbacks.length})</span>
              </button>
            </div>

            {feedbackTab==='submit' && (
              <div style={{ background:bgCard, borderRadius:16, border:`1px solid ${border}`, padding:'28px', maxWidth:600 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
                  <button onClick={() => setFeedbackType('feedback')} className="fb-type-card"
                    style={{ padding:'16px', borderRadius:12, border: feedbackType==='feedback'?'2px solid #1a56db':`1px solid ${border}`, background: feedbackType==='feedback'?(dk?'rgba(26,86,219,0.15)':'#eff6ff'):bgCard2, cursor:'pointer', textAlign:'left' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <div style={{ width:36, height:36, borderRadius:8, background: feedbackType==='feedback'?'#1a56db':'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <MessageSquare size={18} color={feedbackType==='feedback'?'#fff':'#64748b'}/>
                      </div>
                      <span style={{ fontWeight:700, fontSize:14, color: feedbackType==='feedback'?'#1a56db':'#374151' }}>Feedback</span>
                    </div>
                    <p style={{ margin:0, fontSize:12, color:textSec }}>General feedback visible to all authorities (DM, SDM, CDO, Admin)</p>
                  </button>
                  <button onClick={() => setFeedbackType('complaint')} className="fb-type-card"
                    style={{ padding:'16px', borderRadius:12, border: feedbackType==='complaint'?'2px solid #dc2626':`1px solid ${border}`, background: feedbackType==='complaint'?(dk?'rgba(220,38,38,0.15)':'#fef2f2'):bgCard2, cursor:'pointer', textAlign:'left' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <div style={{ width:36, height:36, borderRadius:8, background: feedbackType==='complaint'?'#dc2626':'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Flag size={18} color={feedbackType==='complaint'?'#fff':'#64748b'}/>
                      </div>
                      <span style={{ fontWeight:700, fontSize:14, color: feedbackType==='complaint'?'#dc2626':'#374151' }}>Complaint</span>
                    </div>
                    <p style={{ margin:0, fontSize:12, color:textSec }}>Directed complaint to a specific authority only (+ Admin)</p>
                  </button>
                </div>

                {feedbackType==='complaint' && (
                  <div style={{ marginBottom:20 }}>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:textPri, marginBottom:8 }}>🎯 Send complaint to:</label>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                      {(['dm','sdm','cdo','admin'] as const).map(role => (
                        <button key={role} onClick={() => setFbTargetRole(role)} className="role-btn"
                          style={{ padding:'10px 8px', borderRadius:10, border: fbTargetRole===role?'2px solid #dc2626':`1px solid ${border}`, background: fbTargetRole===role?(dk?'rgba(220,38,38,0.15)':'#fef2f2'):bgCard2, cursor:'pointer', fontWeight:700, fontSize:13, color: fbTargetRole===role?'#dc2626':textSec, textTransform:'uppercase' as any }}>
                          {role}
                        </button>
                      ))}
                    </div>
                    <p style={{ margin:'8px 0 0', fontSize:12, color:textMuted }}>
                      {fbTargetRole==='dm'    && '📋 District Magistrate will see this complaint'}
                      {fbTargetRole==='sdm'   && '📋 Sub-District Magistrate will see this complaint'}
                      {fbTargetRole==='cdo'   && '📋 Chief Development Officer will see this complaint'}
                      {fbTargetRole==='admin' && '📋 System Administrator will see this complaint'}
                      {' '}(Admin always has access to all complaints)
                    </p>
                  </div>
                )}

                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:textPri, marginBottom:6 }}>Category</label>
                  <select value={fbCategory} onChange={e => setFbCategory(e.target.value)}
                    style={{ width:'100%', border:`1px solid ${border}`, borderRadius:8, padding:'10px 12px', fontSize:13, outline:'none', background:inputBg, color:textPri, appearance:'auto' as any }}>
                    {CATEGORIES.map(c => <option key={c} value={c} style={{ color:textPri, background:'#fff' }}>{c}</option>)}
                  </select>
                </div>

                {elections.length > 0 && (
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:textPri, marginBottom:6 }}>Related Election (optional)</label>
                    <select value={fbElection} onChange={e => setFbElection(e.target.value)}
                      style={{ width:'100%', border:`1px solid ${border}`, borderRadius:8, padding:'10px 12px', fontSize:13, outline:'none', background:inputBg, color:textPri, appearance:'auto' as any }}>
                      <option value="" style={{ color:textSec, background:inputBg }}>None</option>
                      {elections.map(e => <option key={e._id} value={e._id} style={{ color:textPri, background:'#fff' }}>{e.title}</option>)}
                    </select>
                  </div>
                )}

                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:textPri, marginBottom:6 }}>Subject *</label>
                  <input value={fbSubject} onChange={e => setFbSubject(e.target.value)} maxLength={100}
                    placeholder={feedbackType==='complaint' ? 'Brief title of your complaint...' : 'Brief title of your feedback...'}
                    style={{ width:'100%', border:`1px solid ${border}`, borderRadius:8, padding:'10px 12px', fontSize:13, outline:'none', boxSizing:'border-box' as any, color:textPri, background:inputBg }}/>
                </div>

                <div style={{ marginBottom:24 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:textPri, marginBottom:6 }}>Message *</label>
                  <textarea value={fbMessage} onChange={e => setFbMessage(e.target.value)} maxLength={1000} rows={5}
                    placeholder={feedbackType==='complaint' ? 'Describe your complaint in detail...' : 'Share your feedback, suggestions, or observations...'}
                    style={{ width:'100%', border:`1px solid ${border}`, borderRadius:8, padding:'10px 12px', fontSize:13, outline:'none', resize:'vertical' as any, fontFamily:'inherit', boxSizing:'border-box' as any, color:textPri, background:inputBg }}/>
                  <p style={{ margin:'4px 0 0', fontSize:11, color:textMuted, textAlign:'right' as any }}>{fbMessage.length}/1000</p>
                </div>

                <div style={{ background: feedbackType==='complaint'?'#fef2f2':'#eff6ff', border: `1px solid ${feedbackType==='complaint'?'#fca5a5':'#bfdbfe'}`, borderRadius:10, padding:'12px 14px', marginBottom:20, fontSize:12, color: feedbackType==='complaint'?'#dc2626':'#1d4ed8' }}>
                  {feedbackType==='complaint'
                    ? `🔒 This complaint will be sent to ${fbTargetRole.toUpperCase()} and Admin only.`
                    : '📢 This feedback will be visible to all authorities: DM, SDM, CDO, and Admin.'}
                </div>

                <button onClick={handleSubmitFeedback} disabled={submittingFb || !fbSubject.trim() || !fbMessage.trim()}
                  className="submit-btn" style={{ width:'100%', padding:'12px 0', borderRadius:10, border:'none', background: (submittingFb || !fbSubject.trim() || !fbMessage.trim())?'#94a3b8': feedbackType==='complaint'?'#dc2626':'#1a56db', color:'#fff', cursor:(submittingFb || !fbSubject.trim() || !fbMessage.trim())?'not-allowed':'pointer', fontWeight:700, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <Send size={15}/>{submittingFb ? 'Submitting...' : feedbackType==='complaint' ? '🚩 Submit Complaint' : '💬 Submit Feedback'}
                </button>
              </div>
            )}

            {feedbackTab==='history' && (
              <div>
                {loadingFb ? (
                  <div style={{ textAlign:'center', padding:'40px', color:textSec }}>Loading...</div>
                ) : myFeedbacks.length === 0 ? (
                  <div style={{ background:bgCard, borderRadius:16, border:`1px solid ${border}`, padding:'40px', textAlign:'center' }}>
                    <MessageSquare size={40} color="#94a3b8" style={{ marginBottom:12 }}/>
                    <p style={{ margin:0, fontWeight:600, fontSize:15, color:textSec }}>No submissions yet</p>
                    <p style={{ margin:'8px 0 16px', fontSize:13, color:textMuted }}>You haven't submitted any feedback or complaints.</p>
                    <button onClick={() => setFeedbackTab('submit')} className="btn-primary"
                      style={{ padding:'10px 24px', borderRadius:10, background:'#1a56db', color:'#fff', border:'none', cursor:'pointer', fontWeight:600, fontSize:13 }}>
                      Submit Your First Feedback
                    </button>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {myFeedbacks.map(fb => {
                      const sc         = statusColor(fb.status);
                      const isExpanded = expandedFb === fb._id;
                      return (
                        <div key={fb._id} className="fb-history-item" style={{ background:bgCard, borderRadius:12, border:`1px solid ${border}`, overflow:'hidden' }}>
                          <div className="fb-expand-row"
                            style={{ padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, cursor:'pointer', background:bgCard }}
                            onClick={() => setExpandedFb(isExpanded ? null : fb._id)}>
                            <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 }}>
                              <div style={{ width:36, height:36, borderRadius:8, background: fb.type==='complaint'?'#fef2f2':'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                {fb.type==='complaint' ? <Flag size={16} color="#dc2626"/> : <MessageSquare size={16} color="#1a56db"/>}
                              </div>
                              <div style={{ minWidth:0 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                                  <p style={{ margin:0, fontWeight:600, fontSize:14, color:textPri }}>{fb.subject}</p>
                                  <span style={{ padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600, background: fb.type==='complaint'?'#fef2f2':'#eff6ff', color: fb.type==='complaint'?'#dc2626':'#1a56db' }}>
                                    {fb.type==='complaint' ? '🚩 Complaint' : '💬 Feedback'}
                                  </span>
                                  {fb.type==='complaint' && fb.targetRole && (
                                    <span style={{ padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600, background: dk?'#273549':'#f1f5f9', color:textSec }}>
                                      → {fb.targetRole.toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <p style={{ margin:'2px 0 0', fontSize:12, color:textMuted }}>{fb.category} · {new Date(fb.createdAt).toLocaleDateString('en-IN')}</p>
                              </div>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                              <span style={{ padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600, background:sc.bg, color:sc.color }}>{fb.status}</span>
                              {isExpanded ? <ChevronUp size={16} color="#94a3b8"/> : <ChevronDown size={16} color="#94a3b8"/>}
                            </div>
                          </div>
                          {isExpanded && (
                            <div style={{ padding:'0 20px 20px', borderTop:`1px solid ${border}`, background:bgCard }}>
                              <p style={{ margin:'16px 0 8px', fontSize:13, fontWeight:600, color:textPri }}>Your Message:</p>
                              <p style={{ margin:0, fontSize:13, color:textSec, background:bgCard2, borderRadius:8, padding:'12px', lineHeight:1.6 }}>{fb.message}</p>
                              {fb.response ? (
                                <div style={{ marginTop:16, background:'#f0fdf4', border:'1px solid #86efac', borderRadius:10, padding:'14px' }}>
                                  <p style={{ margin:'0 0 6px', fontSize:12, fontWeight:700, color:'#15803d' }}>✅ Response from {fb.respondedBy}:</p>
                                  <p style={{ margin:0, fontSize:13, color:'#166534', lineHeight:1.6 }}>{fb.response}</p>
                                  {fb.respondedAt && <p style={{ margin:'6px 0 0', fontSize:11, color:'#4ade80' }}>{new Date(fb.respondedAt).toLocaleString('en-IN')}</p>}
                                </div>
                              ) : (
                                <div style={{ marginTop:16, background:'#fef3c7', border:'1px solid #fcd34d', borderRadius:10, padding:'12px' }}>
                                  <p style={{ margin:0, fontSize:12, color:'#92400e' }}>⏳ Awaiting response from the authority...</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── NOTICES TAB ── */}
        {activeTab==='notices' && (
          <div>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
              <div>
                <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:textPri }}>📬 Notices from Admin</h2>
                <p style={{ margin:'4px 0 0', fontSize:13, color:textSec }}>
                  {notices.length > 0
                    ? `${notices.length} notice${notices.length>1?'s':''} · ${unreadNotices} unread`
                    : 'No notices yet'}
                </p>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                {unreadNotices > 0 && (
                  <button onClick={markAllRead}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, border:`1px solid ${border}`, background:bgCard, color:'#1a56db', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                    <CheckCircle size={13}/> Mark all read
                  </button>
                )}
                <button onClick={fetchNotices} disabled={loadingNotices}
                  className="refresh-btn" style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, border:`1px solid ${border}`, background:bgCard, color:textSec, cursor:'pointer', fontSize:12, fontWeight:600 }}>
                  <RefreshCw size={13} style={{ animation: loadingNotices?'spin 0.8s linear infinite':'none' }}/> Refresh
                </button>
              </div>
            </div>

            {loadingNotices ? (
              <div style={{ textAlign:'center', padding:'60px', color:textMuted }}>
                <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #e2e8f0', borderTopColor:'#1a56db', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }}/>
                <p style={{ fontSize:13 }}>Loading notices...</p>
              </div>
            ) : notices.length === 0 ? (
              <div style={{ background:bgCard, border:`1px solid ${border}`, borderRadius:16, padding:'60px 28px', textAlign:'center' }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background: dk?'rgba(26,86,219,0.15)':'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <Bell size={28} color="#1a56db"/>
                </div>
                <p style={{ margin:0, fontWeight:700, fontSize:16, color:textPri }}>No notices yet</p>
                <p style={{ margin:'8px 0 0', fontSize:13, color:textSec }}>When admin sends you a notice, it will appear here.</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {notices.map(notice => {
                  const isExpanded = expandedNotice === notice._id;

                  const typeMap: Record<string, { icon: JSX.Element; label: string; bg: string; border2: string; color: string; badgeBg: string; badgeColor: string }> = {
                    info:            { icon:<Info size={16}/>,          label:'Info',            bg: dk?'rgba(26,86,219,0.15)':'#eff6ff',          border2: dk?'rgba(26,86,219,0.3)':'#bfdbfe',  color:'#1a56db',  badgeBg: dk?'rgba(26,86,219,0.25)':'#dbeafe',  badgeColor:'#1d4ed8'  },
                    warning:         { icon:<AlertTriangle size={16}/>, label:'Warning',         bg: dk?'rgba(245,158,11,0.15)':'#fffbeb',         border2: dk?'rgba(245,158,11,0.3)':'#fcd34d',  color:'#d97706',  badgeBg: dk?'rgba(245,158,11,0.25)':'#fef3c7', badgeColor:'#92400e'  },
                    urgent:          { icon:<Zap size={16}/>,           label:'Urgent',          bg: dk?'rgba(220,38,38,0.15)':'#fef2f2',          border2: dk?'rgba(220,38,38,0.3)':'#fca5a5',   color:'#dc2626',  badgeBg: dk?'rgba(220,38,38,0.25)':'#fee2e2',  badgeColor:'#dc2626'  },
                    action_required: { icon:<AlertCircle size={16}/>,  label:'Action Required', bg: dk?'rgba(126,58,242,0.15)':'#f5f3ff',         border2: dk?'rgba(126,58,242,0.3)':'#c4b5fd',  color:'#7e3af2',  badgeBg: dk?'rgba(126,58,242,0.25)':'#ede9fe', badgeColor:'#6d28d9'  },
                  };
                  const tc = typeMap[notice.type] ?? { icon:<Bell size={16}/>, label:'Notice', bg:bgCard2, border2:border, color:textSec, badgeBg:bgCard2, badgeColor:textSec };

                  return (
                    <div key={notice._id}
                      style={{ background:bgCard, borderRadius:14, border: !notice.isRead?`2px solid ${tc.border2}`:`1px solid ${border}`, overflow:'hidden', transition:'all 0.2s ease', boxShadow: !notice.isRead?`0 0 0 3px ${tc.bg}`:'none' }}>

                      {/* Header row — click to expand */}
                      <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:14, cursor:'pointer' }}
                        onClick={() => {
                          setExpandedNotice(isExpanded ? null : notice._id);
                          if (!notice.isRead) markNoticeRead(notice._id);
                        }}>

                        {/* Type icon */}
                        <div style={{ width:42, height:42, borderRadius:12, background:tc.bg, border:`1px solid ${tc.border2}`, display:'flex', alignItems:'center', justifyContent:'center', color:tc.color, flexShrink:0 }}>
                          {tc.icon}
                        </div>

                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:3 }}>
                            {!notice.isRead && (
                              <span style={{ width:8, height:8, borderRadius:'50%', background:tc.color, display:'inline-block', flexShrink:0 }}/>
                            )}
                            <p style={{ margin:0, fontWeight: notice.isRead?600:700, fontSize:14, color:textPri, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:320 }}>
                              {notice.subject}
                            </p>
                            <span style={{ padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600, background:tc.badgeBg, color:tc.badgeColor, flexShrink:0 }}>
                              {tc.label}
                            </span>
                            {!notice.isRead && (
                              <span style={{ padding:'2px 6px', borderRadius:20, fontSize:10, fontWeight:700, background:'#fef3c7', color:'#92400e', flexShrink:0 }}>NEW</span>
                            )}
                          </div>
                          <p style={{ margin:0, fontSize:12, color:textMuted }}>
                            From Admin · {new Date(notice.createdAt).toLocaleString('en-IN', { timeZone:'Asia/Kolkata', day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                          </p>
                        </div>

                        <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                          <span style={{ fontSize:11, fontWeight:600, color: notice.isRead?textMuted:tc.color }}>
                            {notice.isRead ? 'Read' : 'Unread'}
                          </span>
                          {isExpanded ? <ChevronUp size={16} color={textMuted}/> : <ChevronDown size={16} color={textMuted}/>}
                        </div>
                      </div>

                      {/* Expanded body */}
                      {isExpanded && (
                        <div style={{ padding:'0 20px 20px', borderTop:`1px solid ${border}` }}>
                          <div style={{ marginTop:16, padding:'16px 18px', background:tc.bg, borderRadius:12, border:`1px solid ${tc.border2}` }}>
                            <p style={{ margin:0, fontSize:14, color:textPri, lineHeight:1.75, whiteSpace:'pre-wrap' }}>{notice.message}</p>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:12, flexWrap:'wrap', gap:8 }}>
                            <p style={{ margin:0, fontSize:12, color:textMuted }}>
                              📅 {new Date(notice.createdAt).toLocaleString('en-IN', { timeZone:'Asia/Kolkata' })}
                            </p>
                            {!notice.isRead && (
                              <button onClick={e => { e.stopPropagation(); markNoticeRead(notice._id); }}
                                style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:8, border:`1px solid ${tc.border2}`, background:tc.bg, color:tc.color, cursor:'pointer', fontSize:12, fontWeight:600 }}>
                                <CheckCircle size={12}/> Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── LOCATION PICKER MODAL ── */}
      {showLocationPicker && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:16 }}>
          <div style={{ background:bgCard, borderRadius:20, width:'100%', maxWidth:520, maxHeight:'90vh', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.3)', overflow:'hidden' }}>
            <div style={{ padding:'20px 24px 16px', borderBottom:`1px solid ${border}`, flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#1a56db,#7e3af2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:18 }}>📍</span>
                  </div>
                  <div>
                    <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:textPri }}>Set Your Voting Area</h3>
                    <p style={{ margin:0, fontSize:12, color:textSec }}>Select from locations created by Admin</p>
                  </div>
                </div>
                <button onClick={() => setShowLocationPicker(false)}
                  style={{ width:32, height:32, borderRadius:8, background: dk?'#334155':'#f1f5f9', border:'none', cursor:'pointer', color:textSec, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>✕</button>
              </div>
              {user?.voterLocation?.label && (
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background: dk?'rgba(26,86,219,0.15)':'#eff6ff', borderRadius:10, border:`1px solid ${dk?'rgba(26,86,219,0.3)':'#bfdbfe'}`, fontSize:12, color:'#1d4ed8' }}>
                  <span>📍</span>
                  <span>Current: <strong>{user.voterLocation.label}</strong></span>
                </div>
              )}
            </div>

            {selectedLoc.state && (
              <div style={{ padding:'10px 24px', background: dk?'rgba(26,86,219,0.08)':'#f8faff', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', flexShrink:0 }}>
                {[
                  locStates.find((x:any) => x._id === selectedLoc.state)?.name,
                  locDistricts.find((x:any) => x._id === selectedLoc.district)?.name,
                  locSubdistricts.find((x:any) => x._id === selectedLoc.subdistrict)?.name,
                  locLocalities.find((x:any) => x._id === selectedLoc.locality)?.name,
                ].filter(Boolean).map((name, i, arr) => (
                  <span key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:'#1a56db', padding:'3px 10px', background: dk?'rgba(26,86,219,0.2)':'#dbeafe', borderRadius:20 }}>{name}</span>
                    {i < arr.length - 1 && <span style={{ color:textMuted, fontSize:12 }}>›</span>}
                  </span>
                ))}
              </div>
            )}

            <div style={{ flex:1, overflowY:'auto', padding:'16px 24px', display:'flex', flexDirection:'column', gap:16 }}>
              {/* States */}
              <div>
                <p style={{ margin:'0 0 8px', fontSize:11, fontWeight:700, color:textMuted, textTransform:'uppercase', letterSpacing:'0.8px' }}>🏛️ State</p>
                {locStates.length === 0 ? (
                  <div style={{ padding:'12px', background:bgCard2, borderRadius:10, textAlign:'center', fontSize:12, color:textMuted }}>No states added by Admin yet</div>
                ) : (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {locStates.map((s:any) => (
                      <button key={s._id} onClick={() => handleLocChange('state', s._id, locStates)} className="loc-pill"
                        style={{ padding:'7px 16px', borderRadius:20, border:`2px solid ${selectedLoc.state===s._id?'#1a56db':border}`, background: selectedLoc.state===s._id?(dk?'rgba(26,86,219,0.25)':'#dbeafe'):bgCard2, color: selectedLoc.state===s._id?'#1a56db':textSec, cursor:'pointer', fontSize:13, fontWeight: selectedLoc.state===s._id?700:500, transition:'all 0.15s ease' }}>
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedLoc.state && (
                <div>
                  <p style={{ margin:'0 0 8px', fontSize:11, fontWeight:700, color:textMuted, textTransform:'uppercase', letterSpacing:'0.8px' }}>🏙️ District</p>
                  {locDistricts.length === 0 ? (
                    <div style={{ padding:'12px', background:bgCard2, borderRadius:10, textAlign:'center', fontSize:12, color:textMuted }}>No districts added for this state yet</div>
                  ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:8 }}>
                      {locDistricts.map((d:any) => (
                        <button key={d._id} onClick={() => handleLocChange('district', d._id, locDistricts)} className="loc-pill"
                          style={{ padding:'10px 14px', borderRadius:12, border:`2px solid ${selectedLoc.district===d._id?'#7e3af2':border}`, background: selectedLoc.district===d._id?(dk?'rgba(126,58,242,0.2)':'#f5f3ff'):bgCard2, color: selectedLoc.district===d._id?'#7e3af2':textSec, cursor:'pointer', fontSize:13, fontWeight: selectedLoc.district===d._id?700:500, textAlign:'left', transition:'all 0.15s ease' }}>
                          {d.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedLoc.district && (
                <div>
                  <p style={{ margin:'0 0 8px', fontSize:11, fontWeight:700, color:textMuted, textTransform:'uppercase', letterSpacing:'0.8px' }}>🏘️ Sub-District</p>
                  {locSubdistricts.length === 0 ? (
                    <div style={{ padding:'12px', background:bgCard2, borderRadius:10, textAlign:'center', fontSize:12, color:textMuted }}>No sub-districts added for this district yet</div>
                  ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:8 }}>
                      {locSubdistricts.map((s:any) => (
                        <button key={s._id} onClick={() => handleLocChange('subdistrict', s._id, locSubdistricts)} className="loc-pill"
                          style={{ padding:'10px 14px', borderRadius:12, border:`2px solid ${selectedLoc.subdistrict===s._id?'#0e9f6e':border}`, background: selectedLoc.subdistrict===s._id?(dk?'rgba(14,159,110,0.2)':'#f0fdf4'):bgCard2, color: selectedLoc.subdistrict===s._id?'#0e9f6e':textSec, cursor:'pointer', fontSize:13, fontWeight: selectedLoc.subdistrict===s._id?700:500, textAlign:'left', transition:'all 0.15s ease' }}>
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedLoc.subdistrict && (
                <div>
                  <p style={{ margin:'0 0 8px', fontSize:11, fontWeight:700, color:textMuted, textTransform:'uppercase', letterSpacing:'0.8px' }}>📍 Locality</p>
                  {locLocalities.length === 0 ? (
                    <div style={{ padding:'12px', background:bgCard2, borderRadius:10, textAlign:'center', fontSize:12, color:textMuted }}>No localities added for this sub-district yet</div>
                  ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:8 }}>
                      {locLocalities.map((l:any) => (
                        <button key={l._id} onClick={() => handleLocChange('locality', l._id, locLocalities)} className="loc-pill"
                          style={{ padding:'10px 14px', borderRadius:12, border:`2px solid ${selectedLoc.locality===l._id?'#ff5a1f':border}`, background: selectedLoc.locality===l._id?(dk?'rgba(255,90,31,0.2)':'#fff7ed'):bgCard2, color: selectedLoc.locality===l._id?'#ff5a1f':textSec, cursor:'pointer', fontSize:13, fontWeight: selectedLoc.locality===l._id?700:500, textAlign:'left', transition:'all 0.15s ease' }}>
                          {l.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedLoc.state && (
                <AreaElectionsPreview
                  areaFilter={selectedLoc} locStates={locStates} locDistricts={locDistricts}
                  locSubdistricts={locSubdistricts} locLocalities={locLocalities}
                  token={localStorage.getItem('token')} isDark={dk} border={border}
                  bgCard2={bgCard2} textPri={textPri} textSec={textSec} textMuted={textMuted}/>
              )}
            </div>

            <div style={{ padding:'16px 24px', borderTop:`1px solid ${border}`, flexShrink:0, display:'flex', gap:10 }}>
              <button onClick={() => { setSelectedLoc({}); setShowLocationPicker(false); fetchElections(localStorage.getItem('token')!); }}
                className="btn-secondary" style={{ flex:1, padding:'11px 0', borderRadius:12, border:`1px solid ${border}`, background:bgCard2, color:textSec, cursor:'pointer', fontWeight:600, fontSize:13 }}>
                🌍 Show All
              </button>
              <button onClick={handleSaveLocation} disabled={savingLoc || !selectedLoc.state}
                className="submit-btn" style={{ flex:2, padding:'11px 0', borderRadius:12, border:'none', background: selectedLoc.state?'linear-gradient(135deg,#1a56db,#7e3af2)':'#94a3b8', color:'#fff', cursor: selectedLoc.state?'pointer':'not-allowed', fontWeight:700, fontSize:13, boxShadow: selectedLoc.state?'0 4px 12px rgba(26,86,219,0.3)':'none' }}>
                {savingLoc ? '💾 Saving...' : '💾 Save Area & Filter Elections'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM VOTE MODAL ── */}
      {confirming && selectedElection && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:20 }}>
          <div style={{ background:bgCard, borderRadius:16, padding:'32px 28px', maxWidth:400, width:'100%', textAlign:'center' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'#eff6ff', border:'3px solid #1a56db', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:22, color:'#1a56db', margin:'0 auto 16px' }}>
              {confirming.name.charAt(0)}
            </div>
            <h3 style={{ margin:'0 0 8px', fontSize:18, color:textPri }}>Confirm Your Vote</h3>
            <p style={{ margin:'0 0 4px', fontSize:13, color:textSec }}>Election: <strong style={{ color:textPri }}>{selectedElection.title}</strong></p>
            <p style={{ margin:'0 0 4px', fontSize:13, color:textSec }}>Voting as: <strong style={{ color:textPri }}>{user.name}</strong></p>
            {user.aadhaarNumber && <p style={{ margin:'0 0 4px', fontSize:12, color:textMuted }}>Aadhaar: {user.aadhaarNumber}</p>}
            {user.eciCardNumber && <p style={{ margin:'0 0 4px', fontSize:12, color:textMuted }}>ECI: {user.eciCardNumber}</p>}
            <p style={{ margin:'8px 0 4px', fontSize:16, color:textPri, fontWeight:700 }}>{confirming.name}</p>
            <p style={{ margin:'0 0 20px', fontSize:13, color:textSec }}>{confirming.party}</p>
            <p style={{ margin:'0 0 20px', fontSize:12, color:'#ef4444', fontWeight:500 }}>⚠ This action cannot be undone.</p>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={() => setConfirming(null)} disabled={casting} className="cancel-btn"
                style={{ flex:1, padding:'10px 0', borderRadius:10, border:`1px solid ${border}`, background:bgCard2, color:textSec, cursor:'pointer', fontWeight:600, fontSize:13 }}>Cancel</button>
              <button onClick={confirmVote} disabled={casting} className="confirm-vote-btn"
                style={{ flex:1, padding:'10px 0', borderRadius:10, border:'none', background:'#1a56db', color:'#fff', cursor:casting?'not-allowed':'pointer', fontWeight:600, fontSize:13, opacity:casting?0.7:1 }}>
                {casting ? 'Saving...' : 'Confirm Vote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
