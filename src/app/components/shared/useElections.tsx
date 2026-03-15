/**
 * useElections.ts
 * Shared hook — fetches elections from backend API.
 * Automatically filters by the logged-in user's role (done server-side).
 * 
 * Usage in any dashboard:
 *   const { elections, loading, refresh } = useElections();
 */
import { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:5001/api';

export interface Candidate {
  _id: string;
  name: string;
  party: string;
  photo?: string;
  description?: string;
  manifesto?: string;
}

export interface Election {
  _id: string;
  title: string;
  description: string;
  status: 'upcoming' | 'active' | 'ended';
  startDate: string;
  endDate: string;
  totalVoters: number;
  turnout: number;
  candidates: Candidate[];
  visibleTo: string[];
  results?: Record<string, number>;
}

export function useElections() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchElections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API}/elections`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data  = await res.json();
      if (data.success) {
        setElections(data.data);
      } else {
        setError(data.message || 'Failed to load elections');
      }
    } catch {
      setError('Cannot reach server');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchElections();
  }, [fetchElections]);

  const active   = elections.filter(e => e.status === 'active');
  const upcoming = elections.filter(e => e.status === 'upcoming');
  const ended    = elections.filter(e => e.status === 'ended');

  return { elections, active, upcoming, ended, loading, error, refresh: fetchElections };
}