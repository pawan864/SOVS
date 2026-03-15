// Authentication and security utilities

export type UserRole = 'voter' | 'admin' | 'dm' | 'sdm' | 'cdo';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  hasVoted: { [electionId: string]: boolean };
  voterId: string; // Unique voter ID for verification
  department?: string;
  district?: string;
  avatar?: string;
}

export interface VoteRecord {
  id: string;
  electionId: string;
  candidateId: string;
  timestamp: number;
  hash: string; // Simulated cryptographic hash
  verified: boolean;
}

// Simulate encryption
export const encryptVote = (vote: string): string => {
  return btoa(vote + Date.now()); // Base64 encoding as simulation
};

// Simulate decryption (for verification only, not to reveal votes)
export const verifyVoteHash = (voteId: string, hash: string): boolean => {
  // Simulated hash verification
  return hash.length > 0;
};

// Generate unique hash for vote
export const generateVoteHash = (voterId: string, electionId: string, candidateId: string): string => {
  const data = `${voterId}-${electionId}-${candidateId}-${Date.now()}`;
  return btoa(data);
};

// Internal users with passwords (never exported)
const mockUsersWithPasswords: (User & { password: string })[] = [
  {
    id: '1',
    email: 'voter@example.com',
    name: 'John Voter',
    role: 'voter',
    hasVoted: {},
    voterId: 'VTR-001-2026',
    password: '', // voter uses OTP flow
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
  },
  {
    id: '2',
    email: 'admin@securevote.gov.in',
    name: 'Raj Sharma',
    role: 'admin',
    hasVoted: {},
    voterId: 'VTR-002-2026',
    password: 'Admin@1234',
    department: 'System Administration',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
  },
  {
    id: '3',
    email: 'dm@securevote.gov.in',
    name: 'Priya Verma',
    role: 'dm',
    hasVoted: {},
    voterId: 'VTR-003-2026',
    password: 'DM@5678',
    district: 'Lucknow',
    department: 'District Management',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
  },
  {
    id: '4',
    email: 'sdm@securevote.gov.in',
    name: 'Amit Tiwari',
    role: 'sdm',
    hasVoted: {},
    voterId: 'VTR-004-2026',
    password: 'SDM@9012',
    district: 'Lucknow',
    department: 'Sub-District Operations',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
  },
  {
    id: '5',
    email: 'cdo@securevote.gov.in',
    name: 'Sunita Pandey',
    role: 'cdo',
    hasVoted: {},
    voterId: 'VTR-005-2026',
    password: 'CDO@3456',
    district: 'Lucknow',
    department: 'Chief Development Office',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400'
  }
];

// Mock users exported without passwords (keeps existing imports working)
export const mockUsers: User[] = mockUsersWithPasswords.map(
  ({ password, ...user }) => user
);

// Authentication service
class AuthService {
  private currentUser: User | null = null;
  private sessionTimeout: number = 30 * 60 * 1000; // 30 minutes
  private sessionTimer: ReturnType<typeof setTimeout> | null = null;

  login(email: string, password: string): User | null {
    // Match by both email AND password
    const found = mockUsersWithPasswords.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      const { password: _, ...user } = found;
      this.currentUser = { ...user };
      this.startSessionTimer();
      // Write to both keys so all dashboards can read it
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    return null;
  }

  logout() {
    this.currentUser = null;
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const stored = localStorage.getItem('currentUser') || localStorage.getItem('user');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(role: UserRole): boolean {
    return this.getCurrentUser()?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.getCurrentUser()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  private startSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    this.sessionTimer = setTimeout(() => {
      this.logout();
      window.location.href = '/';
    }, this.sessionTimeout);
  }

  refreshSession() {
    this.startSessionTimer();
  }
}

export const authService = new AuthService();
