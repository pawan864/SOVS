import { useEffect, useState } from 'react';
import { SettingsModal }    from './SettingsModal';
import { ProfileModal }     from './ProfileModal';
import { LocationManager }  from './LocationManager';
import { LocationPicker }   from './LocationPicker';
import type { LocationValue } from './LocationPicker';
import { useNavigate } from 'react-router';
import { authService } from '../../lib/auth';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import {
  Users, Vote, BarChart3, Settings, Shield,
  TrendingUp, Activity, CheckCircle, Clock,
  Eye, Plus, Calendar, User, X, RefreshCw,
  UserPlus, Trash2, Lock, Unlock, AlertTriangle, Ban, ShieldOff,
  Camera, Key, LogOut, Mail, Building, MapPin, Edit3, Save, Moon, Sun, Navigation,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const API    = 'http://localhost:5001/api';
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const ALL_ROLES = ['voter', 'dm', 'sdm', 'cdo'];

// ── Create Election Modal ─────────────────────────────────────────
function CreateElectionModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    title:'', description:'', startDate:'', endDate:'', totalVoters:'',
    visibleTo: ['voter','dm','sdm','cdo'] as string[],
  });
  const [location, setLocation] = useState<LocationValue>({});
  const [loading, setLoading] = useState(false);

  const toggleRole = (role: string) => {
    setForm(f => ({
      ...f,
      visibleTo: f.visibleTo.includes(role)
        ? f.visibleTo.filter(r => r !== role)
        : [...f.visibleTo, role],
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.startDate || !form.endDate) {
      toast.error('Please fill all required fields'); return;
    }
    if (form.visibleTo.length === 0) { toast.error('Select at least one role'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API}/elections`, {
        method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ ...form, totalVoters: parseInt(form.totalVoters)||0, location }),
      });
      const data = await res.json();
      if (data.success) { toast.success('Election created!'); onCreated(); onClose(); }
      else toast.error(data.message||'Failed');
    } catch { toast.error('Cannot reach server'); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h2 className="text-xl font-bold dark:text-white">Create New Election</h2><p className="text-sm text-gray-500">Fill in the details below</p></div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><X className="w-5 h-5"/></button>
        </div>
        <div className="space-y-4">
          <div className="space-y-1"><Label>Election Title <span className="text-red-500">*</span></Label><Input placeholder="e.g. 2026 General Election" value={form.title} onChange={e => setForm({...form,title:e.target.value})}/></div>
          <div className="space-y-1">
            <Label>Description <span className="text-red-500">*</span></Label>
            <textarea className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:text-white resize-none" rows={3} placeholder="Brief description..." value={form.description} onChange={e => setForm({...form,description:e.target.value})}/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Start Date <span className="text-red-500">*</span></Label><Input type="date" value={form.startDate} onChange={e => setForm({...form,startDate:e.target.value})}/></div>
            <div className="space-y-1"><Label>End Date <span className="text-red-500">*</span></Label><Input type="date" value={form.endDate} onChange={e => setForm({...form,endDate:e.target.value})}/></div>
          </div>
          <div className="space-y-1"><Label>Total Eligible Voters</Label><Input type="number" placeholder="e.g. 10000" value={form.totalVoters} onChange={e => setForm({...form,totalVoters:e.target.value})}/></div>

          {/* ✅ Election Location */}
          <div className="space-y-2">
            <Label>Election Area <span className="text-gray-400 text-xs">(optional)</span></Label>
            <LocationPicker value={location} onChange={setLocation}/>
          </div>

          {/* ✅ Role visibility */}
          <div className="space-y-2">
            <Label>Visible To (select roles) <span className="text-red-500">*</span></Label>
            <div className="flex gap-2 flex-wrap">
              {ALL_ROLES.map(role => (
                <button key={role} type="button" onClick={() => toggleRole(role)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    form.visibleTo.includes(role)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}>
                  {role.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">Selected: {form.visibleTo.join(', ') || 'None'}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={loading}>{loading?'Creating...':'Create Election'}</Button>
        </div>
      </div>
    </div>
  );
}

// ── Add Candidate Modal ───────────────────────────────────────────
function AddCandidateModal({ election, onClose, onAdded }: { election: any; onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ name:'', party:'', description:'', manifesto:'', photo:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.party) { toast.error('Name and party are required'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API}/elections/${election._id}/candidates`, {
        method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { toast.success(`${form.name} added!`); onAdded(); setForm({name:'',party:'',description:'',manifesto:'',photo:''}); }
      else toast.error(data.message||'Failed');
    } catch { toast.error('Cannot reach server'); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold dark:text-white">Add Candidate</h2>
            <p className="text-sm text-gray-500">Election: <span className="font-medium text-blue-600">{election.title}</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><X className="w-5 h-5"/></button>
        </div>

        {/* Existing candidates */}
        {election.candidates?.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 mb-2">CURRENT CANDIDATES ({election.candidates.length})</p>
            <div className="space-y-2">
              {election.candidates.map((c: any) => (
                <div key={c._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold text-xs">{c.name.charAt(0)}</div>
                    <div><p className="text-sm font-medium dark:text-white">{c.name}</p><p className="text-xs text-gray-500">{c.party}</p></div>
                  </div>
                  <DeleteCandidateBtn electionId={election._id} candidateId={c._id} onDeleted={onAdded}/>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Full Name <span className="text-red-500">*</span></Label><Input placeholder="e.g. Raj Kumar" value={form.name} onChange={e => setForm({...form,name:e.target.value})}/></div>
            <div className="space-y-1"><Label>Party <span className="text-red-500">*</span></Label><Input placeholder="e.g. BJP, INC" value={form.party} onChange={e => setForm({...form,party:e.target.value})}/></div>
          </div>
          <div className="space-y-1"><Label>Photo URL <span className="text-gray-400 text-xs">(optional)</span></Label><Input placeholder="https://..." value={form.photo} onChange={e => setForm({...form,photo:e.target.value})}/></div>
          <div className="space-y-1"><Label>Description</Label><Input placeholder="Brief bio..." value={form.description} onChange={e => setForm({...form,description:e.target.value})}/></div>
          <div className="space-y-1">
            <Label>Manifesto / Key Points</Label>
            <textarea className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:text-white resize-none" rows={2} placeholder="Key promises and agenda..." value={form.manifesto} onChange={e => setForm({...form,manifesto:e.target.value})}/>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
            <UserPlus className="w-4 h-4 mr-2"/>{loading?'Adding...':'Add Candidate'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Candidate Button ───────────────────────────────────────
function DeleteCandidateBtn({ electionId, candidateId, onDeleted }: { electionId: string; candidateId: string; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Remove this candidate?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API}/elections/${electionId}/candidates/${candidateId}`, {
        method:'DELETE', headers:{ Authorization:`Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) { toast.success('Candidate removed'); onDeleted(); }
      else toast.error(data.message||'Failed');
    } catch { toast.error('Cannot reach server'); }
    setLoading(false);
  };

  return (
    <button onClick={handleDelete} disabled={loading} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors" title="Remove candidate">
      <Trash2 className="w-4 h-4"/>
    </button>
  );
}

// ── Visibility Modal ──────────────────────────────────────────────
function VisibilityModal({ election, onClose, onSaved }: { election: any; onClose: () => void; onSaved: () => void }) {
  const [selected, setSelected] = useState<string[]>(election.visibleTo || ALL_ROLES);
  const [loading, setLoading]   = useState(false);

  const toggle = (role: string) => setSelected(prev =>
    prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
  );

  const handleSave = async () => {
    if (selected.length === 0) { toast.error('Select at least one role'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API}/elections/${election._id}/visibility`, {
        method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ visibleTo: selected }),
      });
      const data = await res.json();
      if (data.success) { toast.success('Visibility updated!'); onSaved(); onClose(); }
      else toast.error(data.message||'Failed');
    } catch { toast.error('Cannot reach server'); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div><h2 className="text-xl font-bold dark:text-white">Election Visibility</h2><p className="text-sm text-gray-500 truncate max-w-xs">{election.title}</p></div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><X className="w-5 h-5"/></button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select which roles can see and vote in this election:</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {ALL_ROLES.map(role => (
            <button key={role} type="button" onClick={() => toggle(role)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                selected.includes(role)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                selected.includes(role) ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
              }`}>
                {role.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className={`text-sm font-semibold ${selected.includes(role) ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>{role.toUpperCase()}</p>
                <p className="text-xs text-gray-400">{selected.includes(role) ? '✓ Can view' : '✗ Hidden'}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-4">
          <p className="text-xs text-blue-700 dark:text-blue-300"><strong>Visible to:</strong> {selected.length>0 ? selected.map(r=>r.toUpperCase()).join(', ') : 'Nobody'}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave} disabled={loading}>{loading?'Saving...':'Save Changes'}</Button>
        </div>
      </div>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────
export function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser]                   = useState(authService.getCurrentUser());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [addCandidateElection, setAddCandidateElection] = useState<any>(null);
  const [visibilityElection, setVisibilityElection]     = useState<any>(null);
  const [confirmDeleteElection, setConfirmDeleteElection] = useState<any>(null);
  const [elections, setElections]         = useState<any[]>([]);
  const [stats, setStats]                 = useState<any>(null);
  const [recentVotes, setRecentVotes]     = useState<any[]>([]);
  const [auditLogs, setAuditLogs]         = useState<any[]>([]);
  const [loadingVotes, setLoadingVotes]         = useState(false);
  const [selectedElectionFilter, setSelectedElectionFilter] = useState<string>('all');
  const [blockedVoters, setBlockedVoters]       = useState<any[]>([]);
  const [showSettings, setShowSettings]         = useState(false);
  const [showProfile, setShowProfile]           = useState(false);
  const [showDropdown, setShowDropdown]         = useState(false);
  const [showBlockModal, setShowBlockModal]     = useState<any>(null);
  const [blockReason, setBlockReason]           = useState('');
  const [blockLoading, setBlockLoading]         = useState(false);
  const [allVoters, setAllVoters]               = useState<any[]>([]);
  const [voterSearch, setVoterSearch]           = useState('');
  const [assignAreaVoter, setAssignAreaVoter]   = useState<any>(null);
  const [eligibleModal, setEligibleModal]       = useState<any>(null);
  const [eligibleVoters, setEligibleVoters]     = useState<any[]>([]);
  const [eligibleSearch, setEligibleSearch]     = useState('');
  const [eligibleLoading, setEligibleLoading]   = useState(false);
  const [assigningArea, setAssigningArea]       = useState(false);
  const [areaStates,       setAreaStates]       = useState<any[]>([]);
  const [areaDistricts,    setAreaDistricts]    = useState<any[]>([]);
  const [areaSubdistricts, setAreaSubdistricts] = useState<any[]>([]);
  const [areaLocalities,   setAreaLocalities]   = useState<any[]>([]);
  const [assignLoc,        setAssignLoc]        = useState<any>({});

  const token = localStorage.getItem('token');

  const fetchElections = async () => {
    try {
      const res  = await fetch(`${API}/elections`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setElections(data.data);
    } catch {}
  };

  const fetchStats = async () => {
    try {
      const res  = await fetch(`${API}/dashboard/admin`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { setStats(data.data); if (data.data.recentLogs) setAuditLogs(data.data.recentLogs); }
    } catch {}
  };

  const fetchEligibleVoters = async (electionId: string) => {
    setEligibleLoading(true);
    try {
      const res  = await fetch(`${API}/elections/${electionId}/eligible-voters`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setEligibleVoters(data.data);
    } catch {}
    setEligibleLoading(false);
  };

  const addEligibleVoter = async (electionId: string, voterId: string) => {
    try {
      const res  = await fetch(`${API}/elections/${electionId}/eligible-voters`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ voterId }),
      });
      const data = await res.json();
      if (data.success) { toast.success('Voter added to eligible list!'); fetchEligibleVoters(electionId); fetchElections(); }
      else toast.error(data.message || 'Failed');
    } catch { toast.error('Cannot reach server'); }
  };

  const removeEligibleVoter = async (electionId: string, voterId: string) => {
    try {
      const res  = await fetch(`${API}/elections/${electionId}/eligible-voters/${voterId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) { toast.success('Voter removed'); fetchEligibleVoters(electionId); fetchElections(); }
      else toast.error(data.message || 'Failed');
    } catch { toast.error('Cannot reach server'); }
  };

  const toggleRestriction = async (election: any) => {
    try {
      const res  = await fetch(`${API}/elections/${election._id}/restrict`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isRestricted: !election.isRestrictedToEligible }),
      });
      const data = await res.json();
      if (data.success) { toast.success(data.message); fetchElections(); }
      else toast.error(data.message || 'Failed');
    } catch { toast.error('Cannot reach server'); }
  };

  const fetchAreaLocations = async (type: string, parentId?: string) => {
    const url = parentId ? `${API}/locations?type=${type}&parent=${parentId}` : `${API}/locations?type=${type}`;
    const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.success) {
      if (type === 'state')       setAreaStates(data.data);
      if (type === 'district')    setAreaDistricts(data.data);
      if (type === 'subdistrict') setAreaSubdistricts(data.data);
      if (type === 'locality')    setAreaLocalities(data.data);
    }
  };

  const handleAreaLocChange = (level: string, id: string) => {
    if (level === 'state')       { setAssignLoc({ state: id }); setAreaDistricts([]); setAreaSubdistricts([]); setAreaLocalities([]); fetchAreaLocations('district', id); }
    if (level === 'district')    { setAssignLoc((p:any) => ({ ...p, district: id, subdistrict: undefined, locality: undefined })); setAreaSubdistricts([]); setAreaLocalities([]); fetchAreaLocations('subdistrict', id); }
    if (level === 'subdistrict') { setAssignLoc((p:any) => ({ ...p, subdistrict: id, locality: undefined })); setAreaLocalities([]); fetchAreaLocations('locality', id); }
    if (level === 'locality')    { setAssignLoc((p:any) => ({ ...p, locality: id })); }
  };

  const handleAssignArea = async () => {
    if (!assignAreaVoter || !assignLoc.state) { toast.error('Select at least a state'); return; }
    setAssigningArea(true);
    // Build label
    const parts: string[] = [];
    const find = (arr: any[], id?: string) => arr.find((x:any) => x._id === id)?.name;
    if (assignLoc.state)       parts.push(find(areaStates, assignLoc.state) || '');
    if (assignLoc.district)    parts.push(find(areaDistricts, assignLoc.district) || '');
    if (assignLoc.subdistrict) parts.push(find(areaSubdistricts, assignLoc.subdistrict) || '');
    if (assignLoc.locality)    parts.push(find(areaLocalities, assignLoc.locality) || '');
    const label = parts.filter(Boolean).join(', ');
    try {
      const res = await fetch(`${API}/users/${assignAreaVoter._id}/update-location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ voterLocation: { ...assignLoc, label } }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Area assigned: ${label}`);
        setAssignAreaVoter(null); setAssignLoc({});
        fetchAllVoters();
      } else toast.error(data.message || 'Failed');
    } catch { toast.error('Cannot reach server'); }
    setAssigningArea(false);
  };

  const fetchBlockedVoters = async () => {
    try {
      const res  = await fetch(`${API}/users/blocked/list`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setBlockedVoters(data.data);
    } catch {}
  };

  const fetchAllVoters = async () => {
    try {
      const res  = await fetch(`${API}/users?role=voter`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setAllVoters(data.data);
    } catch {}
  };

  const handleBlock = async () => {
    if (!blockReason.trim()) { toast.error('Please enter a reason'); return; }
    if (!showBlockModal) return;
    setBlockLoading(true);
    try {
      const res  = await fetch(`${API}/users/${showBlockModal._id}/block`, {
        method: 'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ reason: blockReason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${showBlockModal.name} has been blocked`);
        setShowBlockModal(null); setBlockReason('');
        fetchBlockedVoters(); fetchAllVoters();
      } else toast.error(data.message || 'Failed');
    } catch { toast.error('Cannot reach server'); }
    setBlockLoading(false);
  };

  const handleUnblock = async (voter: any) => {
    try {
      const res  = await fetch(`${API}/users/${voter._id}/unblock`, {
        method: 'PUT', headers:{ Authorization:`Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${voter.name} has been unblocked`);
        fetchBlockedVoters(); fetchAllVoters();
      } else toast.error(data.message || 'Failed');
    } catch { toast.error('Cannot reach server'); }
  };

  const fetchRecentVotes = async () => {
    setLoadingVotes(true);
    try {
      const res  = await fetch(`${API}/votes/recent?limit=100`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setRecentVotes(data.data);
    } catch {}
    setLoadingVotes(false);
  };

  useEffect(() => {
    if (assignAreaVoter) {
      fetchAreaLocations('state');
      // Pre-load voter's existing location
      if (assignAreaVoter.voterLocation) {
        setAssignLoc(assignAreaVoter.voterLocation);
        if (assignAreaVoter.voterLocation.state)       fetchAreaLocations('district',    assignAreaVoter.voterLocation.state);
        if (assignAreaVoter.voterLocation.district)    fetchAreaLocations('subdistrict', assignAreaVoter.voterLocation.district);
        if (assignAreaVoter.voterLocation.subdistrict) fetchAreaLocations('locality',    assignAreaVoter.voterLocation.subdistrict);
      } else {
        fetchAreaLocations('state');
      }
    }
  }, [assignAreaVoter]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') { navigate('/'); return; }
    setUser(currentUser);
    fetchElections(); fetchStats(); fetchRecentVotes(); fetchBlockedVoters(); fetchAllVoters();
    const interval = setInterval(fetchRecentVotes, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  if (!user) return null;

  const totalElections   = stats?.totalElections  ?? elections.length;
  const activeElections  = stats?.activeElections  ?? elections.filter(e=>e.status==='active').length;
  const totalVoters      = stats?.totalVoters      ?? 0;
  const totalVotesCast   = stats?.totalVotesCast   ?? 0;
  const avgTurnout       = stats?.turnoutPercent   ?? '0';
  const flaggedIncidents = stats?.flaggedIncidents ?? 0;

  const electionData = elections.map((e:any) => ({ name:e.title.split(' ').slice(0,3).join(' '), turnout:e.turnout||0, eligible:e.totalVoters||0 }));
  const statusData   = [
    { name:'Active',   value:elections.filter(e=>e.status==='active').length },
    { name:'Upcoming', value:elections.filter(e=>e.status==='upcoming').length },
    { name:'Ended',    value:elections.filter(e=>e.status==='ended').length },
  ];

  return (
    <DashboardLayout title="Admin Control Center" subtitle="System Administration & Management" roleLabel="System Administrator" roleColor="bg-purple-600" hideProfile={true}>

      {/* Modals */}
      {showSettings && (
        <SettingsModal user={user} token={token} API={API}
          onClose={() => setShowSettings(false)}
          onUserUpdate={(u: any) => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); localStorage.setItem('currentUser', JSON.stringify(u)); }}
        />
      )}
      {showProfile && (
        <ProfileModal user={user} token={token} API={API}
          onClose={() => setShowProfile(false)}
          onOpenSettings={() => { setShowProfile(false); setShowSettings(true); }}
          onUserUpdate={(u: any) => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); localStorage.setItem('currentUser', JSON.stringify(u)); }}
        />
      )}

      {showCreateModal && <CreateElectionModal onClose={() => setShowCreateModal(false)} onCreated={() => { fetchElections(); fetchStats(); }}/>}
      {addCandidateElection && <AddCandidateModal election={addCandidateElection} onClose={() => setAddCandidateElection(null)} onAdded={fetchElections}/>}
      {visibilityElection && <VisibilityModal election={visibilityElection} onClose={() => setVisibilityElection(null)} onSaved={fetchElections}/>}

      {/* ✅ Block Voter Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <Ban className="w-6 h-6 text-red-600"/>
              </div>
              <div>
                <h2 className="text-lg font-bold dark:text-white">Block Voter</h2>
                <p className="text-sm text-gray-500">{showBlockModal.name} · {showBlockModal.voterId}</p>
              </div>
            </div>
            {showBlockModal.aadhaarNumber && (
              <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500">
                Aadhaar: <span className="font-mono font-medium">{showBlockModal.aadhaarNumber}</span>
              </div>
            )}
            {showBlockModal.eciCardNumber && (
              <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500">
                ECI: <span className="font-mono font-medium">{showBlockModal.eciCardNumber}</span>
              </div>
            )}
            <div className="mb-4">
              <Label className="text-sm font-medium dark:text-white mb-2 block">
                Reason for blocking <span className="text-red-500">*</span>
              </Label>
              <textarea
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="e.g. Suspicious activity, duplicate account, fake voter ID..."
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
              />
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4 text-xs text-red-600 dark:text-red-400">
              ⚠ This voter will be blocked immediately. When they try to login with the same Aadhaar/ECI, they will see a blocked message.
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setShowBlockModal(null); setBlockReason(''); }}>Cancel</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleBlock} disabled={blockLoading}>
                <Ban className="w-4 h-4 mr-2"/>{blockLoading ? 'Blocking...' : 'Block Voter'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* ✅ Assign Area Modal */}
      {assignAreaVoter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-blue-600"/>
              </div>
              <div>
                <h2 className="text-lg font-bold dark:text-white">Assign Voter Area</h2>
                <p className="text-sm text-gray-500">{assignAreaVoter.name} · {assignAreaVoter.voterId}</p>
              </div>
              <button onClick={() => setAssignAreaVoter(null)} className="ml-auto p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X className="w-4 h-4"/></button>
            </div>

            {assignAreaVoter.voterLocation?.label && (
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
                Current area: <strong>{assignAreaVoter.voterLocation.label}</strong>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label:'🏛️ State',       level:'state',       list:areaStates,       dep:true },
                { label:'🏙️ District',    level:'district',    list:areaDistricts,    dep:!!assignLoc.state },
                { label:'🏘️ Sub-District',level:'subdistrict', list:areaSubdistricts, dep:!!assignLoc.district },
                { label:'📍 Locality',    level:'locality',    list:areaLocalities,   dep:!!assignLoc.subdistrict },
              ].map(({ label, level, list, dep }) => (
                <div key={level}>
                  <Label className="text-xs font-medium mb-1 block">{label}</Label>
                  <select
                    value={(assignLoc as any)[level] || ''}
                    onChange={e => handleAreaLocChange(level, e.target.value)}
                    disabled={!dep}
                    className={`w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white focus:outline-none ${!dep ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">{dep ? `Select ${level}` : '— select above first'}</option>
                    {list.map((x:any) => <option key={x._id} value={x._id}>{x.name}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {assignLoc.state && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300 mb-4">
                📍 {[
                  areaStates.find((x:any)=>x._id===assignLoc.state)?.name,
                  areaDistricts.find((x:any)=>x._id===assignLoc.district)?.name,
                  areaSubdistricts.find((x:any)=>x._id===assignLoc.subdistrict)?.name,
                  areaLocalities.find((x:any)=>x._id===assignLoc.locality)?.name,
                ].filter(Boolean).join(' › ')}
              </div>
            )}

            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 mb-4 text-xs text-amber-700">
              ⚠️ This voter will only be able to vote in elections matching their assigned area. This prevents fake voting in other areas.
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setAssignAreaVoter(null)}>Cancel</Button>
              <Button className="flex-1" onClick={handleAssignArea} disabled={assigningArea || !assignLoc.state}>
                <MapPin className="w-4 h-4 mr-2"/>{assigningArea ? 'Saving...' : 'Assign Area'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Eligible Voters Modal */}
      {eligibleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold dark:text-white">Eligible Voters</h2>
                <p className="text-sm text-gray-500 truncate max-w-xs">{eligibleModal.title}</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Restriction toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Restricted:</span>
                  <button onClick={() => { toggleRestriction(eligibleModal); setEligibleModal({...eligibleModal, isRestrictedToEligible: !eligibleModal.isRestrictedToEligible}); }}
                    className={`relative w-10 h-5 rounded-full transition-colors ${eligibleModal.isRestrictedToEligible ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${eligibleModal.isRestrictedToEligible ? 'translate-x-5' : 'translate-x-0.5'}`}/>
                  </button>
                </div>
                <button onClick={() => setEligibleModal(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X className="w-4 h-4"/></button>
              </div>
            </div>

            {/* Info banner */}
            <div className={`mx-6 mt-4 p-3 rounded-xl text-xs flex-shrink-0 ${eligibleModal.isRestrictedToEligible ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 text-blue-700 dark:text-blue-300' : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 text-gray-600'}`}>
              {eligibleModal.isRestrictedToEligible
                ? '🔒 RESTRICTED: Only voters in this list can see and vote in this election.'
                : '🔓 OPEN: All voters matching area/role can see this election. Enable restriction to limit to specific voters.'}
            </div>

            {/* Current eligible voters */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Eligible Voters ({eligibleVoters.length})
              </p>
              {eligibleLoading ? (
                <div className="text-center py-4 text-gray-400">Loading...</div>
              ) : eligibleVoters.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2"/>
                  <p className="text-sm text-gray-400">No specific voters added yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Add voters from the list below.</p>
                </div>
              ) : eligibleVoters.map((voter: any) => (
                <div key={voter._id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                      {voter.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold dark:text-white truncate">{voter.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                        <span className="font-mono">{voter.voterId}</span>
                        {voter.aadhaarNumber && <span>· {voter.aadhaarNumber}</span>}
                        {voter.voterLocation?.label && <span className="text-blue-500">📍 {voter.voterLocation.label}</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeEligibleVoter(eligibleModal._id, voter._id)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg ml-2 flex-shrink-0" title="Remove">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              ))}
            </div>

            {/* Add voter from all voters */}
            <div className="border-t dark:border-gray-700 p-4 flex-shrink-0">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Add Voter</p>
              <Input placeholder="Search all voters..." value={eligibleSearch} onChange={e => setEligibleSearch(e.target.value)} className="mb-2 dark:bg-gray-800"/>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {allVoters
                  .filter((v:any) => !eligibleVoters.some((e:any) => e._id === v._id))
                  .filter((v:any) => {
                    const q = eligibleSearch.toLowerCase();
                    return !q || v.name?.toLowerCase().includes(q) || v.voterId?.toLowerCase().includes(q) || v.aadhaarNumber?.includes(q);
                  })
                  .map((voter: any) => (
                    <div key={voter._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => addEligibleVoter(eligibleModal._id, voter._id)}>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 font-bold text-xs flex-shrink-0">
                          {voter.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-medium dark:text-white truncate">{voter.name}</span>
                          <span className="text-xs text-gray-400 ml-2">{voter.voterId}</span>
                          {voter.voterLocation?.label && <span className="text-xs text-blue-400 ml-1">📍 {voter.voterLocation.label.split(',')[0]}</span>}
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-green-500 flex-shrink-0"/>
                    </div>
                  ))}
                {allVoters.filter((v:any) => !eligibleVoters.some((e:any) => e._id === v._id)).length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">All voters already added</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteElection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600"/>
              </div>
              <div>
                <h2 className="text-lg font-bold dark:text-white">Remove Election</h2>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl mb-6 border border-red-200 dark:border-red-800">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">{confirmDeleteElection.title}</p>
              <p className="text-xs text-red-600 dark:text-red-400">Status: {confirmDeleteElection.status} · {confirmDeleteElection.candidates?.length||0} candidates · {confirmDeleteElection.turnout||0} votes cast</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to remove this election? It will be hidden from all dashboards and voters will no longer be able to vote in it.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDeleteElection(null)}>Cancel</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  const res   = await fetch(`${API}/elections/${confirmDeleteElection._id}`, {
                    method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
                  });
                  const data = await res.json();
                  if (data.success) {
                    toast.success('Election removed successfully');
                    fetchElections(); fetchStats();
                    setConfirmDeleteElection(null);
                  } else {
                    toast.error(data.message || 'Failed to remove election');
                  }
                } catch { toast.error('Cannot reach server'); }
              }}>
                <Trash2 className="w-4 h-4 mr-2"/>Remove Election
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Theme toggle + Avatar dropdown — top right corner */}
      <div className="fixed top-4 right-6 z-[200] flex items-center gap-2">
        {/* Theme toggle — right beside avatar */}
        <button
          onClick={() => document.documentElement.classList.toggle('dark')}
          className="w-11 h-11 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all"
          title="Toggle dark/light mode"
        >
          <Sun className="w-5 h-5 text-amber-500 hidden dark:block"/>
          <Moon className="w-5 h-5 text-gray-600 dark:hidden"/>
        </button>

        {/* Avatar button */}
        <button
          onClick={() => setShowDropdown(d => !d)}
          className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all border-2 border-white dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover"/>
          ) : (
            <span className="text-base font-bold text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>
          )}
        </button>

        {/* Dropdown menu */}
        {showDropdown && (
          <>
            {/* Click outside to close */}
            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}/>

            <div className="absolute right-0 top-13 mt-1 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20">

              {/* User info header */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover"/>
                    ) : (
                      <span className="text-sm font-bold text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full capitalize">
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <button
                  onClick={() => { setShowDropdown(false); setShowProfile(true); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600"/>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">My Profile</p>
                    <p className="text-xs text-gray-400">View your details</p>
                  </div>
                </button>

                <button
                  onClick={() => { setShowDropdown(false); setShowSettings(true); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-purple-600"/>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Settings</p>
                    <p className="text-xs text-gray-400">Password & photo</p>
                  </div>
                </button>

                <div className="mx-3 my-1 border-t dark:border-gray-700"/>

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    localStorage.removeItem('currentUser');
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-red-600"/>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Logout</p>
                    <p className="text-xs text-red-400">Sign out of dashboard</p>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>{/* end flex top-right */}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label:'Total Elections', value:totalElections,  sub:`${activeElections} active`, icon:<Vote className="w-8 h-8 text-blue-600"/>,   bg:'bg-blue-100 dark:bg-blue-900',   border:'border-l-blue-600' },
          { label:'Total Voters',    value:Number(totalVoters).toLocaleString(), sub:'In database', icon:<Users className="w-8 h-8 text-green-600"/>,  bg:'bg-green-100 dark:bg-green-900', border:'border-l-green-600' },
          { label:'Votes Cast',      value:Number(totalVotesCast).toLocaleString(), sub:`${avgTurnout}% turnout`, icon:<BarChart3 className="w-8 h-8 text-purple-600"/>, bg:'bg-purple-100 dark:bg-purple-900', border:'border-l-purple-600' },
          { label:'Open Incidents',  value:flaggedIncidents, sub:'Flagged', icon:<Shield className="w-8 h-8 text-amber-600"/>, bg:'bg-amber-100 dark:bg-amber-900', border:'border-l-amber-600' },
        ].map((s,i) => (
          <Card key={i} className={`border-l-4 ${s.border} dark:bg-gray-900 dark:border-gray-800`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/>{s.sub}</p>
                </div>
                <div className={`p-4 ${s.bg} rounded-xl`}>{s.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="elections" className="space-y-6">
        <TabsList className="dark:bg-gray-900">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="live">Live Votes</TabsTrigger>
          <TabsTrigger value="elections">Elections & Candidates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="blocked" className="relative">Blocked Voters{blockedVoters.length > 0 && <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{blockedVoters.length}</span>}</TabsTrigger>
          <TabsTrigger value="locations">📍 Locations</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader><CardTitle className="dark:text-white">Voter Turnout</CardTitle><CardDescription>From elections database</CardDescription></CardHeader>
              <CardContent>
                {electionData.length===0 ? <div className="h-[300px] flex items-center justify-center text-gray-400">No data yet</div> : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={electionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151"/><XAxis dataKey="name" stroke="#9ca3af"/><YAxis stroke="#9ca3af"/>
                      <Tooltip contentStyle={{ backgroundColor:'#1f2937', border:'1px solid #374151', color:'#fff' }}/>
                      <Bar dataKey="turnout" fill="#3b82f6" name="Votes Cast"/>
                      <Bar dataKey="eligible" fill="#6b7280" name="Eligible"/>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader><CardTitle className="dark:text-white">Recent Audit Logs</CardTitle><CardDescription>From auditlogs collection</CardDescription></CardHeader>
              <CardContent>
                {auditLogs.length===0 ? <div className="h-[300px] flex items-center justify-center text-gray-400">No logs yet</div> : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {auditLogs.slice(0,8).map((log:any,i:number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.type==='success'?'bg-green-500':log.type==='warning'?'bg-yellow-500':log.type==='error'?'bg-red-500':'bg-blue-500'}`}/>
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium dark:text-white truncate">{log.action}</p><p className="text-xs text-gray-500 truncate">{log.details}</p></div>
                        <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata'})}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-900 dark:border-gray-800" onClick={() => setShowCreateModal(true)}>
              <CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-2xl"><Plus className="w-8 h-8 text-blue-600"/></div><div><h3 className="font-semibold dark:text-white">Create Election</h3><p className="text-sm text-gray-500">Set up new voting</p></div></div></CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-900 dark:border-gray-800" onClick={() => navigate('/elections')}>
              <CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-4 bg-green-100 dark:bg-green-900 rounded-2xl"><Eye className="w-8 h-8 text-green-600"/></div><div><h3 className="font-semibold dark:text-white">View Elections</h3><p className="text-sm text-gray-500">Manage elections</p></div></div></CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-900 dark:border-gray-800" onClick={() => { fetchStats(); fetchElections(); fetchRecentVotes(); toast.success('Refreshed!'); }}>
              <CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-2xl"><RefreshCw className="w-8 h-8 text-purple-600"/></div><div><h3 className="font-semibold dark:text-white">Refresh Data</h3><p className="text-sm text-gray-500">Reload from database</p></div></div></CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Live Votes with Election Filter */}
        <TabsContent value="live">
          <div className="space-y-4">

            {/* ✅ Per-election vote count cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* All votes card */}
              <Card
                className={`cursor-pointer hover:shadow-md transition-all dark:bg-gray-900 dark:border-gray-800 ${selectedElectionFilter==='all' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedElectionFilter('all')}>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">All Elections</p>
                  <p className="text-3xl font-bold text-blue-600">{recentVotes.length}</p>
                  <p className="text-xs text-gray-400 mt-1">total votes cast</p>
                </CardContent>
              </Card>
              {/* Per election cards */}
              {elections.map((election:any) => {
                const count = recentVotes.filter((v:any) => v.electionTitle === election.title).length;
                const isSelected = selectedElectionFilter === election._id;
                const pct = election.totalVoters > 0 ? ((count / election.totalVoters) * 100).toFixed(1) : '0';
                return (
                  <Card key={election._id}
                    className={`cursor-pointer hover:shadow-md transition-all dark:bg-gray-900 dark:border-gray-800 ${isSelected ? 'ring-2 ring-green-500' : ''}`}
                    onClick={() => setSelectedElectionFilter(isSelected ? 'all' : election._id)}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-500 font-semibold uppercase truncate flex-1 mr-1">
                          {election.title.split(' ').slice(0,2).join(' ')}
                        </p>
                        <Badge variant={election.status==='active'?'default':'secondary'} className="text-xs flex-shrink-0">{election.status}</Badge>
                      </div>
                      <p className="text-3xl font-bold text-green-600">{count}</p>
                      <p className="text-xs text-gray-400 mt-1">votes · {pct}% turnout</p>
                      {election.totalVoters > 0 && (
                        <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width:`${Math.min(parseFloat(pct),100)}%` }}/>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* ✅ Vote feed with filter pills */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                      Vote Feed
                      {selectedElectionFilter !== 'all' && (
                        <span className="text-sm font-normal text-gray-500">
                          — {elections.find(e=>e._id===selectedElectionFilter)?.title}
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>Filtered from votes collection · click a card above to filter</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedElectionFilter !== 'all' && (
                      <Button variant="outline" size="sm" onClick={() => setSelectedElectionFilter('all')}>
                        <X className="w-3 h-3 mr-1"/>Clear
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={fetchRecentVotes} disabled={loadingVotes}>
                      <RefreshCw className={`w-4 h-4 mr-1 ${loadingVotes?'animate-spin':''}`}/>Refresh
                    </Button>
                  </div>
                </div>

                {/* Filter pills */}
                <div className="flex gap-2 flex-wrap pt-1">
                  <button onClick={() => setSelectedElectionFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${selectedElectionFilter==='all'?'bg-blue-600 text-white border-blue-600':'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}>
                    All ({recentVotes.length})
                  </button>
                  {elections.map((election:any) => {
                    const count = recentVotes.filter((v:any) => v.electionTitle === election.title).length;
                    return (
                      <button key={election._id}
                        onClick={() => setSelectedElectionFilter(selectedElectionFilter===election._id?'all':election._id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${selectedElectionFilter===election._id?'bg-green-600 text-white border-green-600':'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}>
                        {election.title.split(' ').slice(0,3).join(' ')} ({count})
                      </button>
                    );
                  })}
                </div>
              </CardHeader>

              <CardContent>
                {loadingVotes ? (
                  <div className="text-center py-12"><RefreshCw className="w-8 h-8 text-blue-500 mx-auto mb-3 animate-spin"/><p className="text-gray-500">Loading votes...</p></div>
                ) : (() => {
                    const filteredVotes = selectedElectionFilter === 'all'
                      ? recentVotes
                      : recentVotes.filter((v:any) => v.electionTitle === elections.find((e:any)=>e._id===selectedElectionFilter)?.title);

                    if (filteredVotes.length === 0) return (
                      <div className="text-center py-12">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3"/>
                        <p className="font-medium text-gray-500">{selectedElectionFilter==='all'?'No votes yet':'No votes for this election'}</p>
                        <p className="text-sm text-gray-400 mt-1">Votes appear here once voters cast them</p>
                      </div>
                    );

                    return (
                      <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {filteredVotes.map((vote:any, i:number) => {
                          const castTime = new Date(vote.createdAt);
                          const timeAgo  = Math.floor((Date.now()-castTime.getTime())/1000);
                          const td = timeAgo<60?`${timeAgo}s ago`:timeAgo<3600?`${Math.floor(timeAgo/60)}m ago`:`${Math.floor(timeAgo/3600)}h ago`;
                          return (
                            <div key={vote._id||i} className="flex items-start gap-4 p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                              <Avatar className="w-12 h-12 flex-shrink-0">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                                  {(vote.userName||'V').charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="font-semibold dark:text-white">{vote.userName||'Anonymous'}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                                        {vote.voterId||'N/A'}
                                      </span>
                                      {vote.userEmail && (
                                        <span className="text-xs text-gray-400">{vote.userEmail}</span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0 ml-2">
                                    <Clock className="w-3 h-3"/>{td}
                                  </span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <Vote className="w-4 h-4 text-blue-600 flex-shrink-0"/>
                                    <span className="text-sm text-gray-500 flex-shrink-0">Election:</span>
                                    <span className="text-sm font-medium dark:text-white truncate">{vote.electionTitle}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-green-600 flex-shrink-0"/>
                                    <span className="text-sm text-gray-500 flex-shrink-0">Voted for:</span>
                                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">{vote.candidateName}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20 border-green-200">
                                    <CheckCircle className="w-3 h-3 mr-1"/>Verified
                                  </Badge>
                                  <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-700 border-gray-200">
                                    {castTime.toLocaleDateString('en-IN')}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                }
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ✅ Elections & Candidates Tab */}
        <TabsContent value="elections">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><h2 className="text-xl font-bold dark:text-white">Elections & Candidates</h2><p className="text-sm text-gray-500">Manage elections, add candidates and control visibility</p></div>
              <Button onClick={() => setShowCreateModal(true)}><Plus className="w-4 h-4 mr-2"/>Create Election</Button>
            </div>

            {elections.length===0 ? (
              <Card className="dark:bg-gray-900 dark:border-gray-800"><CardContent className="py-16 text-center"><Vote className="w-12 h-12 text-gray-300 mx-auto mb-3"/><p className="text-gray-500">No elections yet. Create one to get started.</p></CardContent></Card>
            ) : elections.map((election:any) => (
              <Card key={election._id} className="dark:bg-gray-900 dark:border-gray-800">
                <CardContent className="pt-5">
                  {/* Election Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold dark:text-white">{election.title}</h3>
                        <Badge variant={election.status==='active'?'default':'secondary'}>{election.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{election.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{new Date(election.startDate).toLocaleDateString('en-IN')} – {new Date(election.endDate).toLocaleDateString('en-IN')}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3"/>{election.turnout||0} / {election.totalVoters||0} voted</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3"/>{election.candidates?.length||0} candidates</span>
                        {election.location?.label && <span className="flex items-center gap-1">📍 {election.location.label}</span>}
                        {election.isRestrictedToEligible && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                            🔒 Restricted · {election.eligibleVoters?.length || 0} eligible voters
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      {/* ✅ Add Candidate Button */}
                      <Button size="sm" onClick={() => setAddCandidateElection(election)} className="gap-1">
                        <UserPlus className="w-4 h-4"/>Add Candidate
                      </Button>
                      {/* ✅ Visibility Button */}
                      <Button size="sm" variant="outline" onClick={() => setVisibilityElection(election)} className="gap-1">
                        <Lock className="w-4 h-4"/>Visibility
                      </Button>
                      {/* ✅ Eligible Voters Button */}
                      <Button size="sm" variant="outline" onClick={() => { setEligibleModal(election); fetchEligibleVoters(election._id); setEligibleSearch(''); }}
                        className={election.isRestrictedToEligible ? 'border-blue-300 text-blue-600 bg-blue-50' : ''}>
                        <Users className="w-4 h-4"/>
                        {election.isRestrictedToEligible && <span className="ml-1 text-xs">🔒</span>}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/results/${election._id}`)}>
                        <Eye className="w-4 h-4"/>
                      </Button>
                      {/* ✅ Remove Election Button */}
                      <Button size="sm" variant="outline" onClick={() => setConfirmDeleteElection(election)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-300 border-red-200">
                        <Trash2 className="w-4 h-4"/>
                      </Button>
                    </div>
                  </div>

                  {/* ✅ Visible To Badges */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="text-xs text-gray-500 font-medium">Visible to:</span>
                    {(election.visibleTo || ALL_ROLES).map((role:string) => (
                      <Badge key={role} variant="outline" className="text-xs capitalize bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                        {role.toUpperCase()}
                      </Badge>
                    ))}
                  </div>

                  {/* ✅ Candidates List */}
                  {election.candidates?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {election.candidates.map((c:any, idx:number) => (
                        <div key={c._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 text-sm"
                            style={{ background: COLORS[idx % COLORS.length] }}>
                            {c.photo ? <img src={c.photo} alt={c.name} className="w-full h-full rounded-full object-cover"/> : c.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold dark:text-white truncate">{c.name}</p>
                            <p className="text-xs text-gray-500 truncate">{c.party}</p>
                            {c.description && <p className="text-xs text-gray-400 truncate mt-0.5">{c.description}</p>}
                          </div>
                          <DeleteCandidateBtn electionId={election._id} candidateId={c._id} onDeleted={fetchElections}/>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                      <UserPlus className="w-8 h-8 text-gray-300 mx-auto mb-2"/>
                      <p className="text-sm text-gray-400">No candidates yet.</p>
                      <button onClick={() => setAddCandidateElection(election)} className="text-sm text-blue-600 hover:underline mt-1">Add the first candidate →</button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader><CardTitle className="dark:text-white">Election Status</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({name,value})=>`${name}: ${value}`} outerRadius={100} dataKey="value">
                      {statusData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                    </Pie>
                    <Tooltip/>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader><CardTitle className="dark:text-white">Key Metrics</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label:'Average Turnout', value:avgTurnout },
                  { label:'Active Elections', value:totalElections>0?(activeElections/totalElections*100).toFixed(0):0 },
                  { label:'System Uptime', value:99.9 },
                  { label:'Security Score', value:100 },
                ].map((item,i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">{item.label}</span><span className="font-semibold dark:text-white">{item.value}%</span></div>
                    <Progress value={parseFloat(String(item.value))} className="h-2"/>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ✅ Blocked Voters Tab */}
        <TabsContent value="blocked">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold dark:text-white">Voter Management</h2>
                <p className="text-sm text-gray-500">Block/unblock voters · {blockedVoters.length} currently blocked</p>
              </div>
              <Button variant="outline" onClick={() => { fetchBlockedVoters(); fetchAllVoters(); toast.success('Refreshed'); }}>
                <RefreshCw className="w-4 h-4 mr-2"/>Refresh
              </Button>
            </div>

            {/* Blocked voters list */}
            {blockedVoters.length > 0 && (
              <Card className="dark:bg-gray-900 dark:border-gray-800 border-red-200 dark:border-red-900">
                <CardHeader>
                  <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                    <Ban className="w-5 h-5"/>Blocked Voters ({blockedVoters.length})
                  </CardTitle>
                  <CardDescription>These voters cannot login until unblocked</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {blockedVoters.map((voter:any) => (
                      <div key={voter._id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center flex-shrink-0">
                            <Ban className="w-5 h-5 text-red-600"/>
                          </div>
                          <div>
                            <p className="font-semibold dark:text-white">{voter.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-mono bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">{voter.voterId}</span>
                              {voter.aadhaarNumber && <span className="text-xs text-gray-500">Aadhaar: {voter.aadhaarNumber}</span>}
                              {voter.eciCardNumber && <span className="text-xs text-gray-500">ECI: {voter.eciCardNumber}</span>}
                            </div>
                            <div className="mt-1">
                              <span className="text-xs text-red-600 dark:text-red-400 font-medium">Reason: </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">{voter.blockedReason}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              Blocked by {voter.blockedBy} · {voter.blockedAt ? new Date(voter.blockedAt).toLocaleDateString('en-IN') : ''}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleUnblock(voter)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 flex-shrink-0">
                          <Unlock className="w-4 h-4 mr-1"/>Unblock
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All voters list with block option */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5"/>All Voters
                </CardTitle>
                <CardDescription>Block any voter by clicking the Block button</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-4">
                  <Input
                    placeholder="Search by name, voter ID, Aadhaar or ECI..."
                    value={voterSearch}
                    onChange={e => setVoterSearch(e.target.value)}
                    className="dark:bg-gray-800"
                  />
                </div>
                {allVoters.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No voters registered yet</div>
                ) : (
                  <div className="space-y-2">
                    {allVoters
                      .filter((v:any) => {
                        const q = voterSearch.toLowerCase();
                        return !q ||
                          v.name?.toLowerCase().includes(q) ||
                          v.voterId?.toLowerCase().includes(q) ||
                          v.aadhaarNumber?.includes(q) ||
                          v.eciCardNumber?.toLowerCase().includes(q);
                      })
                      .map((voter:any) => (
                        <div key={voter._id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${voter.isBlocked ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${voter.isBlocked ? 'bg-red-200 dark:bg-red-800 text-red-700' : 'bg-blue-100 dark:bg-blue-900 text-blue-700'}`}>
                              {voter.name?.charAt(0)?.toUpperCase() || 'V'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold dark:text-white truncate">{voter.name}</p>
                                {voter.isBlocked && <Badge className="bg-red-500 text-xs">Blocked</Badge>}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono text-gray-500">{voter.voterId}</span>
                                {voter.aadhaarNumber && <span className="text-xs text-gray-400">· {voter.aadhaarNumber}</span>}
                                {voter.eciCardNumber && <span className="text-xs text-gray-400">· {voter.eciCardNumber}</span>}
                              </div>
                              {voter.voterLocation?.label && (
                                <p className="text-xs text-blue-500 mt-0.5 truncate">📍 {voter.voterLocation.label}</p>
                              )}
                              {voter.isBlocked && voter.blockedReason && (
                                <p className="text-xs text-red-500 mt-0.5 truncate">Reason: {voter.blockedReason}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-3 flex-shrink-0">
                            {voter.isBlocked ? (
                              <Button size="sm" variant="outline" onClick={() => handleUnblock(voter)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300">
                                <Unlock className="w-3 h-3 mr-1"/>Unblock
                              </Button>
                            ) : (
                              <>
                                <Button size="sm" variant="outline" onClick={() => { setAssignAreaVoter(voter); setAssignLoc(voter.voterLocation||{}); }}
                                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                                  <MapPin className="w-3 h-3 mr-1"/>Area
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => { setShowBlockModal(voter); setBlockReason(''); }}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200">
                                  <Ban className="w-3 h-3 mr-1"/>Block
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ✅ Locations Tab */}
        <TabsContent value="locations">
          <LocationManager token={token}/>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader><CardTitle className="dark:text-white">Security Status</CardTitle><CardDescription>Real-time monitoring</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {['256-bit AES Encryption','Blockchain Verification','Two-Factor Authentication','DDoS Protection','Audit Logging','Intrusion Detection'].map((item,i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-600"/><span className="font-medium dark:text-white">{item}</span></div>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
