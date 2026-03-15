import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { X, Key, Camera, Settings, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
  user: any;
  token: string | null;
  API: string;
  onClose: () => void;
  onUserUpdate: (updated: any) => void;
}

export function SettingsModal({ user, token, API, onClose, onUserUpdate }: Props) {
  const [tab, setTab]               = useState<'password' | 'photo'>('password');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd]         = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [photoUrl, setPhotoUrl]     = useState(user?.avatar || '');
  const [saving, setSaving]         = useState(false);

  // ── Change Password ───────────────────────────────────────────
  const handleChangePwd = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) { toast.error('All fields are required'); return; }
    if (newPwd !== confirmPwd) { toast.error('New passwords do not match'); return; }
    if (newPwd.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    setSaving(true);
    try {
      const res  = await fetch(`${API}/users/${user._id}/change-password`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('✅ Password updated! Use your new password next time you login.');
        setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
        onClose();
      } else {
        toast.error(data.message || 'Failed to update password');
      }
    } catch { toast.error('Cannot reach server'); }
    setSaving(false);
  };

  // ── Update Photo ──────────────────────────────────────────────
  const handleUpdatePhoto = async () => {
    setSaving(true);
    try {
      const res  = await fetch(`${API}/users/${user._id}/update-profile`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ avatar: photoUrl }),
      });
      const data = await res.json();
      if (data.success) {
        onUserUpdate({ ...user, avatar: photoUrl });
        toast.success('✅ Profile photo updated!');
        onClose();
      } else {
        toast.error(data.message || 'Failed to update photo');
      }
    } catch { toast.error('Cannot reach server'); }
    setSaving(false);
  };

  const pwdMatch = newPwd && confirmPwd && newPwd === confirmPwd;
  const pwdMismatch = newPwd && confirmPwd && newPwd !== confirmPwd;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600"/>
            </div>
            <div>
              <h2 className="text-lg font-bold dark:text-white">Account Settings</h2>
              <p className="text-xs text-gray-500">Manage your admin account</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b dark:border-gray-700">
          {[
            { id: 'password', label: 'Change Password', icon: <Key className="w-4 h-4"/> },
            { id: 'photo',    label: 'Update Photo',    icon: <Camera className="w-4 h-4"/> },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as 'password' | 'photo')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-all ${
                tab === t.id
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* Change Password Tab */}
          {tab === 'password' && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block dark:text-white">Current Password</Label>
                <Input type="password" placeholder="Enter your current password"
                  value={currentPwd} onChange={e => setCurrentPwd(e.target.value)}
                  className="dark:bg-gray-800"/>
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block dark:text-white">New Password</Label>
                <Input type="password" placeholder="At least 6 characters"
                  value={newPwd} onChange={e => setNewPwd(e.target.value)}
                  className="dark:bg-gray-800"/>
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block dark:text-white">Confirm New Password</Label>
                <Input type="password" placeholder="Repeat new password"
                  value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                  className="dark:bg-gray-800"
                  onKeyDown={e => e.key === 'Enter' && handleChangePwd()}/>
              </div>

              {/* Match indicator */}
              {pwdMismatch && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3"/>Passwords do not match
                </p>
              )}
              {pwdMatch && (
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3"/>Passwords match ✓
                </p>
              )}

              <div className="pt-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  🔐 After updating, you will need to use your new password the next time you login.
                </p>
              </div>

              <Button className="w-full" onClick={handleChangePwd} disabled={saving}>
                <Key className="w-4 h-4 mr-2"/>
                {saving ? 'Updating Password...' : 'Update Password'}
              </Button>
            </div>
          )}

          {/* Update Photo Tab */}
          {tab === 'photo' && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-24 h-24 rounded-full border-4 border-purple-200 dark:border-purple-800 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">Photo preview</p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-1.5 block dark:text-white">Photo URL</Label>
                <Input
                  placeholder="https://example.com/your-photo.jpg"
                  value={photoUrl}
                  onChange={e => setPhotoUrl(e.target.value)}
                  className="dark:bg-gray-800"
                />
                <p className="text-xs text-gray-400 mt-1">Paste a direct link to your photo (JPG, PNG, WebP)</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setPhotoUrl('')}>
                  Remove Photo
                </Button>
                <Button className="flex-1" onClick={handleUpdatePhoto} disabled={saving}>
                  <Camera className="w-4 h-4 mr-2"/>
                  {saving ? 'Saving...' : 'Save Photo'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
