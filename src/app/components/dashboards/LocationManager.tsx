import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, ChevronRight, MapPin, Save, X, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

const API = 'https://sovs-backend-bf8j.onrender.com/api';

interface Location { _id: string; name: string; type: string; code?: string; parent?: any; }

const TYPE_ORDER = ['state', 'district', 'subdistrict', 'locality'] as const;
type LocType = typeof TYPE_ORDER[number];

const TYPE_LABELS: Record<LocType, string> = {
  state:       '🏛️ State',
  district:    '🏙️ District',
  subdistrict: '🏘️ Sub-District',
  locality:    '📍 Locality',
};

const TYPE_COLORS: Record<LocType, string> = {
  state:       'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200',
  district:    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200',
  subdistrict: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200',
  locality:    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200',
};

interface Props { token: string | null; }

export function LocationManager({ token }: Props) {
  const [locations, setLocations] = useState<Record<LocType, Location[]>>({
    state: [], district: [], subdistrict: [], locality: [],
  });
  const [selected, setSelected] = useState<Record<LocType, Location | null>>({
    state: null, district: null, subdistrict: null, locality: null,
  });
  const [loading, setLoading]     = useState(false);
  const [adding, setAdding]       = useState<LocType | null>(null);
  const [editing, setEditing]     = useState<Location | null>(null);
  const [newName, setNewName]     = useState('');
  const [newCode, setNewCode]     = useState('');
  const [saving, setSaving]       = useState(false);

  // ── fetch locations for a level ────────────────────────────────
  const fetchLevel = async (type: LocType, parentId?: string) => {
    try {
      const url = parentId
        ? `${API}/locations?type=${type}&parent=${parentId}`
        : `${API}/locations?type=${type}`;
      const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setLocations(prev => ({ ...prev, [type]: data.data }));
      }
    } catch {}
  };

  // Initial load — fetch states
  useEffect(() => { fetchLevel('state'); }, []);

  // ── select a location, fetch children ──────────────────────────
  const handleSelect = (type: LocType, loc: Location) => {
    const idx = TYPE_ORDER.indexOf(type);

    // Update selected
    const newSelected = { ...selected, [type]: loc };
    // Clear selections below
    TYPE_ORDER.slice(idx + 1).forEach(t => { newSelected[t] = null; });
    setSelected(newSelected);

    // Clear locations below
    const newLocs = { ...locations };
    TYPE_ORDER.slice(idx + 1).forEach(t => { newLocs[t] = []; });
    setLocations(newLocs);

    // Fetch next level
    const nextType = TYPE_ORDER[idx + 1];
    if (nextType) fetchLevel(nextType, loc._id);

    // Close any add form
    setAdding(null);
  };

  // ── add location ────────────────────────────────────────────────
  const handleAdd = async (type: LocType) => {
    if (!newName.trim()) { toast.error('Name is required'); return; }
    setSaving(true);

    const parentId = type !== 'state' ? selected[TYPE_ORDER[TYPE_ORDER.indexOf(type) - 1]]?._id : undefined;
    if (type !== 'state' && !parentId) {
      toast.error(`Select a ${TYPE_ORDER[TYPE_ORDER.indexOf(type) - 1]} first`);
      setSaving(false); return;
    }

    try {
      const res  = await fetch(`${API}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName.trim(), type, parent: parentId || null, code: newCode.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${newName} added!`);
        setNewName(''); setNewCode(''); setAdding(null);
        // Refresh this level
        if (type === 'state') fetchLevel('state');
        else fetchLevel(type, parentId);
      } else {
        toast.error(data.message || 'Failed');
      }
    } catch { toast.error('Cannot reach server'); }
    setSaving(false);
  };

  // ── edit location ───────────────────────────────────────────────
  const handleEdit = async () => {
    if (!editing || !newName.trim()) return;
    setSaving(true);
    try {
      const res  = await fetch(`${API}/locations/${editing._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName.trim(), code: newCode }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Updated!');
        setEditing(null); setNewName(''); setNewCode('');
        // Refresh the level
        const type = editing.type as LocType;
        const parentId = editing.parent?._id || editing.parent;
        if (type === 'state') fetchLevel('state');
        else fetchLevel(type, parentId);
      } else {
        toast.error(data.message || 'Failed');
      }
    } catch { toast.error('Cannot reach server'); }
    setSaving(false);
  };

  // ── delete location ─────────────────────────────────────────────
  const handleDelete = async (loc: Location) => {
    if (!confirm(`Remove "${loc.name}"? This will also hide its children.`)) return;
    try {
      const res  = await fetch(`${API}/locations/${loc._id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${loc.name} removed`);
        const type = loc.type as LocType;
        const parentId = loc.parent?._id || loc.parent;
        if (type === 'state') fetchLevel('state');
        else fetchLevel(type, parentId);
        // Deselect if deleted
        if (selected[type]?._id === loc._id) {
          const newSel = { ...selected, [type]: null };
          const idx = TYPE_ORDER.indexOf(type);
          TYPE_ORDER.slice(idx + 1).forEach(t => { newSel[t] = null; });
          setSelected(newSel);
        }
      } else {
        toast.error(data.message || 'Failed');
      }
    } catch { toast.error('Cannot reach server'); }
  };

  const startEdit = (loc: Location) => {
    setEditing(loc);
    setNewName(loc.name);
    setNewCode(loc.code || '');
    setAdding(null);
  };

  const startAdd = (type: LocType) => {
    setAdding(type);
    setNewName(''); setNewCode('');
    setEditing(null);
  };

  // Which levels are visible
  const visibleLevels: LocType[] = ['state'];
  if (selected.state)       visibleLevels.push('district');
  if (selected.district)    visibleLevels.push('subdistrict');
  if (selected.subdistrict) visibleLevels.push('locality');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold dark:text-white">Location Management</h2>
          <p className="text-sm text-gray-500">Create and manage State → District → Sub-District → Locality</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchLevel('state')}>
          <RefreshCw className="w-4 h-4 mr-2"/>Refresh
        </Button>
      </div>

      {/* Breadcrumb trail */}
      {(selected.state || selected.district || selected.subdistrict || selected.locality) && (
        <div className="flex items-center gap-1 flex-wrap p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0"/>
          {TYPE_ORDER.filter(t => selected[t]).map((t, i, arr) => (
            <span key={t} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3 text-gray-400"/>}
              <button
                onClick={() => handleSelect(t, selected[t]!)}
                className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${TYPE_COLORS[t]}`}
              >
                {selected[t]!.name}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Location columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {TYPE_ORDER.map((type) => {
          const isVisible  = visibleLevels.includes(type);
          const parentType = TYPE_ORDER[TYPE_ORDER.indexOf(type) - 1];
          const parentSelected = type === 'state' || !!selected[parentType];

          return (
            <Card key={type} className={`dark:bg-gray-900 dark:border-gray-800 transition-opacity ${!isVisible ? 'opacity-40' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm dark:text-white">{TYPE_LABELS[type]}</CardTitle>
                  {isVisible && parentSelected && (
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1"
                      onClick={() => startAdd(type)}>
                      <Plus className="w-3 h-3"/>Add
                    </Button>
                  )}
                </div>
                {!isVisible && type !== 'state' && (
                  <CardDescription className="text-xs">Select {TYPE_LABELS[parentType]} first</CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-1 max-h-72 overflow-y-auto">
                {/* Add form */}
                {adding === type && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 mb-2 space-y-2">
                    <Input
                      autoFocus
                      placeholder={`${type} name`}
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => { if(e.key==='Enter') handleAdd(type); if(e.key==='Escape') setAdding(null); }}
                      className="h-8 text-sm dark:bg-gray-800"
                    />
                    <Input
                      placeholder="Code (optional)"
                      value={newCode}
                      onChange={e => setNewCode(e.target.value)}
                      className="h-8 text-sm dark:bg-gray-800"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => handleAdd(type)} disabled={saving}>
                        <Save className="w-3 h-3 mr-1"/>{saving ? '...' : 'Save'}
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => setAdding(null)}>
                        <X className="w-3 h-3"/>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Edit form */}
                {editing && editing.type === type && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 mb-2 space-y-2">
                    <Input
                      autoFocus
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => { if(e.key==='Enter') handleEdit(); if(e.key==='Escape') setEditing(null); }}
                      className="h-8 text-sm dark:bg-gray-800"
                    />
                    <Input
                      placeholder="Code"
                      value={newCode}
                      onChange={e => setNewCode(e.target.value)}
                      className="h-8 text-sm dark:bg-gray-800"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleEdit} disabled={saving}>
                        <Save className="w-3 h-3 mr-1"/>{saving ? '...' : 'Update'}
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => setEditing(null)}>
                        <X className="w-3 h-3"/>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Location list */}
                {locations[type].length === 0 && isVisible && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    {adding === type ? '' : `No ${type}s yet. Click Add.`}
                  </p>
                )}
                {locations[type].map(loc => (
                  <div key={loc._id}
                    onClick={() => handleSelect(type, loc)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all text-sm ${
                      selected[type]?._id === loc._id
                        ? `${TYPE_COLORS[type]} border`
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="truncate font-medium">{loc.name}</span>
                      {loc.code && <span className="text-xs text-gray-400 flex-shrink-0">{loc.code}</span>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                      onClick={e => e.stopPropagation()}>
                      <button onClick={() => startEdit(loc)}
                        className="p-1 rounded hover:bg-white dark:hover:bg-gray-700 text-gray-400 hover:text-blue-600">
                        <Edit2 className="w-3 h-3"/>
                      </button>
                      <button onClick={() => handleDelete(loc)}
                        className="p-1 rounded hover:bg-white dark:hover:bg-gray-700 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-3 h-3"/>
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
