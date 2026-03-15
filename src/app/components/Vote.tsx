import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { authService } from '../lib/auth';
import { mockElections, votingService } from '../lib/elections';
import { generateVoteHash } from '../lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Shield, 
  ArrowLeft, 
  CheckCircle, 
  Lock, 
  AlertCircle, 
  User,
  FileText,
  Vote as VoteIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function Vote() {
  const navigate = useNavigate();
  const { electionId } = useParams<{ electionId: string }>();
  const [user, setUser] = useState(authService.getCurrentUser());
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteHash, setVoteHash] = useState('');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/');
      return;
    }
    setUser(authService.getCurrentUser());
  }, [navigate]);

  if (!user || !electionId) return null;

  const election = mockElections.find(e => e.id === electionId);
  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Election not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasVoted = votingService.hasVoted(user.id, electionId);

  const handleVoteSubmit = () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }
    setShowConfirmation(true);
  };

  const confirmVote = () => {
    setIsSubmitting(true);
    
    // Simulate vote processing delay
    setTimeout(() => {
      const candidate = election.candidates.find(c => c.id === selectedCandidate);
      if (!candidate) {
        toast.error('Invalid candidate selection');
        setIsSubmitting(false);
        return;
      }

      const success = votingService.castVote(
        user.id,
        user.name,
        user.email,
        electionId,
        election.title,
        selectedCandidate,
        candidate.name
      );
      
      if (success) {
        const hash = generateVoteHash(user.voterId, electionId, selectedCandidate);
        setVoteHash(hash);
        
        toast.success('Vote cast successfully!', {
          description: 'Your vote has been encrypted and recorded'
        });
        
        // Update election turnout
        election.turnout += 1;
        
        setIsSubmitting(false);
        setShowConfirmation(false);
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        toast.error('Failed to cast vote', {
          description: 'You may have already voted in this election'
        });
        setIsSubmitting(false);
      }
    }, 2000);
  };

  if (hasVoted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-center text-2xl">Vote Already Cast</CardTitle>
              <CardDescription className="text-center">
                You have already voted in this election
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="w-4 h-4" />
                <AlertDescription>
                  Your vote has been securely recorded and encrypted. You can view the results once the election ends.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => navigate('/dashboard')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button className="flex-1" onClick={() => navigate(`/results/${electionId}`)}>
                  View Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (voteHash) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-center text-2xl">Vote Successfully Cast!</CardTitle>
              <CardDescription className="text-center">
                Your vote has been encrypted and recorded on the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Lock className="w-4 h-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">Your Vote Hash:</p>
                  <code className="block text-xs bg-gray-100 p-2 rounded break-all">
                    {voteHash}
                  </code>
                  <p className="text-xs mt-2 text-gray-600">
                    Save this hash to verify your vote later (optional)
                  </p>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-xs font-semibold">Encrypted</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-xs font-semibold">Verified</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Lock className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-xs font-semibold">Anonymous</p>
                </div>
              </div>

              <Button className="w-full" onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/elections')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <VoteIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Cast Your Vote</h1>
                  <p className="text-xs text-gray-500">Secure and anonymous</p>
                </div>
              </div>
            </div>
            <Badge variant="default" className="bg-green-600">
              <Shield className="w-3 h-3 mr-1" />
              Secure Connection
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Security Notice */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Shield className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <p className="font-semibold mb-1">Your vote is completely secure and anonymous</p>
            <p className="text-sm">Your selection will be encrypted before submission. No one can trace your vote back to you.</p>
          </AlertDescription>
        </Alert>

        {/* Election Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{election.title}</CardTitle>
            <CardDescription>{election.description}</CardDescription>
          </CardHeader>
        </Card>

        {/* Voting Form */}
        {!showConfirmation ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Select Your Candidate</CardTitle>
                <CardDescription>Choose one candidate to cast your vote</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedCandidate} onValueChange={setSelectedCandidate}>
                  <div className="space-y-4">
                    {election.candidates.map((candidate) => (
                      <motion.div
                        key={candidate.id}
                        whileHover={{ scale: 1.02 }}
                        className="relative"
                      >
                        <Label
                          htmlFor={candidate.id}
                          className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedCandidate === candidate.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <RadioGroupItem value={candidate.id} id={candidate.id} className="mt-1" />
                          
                          <img
                            src={candidate.photo}
                            alt={candidate.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">{candidate.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{candidate.party}</p>
                            <p className="text-sm text-gray-700 mb-2">{candidate.description}</p>
                            <div className="flex items-start gap-2">
                              <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-gray-600">{candidate.manifesto}</p>
                            </div>
                          </div>
                        </Label>
                      </motion.div>
                    ))}
                  </div>
                </RadioGroup>

                <div className="mt-8 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/elections')}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleVoteSubmit}
                    disabled={!selectedCandidate}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Continue to Confirmation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Confirm Your Vote</CardTitle>
                <CardDescription>Please review your selection before submitting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-amber-900">
                    <p className="font-semibold">Important: Your vote cannot be changed after submission</p>
                    <p className="text-sm mt-1">Please verify your selection is correct before confirming.</p>
                  </AlertDescription>
                </Alert>

                {(() => {
                  const candidate = election.candidates.find(c => c.id === selectedCandidate);
                  if (!candidate) return null;

                  return (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <p className="text-sm text-gray-600 mb-4">You are voting for:</p>
                      <div className="flex items-center gap-4">
                        <img
                          src={candidate.photo}
                          alt={candidate.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
                          <p className="text-gray-600">{candidate.party}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Vote will be encrypted with 256-bit encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Your identity will remain anonymous</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Verified on blockchain for transparency</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowConfirmation(false)}
                    disabled={isSubmitting}
                  >
                    Go Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={confirmVote}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Confirm & Submit Vote
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}