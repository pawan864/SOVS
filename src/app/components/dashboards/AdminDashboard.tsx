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
  Bell, Send, RotateCcw, MessageCircle, AlertCircle, Info, Zap,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { FeedbackInbox } from './FeedbackInbox';

const API    = 'https://sovs-backend-bf8j.onrender.com/api';
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const ALL_ROLES = ['voter', 'dm', 'sdm', 'cdo'];

// ── Handle expired / invalid token gracefully ──────────────────
function checkAuth(data: any) {
  if (data?.message?.toLowerCase().includes('invalid token') ||
      data?.message?.toLowerCase().includes('jwt expired') ||
      data?.message?.toLowerCase().includes('not authorized')) {
    toast.error('Session expired. Please log in again.', { duration: 4000 });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentUser');
    window.location.href = '/';
    return false;
  }
  return true;
}

const NOTICE_TYPES = [
  { value: 'info',            label: 'ℹ️ Information', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'warning',         label: '⚠️ Warning',     color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'urgent',          label: '🚨 Urgent',      color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'action_required', label: '✅ Action Required', color: 'bg-purple-100 text-purple-700 border-purple-200' },
];

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
          <div className="space-y-2">
            <Label>Election Area <span className="text-gray-400 text-xs">(optional)</span></Label>
            <LocationPicker value={location} onChange={setLocation}/>
          </div>
          <div className="space-y-2">
            <Label>Visible To (select roles) <span className="text-red-500">*</span></Label>
            <div className="flex gap-2 flex-wrap">
              {ALL_ROLES.map(role => (
                <button key={role} type="button" onClick={() => toggleRole(role)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${form.visibleTo.includes(role) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}>
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
          <div><h2 className="text-xl font-bold dark:text-white">Add Candidate</h2><p className="text-sm text-gray-500">Election: <span className="font-medium text-blue-600">{election.title}</span></p></div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><X className="w-5 h-5"/></button>
        </div>
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
          <Button className="flex-1" onClick={handleSubmit} disabled={loading}><UserPlus className="w-4 h-4 mr-2"/>{loading?'Adding...':'Add Candidate'}</Button>
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
      const res   = await fetch(`${API}/elections/${electionId}/candidates/${candidateId}`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } });
      const data  = await res.json();
      if (data.success) { toast.success('Candidate removed'); onDeleted(); }
      else toast.error(data.message||'Failed');
    } catch { toast.error('Cannot reach server'); }
    setLoading(false);
  };
  return (
    <button onClick={handleDelete} disabled={loading} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
  );
}

