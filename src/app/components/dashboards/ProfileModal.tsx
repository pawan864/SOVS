import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, Settings, User, Mail, Shield, Building, MapPin, Edit3, Save, Calendar } from 'lucide-react';

interface Props {
  user: any;
  token: string | null;
  API: string;
  onClose: () => void;
  onOpenSettings: () => void;
  onUserUpdate: (updated: any) => void;
}

export function ProfileModal({ user, token, API, onClose, onOpenSettings, onUserUpdate }: Props) {
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName]         = useState(user?.name || '');
  const [saving, setSaving]           = useState(false);

  const handleSaveName = async () => {
    if (!newName.trim()) { toast.error('Name cannot be empty'); return; }
    if (newName.trim() === user?.name) { setEditingName(false); return; }
    setSaving(true);
    try {
      const res  = await fetch(`${API}/users/${user._id}/update-profile`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        onUserUpdate({ ...user, name: newName.trim() });
        toast.success('Name updated!');
        setEditingName(false);
      } else {
        toast.error(data.message || 'Failed');
      }
    } catch { toast.error('Cannot reach server'); }
    setSaving(false);
  };

  const roleColor: Record<string, string> = {
    admin: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
    dm:    'bg-blue-100   dark:bg-blue-900   text-blue-700   dark:text-blue-300',
    sdm:   'bg-green-100  dark:bg-green-900  text-green-700  dark:text-green-300',
    cdo:   'bg-amber-100  dark:bg-amber-900  text-amber-700  dark:text-amber-300',
  };

  const details = [
    { icon: <Mail     className="w-4 h-4 text-blue-500"/>,   label: 'Email Address', value: user?.email },
    { icon: <Shield   className="w-4 h-4 text-purple-500"/>, label: 'Role',          value: user?.role?.toUpperCase() },
    { icon: <Building className="w-4 h-4 text-green-500"/>,  label: 'Department',    value: user?.department || 'Not assigned' },
    { icon: <MapPin   className="w-4 h-4 text-red-500"/>,    label: 'District',      value: user?.district   || 'Not assigned' },
    { icon: <Calendar className="w-4 h-4 text-gray-400"/>,   label: 'Member Since',
      value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' }) : 'N/A' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600"/>
            </div>
            <div>
              <h2 className="text-lg font-bold dark:text-white">My Profile</h2>
              <p className="text-xs text-gray-500">Your admin account details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover"/>
              ) : (
                <span className="text-3xl font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2 mb-1">
                  <Input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="dark:bg-gray-800 h-8 text-sm flex-1"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter')  handleSaveName();
                      if (e.key === 'Escape') setEditingName(false);
                    }}
                  />
                  <button onClick={handleSaveName} disabled={saving}
                    className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex-shrink-0">
                    <Save className="w-3.5 h-3.5"/>
                  </button>
                  <button onClick={() => { setEditingName(false); setNewName(user?.name); }}
                    className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-lg flex-shrink-0">
                    <X className="w-3.5 h-3.5"/>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold dark:text-white truncate">{user?.name}</h3>
                  <button onClick={() => setEditingName(true)}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded flex-shrink-0"
                    title="Edit name">
                    <Edit3 className="w-3.5 h-3.5"/>
                  </button>
                </div>
              )}
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${roleColor[user?.role] || ''}`}>
                {user?.role}
              </span>
            </div>
          </div>

          {/* Details List */}
          <div className="space-y-2 pt-1 border-t dark:border-gray-700">
            {details.map((row, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                  {row.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 font-medium">{row.label}</p>
                  <p className="text-sm font-semibold dark:text-white truncate">{row.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1 gap-1.5" onClick={onOpenSettings}>
              <Settings className="w-4 h-4"/>Account Settings
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
