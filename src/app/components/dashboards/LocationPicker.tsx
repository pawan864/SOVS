import { useEffect, useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { Label } from '../ui/label';

const API = 'https://sovs-backend-bf8j.onrender.com/api';

interface Location { _id: string; name: string; type: string; code?: string; }

export interface LocationValue {
  state?:       string;
  district?:    string;
  subdistrict?: string;
  locality?:    string;
  label?:       string;
}

interface Props {
  value: LocationValue;
  onChange: (val: LocationValue) => void;
}

export function LocationPicker({ value, onChange }: Props) {
  const [states,        setStates]        = useState<Location[]>([]);
  const [districts,     setDistricts]     = useState<Location[]>([]);
  const [subdistricts,  setSubdistricts]  = useState<Location[]>([]);
  const [localities,    setLocalities]    = useState<Location[]>([]);

  // Fetch states on mount
  useEffect(() => {
    fetch(`${API}/locations?type=state`)
      .then(r => r.json())
      .then(d => { if(d.success) setStates(d.data); })
      .catch(() => {});
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (!value.state) { setDistricts([]); setSubdistricts([]); setLocalities([]); return; }
    fetch(`${API}/locations?type=district&parent=${value.state}`)
      .then(r => r.json())
      .then(d => { if(d.success) setDistricts(d.data); })
      .catch(() => {});
  }, [value.state]);

  // Fetch subdistricts when district changes
  useEffect(() => {
    if (!value.district) { setSubdistricts([]); setLocalities([]); return; }
    fetch(`${API}/locations?type=subdistrict&parent=${value.district}`)
      .then(r => r.json())
      .then(d => { if(d.success) setSubdistricts(d.data); })
      .catch(() => {});
  }, [value.district]);

  // Fetch localities when subdistrict changes
  useEffect(() => {
    if (!value.subdistrict) { setLocalities([]); return; }
    fetch(`${API}/locations?type=locality&parent=${value.subdistrict}`)
      .then(r => r.json())
      .then(d => { if(d.success) setLocalities(d.data); })
      .catch(() => {});
  }, [value.subdistrict]);

  // Build label from selected names
  const buildLabel = (
    stateId?: string, districtId?: string,
    subdistrictId?: string, localityId?: string
  ) => {
    const parts = [];
    if (stateId)       { const s = states.find(x => x._id === stateId);       if(s) parts.push(s.name); }
    if (districtId)    { const d = districts.find(x => x._id === districtId); if(d) parts.push(d.name); }
    if (subdistrictId) { const sd = subdistricts.find(x => x._id === subdistrictId); if(sd) parts.push(sd.name); }
    if (localityId)    { const l = localities.find(x => x._id === localityId);  if(l) parts.push(l.name); }
    return parts.join(', ');
  };

  const handleChange = (level: keyof LocationValue, id: string) => {
    let next: LocationValue = { ...value };

    if (level === 'state') {
      next = { state: id || undefined, district: undefined, subdistrict: undefined, locality: undefined };
    } else if (level === 'district') {
      next = { ...value, district: id || undefined, subdistrict: undefined, locality: undefined };
    } else if (level === 'subdistrict') {
      next = { ...value, subdistrict: id || undefined, locality: undefined };
    } else {
      next = { ...value, locality: id || undefined };
    }

    // Compute label after state updates
    setTimeout(() => {
      next.label = buildLabel(
        level === 'state' ? id : next.state,
        level === 'district' ? id : next.district,
        level === 'subdistrict' ? id : next.subdistrict,
        level === 'locality' ? id : next.locality,
      );
      onChange(next);
    }, 0);

    onChange(next);
  };

  const selectClass = "w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none";

  const selectedLabel = [
    value.state       && states.find(x => x._id === value.state)?.name,
    value.district    && districts.find(x => x._id === value.district)?.name,
    value.subdistrict && subdistricts.find(x => x._id === value.subdistrict)?.name,
    value.locality    && localities.find(x => x._id === value.locality)?.name,
  ].filter(Boolean).join(' › ');

  return (
    <div className="space-y-3">
      {/* Preview of selected path */}
      {selectedLabel && (
        <div className="flex items-center gap-2 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0"/>
          <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">{selectedLabel}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* State */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">🏛️ State</Label>
          <div className="relative">
            <select
              className={selectClass}
              value={value.state || ''}
              onChange={e => handleChange('state', e.target.value)}
            >
              <option value="">Select state</option>
              {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"/>
          </div>
        </div>

        {/* District */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">🏙️ District</Label>
          <div className="relative">
            <select
              className={`${selectClass} ${!value.state ? 'opacity-50 cursor-not-allowed' : ''}`}
              value={value.district || ''}
              onChange={e => handleChange('district', e.target.value)}
              disabled={!value.state}
            >
              <option value="">{value.state ? 'Select district' : '— select state first'}</option>
              {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"/>
          </div>
        </div>

        {/* Sub-District */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">🏘️ Sub-District</Label>
          <div className="relative">
            <select
              className={`${selectClass} ${!value.district ? 'opacity-50 cursor-not-allowed' : ''}`}
              value={value.subdistrict || ''}
              onChange={e => handleChange('subdistrict', e.target.value)}
              disabled={!value.district}
            >
              <option value="">{value.district ? 'Select sub-district' : '— select district first'}</option>
              {subdistricts.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"/>
          </div>
        </div>

        {/* Locality */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">📍 Locality</Label>
          <div className="relative">
            <select
              className={`${selectClass} ${!value.subdistrict ? 'opacity-50 cursor-not-allowed' : ''}`}
              value={value.locality || ''}
              onChange={e => handleChange('locality', e.target.value)}
              disabled={!value.subdistrict}
            >
              <option value="">{value.subdistrict ? 'Select locality' : '— select sub-district first'}</option>
              {localities.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"/>
          </div>
        </div>
      </div>
    </div>
  );
}