// ── Edit Election Modal ───────────────────────────────────────────────────────
function EditElectionModal({ election, onClose, onSaved }: { election: any; onClose: () => void; onSaved: () => void }) {
  const getToken = () => localStorage.getItem('token') || '';
  const [section, setSection] = useState<'details'|'candidates'|'dates'>('details');
  const [saving, setSaving]   = useState(false);

  // Details form
  const [form, setForm] = useState({
    title:       election.title       || '',
    description: election.description || '',
    totalVoters: String(election.totalVoters || 0),
    startDate:   election.startDate ? new Date(election.startDate).toISOString().slice(0,10) : '',
    endDate:     election.endDate   ? new Date(election.endDate).toISOString().slice(0,10)   : '',
    status:      election.status    || 'upcoming',
  });

  // Candidates
  const [candidates, setCandidates] = useState<any[]>(
    (election.candidates || []).map((c: any) => ({ ...c, _editing: false }))
  );
  const [newCand, setNewCand]         = useState({ name:'', party:'', description:'', manifesto:'', photo:'' });
  const [addingCand, setAddingCand]   = useState(false);
  const [candSaving, setCandSaving]   = useState(false);

  const C_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#0891b2'];

  // ── Save details / dates ──────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) { toast.error('Title and description are required'); return; }
    setSaving(true);
    try {
      const body: any = {
        title:       form.title.trim(),
        description: form.description.trim(),
        totalVoters: parseInt(form.totalVoters) || 0,
        startDate:   form.startDate,
        endDate:     form.endDate,
        status:      form.status,
      };
      const res  = await fetch(`${API}/elections/${election._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) { toast.success('Election updated!'); onSaved(); }
      else { if (!checkAuth(data)) return; toast.error(data.message || 'Failed'); }
    } catch { toast.error('Cannot reach server'); }
    setSaving(false);
  };

  // ── Add candidate ─────────────────────────────────────────────────
  const handleAddCandidate = async () => {
    if (!newCand.name.trim() || !newCand.party.trim()) { toast.error('Name and party are required'); return; }
    setCandSaving(true);
    try {
      const res  = await fetch(`${API}/elections/${election._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ candidates: [...candidates.map(({ _editing, ...c }) => c), { ...newCand }] }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${newCand.name} added!`);
        setCandidates((data.data.candidates || []).map((c: any) => ({ ...c, _editing: false })));
        setNewCand({ name:'', party:'', description:'', manifesto:'', photo:'' });
        setAddingCand(false);
        onSaved();
      } else { if (!checkAuth(data)) return; toast.error(data.message || 'Failed'); }
    } catch { toast.error('Cannot reach server'); }
    setCandSaving(false);
  };

  // ── Save edited candidate ─────────────────────────────────────────
  const handleSaveCandidate = async (idx: number) => {
    const c = candidates[idx];
    if (!c.name.trim() || !c.party.trim()) { toast.error('Name and party required'); return; }
    setCandSaving(true);
    try {
      const res  = await fetch(`${API}/elections/${election._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ candidates: candidates.map(({ _editing, ...c }) => c) }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Candidate saved!');
        setCandidates((data.data.candidates || []).map((c: any) => ({ ...c, _editing: false })));
        onSaved();
      } else { if (!checkAuth(data)) return; toast.error(data.message || 'Failed'); }
    } catch { toast.error('Cannot reach server'); }
    setCandSaving(false);
  };

  // ── Delete candidate ──────────────────────────────────────────────
  const handleDeleteCandidate = async (candidateId: string, name: string) => {
    if (!confirm(`Remove "${name}" from this election?`)) return;
    try {
      const res  = await fetch(`${API}/elections/${election._id}/candidates/${candidateId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Candidate removed');
        setCandidates(prev => prev.filter(c => c._id !== candidateId));
        onSaved();
      } else { if (!checkAuth(data)) return; toast.error(data.message || 'Failed'); }
    } catch { toast.error('Cannot reach server'); }
  };

  const fieldCls = "w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
  const smFieldCls = "w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh] overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Edit3 className="w-5 h-5 text-white"/>
            </div>
            <div>
              <h2 className="text-lg font-bold dark:text-white leading-tight">Edit Election</h2>
              <p className="text-xs text-gray-500 truncate max-w-xs">{election.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* ── Section tabs ── */}
        <div className="flex gap-2 px-6 pt-4 pb-1 flex-shrink-0 border-b dark:border-gray-800">
          {([
            { key:'details',    icon:'📋', label:'Details'     },
            { key:'candidates', icon:'👥', label:'Candidates'  },
            { key:'dates',      icon:'📅', label:'Dates & Status' },
          ] as const).map(s => (
            <button key={s.key} onClick={() => setSection(s.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-sm font-semibold border-b-2 transition-all ${
                section === s.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
              <span>{s.icon}</span>{s.label}
            </button>
          ))}
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* ────── DETAILS ────── */}
          {section === 'details' && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">Election Title <span className="text-red-500">*</span></Label>
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className={fieldCls} placeholder="e.g. Lok Sabha 2026"/>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">Description <span className="text-red-500">*</span></Label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  rows={3} className={fieldCls + " resize-none"} placeholder="Brief description of this election"/>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">Total Eligible Voters</Label>
                <input type="number" min="0" value={form.totalVoters} onChange={e => setForm(f => ({...f, totalVoters: e.target.value}))} className={fieldCls} placeholder="0"/>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
                ℹ️ To change the election area (state/district/locality), use the <strong>Visibility</strong> button on the election card.
              </div>
              <Button className="w-full h-10" onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2"/>{saving ? 'Saving...' : 'Save Details'}
              </Button>
            </div>
          )}

          {/* ────── CANDIDATES ────── */}
          {section === 'candidates' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold dark:text-white">{candidates.length} candidate{candidates.length !== 1 ? 's' : ''}</p>
                {!addingCand && (
                  <Button size="sm" onClick={() => setAddingCand(true)} className="gap-1.5">
                    <Plus className="w-4 h-4"/>Add Candidate
                  </Button>
                )}
              </div>

              {/* ── New candidate form ── */}
              {addingCand && (
                <div className="border-2 border-blue-300 dark:border-blue-700 rounded-xl p-4 space-y-3 bg-blue-50/50 dark:bg-blue-900/10">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">➕ New Candidate</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs mb-1 block">Full Name *</Label>
                      <input value={newCand.name} onChange={e => setNewCand(n => ({...n, name: e.target.value}))}
                        placeholder="Candidate name" className={smFieldCls}/>
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Party *</Label>
                      <input value={newCand.party} onChange={e => setNewCand(n => ({...n, party: e.target.value}))}
                        placeholder="Party name" className={smFieldCls}/>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs mb-1 block">Photo URL (optional)</Label>
                      <input value={newCand.photo} onChange={e => setNewCand(n => ({...n, photo: e.target.value}))}
                        placeholder="https://example.com/photo.jpg" className={smFieldCls}/>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs mb-1 block">Short Description</Label>
                      <input value={newCand.description} onChange={e => setNewCand(n => ({...n, description: e.target.value}))}
                        placeholder="Brief bio or background..." className={smFieldCls}/>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs mb-1 block">Manifesto / Key Promises</Label>
                      <textarea value={newCand.manifesto} onChange={e => setNewCand(n => ({...n, manifesto: e.target.value}))}
                        rows={2} placeholder="Key points..." className={smFieldCls + " resize-none"}/>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => { setAddingCand(false); setNewCand({ name:'', party:'', description:'', manifesto:'', photo:'' }); }}>
                      Cancel
                    </Button>
                    <Button size="sm" className="flex-1" onClick={handleAddCandidate} disabled={candSaving}>
                      <UserPlus className="w-4 h-4 mr-1.5"/>{candSaving ? 'Adding...' : 'Add Candidate'}
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Existing candidates list ── */}
              {candidates.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                  <UserPlus className="w-10 h-10 text-gray-300 mx-auto mb-2"/>
                  <p className="text-sm text-gray-400">No candidates yet. Add the first one.</p>
                </div>
              ) : candidates.map((c, idx) => (
                <div key={c._id || idx} className="border dark:border-gray-700 rounded-xl overflow-hidden transition-all">
                  {!c._editing ? (
                    /* ── Collapsed row ── */
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                        style={{ background: C_COLORS[idx % C_COLORS.length] }}>
                        {c.photo
                          ? <img src={c.photo} alt={c.name} className="w-full h-full rounded-full object-cover"/>
                          : c.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold dark:text-white truncate">{c.name}</p>
                        <p className="text-xs text-gray-500 truncate">{c.party}{c.description ? ` · ${c.description}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setCandidates(prev => prev.map((x,i) => i===idx ? {...x, _editing:true} : x))}
                          className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 transition-colors" title="Edit">
                          <Edit3 className="w-4 h-4"/>
                        </button>
                        <button
                          onClick={() => handleDeleteCandidate(c._id, c.name)}
                          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 hover:text-red-600 transition-colors" title="Remove">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── Expanded edit form ── */
                    <div className="p-4 space-y-3 bg-amber-50/50 dark:bg-amber-900/10 border-l-4 border-l-amber-400">
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">✏️ Editing: {c.name}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs mb-1 block">Full Name *</Label>
                          <input value={c.name} onChange={e => setCandidates(prev => prev.map((x,i) => i===idx ? {...x, name: e.target.value} : x))}
                            className={smFieldCls}/>
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Party *</Label>
                          <input value={c.party} onChange={e => setCandidates(prev => prev.map((x,i) => i===idx ? {...x, party: e.target.value} : x))}
                            className={smFieldCls}/>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs mb-1 block">Photo URL</Label>
                          <input value={c.photo||''} onChange={e => setCandidates(prev => prev.map((x,i) => i===idx ? {...x, photo: e.target.value} : x))}
                            placeholder="https://..." className={smFieldCls}/>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs mb-1 block">Description</Label>
                          <input value={c.description||''} onChange={e => setCandidates(prev => prev.map((x,i) => i===idx ? {...x, description: e.target.value} : x))}
                            className={smFieldCls}/>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs mb-1 block">Manifesto / Key Promises</Label>
                          <textarea value={c.manifesto||''} rows={2}
                            onChange={e => setCandidates(prev => prev.map((x,i) => i===idx ? {...x, manifesto: e.target.value} : x))}
                            className={smFieldCls + " resize-none"}/>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1"
                          onClick={() => setCandidates(prev => prev.map((x,i) => i===idx ? {...x, _editing:false} : x))}>
                          Cancel
                        </Button>
                        <Button size="sm" className="flex-1" onClick={() => handleSaveCandidate(idx)} disabled={candSaving}>
                          <Save className="w-4 h-4 mr-1.5"/>{candSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ────── DATES & STATUS ────── */}
          {section === 'dates' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold mb-1.5 block">Start Date</Label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({...f, startDate: e.target.value}))} className={fieldCls}/>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-1.5 block">End Date</Label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({...f, endDate: e.target.value}))} className={fieldCls}/>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold mb-1.5 block">Status Override</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['upcoming','active','ended'] as const).map(s => (
                    <button key={s} onClick={() => setForm(f => ({...f, status: s}))}
                      className={`py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                        form.status === s
                          ? s==='active' ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : s==='upcoming' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'border-gray-400 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}>
                      {s==='active'?'🟢':s==='upcoming'?'🔵':'⚫'} {s.charAt(0).toUpperCase()+s.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Status auto-updates based on dates, but can be overridden manually.</p>
              </div>

              {/* Preview card */}
              <div className="rounded-xl border dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">📋 Preview</p>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  {[
                    { label:'Start Date', value: form.startDate ? new Date(form.startDate).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'}) : '—' },
                    { label:'End Date',   value: form.endDate   ? new Date(form.endDate).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'})   : '—' },
                    { label:'Duration',   value: form.startDate && form.endDate ? `${Math.max(0,Math.ceil((new Date(form.endDate).getTime()-new Date(form.startDate).getTime())/(1000*60*60*24)))} days` : '—' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{row.label}</span>
                      <span className="font-medium dark:text-white">{row.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Status</span>
                    <span className={`font-semibold px-2.5 py-0.5 rounded-full text-xs ${
                      form.status==='active'  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      form.status==='upcoming'? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {form.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                ⚠️ Changing dates on an active election affects live voting. Status override takes effect immediately.
              </div>

              <Button className="w-full h-10" onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2"/>{saving ? 'Saving...' : 'Save Dates & Status'}
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Visibility Modal ──────────────────────────────────────────────
function VisibilityModal({ election, onClose, onSaved }: { election: any; onClose: () => void; onSaved: () => void }) {
  const [selected, setSelected] = useState<string[]>(election.visibleTo || ALL_ROLES);
  const [loading, setLoading]   = useState(false);
  const toggle = (role: string) => setSelected(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  const handleSave = async () => {
    if (selected.length === 0) { toast.error('Select at least one role'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API}/elections/${election._id}/visibility`, { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ visibleTo: selected }) });
      const data  = await res.json();
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
        <div className="grid grid-cols-2 gap-3 mb-6">
          {ALL_ROLES.map(role => (
            <button key={role} type="button" onClick={() => toggle(role)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${selected.includes(role) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${selected.includes(role) ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500'}`}>{role.charAt(0).toUpperCase()}</div>
              <div className="text-left">
                <p className={`text-sm font-semibold ${selected.includes(role) ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>{role.toUpperCase()}</p>
                <p className="text-xs text-gray-400">{selected.includes(role) ? '✓ Can view' : '✗ Hidden'}</p>
              </div>
            </button>
          ))}
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
  const [editElection,         setEditElection]           = useState<any>(null);
  const [elections, setElections]         = useState<any[]>([]);
  const [stats, setStats]                 = useState<any>(null);
  const [recentVotes, setRecentVotes]     = useState<any[]>([]);
  const [auditLogs, setAuditLogs]         = useState<any[]>([]);
  const [loadingVotes, setLoadingVotes]   = useState(false);
  const [selectedElectionFilter, setSelectedElectionFilter] = useState<string>('all');
  const [blockedVoters, setBlockedVoters] = useState<any[]>([]);
  const [showSettings, setShowSettings]   = useState(false);
  const [showProfile, setShowProfile]     = useState(false);
  const [showDropdown, setShowDropdown]   = useState(false);
  const [showBlockModal, setShowBlockModal] = useState<any>(null);
  const [blockReason, setBlockReason]     = useState('');
  const [blockLoading, setBlockLoading]   = useState(false);
  const [allVoters, setAllVoters]         = useState<any[]>([]);
  const [voterSearch, setVoterSearch]     = useState('');
  const [assignAreaVoter, setAssignAreaVoter] = useState<any>(null);
  const [eligibleModal, setEligibleModal] = useState<any>(null);
  const [eligibleVoters, setEligibleVoters] = useState<any[]>([]);
  const [eligibleSearch, setEligibleSearch] = useState('');
  const [eligibleLoading, setEligibleLoading] = useState(false);
  const [assigningArea, setAssigningArea] = useState(false);
  const [areaStates,       setAreaStates]       = useState<any[]>([]);
  const [areaDistricts,    setAreaDistricts]    = useState<any[]>([]);
  const [areaSubdistricts, setAreaSubdistricts] = useState<any[]>([]);
  const [areaLocalities,   setAreaLocalities]   = useState<any[]>([]);
  const [assignLoc,        setAssignLoc]        = useState<any>({});

  // ── Voter Management state ────────────────────────────────────
  const [voterMgmtModal, setVoterMgmtModal]   = useState<any>(null); // voter object
  const [voterVotes, setVoterVotes]           = useState<any[]>([]);
  const [loadingVoterVotes, setLoadingVoterVotes] = useState(false);
  const [resetVoteConfirm, setResetVoteConfirm] = useState<any>(null); // { voter, vote, election }
  const [resettingVote, setResettingVote]     = useState(false);

  // ── Notice state ──────────────────────────────────────────────
  const [noticeModal, setNoticeModal]         = useState<any>(null); // voter to send notice to
  const [noticeSubject, setNoticeSubject]     = useState('');
  const [noticeMessage, setNoticeMessage]     = useState('');
  const [noticeType, setNoticeType]           = useState('info');
  const [sendingNotice, setSendingNotice]     = useState(false);
  const [allNotices, setAllNotices]           = useState<any[]>([]);
  const [loadingNotices, setLoadingNotices]   = useState(false);
  const [noticeSearch, setNoticeSearch]       = useState('');

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

  const fetchAllVoters = async () => {
    try {
      const res  = await fetch(`${API}/users?role=voter`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setAllVoters(data.data);
    } catch {}
  };

  const fetchBlockedVoters = async () => {
    try {
      const res  = await fetch(`${API}/users/blocked/list`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setBlockedVoters(data.data);
    } catch {}
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

  const fetchAllNotices = async () => {
    setLoadingNotices(true);
    try {
      const res  = await fetch(`${API}/notices`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setAllNotices(data.data);
    } catch {}
    setLoadingNotices(false);
  };

  // ── Fetch votes for a specific voter ──────────────────────────
  const fetchVoterVotes = async (voterId: string) => {
    setLoadingVoterVotes(true);
    try {
      const res  = await fetch(`${API}/votes/recent?limit=200`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        // Filter votes for this specific voter by matching voterId field
        const voterVotesList = data.data.filter((v: any) =>
          v.userId === voterId || v.voterId === voterMgmtModal?.voterId
        );
        setVoterVotes(voterVotesList);
      }
    } catch {}
    setLoadingVoterVotes(false);
  };

  // ── Reset a voter's vote ──────────────────────────────────────
  const handleResetVote = async () => {
    if (!resetVoteConfirm) return;
    setResettingVote(true);
    try {
      const res  = await fetch(`${API}/votes/admin/reset/${resetVoteConfirm.electionId}/${resetVoteConfirm.voterId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('✅ Vote reset! Voter can now vote again.');
        setResetVoteConfirm(null);
        // Refresh
        fetchRecentVotes();
        if (voterMgmtModal) fetchVoterVotes(voterMgmtModal._id);
      } else {
        toast.error(data.message || 'Failed to reset vote');
      }
    } catch { toast.error('Cannot reach server'); }
    setResettingVote(false);
  };

  // ── Send notice ───────────────────────────────────────────────
  const handleSendNotice = async () => {
    if (!noticeModal || !noticeSubject.trim() || !noticeMessage.trim()) {
      toast.error('Subject and message are required'); return;
    }
    setSendingNotice(true);
    try {
      const res  = await fetch(`${API}/notices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          targetVoterId: noticeModal._id,
          targetName:    noticeModal.name,
          subject:       noticeSubject.trim(),
          message:       noticeMessage.trim(),
          type:          noticeType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`📬 Notice sent to ${noticeModal.name}!`);
        setNoticeModal(null); setNoticeSubject(''); setNoticeMessage(''); setNoticeType('info');
        fetchAllNotices();
      } else {
        toast.error(data.message || 'Failed to send notice');
      }
    } catch { toast.error('Cannot reach server'); }
    setSendingNotice(false);
  };

  const handleDeleteNotice = async (noticeId: string) => {
    try {
      const res  = await fetch(`${API}/notices/${noticeId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { toast.success('Notice deleted'); fetchAllNotices(); }
      else toast.error(data.message || 'Failed');
    } catch { toast.error('Cannot reach server'); }
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
      const res  = await fetch(`${API}/elections/${electionId}/eligible-voters`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ voterId }) });
      const data = await res.json();
      if (data.success) { toast.success('Voter added!'); fetchEligibleVoters(electionId); fetchElections(); }
      else toast.error(data.message || 'Failed');
    } catch { toast.error('Cannot reach server'); }
  };

  const removeEligibleVoter = async (electionId: string, voterId: string) => {
    try {
      const res  = await fetch(`${API}/elections/${electionId}/eligible-voters/${voterId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { toast.success('Voter removed'); fetchEligibleVoters(electionId); fetchElections(); }
      else toast.error(data.message || 'Failed');
    } catch { toast.error('Cannot reach server'); }
  };

  const toggleRestriction = async (election: any) => {
    try {
      const res  = await fetch(`${API}/elections/${election._id}/restrict`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ isRestricted: !election.isRestrictedToEligible }) });
      const data = await res.json();
      if (data.success) { toast.success(data.message); fetchElections(); }
    } catch { toast.error('Cannot reach server'); }
  };

  const fetchAreaLocations = async (type: string, parentId?: string) => {
    const url  = parentId ? `${API}/locations?type=${type}&parent=${parentId}` : `${API}/locations?type=${type}`;
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
    const parts: string[] = [];
    const find = (arr: any[], id?: string) => arr.find((x:any) => x._id === id)?.name;
    if (assignLoc.state)       parts.push(find(areaStates, assignLoc.state) || '');
    if (assignLoc.district)    parts.push(find(areaDistricts, assignLoc.district) || '');
    if (assignLoc.subdistrict) parts.push(find(areaSubdistricts, assignLoc.subdistrict) || '');
    if (assignLoc.locality)    parts.push(find(areaLocalities, assignLoc.locality) || '');
    const label = parts.filter(Boolean).join(', ');
    try {
      const res  = await fetch(`${API}/users/${assignAreaVoter._id}/update-location`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ voterLocation: { ...assignLoc, label } }) });
      const data = await res.json();
      if (data.success) { toast.success(`Area assigned: ${label}`); setAssignAreaVoter(null); setAssignLoc({}); fetchAllVoters(); }
      else toast.error(data.message || 'Failed');
    } catch { toast.error('Cannot reach server'); }
    setAssigningArea(false);
  };

  const handleBlock = async () => {
    if (!blockReason.trim()) { toast.error('Please enter a reason'); return; }
    if (!showBlockModal) return;
    setBlockLoading(true);
    try {
      const res  = await fetch(`${API}/users/${showBlockModal._id}/block`, { method: 'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ reason: blockReason }) });
      const data = await res.json();
      if (data.success) { toast.success(`${showBlockModal.name} blocked`); setShowBlockModal(null); setBlockReason(''); fetchBlockedVoters(); fetchAllVoters(); }
      else toast.error(data.message || 'Failed');
    } catch { toast.error('Cannot reach server'); }
    setBlockLoading(false);
  };

  const handleUnblock = async (voter: any) => {
    try {
      const res  = await fetch(`${API}/users/${voter._id}/unblock`, { method: 'PUT', headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { toast.success(`${voter.name} unblocked`); fetchBlockedVoters(); fetchAllVoters(); }
      else toast.error(data.message || 'Failed');
    } catch { toast.error('Cannot reach server'); }
  };

  useEffect(() => {
    if (assignAreaVoter) {
      fetchAreaLocations('state');
      if (assignAreaVoter.voterLocation) {
        setAssignLoc(assignAreaVoter.voterLocation);
        if (assignAreaVoter.voterLocation.state)       fetchAreaLocations('district',    assignAreaVoter.voterLocation.state);
        if (assignAreaVoter.voterLocation.district)    fetchAreaLocations('subdistrict', assignAreaVoter.voterLocation.district);
        if (assignAreaVoter.voterLocation.subdistrict) fetchAreaLocations('locality',    assignAreaVoter.voterLocation.subdistrict);
      }
    }
  }, [assignAreaVoter]);

  // ── active tab tracker for smart refresh ─────────────────────
  const [activeTab, setActiveTab] = useState('overview');

  // ── refresh all data ──────────────────────────────────────────
  const refreshAll = () => {
    fetchElections(); fetchStats(); fetchRecentVotes();
    fetchBlockedVoters(); fetchAllVoters(); fetchAllNotices();
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') { navigate('/'); return; }
    setUser(currentUser);
    refreshAll();

    // Auto-refresh intervals
    const votesInterval   = setInterval(fetchRecentVotes, 10000);   // every 10s
    const statsInterval   = setInterval(() => { fetchStats(); fetchElections(); }, 20000); // every 20s
    const votersInterval  = setInterval(() => { fetchAllVoters(); fetchBlockedVoters(); }, 30000); // every 30s
    const noticesInterval = setInterval(fetchAllNotices, 15000);    // every 15s

    return () => {
      clearInterval(votesInterval);
      clearInterval(statsInterval);
      clearInterval(votersInterval);
      clearInterval(noticesInterval);
    };
  }, [navigate]);

  // ── Refresh relevant data when switching tabs ─────────────────
  useEffect(() => {
    if (activeTab === 'overview')  { fetchStats(); fetchElections(); }
    if (activeTab === 'live')      { fetchRecentVotes(); }
    if (activeTab === 'elections') { fetchElections(); }
    if (activeTab === 'voters')    { fetchAllVoters(); fetchBlockedVoters(); }
    if (activeTab === 'notices')   { fetchAllNotices(); fetchAllVoters(); }
    if (activeTab === 'blocked')   { fetchBlockedVoters(); }
    if (activeTab === 'analytics') { fetchStats(); fetchElections(); }
  }, [activeTab]);

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

  const noticeTypeStyle = (type: string) => NOTICE_TYPES.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-600';

  return (
    <DashboardLayout title="Admin Control Center" subtitle="System Administration & Management" roleLabel="System Administrator" roleColor="bg-purple-600" hideProfile={true}>

      {/* Modals */}
      {showSettings && <SettingsModal user={user} token={token} API={API} onClose={() => setShowSettings(false)} onUserUpdate={(u: any) => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); localStorage.setItem('currentUser', JSON.stringify(u)); }}/>}
      {showProfile  && <ProfileModal  user={user} token={token} API={API} onClose={() => setShowProfile(false)}  onOpenSettings={() => { setShowProfile(false); setShowSettings(true); }} onUserUpdate={(u: any) => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); localStorage.setItem('currentUser', JSON.stringify(u)); }}/>}
      {showCreateModal && <CreateElectionModal onClose={() => setShowCreateModal(false)} onCreated={() => { fetchElections(); fetchStats(); }}/>}
      {addCandidateElection && <AddCandidateModal election={addCandidateElection} onClose={() => setAddCandidateElection(null)} onAdded={fetchElections}/>}
      {visibilityElection && <VisibilityModal election={visibilityElection} onClose={() => setVisibilityElection(null)} onSaved={fetchElections}/>}
      {editElection && <EditElectionModal election={editElection} onClose={() => setEditElection(null)} onSaved={() => { fetchElections(); fetchStats(); }}/>}

      {/* ── VOTER MANAGEMENT MODAL ── */}
      {voterMgmtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {voterMgmtModal.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold dark:text-white">{voterMgmtModal.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-mono">{voterMgmtModal.voterId}</span>
                    {voterMgmtModal.aadhaarNumber && <span>· Aadhaar: {voterMgmtModal.aadhaarNumber}</span>}
                  </div>
                  {voterMgmtModal.voterLocation?.label && <p className="text-xs text-blue-500 mt-0.5">📍 {voterMgmtModal.voterLocation.label}</p>}
                </div>
              </div>
              <button onClick={() => setVoterMgmtModal(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X className="w-5 h-5"/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* ── Quick Actions ── */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-3">Quick Actions</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button onClick={() => { setNoticeModal(voterMgmtModal); setVoterMgmtModal(null); }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 transition-colors cursor-pointer">
                    <Bell className="w-6 h-6 text-blue-600"/>
                    <span className="text-xs font-semibold text-blue-700">Send Notice</span>
                  </button>
                  <button onClick={() => { setAssignAreaVoter(voterMgmtModal); setAssignLoc(voterMgmtModal.voterLocation || {}); setVoterMgmtModal(null); }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 transition-colors cursor-pointer">
                    <MapPin className="w-6 h-6 text-green-600"/>
                    <span className="text-xs font-semibold text-green-700">Assign Area</span>
                  </button>
                  {voterMgmtModal.isBlocked ? (
                    <button onClick={() => { handleUnblock(voterMgmtModal); setVoterMgmtModal(null); }}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 transition-colors cursor-pointer">
                      <Unlock className="w-6 h-6 text-green-600"/>
                      <span className="text-xs font-semibold text-green-700">Unblock</span>
                    </button>
                  ) : (
                    <button onClick={() => { setShowBlockModal(voterMgmtModal); setVoterMgmtModal(null); }}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 transition-colors cursor-pointer">
                      <Ban className="w-6 h-6 text-red-600"/>
                      <span className="text-xs font-semibold text-red-700">Block Voter</span>
                    </button>
                  )}
                  <button onClick={() => fetchVoterVotes(voterMgmtModal._id)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-purple-200 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 transition-colors cursor-pointer">
                    <RefreshCw className="w-6 h-6 text-purple-600"/>
                    <span className="text-xs font-semibold text-purple-700">Load Votes</span>
                  </button>
                </div>
              </div>

              {/* ── Vote Status Management ── */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-3">Vote Status Management</p>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl mb-3 text-xs text-amber-700 dark:text-amber-300">
                  ⚠️ Resetting a vote removes the voter's record from the database. They will be able to vote again. Use this only to correct errors or fraud cases.
                </div>

                {loadingVoterVotes ? (
                  <div className="text-center py-6 text-gray-400">Loading vote records...</div>
                ) : voterVotes.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <Vote className="w-8 h-8 text-gray-300 mx-auto mb-2"/>
                    <p className="text-sm text-gray-400">No vote records found</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Load Votes" above to fetch this voter's votes</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {voterVotes.map((vote: any) => (
                      <div key={vote._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold dark:text-white truncate">{vote.electionTitle}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Voted for: <span className="text-green-600 font-medium">{vote.candidateName}</span>
                          </p>
                          <p className="text-xs text-gray-400">{new Date(vote.createdAt).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">✓ Voted</Badge>
                          <button
                            onClick={() => setResetVoteConfirm({ voter: voterMgmtModal, vote, electionId: vote.electionId, voterId: voterMgmtModal._id })}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors">
                            <RotateCcw className="w-3.5 h-3.5"/>Reset to Non-Voted
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESET VOTE CONFIRM MODAL ── */}
      {resetVoteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0"><RotateCcw className="w-6 h-6 text-red-600"/></div>
              <div><h2 className="text-lg font-bold dark:text-white">Reset Vote?</h2><p className="text-sm text-gray-500">This cannot be undone easily</p></div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Voter:</span><span className="font-semibold dark:text-white">{resetVoteConfirm.voter?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Election:</span><span className="font-semibold dark:text-white truncate ml-2">{resetVoteConfirm.vote?.electionTitle}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Voted for:</span><span className="font-semibold text-green-600">{resetVoteConfirm.vote?.candidateName}</span></div>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-xs text-red-600">
              🗑️ The vote record will be permanently deleted from the database. The election turnout count will decrease by 1. The voter will be able to vote again.
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setResetVoteConfirm(null)}>Cancel</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleResetVote} disabled={resettingVote}>
                <RotateCcw className="w-4 h-4 mr-2"/>{resettingVote ? 'Resetting...' : 'Yes, Reset Vote'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── SEND NOTICE MODAL ── */}
      {noticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><Bell className="w-5 h-5 text-blue-600"/></div>
                <div>
                  <h2 className="text-lg font-bold dark:text-white">Send Notice</h2>
                  <p className="text-sm text-gray-500">To: <span className="font-medium text-blue-600">{noticeModal.name}</span> · {noticeModal.voterId}</p>
                </div>
              </div>
              <button onClick={() => setNoticeModal(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X className="w-5 h-5"/></button>
            </div>

            {/* Notice type */}
            <div className="mb-4">
              <Label className="text-sm font-semibold mb-2 block">Notice Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {NOTICE_TYPES.map(t => (
                  <button key={t.value} onClick={() => setNoticeType(t.value)}
                    className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${noticeType === t.value ? t.color + ' ring-2 ring-offset-1 ring-blue-400' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 text-gray-600'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div className="mb-4">
              <Label className="text-sm font-semibold mb-1 block">Subject *</Label>
              <Input value={noticeSubject} onChange={e => setNoticeSubject(e.target.value)} placeholder="e.g. Important voting information" className="dark:bg-gray-800"/>
            </div>

            {/* Message */}
            <div className="mb-5">
              <Label className="text-sm font-semibold mb-1 block">Message *</Label>
              <textarea value={noticeMessage} onChange={e => setNoticeMessage(e.target.value)} rows={5}
                placeholder="Write your notice here..."
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              <p className="text-right text-xs text-gray-400 mt-1">{noticeMessage.length}/1000</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setNoticeModal(null)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSendNotice} disabled={sendingNotice || !noticeSubject.trim() || !noticeMessage.trim()}>
                <Send className="w-4 h-4 mr-2"/>{sendingNotice ? 'Sending...' : 'Send Notice'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0"><Ban className="w-6 h-6 text-red-600"/></div>
              <div><h2 className="text-lg font-bold dark:text-white">Block Voter</h2><p className="text-sm text-gray-500">{showBlockModal.name} · {showBlockModal.voterId}</p></div>
            </div>
            <div className="mb-4">
              <Label className="text-sm font-medium dark:text-white mb-2 block">Reason for blocking <span className="text-red-500">*</span></Label>
              <textarea className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500" rows={3} placeholder="e.g. Suspicious activity, duplicate account..." value={blockReason} onChange={e => setBlockReason(e.target.value)}/>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4 text-xs text-red-600">⚠ This voter will be blocked immediately from logging in.</div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setShowBlockModal(null); setBlockReason(''); }}>Cancel</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleBlock} disabled={blockLoading}><Ban className="w-4 h-4 mr-2"/>{blockLoading ? 'Blocking...' : 'Block Voter'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Area Modal */}
      {assignAreaVoter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><MapPin className="w-6 h-6 text-blue-600"/></div>
              <div><h2 className="text-lg font-bold dark:text-white">Assign Voter Area</h2><p className="text-sm text-gray-500">{assignAreaVoter.name} · {assignAreaVoter.voterId}</p></div>
              <button onClick={() => setAssignAreaVoter(null)} className="ml-auto p-2 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4"/></button>
            </div>
            {assignAreaVoter.voterLocation?.label && (
              <div className="mb-3 p-3 bg-blue-50 rounded-xl border border-blue-200 text-sm text-blue-700">Current: <strong>{assignAreaVoter.voterLocation.label}</strong></div>
            )}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label:'🏛️ State', level:'state', list:areaStates, dep:true },
                { label:'🏙️ District', level:'district', list:areaDistricts, dep:!!assignLoc.state },
                { label:'🏘️ Sub-District', level:'subdistrict', list:areaSubdistricts, dep:!!assignLoc.district },
                { label:'📍 Locality', level:'locality', list:areaLocalities, dep:!!assignLoc.subdistrict },
              ].map(({ label, level, list, dep }) => (
                <div key={level}>
                  <Label className="text-xs font-medium mb-1 block">{label}</Label>
                  <select value={(assignLoc as any)[level] || ''} onChange={e => handleAreaLocChange(level, e.target.value)} disabled={!dep}
                    className={`w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white focus:outline-none ${!dep ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <option value="">{dep ? `Select ${level}` : '— select above first'}</option>
                    {list.map((x:any) => <option key={x._id} value={x._id}>{x.name}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setAssignAreaVoter(null)}>Cancel</Button>
              <Button className="flex-1" onClick={handleAssignArea} disabled={assigningArea || !assignLoc.state}><MapPin className="w-4 h-4 mr-2"/>{assigningArea ? 'Saving...' : 'Assign Area'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── ELIGIBLE VOTERS & RESTRICTION MODAL ── */}
      {eligibleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh]">

            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b dark:border-gray-700 flex-shrink-0">
              <div className="flex-1 min-w-0 mr-4">
                <h2 className="text-lg font-bold dark:text-white">Voter Restriction Control</h2>
                <p className="text-sm text-blue-600 font-medium truncate mt-0.5">{eligibleModal.title}</p>
                {eligibleModal.location?.label && (
                  <p className="text-xs text-gray-500 mt-0.5">📍 Election area: <span className="font-medium text-gray-700 dark:text-gray-300">{eligibleModal.location.label}</span></p>
                )}
              </div>
              <button onClick={() => setEligibleModal(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 flex-shrink-0"><X className="w-5 h-5"/></button>
            </div>

            {/* Restriction toggle — prominent */}
            <div className="px-5 py-4 border-b dark:border-gray-700 flex-shrink-0">
              <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${eligibleModal.isRestrictedToEligible ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${eligibleModal.isRestrictedToEligible ? 'bg-purple-100 dark:bg-purple-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <Shield className={`w-5 h-5 ${eligibleModal.isRestrictedToEligible ? 'text-purple-600' : 'text-gray-400'}`}/>
                  </div>
                  <div>
                    <p className="text-sm font-bold dark:text-white">
                      {eligibleModal.isRestrictedToEligible ? '🔒 Restricted — Only eligible voters can vote' : '🌍 Open — Anyone in the area can vote'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {eligibleModal.isRestrictedToEligible
                        ? `Only the ${eligibleVoters.length} voter(s) in the list below are allowed to cast a vote`
                        : 'All voters matching the election area can vote. Enable restriction to control who can vote.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { toggleRestriction(eligibleModal); setEligibleModal((prev: any) => ({...prev, isRestrictedToEligible: !prev.isRestrictedToEligible})); }}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${eligibleModal.isRestrictedToEligible ? 'bg-purple-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${eligibleModal.isRestrictedToEligible ? 'translate-x-7' : 'translate-x-1'}`}/>
                </button>
              </div>
              {eligibleModal.isRestrictedToEligible && eligibleVoters.length === 0 && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                  ⚠️ Restriction is ON but no voters are added yet. No one will be able to vote until you add eligible voters below.
                </div>
              )}
            </div>

            {/* Body — two columns */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">

              {/* LEFT: Current eligible voters */}
              <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r dark:border-gray-700 min-h-0">
                <div className="px-4 pt-4 pb-2 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      ✅ Eligible Voters <span className="text-purple-600">({eligibleVoters.length})</span>
                    </p>
                    {eligibleVoters.length > 0 && (
                      <span className="text-xs text-gray-400">Click ✕ to remove</span>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 min-h-0" style={{ maxHeight: 280 }}>
                  {eligibleLoading ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
                  ) : eligibleVoters.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                      <Users className="w-8 h-8 text-gray-300 mx-auto mb-2"/>
                      <p className="text-sm text-gray-400">No eligible voters added yet</p>
                      <p className="text-xs text-gray-400 mt-1">Add voters from the right panel →</p>
                    </div>
                  ) : eligibleVoters.map((voter: any) => (
                    <div key={voter._id} className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-sm flex-shrink-0">
                          {voter.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold dark:text-white truncate">{voter.name}</p>
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-xs text-gray-500 font-mono">{voter.voterId}</span>
                            {voter.voterLocation?.label && (
                              <span className="text-xs text-blue-500 truncate">· 📍 {voter.voterLocation.label}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeEligibleVoter(eligibleModal._id, voter._id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg ml-2 flex-shrink-0 transition-colors">
                        <X className="w-4 h-4"/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: Add voters from all voters list */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-4 pt-4 pb-2 flex-shrink-0">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    ➕ Add Voters <span className="text-gray-400 font-normal normal-case">(click to add)</span>
                  </p>
                  <Input
                    placeholder="Search by name, voter ID, Aadhaar..."
                    value={eligibleSearch}
                    onChange={e => setEligibleSearch(e.target.value)}
                    className="dark:bg-gray-800 h-8 text-sm"
                  />
                  {eligibleModal.location?.label && (
                    <p className="text-xs text-blue-500 mt-1.5">
                      💡 Tip: Showing all voters. Voters from <strong>{eligibleModal.location.label}</strong> are highlighted.
                    </p>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5 min-h-0" style={{ maxHeight: 280 }}>
                  {allVoters
                    .filter((v: any) => !eligibleVoters.some((e: any) => e._id === v._id))
                    .filter((v: any) => {
                      const q = eligibleSearch.toLowerCase();
                      return !q || v.name?.toLowerCase().includes(q) || v.voterId?.toLowerCase().includes(q) || v.aadhaarNumber?.includes(q) || v.eciCardNumber?.toLowerCase().includes(q);
                    })
                    .map((voter: any) => {
                      // Highlight voters whose area matches the election area
                      const elLoc = eligibleModal.location;
                      const vLoc  = voter.voterLocation;
                      const areaMatch = elLoc && vLoc && (
                        (elLoc.locality    && vLoc.locality    && elLoc.locality.toString()    === vLoc.locality?.toString())    ||
                        (elLoc.subdistrict && vLoc.subdistrict && elLoc.subdistrict.toString() === vLoc.subdistrict?.toString()) ||
                        (elLoc.district    && vLoc.district    && elLoc.district.toString()    === vLoc.district?.toString())    ||
                        (elLoc.state       && vLoc.state       && elLoc.state.toString()       === vLoc.state?.toString())
                      );
                      return (
                        <div
                          key={voter._id}
                          onClick={() => addEligibleVoter(eligibleModal._id, voter._id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors border ${areaMatch ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${areaMatch ? 'bg-green-200 text-green-700' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
                              {voter.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-sm font-medium dark:text-white truncate">{voter.name}</span>
                                {areaMatch && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Area match ✓</span>}
                                {voter.isBlocked && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Blocked</span>}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <span className="font-mono">{voter.voterId}</span>
                                {voter.voterLocation?.label && <span className="truncate">· 📍 {voter.voterLocation.label}</span>}
                              </div>
                            </div>
                          </div>
                          <Plus className="w-4 h-4 text-green-500 flex-shrink-0 ml-2"/>
                        </div>
                      );
                    })
                  }
                  {allVoters.filter((v: any) => !eligibleVoters.some((e: any) => e._id === v._id)).length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">All voters have been added</div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t dark:border-gray-700 flex-shrink-0 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
              <p className="text-xs text-gray-500">
                {eligibleModal.isRestrictedToEligible
                  ? `🔒 ${eligibleVoters.length} voter(s) can vote in this election`
                  : '🌍 Open election — location-based access'}
              </p>
              <Button size="sm" onClick={() => setEligibleModal(null)}>Done</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Election Confirm */}
      {confirmDeleteElection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-6 h-6 text-red-600"/></div>
              <div><h2 className="text-lg font-bold dark:text-white">Remove Election</h2><p className="text-sm text-gray-500">This action cannot be undone</p></div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl mb-6 border border-red-200">
              <p className="text-sm font-semibold text-red-700 mb-1">{confirmDeleteElection.title}</p>
              <p className="text-xs text-red-600">Status: {confirmDeleteElection.status} · {confirmDeleteElection.candidates?.length||0} candidates · {confirmDeleteElection.turnout||0} votes cast</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDeleteElection(null)}>Cancel</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  const res   = await fetch(`${API}/elections/${confirmDeleteElection._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                  const data  = await res.json();
                  if (data.success) { toast.success('Election removed'); fetchElections(); fetchStats(); setConfirmDeleteElection(null); }
                  else toast.error(data.message || 'Failed');
                } catch { toast.error('Cannot reach server'); }
              }}><Trash2 className="w-4 h-4 mr-2"/>Remove Election</Button>
            </div>
          </div>
        </div>
      )}

      {/* Theme + Avatar top right */}
      <div className="fixed top-4 right-6 z-[200] flex items-center gap-2">
        <button onClick={() => document.documentElement.classList.toggle('dark')} className="w-11 h-11 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all">
          <Sun className="w-5 h-5 text-amber-500 hidden dark:block"/><Moon className="w-5 h-5 text-gray-600 dark:hidden"/>
        </button>
        <button onClick={() => setShowDropdown(d => !d)} className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all border-2 border-white dark:border-gray-800">
          {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover"/> : <span className="text-base font-bold text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>}
        </button>
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}/>
            <div className="absolute right-0 top-13 mt-1 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover"/> : <span className="text-sm font-bold text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>}
                  </div>
                  <div className="min-w-0"><p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p><p className="text-xs text-gray-500 truncate">{user?.email}</p></div>
                </div>
              </div>
              <div className="py-1.5">
                <button onClick={() => { setShowDropdown(false); setShowProfile(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><User className="w-4 h-4 text-blue-600"/></div><div className="text-left"><p className="font-medium">My Profile</p></div>
                </button>
                <button onClick={() => { setShowDropdown(false); setShowSettings(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><Settings className="w-4 h-4 text-purple-600"/></div><div className="text-left"><p className="font-medium">Settings</p></div>
                </button>
                <div className="mx-3 my-1 border-t dark:border-gray-700"/>
                <button onClick={() => { setShowDropdown(false); localStorage.removeItem('user'); localStorage.removeItem('token'); localStorage.removeItem('currentUser'); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><LogOut className="w-4 h-4 text-red-600"/></div><div className="text-left"><p className="font-medium">Logout</p></div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Stats */}
      {/* ── Live indicator + global refresh ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"/>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"/>
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Live — auto-refreshing</span>
        </div>
        <Button variant="outline" size="sm" onClick={refreshAll} className="text-xs gap-1.5">
          <RefreshCw className="w-3.5 h-3.5"/>Refresh All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label:'Total Elections', value:totalElections,  sub:`${activeElections} active`, icon:<Vote className="w-8 h-8 text-blue-600"/>,   bg:'bg-blue-100 dark:bg-blue-900',   border:'border-l-blue-600' },
          { label:'Total Voters',    value:Number(totalVoters).toLocaleString(), sub:'In database', icon:<Users className="w-8 h-8 text-green-600"/>, bg:'bg-green-100 dark:bg-green-900', border:'border-l-green-600' },
          { label:'Votes Cast',      value:Number(totalVotesCast).toLocaleString(), sub:`${avgTurnout}% turnout`, icon:<BarChart3 className="w-8 h-8 text-purple-600"/>, bg:'bg-purple-100 dark:bg-purple-900', border:'border-l-purple-600' },
          { label:'Open Incidents',  value:flaggedIncidents, sub:'Flagged', icon:<Shield className="w-8 h-8 text-amber-600"/>, bg:'bg-amber-100 dark:bg-amber-900', border:'border-l-amber-600' },
        ].map((s,i) => (
          <Card key={i} className={`border-l-4 ${s.border} dark:bg-gray-900 dark:border-gray-800`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p><p className="text-3xl font-bold text-gray-900 dark:text-white">{s.value}</p><p className="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/>{s.sub}</p></div>
                <div className={`p-4 ${s.bg} rounded-xl`}>{s.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="elections" className="space-y-6" onValueChange={(val) => setActiveTab(val)}>
        <TabsList className="dark:bg-gray-900 flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="live">Live Votes</TabsTrigger>
          <TabsTrigger value="elections">Elections</TabsTrigger>
          <TabsTrigger value="voters">👥 Voters</TabsTrigger>
          <TabsTrigger value="notices" className="relative">
            📬 Notices {allNotices.length > 0 && <span className="ml-1.5 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">{allNotices.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="feedback">💬 Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="blocked" className="relative">Blocked {blockedVoters.length > 0 && <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{blockedVoters.length}</span>}</TabsTrigger>
          <TabsTrigger value="locations">📍 Locations</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader><CardTitle className="dark:text-white">Voter Turnout</CardTitle></CardHeader>
              <CardContent>
                {electionData.length===0 ? <div className="h-[300px] flex items-center justify-center text-gray-400">No data yet</div> : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={electionData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="turnout" fill="#3b82f6" name="Votes"/><Bar dataKey="eligible" fill="#6b7280" name="Eligible"/></BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader><CardTitle className="dark:text-white">Recent Audit Logs</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {auditLogs.slice(0,8).map((log:any,i:number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.type==='success'?'bg-green-500':log.type==='warning'?'bg-yellow-500':log.type==='error'?'bg-red-500':'bg-blue-500'}`}/>
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium dark:text-white truncate">{log.action}</p><p className="text-xs text-gray-500 truncate">{log.details}</p></div>
                      <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata'})}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-900 dark:border-gray-800" onClick={() => setShowCreateModal(true)}>
              <CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-4 bg-blue-100 rounded-2xl"><Plus className="w-8 h-8 text-blue-600"/></div><div><h3 className="font-semibold dark:text-white">Create Election</h3><p className="text-sm text-gray-500">Set up new voting</p></div></div></CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-900 dark:border-gray-800" onClick={() => navigate('/elections')}>
              <CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-4 bg-green-100 rounded-2xl"><Eye className="w-8 h-8 text-green-600"/></div><div><h3 className="font-semibold dark:text-white">View Elections</h3><p className="text-sm text-gray-500">Manage elections</p></div></div></CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-900 dark:border-gray-800" onClick={() => { fetchStats(); fetchElections(); fetchRecentVotes(); toast.success('Refreshed!'); }}>
              <CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-4 bg-purple-100 rounded-2xl"><RefreshCw className="w-8 h-8 text-purple-600"/></div><div><h3 className="font-semibold dark:text-white">Refresh Data</h3><p className="text-sm text-gray-500">Reload from database</p></div></div></CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Live Votes */}
        <TabsContent value="live">
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className={`cursor-pointer hover:shadow-md transition-all dark:bg-gray-900 dark:border-gray-800 ${selectedElectionFilter==='all' ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setSelectedElectionFilter('all')}>
                <CardContent className="pt-4 pb-4"><p className="text-xs text-gray-500 font-semibold uppercase mb-1">All Elections</p><p className="text-3xl font-bold text-blue-600">{recentVotes.length}</p><p className="text-xs text-gray-400 mt-1">total votes cast</p></CardContent>
              </Card>
              {elections.map((election:any) => {
                const count = recentVotes.filter((v:any) => v.electionTitle === election.title).length;
                const isSelected = selectedElectionFilter === election._id;
                const pct = election.totalVoters > 0 ? ((count / election.totalVoters) * 100).toFixed(1) : '0';
                return (
                  <Card key={election._id} className={`cursor-pointer hover:shadow-md transition-all dark:bg-gray-900 dark:border-gray-800 ${isSelected ? 'ring-2 ring-green-500' : ''}`} onClick={() => setSelectedElectionFilter(isSelected ? 'all' : election._id)}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between mb-1"><p className="text-xs text-gray-500 font-semibold uppercase truncate flex-1 mr-1">{election.title.split(' ').slice(0,2).join(' ')}</p><Badge variant={election.status==='active'?'default':'secondary'} className="text-xs">{election.status}</Badge></div>
                      <p className="text-3xl font-bold text-green-600">{count}</p>
                      <p className="text-xs text-gray-400 mt-1">votes · {pct}% turnout</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="dark:text-white flex items-center gap-2">
                    <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"/><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"/></span>
                    Vote Feed
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={fetchRecentVotes} disabled={loadingVotes}><RefreshCw className={`w-4 h-4 mr-1 ${loadingVotes?'animate-spin':''}`}/>Refresh</Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingVotes ? <div className="text-center py-12"><RefreshCw className="w-8 h-8 text-blue-500 mx-auto animate-spin"/></div> : (() => {
                  const filteredVotes = selectedElectionFilter === 'all' ? recentVotes : recentVotes.filter((v:any) => v.electionTitle === elections.find((e:any)=>e._id===selectedElectionFilter)?.title);
                  if (filteredVotes.length === 0) return <div className="text-center py-12"><Clock className="w-12 h-12 text-gray-400 mx-auto mb-3"/><p className="text-gray-500">No votes yet</p></div>;
                  return (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {filteredVotes.map((vote:any,i:number) => {
                        const castTime = new Date(vote.createdAt);
                        const timeAgo = Math.floor((Date.now()-castTime.getTime())/1000);
                        const td = timeAgo<60?`${timeAgo}s ago`:timeAgo<3600?`${Math.floor(timeAgo/60)}m ago`:`${Math.floor(timeAgo/3600)}h ago`;
                        return (
                          <div key={vote._id||i} className="flex items-start gap-4 p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                            <Avatar className="w-12 h-12 flex-shrink-0"><AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">{(vote.userName||'V').charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div><p className="font-semibold dark:text-white">{vote.userName||'Anonymous'}</p><span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">{vote.voterId||'N/A'}</span></div>
                                <span className="text-xs text-gray-400 flex-shrink-0">{td}</span>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-1.5">
                                <div className="flex items-center gap-2"><Vote className="w-4 h-4 text-blue-600"/><span className="text-sm text-gray-500">Election:</span><span className="text-sm font-medium dark:text-white truncate">{vote.electionTitle}</span></div>
                                <div className="flex items-center gap-2"><User className="w-4 h-4 text-green-600"/><span className="text-sm text-gray-500">Voted for:</span><span className="text-sm font-semibold text-green-700">{vote.candidateName}</span></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Elections */}
        <TabsContent value="elections">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><h2 className="text-xl font-bold dark:text-white">Elections & Candidates</h2><p className="text-sm text-gray-500">Manage elections, candidates and visibility</p></div>
              <Button onClick={() => setShowCreateModal(true)}><Plus className="w-4 h-4 mr-2"/>Create Election</Button>
            </div>
            {elections.length===0 ? (
              <Card className="dark:bg-gray-900 dark:border-gray-800"><CardContent className="py-16 text-center"><Vote className="w-12 h-12 text-gray-300 mx-auto mb-3"/><p className="text-gray-500">No elections yet.</p></CardContent></Card>
            ) : elections.map((election:any) => (
              <Card key={election._id} className="dark:bg-gray-900 dark:border-gray-800">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1"><h3 className="text-lg font-bold dark:text-white">{election.title}</h3><Badge variant={election.status==='active'?'default':'secondary'}>{election.status}</Badge></div>
                      <p className="text-sm text-gray-500 mb-2">{election.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span><Calendar className="w-3 h-3 inline mr-1"/>{new Date(election.startDate).toLocaleDateString('en-IN')} – {new Date(election.endDate).toLocaleDateString('en-IN')}</span>
                        <span><Users className="w-3 h-3 inline mr-1"/>{election.turnout||0} / {election.totalVoters||0} voted</span>
                        {election.location?.label && <span>📍 {election.location.label}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 flex-shrink-0 flex-wrap justify-end">
                      <Button size="sm" variant="outline" onClick={() => setEditElection(election)} className="gap-1 text-blue-600 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Edit3 className="w-4 h-4"/>Edit</Button>
                      <Button size="sm" onClick={() => setAddCandidateElection(election)} className="gap-1"><UserPlus className="w-4 h-4"/>Candidates</Button>
                      <Button size="sm" variant="outline" onClick={() => setVisibilityElection(election)} className="gap-1"><Lock className="w-4 h-4"/>Visibility</Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEligibleModal(election); fetchEligibleVoters(election._id); }}
                        className={`gap-1 ${election.isRestrictedToEligible ? 'border-purple-400 text-purple-600 bg-purple-50 hover:bg-purple-100' : 'border-gray-300 text-gray-600'}`}>
                        <Shield className="w-4 h-4"/>Restrict
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/results/${election._id}`)}><Eye className="w-4 h-4"/></Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmDeleteElection(election)} className="text-red-500 hover:bg-red-50 border-red-200"><Trash2 className="w-4 h-4"/></Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs text-gray-500 font-medium">Visible to:</span>
                    {(election.visibleTo || ALL_ROLES).map((role:string) => (
                      <Badge key={role} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">{role.toUpperCase()}</Badge>
                    ))}
                    {election.isRestrictedToEligible ? (
                      <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-300 border ml-1">
                        🔒 Restricted · {election.eligibleVoters?.length || 0} eligible
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700 ml-1">
                        🌍 Open access
                      </Badge>
                    )}
                  </div>
                  {/* Live vote count bar */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border dark:border-gray-700">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Live Turnout</span>
                        <span className="text-xs font-bold text-blue-600">{election.totalVoters > 0 ? ((election.turnout||0)/election.totalVoters*100).toFixed(1) : 0}% · {election.turnout||0} votes</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" style={{ width: `${election.totalVoters > 0 ? Math.min((election.turnout||0)/election.totalVoters*100,100) : 0}%` }}/>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">of {(election.totalVoters||0).toLocaleString()} eligible</p>
                    </div>
                  </div>
                  {election.candidates?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {election.candidates.map((c:any, idx:number) => (
                        <div key={c._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 text-sm" style={{ background: COLORS[idx % COLORS.length] }}>
                            {c.photo ? <img src={c.photo} alt={c.name} className="w-full h-full rounded-full object-cover"/> : c.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0"><p className="text-sm font-semibold dark:text-white truncate">{c.name}</p><p className="text-xs text-gray-500 truncate">{c.party}</p></div>
                          <DeleteCandidateBtn electionId={election._id} candidateId={c._id} onDeleted={fetchElections}/>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                      <UserPlus className="w-8 h-8 text-gray-300 mx-auto mb-2"/>
                      <button onClick={() => setAddCandidateElection(election)} className="text-sm text-blue-600 hover:underline">Add the first candidate →</button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── VOTERS TAB ── */}
        <TabsContent value="voters">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><h2 className="text-xl font-bold dark:text-white">Voter Management</h2><p className="text-sm text-gray-500">Manage voter accounts — reset votes, send notices, assign areas</p></div>
              <Button variant="outline" onClick={() => { fetchAllVoters(); toast.success('Refreshed'); }}><RefreshCw className="w-4 h-4 mr-2"/>Refresh</Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Input placeholder="Search by name, voter ID, Aadhaar or ECI..." value={voterSearch} onChange={e => setVoterSearch(e.target.value)} className="dark:bg-gray-800 pl-4"/>
            </div>

            {/* Voters list */}
            {allVoters.length === 0 ? (
              <Card className="dark:bg-gray-900 dark:border-gray-800"><CardContent className="py-16 text-center"><Users className="w-12 h-12 text-gray-300 mx-auto mb-3"/><p className="text-gray-500">No voters registered yet</p></CardContent></Card>
            ) : (
              <div className="space-y-2">
                {allVoters.filter((v:any) => {
                  const q = voterSearch.toLowerCase();
                  return !q || v.name?.toLowerCase().includes(q) || v.voterId?.toLowerCase().includes(q) || v.aadhaarNumber?.includes(q) || v.eciCardNumber?.toLowerCase().includes(q);
                }).map((voter:any) => (
                  <div key={voter._id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${voter.isBlocked ? 'bg-red-50 dark:bg-red-900/10 border-red-200' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${voter.isBlocked ? 'bg-red-200 text-red-700' : 'bg-gradient-to-br from-blue-400 to-purple-500 text-white'}`}>
                        {voter.name?.charAt(0)?.toUpperCase() || 'V'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold dark:text-white">{voter.name}</p>
                          {voter.isBlocked && <Badge className="bg-red-500 text-xs">Blocked</Badge>}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
                          <span className="font-mono">{voter.voterId}</span>
                          {voter.aadhaarNumber && <span>· {voter.aadhaarNumber}</span>}
                          {voter.eciCardNumber  && <span>· ECI: {voter.eciCardNumber}</span>}
                        </div>
                        {voter.voterLocation?.label && <p className="text-xs text-blue-500 mt-0.5 truncate">📍 {voter.voterLocation.label}</p>}
                        {voter.isBlocked && voter.blockedReason && <p className="text-xs text-red-500 mt-0.5">Blocked: {voter.blockedReason}</p>}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 ml-3 flex-shrink-0 flex-wrap justify-end">
                      {/* Manage button — opens voter mgmt modal */}
                      <Button size="sm" variant="outline" onClick={() => { setVoterMgmtModal(voter); setVoterVotes([]); }}
                        className="text-purple-600 hover:bg-purple-50 border-purple-200">
                        <Settings className="w-3 h-3 mr-1"/>Manage
                      </Button>
                      {/* Quick: Send Notice */}
                      <Button size="sm" variant="outline" onClick={() => { setNoticeModal(voter); setNoticeSubject(''); setNoticeMessage(''); setNoticeType('info'); }}
                        className="text-blue-600 hover:bg-blue-50 border-blue-200">
                        <Bell className="w-3 h-3 mr-1"/>Notice
                      </Button>
                      {/* Quick: Assign Area */}
                      <Button size="sm" variant="outline" onClick={() => { setAssignAreaVoter(voter); setAssignLoc(voter.voterLocation||{}); }}
                        className="text-green-600 hover:bg-green-50 border-green-200">
                        <MapPin className="w-3 h-3 mr-1"/>Area
                      </Button>
                      {/* Quick: Block/Unblock */}
                      {voter.isBlocked ? (
                        <Button size="sm" variant="outline" onClick={() => handleUnblock(voter)} className="text-green-600 hover:bg-green-50 border-green-200">
                          <Unlock className="w-3 h-3 mr-1"/>Unblock
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => { setShowBlockModal(voter); setBlockReason(''); }} className="text-red-500 hover:bg-red-50 border-red-200">
                          <Ban className="w-3 h-3 mr-1"/>Block
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>


        {/* ── NOTICES TAB ── */}
        <TabsContent value="notices">
          <div className="grid lg:grid-cols-2 gap-6">

            {/* ── LEFT: Sent Notices ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold dark:text-white">📬 Sent Notices</h2>
                  <p className="text-sm text-gray-500">{allNotices.length} total · {allNotices.filter((n:any) => !n.isRead).length} unread</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchAllNotices} disabled={loadingNotices}>
                  <RefreshCw className={`w-4 h-4 mr-1 ${loadingNotices?'animate-spin':''}`}/>Refresh
                </Button>
              </div>

              <Input placeholder="Search by voter name or subject..." value={noticeSearch} onChange={e => setNoticeSearch(e.target.value)} className="dark:bg-gray-800"/>

              {/* Scrollable notices list */}
              <div className="h-[600px] overflow-y-auto space-y-3 pr-1">
                {loadingNotices ? (
                  <div className="text-center py-12 text-gray-400">Loading...</div>
                ) : allNotices.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
                    <p className="text-gray-500 font-medium">No notices sent yet</p>
                    <p className="text-sm text-gray-400 mt-1">Select a voter on the right to send one</p>
                  </div>
                ) : allNotices.filter((n:any) => {
                  const q = noticeSearch.toLowerCase();
                  return !q || n.targetName?.toLowerCase().includes(q) || n.subject?.toLowerCase().includes(q);
                }).map((notice: any) => (
                  <div key={notice._id} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${noticeTypeStyle(notice.type)}`}>
                      {notice.type === 'urgent' ? <Zap className="w-4 h-4"/> : notice.type === 'warning' ? <AlertTriangle className="w-4 h-4"/> : notice.type === 'action_required' ? <CheckCircle className="w-4 h-4"/> : <Info className="w-4 h-4"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold dark:text-white text-sm truncate">{notice.subject}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            To: <span className="font-medium text-blue-600">{notice.targetName}</span>
                            {notice.targetVoterId?.voterId && <span className="font-mono ml-1">· {notice.targetVoterId.voterId}</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {notice.isRead
                            ? <Badge className="bg-green-100 text-green-700 text-xs">✓ Read</Badge>
                            : <Badge className="bg-amber-100 text-amber-700 text-xs">Unread</Badge>}
                          <button onClick={() => handleDeleteNotice(notice._id)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5"/>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 line-clamp-2">{notice.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(notice.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Send Notice to Voter ── */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold dark:text-white">📤 Send Notice to Voter</h2>
                <p className="text-sm text-gray-500">Select a voter from the list below</p>
              </div>

              {/* Voter scroll box */}
              <div className="border dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                  <Input
                    placeholder="Search voters by name, ID or Aadhaar..."
                    value={voterSearch}
                    onChange={e => setVoterSearch(e.target.value)}
                    className="dark:bg-gray-700 h-8 text-sm"
                  />
                </div>
                <div className="h-[220px] overflow-y-auto divide-y dark:divide-gray-700">
                  {allVoters.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">No voters found</div>
                  ) : allVoters.filter((v:any) => {
                    const q = voterSearch.toLowerCase();
                    return !q || v.name?.toLowerCase().includes(q) || v.voterId?.toLowerCase().includes(q) || v.aadhaarNumber?.includes(q);
                  }).map((voter: any) => (
                    <div
                      key={voter._id}
                      onClick={() => { setNoticeModal(voter); setNoticeSubject(''); setNoticeMessage(''); setNoticeType('info'); }}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors ${noticeModal?._id === voter._id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-500' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {voter.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold dark:text-white truncate">{voter.name}</p>
                        <p className="text-xs text-gray-400 font-mono truncate">{voter.voterId}</p>
                      </div>
                      {voter.isBlocked && <Badge className="bg-red-100 text-red-600 text-xs flex-shrink-0">Blocked</Badge>}
                      <Bell className="w-4 h-4 text-blue-400 flex-shrink-0"/>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compose notice form — shows when a voter is selected */}
              {noticeModal ? (
                <div className="border dark:border-gray-700 rounded-xl p-4 space-y-3 bg-white dark:bg-gray-900">
                  {/* Selected voter banner */}
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {noticeModal.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold dark:text-white">{noticeModal.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{noticeModal.voterId}</p>
                    </div>
                    <button onClick={() => setNoticeModal(null)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <X className="w-4 h-4"/>
                    </button>
                  </div>

                  {/* Notice type */}
                  <div className="grid grid-cols-2 gap-2">
                    {NOTICE_TYPES.map(t => (
                      <button key={t.value} onClick={() => setNoticeType(t.value)}
                        className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left ${noticeType === t.value ? t.color + ' ring-2 ring-offset-1 ring-blue-400' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 text-gray-600'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Subject */}
                  <input
                    value={noticeSubject}
                    onChange={e => setNoticeSubject(e.target.value)}
                    placeholder="Subject..."
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {/* Message */}
                  <textarea
                    value={noticeMessage}
                    onChange={e => setNoticeMessage(e.target.value)}
                    rows={4}
                    placeholder="Write your notice here..."
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <Button className="w-full" onClick={handleSendNotice} disabled={sendingNotice || !noticeSubject.trim() || !noticeMessage.trim()}>
                    <Send className="w-4 h-4 mr-2"/>{sendingNotice ? 'Sending...' : `Send to ${noticeModal.name}`}
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
                  <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3"/>
                  <p className="text-sm font-medium text-gray-500">Select a voter above</p>
                  <p className="text-xs text-gray-400 mt-1">Click any voter to compose a notice</p>
                </div>
              )}
            </div>

          </div>
        </TabsContent>

        {/* Feedback & Complaints */}
        <TabsContent value="feedback">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600"/>
                All Voter Feedback & Complaints
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Admin has full access to all feedback and complaints regardless of target role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackInbox role="admin" token={token}/>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader><CardTitle className="dark:text-white">Election Status</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart><Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({name,value})=>`${name}: ${value}`} outerRadius={100} dataKey="value">{statusData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip/></PieChart>
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

        {/* Security */}
        <TabsContent value="security">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader><CardTitle className="dark:text-white">Security Status</CardTitle></CardHeader>
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

        {/* Blocked Voters */}
        <TabsContent value="blocked">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><h2 className="text-xl font-bold dark:text-white">Blocked Voters</h2><p className="text-sm text-gray-500">{blockedVoters.length} currently blocked</p></div>
              <Button variant="outline" onClick={() => { fetchBlockedVoters(); fetchAllVoters(); toast.success('Refreshed'); }}><RefreshCw className="w-4 h-4 mr-2"/>Refresh</Button>
            </div>
            {blockedVoters.length === 0 ? (
              <Card className="dark:bg-gray-900 dark:border-gray-800"><CardContent className="py-16 text-center"><CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3"/><p className="text-gray-500">No blocked voters</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {blockedVoters.map((voter:any) => (
                  <div key={voter._id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0"><Ban className="w-5 h-5 text-red-600"/></div>
                      <div>
                        <p className="font-semibold dark:text-white">{voter.name}</p>
                        <span className="text-xs font-mono text-gray-500">{voter.voterId}</span>
                        <p className="text-xs text-red-600 mt-0.5">Reason: {voter.blockedReason}</p>
                        <p className="text-xs text-gray-400">By {voter.blockedBy} · {voter.blockedAt ? new Date(voter.blockedAt).toLocaleDateString('en-IN') : ''}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleUnblock(voter)} className="text-green-600 hover:bg-green-50 border-green-200">
                      <Unlock className="w-4 h-4 mr-1"/>Unblock
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Locations */}
        <TabsContent value="locations">
          <LocationManager token={token}/>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
