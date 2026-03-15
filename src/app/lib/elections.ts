// Election data and management

export interface Candidate {
  id: string;
  name: string;
  party: string;
  photo: string;
  description: string;
  manifesto: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'ended';
  candidates: Candidate[];
  totalVoters: number;
  turnout: number;
  results?: { [candidateId: string]: number };
}

export interface VoteRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  electionId: string;
  electionTitle: string;
  candidateId: string;
  candidateName: string;
  timestamp: number;
  hash: string;
}

// Mock elections data
export const mockElections: Election[] = [
  {
    id: 'election-1',
    title: '2026 Presidential Election',
    description: 'National presidential election to elect the next president for a 4-year term.',
    startDate: new Date('2026-02-01'),
    endDate: new Date('2026-03-15'),
    status: 'active',
    totalVoters: 15000,
    turnout: 8500,
    candidates: [
      {
        id: 'candidate-1',
        name: 'Sarah Johnson',
        party: 'Progressive Party',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
        description: 'Former Governor with 15 years of public service',
        manifesto: 'Focus on education, healthcare, and economic growth'
      },
      {
        id: 'candidate-2',
        name: 'Michael Chen',
        party: 'Conservative Alliance',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        description: 'Business leader and philanthropist',
        manifesto: 'Strengthening national security and economic stability'
      },
      {
        id: 'candidate-3',
        name: 'Amanda Rodriguez',
        party: 'Green Coalition',
        photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
        description: 'Environmental scientist and activist',
        manifesto: 'Climate action, renewable energy, and sustainability'
      }
    ],
    results: {
      'candidate-1': 3200,
      'candidate-2': 2900,
      'candidate-3': 2400
    }
  },
  {
    id: 'election-2',
    title: 'City Council Election - District 5',
    description: 'Local council election for District 5 representative.',
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-03-30'),
    status: 'active',
    totalVoters: 5000,
    turnout: 1200,
    candidates: [
      {
        id: 'candidate-4',
        name: 'David Wilson',
        party: 'Independent',
        photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
        description: 'Community organizer and local business owner',
        manifesto: 'Infrastructure development and community services'
      },
      {
        id: 'candidate-5',
        name: 'Lisa Martinez',
        party: 'Citizens Party',
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        description: 'Education administrator with 20 years experience',
        manifesto: 'Better schools and public transportation'
      }
    ],
    results: {
      'candidate-4': 650,
      'candidate-5': 550
    }
  },
  {
    id: 'election-3',
    title: 'Student Government President',
    description: 'University student government presidential election.',
    startDate: new Date('2026-04-01'),
    endDate: new Date('2026-04-15'),
    status: 'upcoming',
    totalVoters: 12000,
    turnout: 0,
    candidates: [
      {
        id: 'candidate-6',
        name: 'Alex Thompson',
        party: 'Student Voice',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        description: 'Current VP with vision for student welfare',
        manifesto: 'Mental health support and campus facilities'
      },
      {
        id: 'candidate-7',
        name: 'Emily Zhang',
        party: 'Unity Coalition',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        description: 'Student activist and club leader',
        manifesto: 'Diversity initiatives and student activities'
      }
    ]
  }
];

// Voting service
class VotingService {
  private votes: Map<string, Map<string, string>> = new Map(); // electionId -> userId -> candidateId
  private voteRecords: VoteRecord[] = [];
  private listeners: Set<() => void> = new Set();

  // Subscribe to vote changes
  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  castVote(
    userId: string, 
    userName: string,
    userEmail: string,
    electionId: string, 
    electionTitle: string,
    candidateId: string,
    candidateName: string
  ): boolean {
    if (!this.votes.has(electionId)) {
      this.votes.set(electionId, new Map());
    }
    
    const electionVotes = this.votes.get(electionId)!;
    
    // Check if user has already voted
    if (electionVotes.has(userId)) {
      return false;
    }
    
    electionVotes.set(userId, candidateId);
    
    // Create vote record
    const voteRecord: VoteRecord = {
      id: `vote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userName,
      userEmail,
      electionId,
      electionTitle,
      candidateId,
      candidateName,
      timestamp: Date.now(),
      hash: this.generateHash(userId, electionId, candidateId)
    };
    
    this.voteRecords.unshift(voteRecord); // Add to beginning for recent-first order
    this.saveToStorage();
    this.notifyListeners(); // Notify all subscribers
    return true;
  }

  private generateHash(userId: string, electionId: string, candidateId: string): string {
    const data = `${userId}-${electionId}-${candidateId}-${Date.now()}`;
    return btoa(data);
  }

  hasVoted(userId: string, electionId: string): boolean {
    return this.votes.get(electionId)?.has(userId) || false;
  }

  getResults(electionId: string): { [candidateId: string]: number } {
    const electionVotes = this.votes.get(electionId);
    const results: { [candidateId: string]: number } = {};
    
    if (electionVotes) {
      electionVotes.forEach((candidateId) => {
        results[candidateId] = (results[candidateId] || 0) + 1;
      });
    }
    
    return results;
  }

  getRecentVotes(limit: number = 10): VoteRecord[] {
    return this.voteRecords.slice(0, limit);
  }

  getVotesByElection(electionId: string): VoteRecord[] {
    return this.voteRecords.filter(v => v.electionId === electionId);
  }

  getAllVoteRecords(): VoteRecord[] {
    return [...this.voteRecords];
  }

  getTotalVoteCount(): number {
    return this.voteRecords.length;
  }

  private saveToStorage() {
    const data: { [electionId: string]: { [userId: string]: string } } = {};
    this.votes.forEach((electionVotes, electionId) => {
      data[electionId] = {};
      electionVotes.forEach((candidateId, userId) => {
        data[electionId][userId] = candidateId;
      });
    });
    localStorage.setItem('votes', JSON.stringify(data));
    localStorage.setItem('voteRecords', JSON.stringify(this.voteRecords));
  }

  loadFromStorage() {
    const stored = localStorage.getItem('votes');
    if (stored) {
      const data = JSON.parse(stored);
      Object.keys(data).forEach(electionId => {
        const electionVotes = new Map<string, string>();
        Object.keys(data[electionId]).forEach(userId => {
          electionVotes.set(userId, data[electionId][userId]);
        });
        this.votes.set(electionId, electionVotes);
      });
    }

    const storedRecords = localStorage.getItem('voteRecords');
    if (storedRecords) {
      this.voteRecords = JSON.parse(storedRecords);
    }
  }
}

export const votingService = new VotingService();
votingService.loadFromStorage();
