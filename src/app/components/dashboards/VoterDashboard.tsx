import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  Vote, CheckCircle, Clock, FileText, LogOut,
  Activity, ShieldCheck, Users, Timer, BarChart3,
  User, RefreshCw, Edit2, Save, X, AlertCircle,
  MessageSquare, Flag, Send, ChevronDown, ChevronUp,
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

const COLORS = ['#1a56db','#7e3af2','#0e9f6e','#ff5a1f','#e3a008','#e11d48','#0891b2'];

const CATEGORIES = ['General','EVM Issue','Booth Issue','Staff Behaviour','Process Issue','Other'];

export function VoterDashboard() {
  const navigate = useNavigate();

  const [user, setUser]                   = useState<VoterUser | null>(null);
  const [elections, setElections]         = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);

  // vote state
  const [hasVoted, setHasVoted]           = useState(false);
  const [votedFor, setVotedFor]           = useState('');
  const [voteHash, setVoteHash]           = useState('');
  const [voteTime, setVoteTime]           = useState('');
  const [electionTitle, setElectionTitle] = useState('');

  const [activeTab, setActiveTab]         = useState<'vote'|'activity'|'receipt'|'feedback'>('vote');
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

  // ── check vote status ────────────────────────────────────────
  const checkVoteStatus = async (token: string, electionList: Election[]) => {
    if (!electionList || electionList.length === 0) return;
    for (const election of electionList) {
      try {
        const res  = await fetch(`${API}/votes/has-voted/${election._id}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success && data.hasVoted) {
          try {
            const rRes  = await fetch(`${API}/votes/receipt/${election._id}`, { headers: { Authorization: `Bearer ${token}` } });
            const rData = await rRes.json();
            if (rData.success && rData.receipt) {
              setHasVoted(true);
              setVotedFor(rData.receipt.candidateName || 'Recorded');
              setVoteHash(rData.receipt.hash || '');
              setElectionTitle(rData.receipt.electionTitle || election.title);
              setVoteTime(rData.receipt.castAt ? new Date(rData.receipt.castAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '');
              setActiveTab('receipt');
              return;
            }
          } catch {}
          setHasVoted(true); setElectionTitle(election.title); setActiveTab('receipt');
          return;
        }
      } catch {}
    }
    setHasVoted(false); setActiveTab('vote');
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

  // ── auth guard ────────────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem('user');
    const parsed: VoterUser | null = raw ? JSON.parse(raw) : null;
    if (!parsed || parsed.role !== 'voter') { navigate('/', { replace: true }); return; }
    setUser(parsed); setNewName(parsed.name);
    if (parsed.voterLocation) setSelectedLoc(parsed.voterLocation);
    fetch(`${API}/locations?type=state`).then(r => r.json()).then(d => { if(d.success) setLocStates(d.data); }).catch(() => {});
    setHasVoted(false); setVotedFor(''); setVoteHash(''); setVoteTime('');
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
    if (level === 'state')       { next = { state: id }; setLocDistricts([]); setLocSubdistricts([]); setLocLocalities([]); fetchLocDistricts(id); }
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
        if (token2) { const el = await fetchElections(token2); await checkVoteStatus(token2, el); }
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
    setHasVoted(false); setVotedFor(''); setVoteHash(''); setVoteTime('');
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
        setHasVoted(true); setVotedFor(confirming.name); setElectionTitle(selectedElection.title);
        setVoteHash(data.receipt?.hash || ''); setVoteTime(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
        setConfirming(null); setActiveTab('receipt');
        toast.success(`✅ Vote cast for ${confirming.name}!`);
      } else if (data.message?.includes('already voted')) {
        toast.error('You have already voted!'); await handleRefresh(); setConfirming(null);
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
    const lines = [
      '╔══════════════════════════════════════╗',
      '║        SECUREVOTE PRO  RECEIPT       ║',
      '╚══════════════════════════════════════╝',
      '',
      `  Voter ID    : ${user.voterId || user._id}`,
      `  Voter Name  : ${user.name}`,
      user.aadhaarNumber ? `  Aadhaar No. : ${user.aadhaarNumber}` : '',
      user.eciCardNumber ? `  ECI Card    : ${user.eciCardNumber}` : '',
      `  Election    : ${electionTitle}`,
      `  Candidate   : ${votedFor}`,
      `  Status      : VOTE RECORDED IN DATABASE`,
      `  Timestamp   : ${voteTime}`,
      `  Hash        : ${voteHash}`,
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
    if (s === 'Resolved') return { bg: '#dcfce7', color: '#15803d' };
    if (s === 'Reviewed') return { bg: '#dbeafe', color: '#1d4ed8' };
    if (s === 'Dismissed') return { bg: '#fee2e2', color: '#dc2626' };
    return { bg: '#fef3c7', color: '#92400e' }; // Pending
  };

  if (verifying) return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ width:48, height:48, borderRadius:'50%', border:'4px solid #e2e8f0', borderTopColor:'#1a56db', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color:'#64748b', fontSize:14, fontWeight:500 }}>Checking vote status from database...</p>
    </div>
  );

  if (!user) return null;

  const activities = [
    { icon:<ShieldCheck size={16}/>, text:'Election started',              time:'1 hour ago',     color:'#0e9f6e' },
    { icon:<Users       size={16}/>, text:'Voters actively casting votes', time:'45 minutes ago', color:'#1a56db' },
    { icon:<BarChart3   size={16}/>, text:'High turnout detected',         time:'20 minutes ago', color:'#7e3af2' },
    { icon:<Activity    size={16}/>, text:'Live results being processed',  time:'5 minutes ago',  color:'#ff5a1f' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'Segoe UI',sans-serif" }}>

      {/* NAV */}
      <nav style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'0 24px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:8, background:'linear-gradient(135deg,#1a56db,#7e3af2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ShieldCheck size={18} color="#fff"/>
          </div>
          <span style={{ fontWeight:700, fontSize:16, color:'#1e293b' }}>SecureVote Pro</span>
          <span style={{ marginLeft:8, padding:'2px 8px', borderRadius:20, background:'#dcfce7', color:'#166534', fontSize:11, fontWeight:600 }}>LIVE</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
            <User size={14} color="#64748b"/>
            <span style={{ fontWeight:600, color:'#1e293b' }}>{user.name}</span>
            {user.voterId && <span style={{ color:'#94a3b8', fontSize:11 }}>· {user.voterId}</span>}
            <span style={{ padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600, background: hasVoted?'#dcfce7':'#fef3c7', color: hasVoted?'#166534':'#92400e' }}>
              {hasVoted ? '✓ Voted' : 'Not Voted'}
            </span>
          </div>
          <button onClick={handleRefresh} disabled={loading} style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 10px', borderRadius:8, border:'1px solid #e2e8f0', background:'#fff', color:'#64748b', cursor:'pointer', fontSize:12 }}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }}/> Refresh
          </button>
          <button onClick={logout} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:8, border:'1px solid #e2e8f0', background:'#fff', color:'#64748b', cursor:'pointer', fontSize:13 }}>
            <LogOut size={14}/> Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:960, margin:'0 auto', padding:'28px 20px' }}>

        {/* IDENTITY CARD */}
        <div style={{ background:'linear-gradient(135deg,#1a56db,#7e3af2)', borderRadius:16, padding:'20px 24px', marginBottom:24, color:'#fff' }}>
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
                    <button onClick={handleSaveName} disabled={savingName} style={{ background:'rgba(255,255,255,0.3)', border:'none', borderRadius:6, padding:'4px 10px', cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', gap:4, fontSize:12 }}>
                      <Save size={12}/>{savingName?'...':'Save'}
                    </button>
                    <button onClick={() => {setEditingName(false); setNewName(user.name);}} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:6, padding:'4px 8px', cursor:'pointer', color:'#fff' }}>
                      <X size={12}/>
                    </button>
                  </div>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <p style={{ margin:0, fontSize:18, fontWeight:700 }}>{user.name}</p>
                    <button onClick={() => setEditingName(true)} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:6, padding:'3px 8px', cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', gap:4, fontSize:11 }}>
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
                style={{ marginBottom:8, display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.18)', border:'none', borderRadius:8, padding:'5px 12px', cursor:'pointer', color:'#fff', fontSize:12, fontWeight:500 }}>
                📍 {user.voterLocation?.label ? user.voterLocation.label.split(',')[0] + '...' : 'Set Your Area'}
              </button>
              <p style={{ margin:'0 0 4px', fontSize:11, opacity:0.7 }}>VOTE STATUS</p>
              <div style={{ background: hasVoted?'rgba(22,163,74,0.3)':'rgba(255,255,255,0.15)', borderRadius:10, padding:'8px 16px', border: hasVoted?'1px solid rgba(22,163,74,0.5)':'1px solid rgba(255,255,255,0.3)' }}>
                <p style={{ margin:0, fontSize:16, fontWeight:700 }}>{hasVoted ? '✅ Vote Cast' : '⏳ Not Voted'}</p>
                {hasVoted && votedFor && <p style={{ margin:'2px 0 0', fontSize:12, opacity:0.85 }}>for {votedFor}</p>}
                {hasVoted && electionTitle && <p style={{ margin:'2px 0 0', fontSize:11, opacity:0.7 }}>{electionTitle}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:24 }}>
          {[
            { label:'Active Elections', value:String(elections.length),  icon:<Activity size={20}/>, accent:'#0e9f6e', bg:'#f0fdf4' },
            { label:'My Vote Status',   value: hasVoted?`✓ ${votedFor}`:'Not Voted', icon:<Vote size={20}/>, accent: hasVoted?'#0e9f6e':'#f59e0b', bg: hasVoted?'#f0fdf4':'#fffbeb' },
            { label:'Candidates',       value: String(selectedElection?.candidates?.length || 0), icon:<Users size={20}/>, accent:'#1a56db', bg:'#eff6ff' },
            { label:'Time Remaining',   value:fmt(timeLeft), icon:<Timer size={20}/>, accent:'#ff5a1f', bg:'#fff7ed' },
          ].map((c,i) => (
            <div key={i} style={{ background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', padding:'18px 20px', display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:42, height:42, borderRadius:10, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', color:c.accent, flexShrink:0 }}>{c.icon}</div>
              <div>
                <p style={{ margin:0, fontSize:12, color:'#64748b', fontWeight:500 }}>{c.label}</p>
                <p style={{ margin:'2px 0 0', fontSize:15, fontWeight:700, color:c.accent }}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* STATUS BANNER */}
        {hasVoted ? (
          <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:12, padding:'14px 20px', display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
            <CheckCircle size={20} color="#16a34a"/>
            <div>
              <p style={{ margin:0, fontWeight:600, color:'#15803d', fontSize:14 }}>✅ Vote Confirmed</p>
              <p style={{ margin:0, color:'#166534', fontSize:13 }}>You voted for <strong>{votedFor}</strong> in <strong>{electionTitle}</strong>.</p>
            </div>
          </div>
        ) : (
          <div style={{ background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:12, padding:'14px 20px', display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
            <Clock size={20} color="#d97706"/>
            <div>
              <p style={{ margin:0, fontWeight:600, color:'#92400e', fontSize:14 }}>You have not voted yet</p>
              <p style={{ margin:0, color:'#b45309', fontSize:13 }}>Select a candidate below to cast your vote.</p>
            </div>
          </div>
        )}

        {/* ELECTION SELECTOR */}
        {!hasVoted && elections.length > 1 && (
          <div style={{ marginBottom:20 }}>
            <p style={{ margin:'0 0 8px', fontSize:13, fontWeight:600, color:'#374151' }}>Select Election:</p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {elections.map(e => (
                <button key={e._id} onClick={() => setSelectedElection(e)} style={{ padding:'8px 16px', borderRadius:8, border: selectedElection?._id===e._id ? '2px solid #1a56db' : '1px solid #e2e8f0', background: selectedElection?._id===e._id ? '#eff6ff' : '#fff', color: selectedElection?._id===e._id ? '#1a56db' : '#374151', cursor:'pointer', fontSize:13, fontWeight:500 }}>
                  {e.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TABS */}
        <div style={{ display:'flex', gap:4, background:'#f1f5f9', borderRadius:10, padding:4, marginBottom:24, width:'fit-content', flexWrap:'wrap' }}>
          {(['vote','activity','receipt','feedback'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding:'8px 20px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:500, background: activeTab===tab?'#fff':'transparent', color: activeTab===tab?'#1e293b':'#64748b', boxShadow: activeTab===tab?'0 1px 3px rgba(0,0,0,0.1)':'none', transition:'all 0.15s', display:'flex', alignItems:'center', gap:6 }}>
              {tab==='vote' ? <><Vote size={13}/>Cast Vote</> : tab==='activity' ? <><Activity size={13}/>Activity</> : tab==='receipt' ? <><FileText size={13}/>My Receipt</> : <><MessageSquare size={13}/>Feedback & Complaints</>}
            </button>
          ))}
        </div>

        {/* CAST VOTE TAB */}
        {activeTab==='vote' && (
          <div>
            {elections.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', padding:'40px', textAlign:'center' }}>
                <AlertCircle size={40} color="#94a3b8" style={{ marginBottom:12 }}/>
                <p style={{ margin:0, fontWeight:600, fontSize:15, color:'#64748b' }}>No active elections</p>
                <p style={{ margin:'8px 0 0', fontSize:13, color:'#94a3b8' }}>{user?.voterLocation?.label ? `No elections found for your area: ${user.voterLocation.label}` : 'There are no active elections at the moment.'}</p>
              </div>
            ) : !selectedElection ? null : (() => {
              const areaMatch = isVoterAreaMatch(selectedElection);
              const hasLocation = !!(selectedElection.location?.state || selectedElection.location?.district || selectedElection.location?.subdistrict || selectedElection.location?.locality);
              return (
                <>
                  <div style={{ marginBottom:16 }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                      <div>
                        <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:'#1e293b' }}>{selectedElection.title}</h2>
                        {selectedElection.location?.label && <p style={{ margin:'3px 0 2px', fontSize:12, color:'#6366f1' }}>📍 {selectedElection.location.label}</p>}
                        <p style={{ margin:'4px 0 0', fontSize:13, color:'#64748b' }}>{hasVoted ? `✅ You already voted for "${votedFor}".` : 'Select a candidate below.'}</p>
                      </div>
                      <button onClick={() => setShowLocationPicker(true)} style={{ padding:'6px 14px', borderRadius:8, border:'1px solid #e2e8f0', background:'#f8fafc', color:'#64748b', cursor:'pointer', fontSize:12, fontWeight:500, display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                        📍 {user?.voterLocation?.label ? user.voterLocation.label.split(',')[0] : 'Set Area'}
                      </button>
                    </div>
                  </div>

                  {hasLocation && !user?.voterLocation?.label && !hasVoted && (
                    <div style={{ background:'#fef3c7', border:'1px solid #fcd34d', borderRadius:12, padding:'20px 24px', marginBottom:16, display:'flex', alignItems:'center', gap:16 }}>
                      <span style={{ fontSize:32 }}>🗺️</span>
                      <div style={{ flex:1 }}>
                        <p style={{ margin:0, fontWeight:700, fontSize:15, color:'#92400e' }}>Set your area to see candidates</p>
                        <p style={{ margin:'4px 0 8px', fontSize:13, color:'#b45309' }}>This election is for <strong>{selectedElection.location?.label}</strong>.</p>
                        <button onClick={() => setShowLocationPicker(true)} style={{ padding:'8px 20px', borderRadius:8, border:'none', background:'#d97706', color:'#fff', cursor:'pointer', fontWeight:600, fontSize:13 }}>📍 Set My Area Now</button>
                      </div>
                    </div>
                  )}

                  {hasLocation && user?.voterLocation?.label && !areaMatch && !hasVoted && (
                    <div style={{ background:'#fef2f2', border:'2px solid #fca5a5', borderRadius:12, padding:'24px', marginBottom:16, textAlign:'center' }}>
                      <div style={{ fontSize:48, marginBottom:12 }}>🚫</div>
                      <p style={{ margin:0, fontWeight:700, fontSize:17, color:'#dc2626' }}>Not Allowed to Vote Here</p>
                      <p style={{ margin:'8px 0 16px', fontSize:14, color:'#ef4444' }}>This election is for <strong>{selectedElection.location?.label}</strong>. Your area: <strong>{user.voterLocation?.label}</strong></p>
                      <button onClick={() => setShowLocationPicker(true)} style={{ padding:'8px 20px', borderRadius:8, border:'1px solid #fca5a5', background:'#fff', color:'#dc2626', cursor:'pointer', fontWeight:600, fontSize:13 }}>📍 Update My Area</button>
                    </div>
                  )}

                  {(areaMatch || !hasLocation) && (
                    <>
                      {hasLocation && areaMatch && user?.voterLocation?.label && !hasVoted && (
                        <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:10, padding:'10px 16px', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                          <CheckCircle size={16} color="#16a34a"/>
                          <span style={{ fontSize:13, color:'#15803d', fontWeight:500 }}>✅ Your area matches — you are eligible to vote here</span>
                        </div>
                      )}
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
                        {selectedElection.candidates.map((c, idx) => {
                          const color = COLORS[idx % COLORS.length];
                          const isMyVote = hasVoted && votedFor===c.name;
                          return (
                            <div key={c._id} style={{ background:'#fff', border: isMyVote?`2px solid ${color}`:'1px solid #e2e8f0', borderRadius:12, padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', opacity: hasVoted&&!isMyVote?0.45:1 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                                <div style={{ width:44, height:44, borderRadius:'50%', background:color+'18', border:`2px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:16, color, flexShrink:0 }}>{c.name.charAt(0)}</div>
                                <div>
                                  <p style={{ margin:0, fontWeight:600, fontSize:15, color:'#1e293b' }}>{c.name}</p>
                                  <p style={{ margin:'2px 0 0', fontSize:12, color:'#64748b' }}>{c.party}</p>
                                </div>
                              </div>
                              {isMyVote ? (
                                <div style={{ display:'flex', alignItems:'center', gap:6, color:'#16a34a', fontSize:13, fontWeight:600 }}><CheckCircle size={16}/> Voted</div>
                              ) : (
                                <button disabled={hasVoted} onClick={() => setConfirming(c)} style={{ padding:'8px 18px', borderRadius:8, background: hasVoted?'#f1f5f9':color, color: hasVoted?'#94a3b8':'#fff', border:'none', cursor: hasVoted?'not-allowed':'pointer', fontWeight:600, fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
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

        {/* ACTIVITY TAB */}
        {activeTab==='activity' && (
          <div>
            <h2 style={{ margin:'0 0 16px', fontSize:18, fontWeight:700, color:'#1e293b' }}>Voting Activity</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {activities.map((a,i) => (
                <div key={i} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'16px 20px', display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:a.color+'15', display:'flex', alignItems:'center', justifyContent:'center', color:a.color, flexShrink:0 }}>{a.icon}</div>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:0, fontWeight:500, fontSize:14, color:'#1e293b' }}>{a.text}</p>
                    <p style={{ margin:'2px 0 0', fontSize:12, color:'#94a3b8' }}>{a.time}</p>
                  </div>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:a.color }}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECEIPT TAB */}
        {activeTab==='receipt' && (
          <div>
            <h2 style={{ margin:'0 0 4px', fontSize:18, fontWeight:700, color:'#1e293b' }}>Vote Receipt</h2>
            <p style={{ margin:'0 0 16px', fontSize:13, color:'#64748b' }}>Fetched from votes collection in database</p>
            {hasVoted ? (
              <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:'28px', maxWidth:480 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, paddingBottom:20, borderBottom:'1px dashed #e2e8f0' }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <CheckCircle size={20} color="#16a34a"/>
                  </div>
                  <div>
                    <p style={{ margin:0, fontWeight:700, fontSize:15, color:'#15803d' }}>Vote Stored ✅</p>
                    <p style={{ margin:0, fontSize:12, color:'#64748b' }}>Immutable · Blockchain-verified</p>
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {[
                    { label:'Voter ID',   value: user.voterId || user._id },
                    { label:'Voter Name', value: user.name },
                    ...(user.aadhaarNumber ? [{ label:'Aadhaar No.', value: user.aadhaarNumber }] : []),
                    ...(user.eciCardNumber ? [{ label:'ECI Card',    value: user.eciCardNumber  }] : []),
                    { label:'Election',   value: electionTitle || 'N/A' },
                    { label:'Candidate',  value: votedFor      || 'Recorded' },
                    { label:'Status',     value: 'CONFIRMED' },
                    { label:'Timestamp',  value: voteTime      || 'N/A' },
                    { label:'Hash',       value: voteHash ? voteHash.substring(0,28)+'...' : 'N/A' },
                  ].map((row,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom: i<7?'1px solid #f1f5f9':'none', paddingBottom:8 }}>
                      <span style={{ fontSize:13, color:'#64748b', fontWeight:500 }}>{row.label}</span>
                      <span style={{ fontSize:13, fontWeight:600, background: row.label==='Status'?'#dcfce7':'transparent', color: row.label==='Status'?'#15803d':'#1e293b', padding: row.label==='Status'?'2px 10px':'0', borderRadius: row.label==='Status'?20:0 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={downloadReceipt} style={{ marginTop:24, width:'100%', padding:'10px 0', borderRadius:10, border:'1px solid #e2e8f0', background:'#f8fafc', color:'#1e293b', cursor:'pointer', fontWeight:600, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <FileText size={15}/> Download Receipt
                </button>
              </div>
            ) : (
              <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:'40px 28px', textAlign:'center', maxWidth:400 }}>
                <Clock size={40} color="#e3a008" style={{ marginBottom:12 }}/>
                <p style={{ margin:0, fontWeight:600, fontSize:15, color:'#92400e' }}>No vote found</p>
                <p style={{ margin:'8px 0 20px', fontSize:13, color:'#64748b' }}>Cast your vote first.</p>
                <button onClick={() => setActiveTab('vote')} style={{ padding:'10px 24px', borderRadius:10, background:'#1a56db', color:'#fff', border:'none', cursor:'pointer', fontWeight:600, fontSize:13, display:'inline-flex', alignItems:'center', gap:8 }}>
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
                <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:'#1e293b' }}>Feedback & Complaints</h2>
                <p style={{ margin:'4px 0 0', fontSize:13, color:'#64748b' }}>Submit feedback or raise a complaint to the concerned authority</p>
              </div>
            </div>

            {/* Sub tabs */}
            <div style={{ display:'flex', gap:4, background:'#f1f5f9', borderRadius:10, padding:4, marginBottom:24, width:'fit-content' }}>
              <button onClick={() => setFeedbackTab('submit')} style={{ padding:'8px 20px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:500, background: feedbackTab==='submit'?'#fff':'transparent', color: feedbackTab==='submit'?'#1e293b':'#64748b', boxShadow: feedbackTab==='submit'?'0 1px 3px rgba(0,0,0,0.1)':'none' }}>
                <span style={{ display:'flex', alignItems:'center', gap:6 }}><Send size={13}/> Submit New</span>
              </button>
              <button onClick={() => { setFeedbackTab('history'); fetchMyFeedbacks(); }} style={{ padding:'8px 20px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:500, background: feedbackTab==='history'?'#fff':'transparent', color: feedbackTab==='history'?'#1e293b':'#64748b', boxShadow: feedbackTab==='history'?'0 1px 3px rgba(0,0,0,0.1)':'none' }}>
                <span style={{ display:'flex', alignItems:'center', gap:6 }}><Clock size={13}/> My History ({myFeedbacks.length})</span>
              </button>
            </div>

            {/* SUBMIT FORM */}
            {feedbackTab==='submit' && (
              <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', padding:'28px', maxWidth:600 }}>

                {/* Type selector */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
                  <button onClick={() => setFeedbackType('feedback')} style={{ padding:'16px', borderRadius:12, border: feedbackType==='feedback'?'2px solid #1a56db':'1px solid #e2e8f0', background: feedbackType==='feedback'?'#eff6ff':'#f8fafc', cursor:'pointer', textAlign:'left' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <div style={{ width:36, height:36, borderRadius:8, background: feedbackType==='feedback'?'#1a56db':'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <MessageSquare size={18} color={feedbackType==='feedback'?'#fff':'#64748b'}/>
                      </div>
                      <span style={{ fontWeight:700, fontSize:14, color: feedbackType==='feedback'?'#1a56db':'#374151' }}>Feedback</span>
                    </div>
                    <p style={{ margin:0, fontSize:12, color:'#64748b' }}>General feedback visible to all authorities (DM, SDM, CDO, Admin)</p>
                  </button>
                  <button onClick={() => setFeedbackType('complaint')} style={{ padding:'16px', borderRadius:12, border: feedbackType==='complaint'?'2px solid #dc2626':'1px solid #e2e8f0', background: feedbackType==='complaint'?'#fef2f2':'#f8fafc', cursor:'pointer', textAlign:'left' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <div style={{ width:36, height:36, borderRadius:8, background: feedbackType==='complaint'?'#dc2626':'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Flag size={18} color={feedbackType==='complaint'?'#fff':'#64748b'}/>
                      </div>
                      <span style={{ fontWeight:700, fontSize:14, color: feedbackType==='complaint'?'#dc2626':'#374151' }}>Complaint</span>
                    </div>
                    <p style={{ margin:0, fontSize:12, color:'#64748b' }}>Directed complaint to a specific authority only (+ Admin)</p>
                  </button>
                </div>

                {/* Target role selector — only for complaints */}
                {feedbackType==='complaint' && (
                  <div style={{ marginBottom:20 }}>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:8 }}>
                      🎯 Send complaint to:
                    </label>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                      {(['dm','sdm','cdo','admin'] as const).map(role => (
                        <button key={role} onClick={() => setFbTargetRole(role)} style={{ padding:'10px 8px', borderRadius:10, border: fbTargetRole===role?'2px solid #dc2626':'1px solid #e2e8f0', background: fbTargetRole===role?'#fef2f2':'#f8fafc', cursor:'pointer', fontWeight:700, fontSize:13, color: fbTargetRole===role?'#dc2626':'#374151', textTransform:'uppercase' }}>
                          {role}
                        </button>
                      ))}
                    </div>
                    <p style={{ margin:'8px 0 0', fontSize:12, color:'#94a3b8' }}>
                      {fbTargetRole==='dm'    && '📋 District Magistrate will see this complaint'}
                      {fbTargetRole==='sdm'   && '📋 Sub-District Magistrate will see this complaint'}
                      {fbTargetRole==='cdo'   && '📋 Chief Development Officer will see this complaint'}
                      {fbTargetRole==='admin' && '📋 System Administrator will see this complaint'}
                      {' '}(Admin always has access to all complaints)
                    </p>
                  </div>
                )}

                {/* Category */}
                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Category</label>
                  <select value={fbCategory} onChange={e => setFbCategory(e.target.value)}
                    style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:8, padding:'10px 12px', fontSize:13, outline:'none', background:'#fff', color:'#1e293b', appearance:'auto' }}>
                    {CATEGORIES.map(c => <option key={c} value={c} style={{ color:'#1e293b', background:'#fff' }}>{c}</option>)}
                  </select>
                </div>

                {/* Election (optional) */}
                {elections.length > 0 && (
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Related Election (optional)</label>
                    <select value={fbElection} onChange={e => setFbElection(e.target.value)}
                      style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:8, padding:'10px 12px', fontSize:13, outline:'none', background:'#fff', color:'#1e293b', appearance:'auto' }}>
                      <option value="" style={{ color:'#6b7280', background:'#fff' }}>None</option>
                      {elections.map(e => <option key={e._id} value={e._id} style={{ color:'#1e293b', background:'#fff' }}>{e.title}</option>)}
                    </select>
                  </div>
                )}

                {/* Subject */}
                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Subject *</label>
                  <input value={fbSubject} onChange={e => setFbSubject(e.target.value)} maxLength={100}
                    placeholder={feedbackType==='complaint' ? 'Brief title of your complaint...' : 'Brief title of your feedback...'}
                    style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:8, padding:'10px 12px', fontSize:13, outline:'none', boxSizing:'border-box', color:'#1e293b', background:'#fff' }}/>
                </div>

                {/* Message */}
                <div style={{ marginBottom:24 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Message *</label>
                  <textarea value={fbMessage} onChange={e => setFbMessage(e.target.value)} maxLength={1000} rows={5}
                    placeholder={feedbackType==='complaint' ? 'Describe your complaint in detail...' : 'Share your feedback, suggestions, or observations...'}
                    style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:8, padding:'10px 12px', fontSize:13, outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box', color:'#1e293b', background:'#fff' }}/>
                  <p style={{ margin:'4px 0 0', fontSize:11, color:'#94a3b8', textAlign:'right' }}>{fbMessage.length}/1000</p>
                </div>

                {/* Info banner */}
                <div style={{ background: feedbackType==='complaint'?'#fef2f2':'#eff6ff', border: `1px solid ${feedbackType==='complaint'?'#fca5a5':'#bfdbfe'}`, borderRadius:10, padding:'12px 14px', marginBottom:20, fontSize:12, color: feedbackType==='complaint'?'#dc2626':'#1d4ed8' }}>
                  {feedbackType==='complaint'
                    ? `🔒 This complaint will be sent to ${fbTargetRole.toUpperCase()} and Admin only. Other authorities cannot see it.`
                    : '📢 This feedback will be visible to all authorities: DM, SDM, CDO, and Admin.'}
                </div>

                <button onClick={handleSubmitFeedback} disabled={submittingFb || !fbSubject.trim() || !fbMessage.trim()}
                  style={{ width:'100%', padding:'12px 0', borderRadius:10, border:'none', background: (submittingFb || !fbSubject.trim() || !fbMessage.trim())?'#94a3b8': feedbackType==='complaint'?'#dc2626':'#1a56db', color:'#fff', cursor:(submittingFb || !fbSubject.trim() || !fbMessage.trim())?'not-allowed':'pointer', fontWeight:700, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <Send size={15}/>{submittingFb ? 'Submitting...' : feedbackType==='complaint' ? '🚩 Submit Complaint' : '💬 Submit Feedback'}
                </button>
              </div>
            )}

            {/* HISTORY */}
            {feedbackTab==='history' && (
              <div>
                {loadingFb ? (
                  <div style={{ textAlign:'center', padding:'40px', color:'#64748b' }}>Loading...</div>
                ) : myFeedbacks.length === 0 ? (
                  <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', padding:'40px', textAlign:'center' }}>
                    <MessageSquare size={40} color="#94a3b8" style={{ marginBottom:12 }}/>
                    <p style={{ margin:0, fontWeight:600, fontSize:15, color:'#64748b' }}>No submissions yet</p>
                    <p style={{ margin:'8px 0 16px', fontSize:13, color:'#94a3b8' }}>You haven't submitted any feedback or complaints.</p>
                    <button onClick={() => setFeedbackTab('submit')} style={{ padding:'10px 24px', borderRadius:10, background:'#1a56db', color:'#fff', border:'none', cursor:'pointer', fontWeight:600, fontSize:13 }}>
                      Submit Your First Feedback
                    </button>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {myFeedbacks.map(fb => {
                      const sc = statusColor(fb.status);
                      const isExpanded = expandedFb === fb._id;
                      return (
                        <div key={fb._id} style={{ background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden' }}>
                          <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, cursor:'pointer' }} onClick={() => setExpandedFb(isExpanded ? null : fb._id)}>
                            <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 }}>
                              <div style={{ width:36, height:36, borderRadius:8, background: fb.type==='complaint'?'#fef2f2':'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                {fb.type==='complaint' ? <Flag size={16} color="#dc2626"/> : <MessageSquare size={16} color="#1a56db"/>}
                              </div>
                              <div style={{ minWidth:0 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                                  <p style={{ margin:0, fontWeight:600, fontSize:14, color:'#1e293b' }}>{fb.subject}</p>
                                  <span style={{ padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600, background: fb.type==='complaint'?'#fef2f2':'#eff6ff', color: fb.type==='complaint'?'#dc2626':'#1a56db' }}>
                                    {fb.type==='complaint' ? '🚩 Complaint' : '💬 Feedback'}
                                  </span>
                                  {fb.type==='complaint' && fb.targetRole && (
                                    <span style={{ padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600, background:'#f1f5f9', color:'#475569' }}>
                                      → {fb.targetRole.toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <p style={{ margin:'2px 0 0', fontSize:12, color:'#94a3b8' }}>{fb.category} · {new Date(fb.createdAt).toLocaleDateString('en-IN')}</p>
                              </div>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                              <span style={{ padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600, background:sc.bg, color:sc.color }}>{fb.status}</span>
                              {isExpanded ? <ChevronUp size={16} color="#94a3b8"/> : <ChevronDown size={16} color="#94a3b8"/>}
                            </div>
                          </div>

                          {/* Expanded details */}
                          {isExpanded && (
                            <div style={{ padding:'0 20px 20px', borderTop:'1px solid #f1f5f9' }}>
                              <p style={{ margin:'16px 0 8px', fontSize:13, fontWeight:600, color:'#374151' }}>Your Message:</p>
                              <p style={{ margin:0, fontSize:13, color:'#475569', background:'#f8fafc', borderRadius:8, padding:'12px', lineHeight:1.6 }}>{fb.message}</p>

                              {fb.response ? (
                                <div style={{ marginTop:16, background:'#f0fdf4', border:'1px solid #86efac', borderRadius:10, padding:'14px' }}>
                                  <p style={{ margin:'0 0 6px', fontSize:12, fontWeight:700, color:'#15803d' }}>✅ Response from {fb.respondedBy}:</p>
                                  <p style={{ margin:0, fontSize:13, color:'#166534', lineHeight:1.6 }}>{fb.response}</p>
                                  {fb.respondedAt && <p style={{ margin:'6px 0 0', fontSize:11, color:'#86efac' }}>{new Date(fb.respondedAt).toLocaleString('en-IN')}</p>}
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
      </div>

      {/* LOCATION PICKER MODAL */}
      {showLocationPicker && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:20 }}>
          <div style={{ background:'#fff', borderRadius:16, padding:'28px', maxWidth:440, width:'100%' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div>
                <h3 style={{ margin:0, fontSize:17, fontWeight:700, color:'#1e293b' }}>📍 Set Your Area</h3>
                <p style={{ margin:'4px 0 0', fontSize:13, color:'#64748b' }}>Elections will be filtered for your location</p>
              </div>
              <button onClick={() => setShowLocationPicker(false)} style={{ background:'#f1f5f9', border:'none', borderRadius:8, padding:'6px 10px', cursor:'pointer', color:'#64748b', fontSize:16 }}>✕</button>
            </div>
            {user?.voterLocation?.label && (
              <div style={{ padding:'10px 14px', background:'#eff6ff', borderRadius:10, marginBottom:16, border:'1px solid #bfdbfe', fontSize:13, color:'#1d4ed8' }}>
                📍 Current: <strong>{user.voterLocation.label}</strong>
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
              {[
                { level:'state',       label:'🏛️ State',        value: selectedLoc.state||'',       list: locStates,       disabled: false,                    placeholder:'Select state' },
                { level:'district',    label:'🏙️ District',     value: selectedLoc.district||'',    list: locDistricts,    disabled: !selectedLoc.state,       placeholder: selectedLoc.state?'Select district':'— select state first' },
                { level:'subdistrict', label:'🏘️ Sub-District', value: selectedLoc.subdistrict||'', list: locSubdistricts, disabled: !selectedLoc.district,    placeholder: selectedLoc.district?'Select sub-district':'— select district first' },
                { level:'locality',    label:'📍 Locality',     value: selectedLoc.locality||'',    list: locLocalities,   disabled: !selectedLoc.subdistrict, placeholder: selectedLoc.subdistrict?'Select locality':'— select sub-district first' },
              ].map(f => (
                <div key={f.level}>
                  <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:4 }}>{f.label}</label>
                  <select value={f.value} onChange={e => handleLocChange(f.level, e.target.value, f.list)} disabled={f.disabled}
                    style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:8, padding:'8px 10px', fontSize:13, outline:'none', background: f.disabled?'#f9fafb':'#fff', opacity: f.disabled?0.6:1 }}>
                    <option value="">{f.placeholder}</option>
                    {f.list.map((x:any) => <option key={x._id} value={x._id}>{x.name}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => { setSelectedLoc({}); setShowLocationPicker(false); }} style={{ flex:1, padding:'10px 0', borderRadius:10, border:'1px solid #e2e8f0', background:'#f8fafc', color:'#64748b', cursor:'pointer', fontWeight:600, fontSize:13 }}>Show All</button>
              <button onClick={handleSaveLocation} disabled={savingLoc || !selectedLoc.state} style={{ flex:2, padding:'10px 0', borderRadius:10, border:'none', background: selectedLoc.state?'#1a56db':'#94a3b8', color:'#fff', cursor: selectedLoc.state?'pointer':'not-allowed', fontWeight:600, fontSize:13 }}>
                {savingLoc ? 'Saving...' : '💾 Save & Filter Elections'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM VOTE MODAL */}
      {confirming && selectedElection && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:20 }}>
          <div style={{ background:'#fff', borderRadius:16, padding:'32px 28px', maxWidth:400, width:'100%', textAlign:'center' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'#eff6ff', border:'3px solid #1a56db', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:22, color:'#1a56db', margin:'0 auto 16px' }}>
              {confirming.name.charAt(0)}
            </div>
            <h3 style={{ margin:'0 0 8px', fontSize:18, color:'#1e293b' }}>Confirm Your Vote</h3>
            <p style={{ margin:'0 0 4px', fontSize:13, color:'#64748b' }}>Election: <strong style={{ color:'#1e293b' }}>{selectedElection.title}</strong></p>
            <p style={{ margin:'0 0 4px', fontSize:13, color:'#64748b' }}>Voting as: <strong style={{ color:'#1e293b' }}>{user.name}</strong></p>
            {user.aadhaarNumber && <p style={{ margin:'0 0 4px', fontSize:12, color:'#94a3b8' }}>Aadhaar: {user.aadhaarNumber}</p>}
            {user.eciCardNumber && <p style={{ margin:'0 0 4px', fontSize:12, color:'#94a3b8' }}>ECI: {user.eciCardNumber}</p>}
            <p style={{ margin:'8px 0 4px', fontSize:16, color:'#1e293b', fontWeight:700 }}>{confirming.name}</p>
            <p style={{ margin:'0 0 20px', fontSize:13, color:'#64748b' }}>{confirming.party}</p>
            <p style={{ margin:'0 0 20px', fontSize:12, color:'#ef4444', fontWeight:500 }}>⚠ This action cannot be undone.</p>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={() => setConfirming(null)} disabled={casting} style={{ flex:1, padding:'10px 0', borderRadius:10, border:'1px solid #e2e8f0', background:'#f8fafc', color:'#64748b', cursor:'pointer', fontWeight:600, fontSize:13 }}>Cancel</button>
              <button onClick={confirmVote} disabled={casting} style={{ flex:1, padding:'10px 0', borderRadius:10, border:'none', background:'#1a56db', color:'#fff', cursor:casting?'not-allowed':'pointer', fontWeight:600, fontSize:13, opacity:casting?0.7:1 }}>
                {casting?'Saving...':'Confirm Vote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
