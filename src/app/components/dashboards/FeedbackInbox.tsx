import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import {
  MessageSquare, Flag, RefreshCw, ChevronDown, ChevronUp,
  CheckCircle, Clock, Send, Filter, X,
} from 'lucide-react';

const API = 'https://sovs-backend-bf8j.onrender.com/api';

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
  voterName: string;
  voterVoterId: string;
  electionTitle?: string;
}

const STATUS_COLORS: Record<string, string> = {
  Pending:    'bg-amber-100 text-amber-700 border-amber-200',
  Reviewed:   'bg-blue-100 text-blue-700 border-blue-200',
  Resolved:   'bg-green-100 text-green-700 border-green-200',
  Dismissed:  'bg-red-100 text-red-700 border-red-200',
};

interface FeedbackInboxProps {
  role: 'admin' | 'dm' | 'sdm' | 'cdo';
  token: string | null;
}

export function FeedbackInbox({ role, token }: FeedbackInboxProps) {
  const [items, setItems]           = useState<FeedbackItem[]>([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState<'all' | 'feedback' | 'complaint'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expanded, setExpanded]     = useState<string | null>(null);

  // respond state
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [newStatus, setNewStatus]       = useState('Reviewed');
  const [submitting, setSubmitting]     = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/feedback`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch { toast.error('Cannot reach server'); }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleRespond = async (id: string) => {
    if (!responseText.trim()) { toast.error('Response text is required'); return; }
    setSubmitting(true);
    try {
      const res  = await fetch(`${API}/feedback/${id}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ response: responseText.trim(), status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Response submitted!');
        setRespondingId(null); setResponseText(''); setNewStatus('Reviewed');
        fetchItems();
      } else toast.error(data.message || 'Failed');
    } catch { toast.error('Cannot reach server'); }
    setSubmitting(false);
  };

  // Filter logic
  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      item.subject?.toLowerCase().includes(q) ||
      item.voterName?.toLowerCase().includes(q) ||
      item.voterVoterId?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q);
    const matchType   = filterType === 'all' || item.type === filterType;
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const pendingCount  = items.filter(i => i.status === 'Pending').length;
  const complaintCount = items.filter(i => i.type === 'complaint').length;
  const feedbackCount  = items.filter(i => i.type === 'feedback').length;

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',      value: items.length,    color: 'bg-gray-50 border-gray-200 text-gray-700' },
          { label: 'Pending',    value: pendingCount,    color: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'Feedback',   value: feedbackCount,   color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Complaints', value: complaintCount,  color: 'bg-red-50 border-red-200 text-red-700' },
        ].map((s, i) => (
          <div key={i} className={`p-3 rounded-xl border ${s.color} text-center`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by voter name, subject, category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="dark:bg-gray-800"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'feedback', 'complaint'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filterType === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-600 border-gray-200 dark:border-gray-700'}`}>
              {t === 'all' ? 'All Types' : t === 'feedback' ? '💬 Feedback' : '🚩 Complaints'}
            </button>
          ))}
          {(['all', 'Pending', 'Reviewed', 'Resolved', 'Dismissed'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filterStatus === s ? 'bg-gray-700 text-white border-gray-700' : 'bg-white dark:bg-gray-800 text-gray-600 border-gray-200 dark:border-gray-700'}`}>
              {s === 'all' ? 'All Status' : s}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={fetchItems} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`}/>Refresh
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
          <p className="font-medium text-gray-500">No items found</p>
          <p className="text-sm text-gray-400 mt-1">
            {items.length === 0 ? 'No feedback or complaints submitted yet.' : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const isExpanded  = expanded === item._id;
            const isResponding = respondingId === item._id;
            const sc = STATUS_COLORS[item.status] || STATUS_COLORS.Pending;

            return (
              <div key={item._id} className={`bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-700 overflow-hidden transition-all ${item.status === 'Pending' ? 'border-l-4 border-l-amber-400' : item.type === 'complaint' ? 'border-l-4 border-l-red-400' : 'border-l-4 border-l-blue-400'}`}>
                {/* Row */}
                <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : item._id)}>
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === 'complaint' ? 'bg-red-100' : 'bg-blue-100'}`}>
                    {item.type === 'complaint'
                      ? <Flag className="w-4 h-4 text-red-600"/>
                      : <MessageSquare className="w-4 h-4 text-blue-600"/>}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-semibold text-sm dark:text-white truncate">{item.subject}</p>
                      <Badge variant="outline" className={`text-xs ${item.type === 'complaint' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                        {item.type === 'complaint' ? '🚩 Complaint' : '💬 Feedback'}
                      </Badge>
                      {item.type === 'complaint' && item.targetRole && (
                        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                          → {item.targetRole.toUpperCase()}
                        </Badge>
                      )}
                      {item.electionTitle && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">
                          🗳️ {item.electionTitle}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">{item.voterName}</span>
                      {item.voterVoterId && <span className="font-mono ml-1">· {item.voterVoterId}</span>}
                      <span className="ml-2">· {item.category}</span>
                      <span className="ml-2">· {new Date(item.createdAt).toLocaleDateString('en-IN')}</span>
                    </p>
                  </div>

                  {/* Status + expand */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${sc}`}>{item.status}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
                  </div>
                </div>

                {/* Expanded body */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t dark:border-gray-700 pt-4 space-y-4">
                    {/* Message */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">Message from voter</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 leading-relaxed">{item.message}</p>
                    </div>

                    {/* Existing response */}
                    {item.response && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-1">
                          ✅ Response by {item.respondedBy}
                          {item.respondedAt && <span className="font-normal ml-1">· {new Date(item.respondedAt).toLocaleString('en-IN')}</span>}
                        </p>
                        <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">{item.response}</p>
                      </div>
                    )}

                    {/* Respond form */}
                    {!isResponding ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { setRespondingId(item._id); setResponseText(''); setNewStatus('Reviewed'); }}
                          className="gap-1">
                          <Send className="w-3.5 h-3.5"/>{item.response ? 'Update Response' : 'Respond'}
                        </Button>
                        {item.status === 'Pending' && (
                          <Button size="sm" variant="outline"
                            onClick={async () => {
                              try {
                                await fetch(`${API}/feedback/${item._id}/respond`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                  body: JSON.stringify({ response: 'Noted and acknowledged.', status: 'Dismissed' }),
                                });
                                toast.success('Dismissed'); fetchItems();
                              } catch { toast.error('Cannot reach server'); }
                            }}
                            className="text-gray-500 hover:text-red-600 text-xs">
                            Dismiss
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700">
                        <p className="text-xs font-bold text-gray-500 uppercase">Your Response</p>
                        <textarea
                          value={responseText}
                          onChange={e => setResponseText(e.target.value)}
                          rows={4}
                          placeholder="Write your official response here..."
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-3 flex-wrap">
                          <div>
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">Update Status</label>
                            <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm dark:bg-gray-700 dark:text-white focus:outline-none">
                              <option value="Reviewed">Reviewed</option>
                              <option value="Resolved">Resolved</option>
                              <option value="Dismissed">Dismissed</option>
                            </select>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" onClick={() => handleRespond(item._id)} disabled={submitting}>
                              <Send className="w-3.5 h-3.5 mr-1"/>{submitting ? 'Submitting...' : 'Submit Response'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setRespondingId(null)}>
                              <X className="w-3.5 h-3.5 mr-1"/>Cancel
                            </Button>
                          </div>
                        </div>
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
  );
}
