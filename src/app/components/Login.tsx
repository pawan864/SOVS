import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Shield, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, KeyRound, Mail, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';

const API = 'https://sovs-backend-bf8j.onrender.com/api';

type ForgotStep = 'idle' | 'enter-email' | 'enter-otp' | 'reset-password' | 'done';

// Voter login sub-steps
// number → otp → password (create or enter) → done
type VoterStep = 'number' | 'otp' | 'create-password' | 'enter-password';

const FEATURE_CARDS = [
  { title: 'End-to-End Encryption', desc: 'AES-256 encryption with blockchain verification', color: '#1a56db', bg: '#eff6ff', darkBg: '#1e3a5f', border: '#93c5fd' },
  { title: 'RBAC Security',         desc: 'Role-based access with granular permissions',     color: '#7e3af2', bg: '#f5f3ff', darkBg: '#3b1f6e', border: '#c4b5fd' },
  { title: 'Anonymous Voting',      desc: 'Complete privacy with audit trail',               color: '#0e9f6e', bg: '#f0fdf4', darkBg: '#064e3b', border: '#6ee7b7' },
];

const glowCSS = `
  @keyframes borderPulse {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1;   }
  }
  .glow-card-wrapper {
    position: relative;
    border-radius: 1rem;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .glow-card-wrapper:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 48px rgba(99,102,241,0.15), 0 8px 24px rgba(0,0,0,0.08);
  }
  .glow-card-wrapper::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 1.1rem;
    background: linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6, #8b5cf6, #6366f1);
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: 0;
    animation: borderPulse 2.5s ease-in-out infinite;
  }
  .glow-card-wrapper:hover::before { opacity: 1; }
  .glow-card-inner {
    position: relative;
    z-index: 1;
    border-radius: 1rem;
    overflow: hidden;
  }
  .feature-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border-radius: 12px;
    border: 1.5px solid #e2e8f0;
    background: #ffffff;
    cursor: default;
    transition: background 0.25s ease, border-color 0.25s ease, transform 0.2s ease, box-shadow 0.2s ease;
  }
  .dark .feature-card { background: #1e293b; border-color: #334155; }
  .feature-card:hover { transform: translateX(6px); box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  .feature-card-icon {
    width: 36px; height: 36px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 2px;
    transition: background 0.25s ease;
  }
  .theme-toggle-btn {
    position: fixed; top: 16px; right: 16px; z-index: 1000;
    width: 42px; height: 42px; border-radius: 50%;
    border: 1.5px solid #e2e8f0; background: #ffffff; color: #1e293b;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
  }
  .theme-toggle-btn:hover { transform: scale(1.08); box-shadow: 0 4px 14px rgba(0,0,0,0.15); }
  .dark .theme-toggle-btn { background: #1e293b; border-color: #334155; color: #f1f5f9; }
`;

// Password strength checker
const getPasswordStrength = (pwd: string) => {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8)           score++;
  if (/[A-Z]/.test(pwd))         score++;
  if (/[0-9]/.test(pwd))         score++;
  if (/[^A-Za-z0-9]/.test(pwd))  score++;
  const map = [
    { label: 'Too short',  color: '#ef4444' },
    { label: 'Weak',       color: '#f97316' },
    { label: 'Fair',       color: '#eab308' },
    { label: 'Good',       color: '#3b82f6' },
    { label: 'Strong',     color: '#22c55e' },
  ];
  return { score, ...map[score] };
};

export function Login() {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') return document.documentElement.classList.contains('dark');
    return false;
  });
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  useEffect(() => {
    isDark ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
  }, [isDark]);

  // officer login
  const [showPassword, setShowPassword]   = useState(false);
  const [loginEmail, setLoginEmail]       = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoading, setIsLoading]         = useState(false);
  const [selectedRole, setSelectedRole]   = useState('');
  const [showRoles, setShowRoles]         = useState(false);

  // voter OTP flow
  const [voterStep, setVoterStep]                 = useState<VoterStep>('number');
  const [voterMethod, setVoterMethod]             = useState('');
  const [showVoterMethods, setShowVoterMethods]   = useState(false);
  const [voterNumber, setVoterNumber]             = useState('');
  const [voterId, setVoterId]                     = useState('');
  const [voterName, setVoterName]                 = useState('');
  const [otp, setOtp]                             = useState('');
  const [otpLoading, setOtpLoading]               = useState(false);

  // voter password fields
  const [voterPassword, setVoterPassword]         = useState('');
  const [voterConfirmPwd, setVoterConfirmPwd]     = useState('');
  const [showVoterPwd, setShowVoterPwd]           = useState(false);
  const [showVoterConfirm, setShowVoterConfirm]   = useState(false);
  const [pwdLoading, setPwdLoading]               = useState(false);

  // validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const clearError = (key: string) => setErrors(prev => { const e = {...prev}; delete e[key]; return e; });

  // forgot password
  const [forgotStep, setForgotStep]           = useState<ForgotStep>('idle');
  const [forgotEmail, setForgotEmail]         = useState('');
  const [forgotOtp, setForgotOtp]             = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPwd, setShowNewPwd]           = useState(false);
  const [showConfirmPwd, setShowConfirmPwd]   = useState(false);

  const roles        = ['voter', 'admin', 'dm', 'sdm', 'cdo'];
  const voterOptions = ['aadhaar number', 'eci card number'];

  // ── validation helpers ────────────────────────────────────────
  const validateAadhaar = (val: string) => {
    const clean = val.replace(/[-\s]/g, '');
    if (!val)                 return 'Aadhaar number is required';
    if (!/^\d+$/.test(clean)) return 'Aadhaar must contain only digits';
    if (clean.length !== 12)  return 'Aadhaar must be exactly 12 digits';
    return '';
  };
  const validateECI = (val: string) => {
    if (!val)                                 return 'ECI card number is required';
    if (val.trim().length < 5)                return 'ECI number must be at least 5 characters';
    if (!/^[A-Za-z0-9-]+$/.test(val.trim())) return 'ECI number can only contain letters, numbers and hyphens';
    return '';
  };
  const validateOTP = (val: string) => {
    if (!val)                        return 'OTP is required';
    if (!/^\d{6}$/.test(val.trim())) return 'OTP must be exactly 6 digits';
    return '';
  };
  const validateEmail = (val: string) => {
    if (!val)                                       return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))   return 'Enter a valid email address';
    return '';
  };
  const validatePassword = (val: string) => {
    if (!val)           return 'Password is required';
    if (val.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const saveAuth = (token: string, user: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const resetVoterFlow = () => {
    setVoterStep('number');
    setVoterMethod('');
    setVoterNumber('');
    setVoterId('');
    setVoterName('');
    setOtp('');
    setVoterPassword('');
    setVoterConfirmPwd('');
    setErrors({});
  };

  // ── STEP 1: Send OTP ──────────────────────────────────────────
  const sendOTP = async () => {
    const err = voterMethod === 'aadhaar number' ? validateAadhaar(voterNumber) : validateECI(voterNumber);
    if (err) { setErrors({ voterNumber: err }); return; }
    setErrors({});
    setOtpLoading(true);
    try {
      const method = voterMethod === 'aadhaar number' ? 'aadhaar' : 'eci';
      const res  = await fetch(`${API}/auth/voter/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, number: voterNumber }),
      });
      const data = await res.json();
      toast.success('OTP sent successfully');
      setVoterStep('otp');
      if (data.voterId)   setVoterId(data.voterId);
      if (data.voterName) setVoterName(data.voterName);
    } catch {
      toast.success('OTP sent (demo: 123456)');
      setVoterStep('otp');
    }
    setOtpLoading(false);
  };

  // ── STEP 2: Verify OTP → check if new or returning ───────────
  const verifyOTP = async () => {
    const otpErr = validateOTP(otp);
    if (otpErr) { setErrors({ otp: otpErr }); return; }
    setErrors({});
    setOtpLoading(true);
    const method = voterMethod === 'aadhaar number' ? 'aadhaar' : 'eci';
    try {
      // First verify OTP, then check if voter exists and has password
      const res  = await fetch(`${API}/auth/voter/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId, otp: otp.trim(), method, number: voterNumber }),
      });
      const data = await res.json();

      if (data.blocked) {
        toast.error('🚫 Account Blocked', { description: data.message, duration: 8000 });
        setOtpLoading(false);
        return;
      }

      if (data.needPassword) {
        // Existing voter with password → ask for password
        if (data.voterId)   setVoterId(data.voterId);
        if (data.voterName) setVoterName(data.voterName);
        setVoterStep('enter-password');
        toast.success('OTP verified! Enter your password to continue.');
        setOtpLoading(false);
        return;
      }

      if (data.success && data.isNew) {
        // New voter — OTP verified, now ask to create password
        if (data.user?.voterId) setVoterId(data.user.voterId);
        if (data.user?.name)    setVoterName(data.user.name);
        // Store token temporarily so we can use it after password creation
        localStorage.setItem('_tmp_token', data.token);
        localStorage.setItem('_tmp_user', JSON.stringify(data.user));
        setVoterStep('create-password');
        toast.success('OTP verified! Create a password for future logins.');
        setOtpLoading(false);
        return;
      }

      if (data.success && !data.isNew) {
        // Existing voter with NO password set — logged in directly
        saveAuth(data.token, data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
        setTimeout(() => navigate('/voter-dashboard'), 500);
        setOtpLoading(false);
        return;
      }

      // Error
      if (data.message?.toLowerCase().includes('invalid otp')) {
        toast.error('❌ Invalid OTP. Please try again.');
      } else {
        toast.error(data.message || 'Verification failed');
      }
    } catch {
      toast.error('Cannot reach server. Render backend may be waking up, please wait 50s and try again');
    }
    setOtpLoading(false);
  };

  // ── STEP 3a: Create password for new voter ────────────────────
  const handleCreatePassword = async () => {
    const pwErr = validatePassword(voterPassword);
    if (pwErr) { setErrors({ voterPassword: pwErr }); return; }
    if (voterPassword !== voterConfirmPwd) { setErrors({ voterConfirmPwd: 'Passwords do not match' }); return; }
    setErrors({});
    setPwdLoading(true);
    const tmpToken = localStorage.getItem('_tmp_token');
    const tmpUser  = JSON.parse(localStorage.getItem('_tmp_user') || '{}');
    try {
      // Call /api/auth/voter/set-password with the new voter's token
      await fetch(`${API}/auth/voter/set-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tmpToken}` },
        body:    JSON.stringify({ password: voterPassword }),
      });
      localStorage.removeItem('_tmp_token');
      localStorage.removeItem('_tmp_user');
      saveAuth(tmpToken!, tmpUser);
      toast.success('🎉 Account created with password! Welcome to SecureVote.');
      setTimeout(() => navigate('/voter-dashboard'), 500);
    } catch {
      // Log in anyway even if password save fails
      localStorage.removeItem('_tmp_token');
      localStorage.removeItem('_tmp_user');
      if (tmpToken && tmpUser._id) {
        saveAuth(tmpToken, tmpUser);
        toast.success('Account created! Welcome to SecureVote.');
        setTimeout(() => navigate('/voter-dashboard'), 500);
      } else {
        toast.error('Cannot reach server');
      }
    }
    setPwdLoading(false);
  };

  const handleSkipPassword = () => {
    const tmpToken = localStorage.getItem('_tmp_token');
    const tmpUser  = JSON.parse(localStorage.getItem('_tmp_user') || '{}');
    localStorage.removeItem('_tmp_token');
    localStorage.removeItem('_tmp_user');
    if (tmpToken && tmpUser._id) {
      saveAuth(tmpToken, tmpUser);
      toast.success(`Welcome, ${tmpUser.name}!`);
      setTimeout(() => navigate('/voter-dashboard'), 500);
    }
  };

  // ── STEP 3b: Enter password for existing voter ────────────────
  const handleEnterPassword = async () => {
    const pwErr = validatePassword(voterPassword);
    if (pwErr) { setErrors({ voterPassword: pwErr }); return; }
    setErrors({});
    setPwdLoading(true);
    const method = voterMethod === 'aadhaar number' ? 'aadhaar' : 'eci';
    try {
      const res  = await fetch(`${API}/auth/voter/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterId,
          otp: otp.trim(),
          method,
          number:   voterNumber,
          password: voterPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        saveAuth(data.token, data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
        setTimeout(() => navigate('/voter-dashboard'), 500);
      } else {
        toast.error(data.message || 'Incorrect password');
        setErrors({ voterPassword: data.message || 'Incorrect password' });
      }
    } catch {
      toast.error('Cannot reach server. Please try again.');
    }
    setPwdLoading(false);
  };

  // ── Officer login ──────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success) {
        saveAuth(data.token, data.user);
        toast.success('Login successful!', { description: `Welcome back, ${data.user.name}` });
        switch (data.user.role) {
          case 'admin': navigate('/admin-dashboard'); break;
          case 'dm':    navigate('/dm-dashboard');    break;
          case 'sdm':   navigate('/sdm-dashboard');   break;
          case 'cdo':   navigate('/cdo-dashboard');   break;
          default:      navigate('/voter-dashboard'); break;
        }
      } else {
        toast.error('Login failed', { description: data.message || 'Invalid email or password' });
      }
    } catch {
      toast.error('Cannot reach server', { description: 'Render backend may be waking up, please wait 50s and try again' });
    }
    setIsLoading(false);
  };

  // ── Forgot password ────────────────────────────────────────────
  const handleForgotSendOtp = () => {
    if (!forgotEmail) { toast.error('Enter your email first'); return; }
    const validEmails = ['admin@securevote.gov.in','dm@securevote.gov.in','sdm@securevote.gov.in','cdo@securevote.gov.in'];
    if (!validEmails.includes(forgotEmail.toLowerCase())) { toast.error('Email not found in system'); return; }
    toast.success('Reset OTP sent to ' + forgotEmail);
    setForgotStep('enter-otp');
  };
  const handleForgotVerifyOtp = () => {
    if (forgotOtp.trim() === '123456') { setForgotStep('reset-password'); }
    else { toast.error('Invalid OTP. Use 123456 for demo'); }
  };
  const handleResetPassword = () => {
    if (!newPassword)                    { toast.error('Enter new password'); return; }
    if (newPassword.length < 6)          { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    toast.success('Password reset successfully! Please login.');
    setForgotStep('done');
    setTimeout(() => { setForgotStep('idle'); setForgotEmail(''); setForgotOtp(''); setNewPassword(''); setConfirmPassword(''); }, 2000);
  };
  const cancelForgot = () => { setForgotStep('idle'); setForgotEmail(''); setForgotOtp(''); setNewPassword(''); setConfirmPassword(''); };

  // ── Step indicator for voter flow ──────────────────────────────
  const voterStepIndex = { number: 0, otp: 1, 'create-password': 2, 'enter-password': 2 }[voterStep];
  const voterStepLabels = ['ID Verification', 'OTP Verify', voterStep === 'enter-password' ? 'Password Login' : 'Create Password'];

  // ── Forgot Password UI ─────────────────────────────────────────
  const renderForgotPassword = () => (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <button type="button" onClick={cancelForgot} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-base">
            {forgotStep === 'enter-email'    && 'Forgot Password'}
            {forgotStep === 'enter-otp'      && 'Verify OTP'}
            {forgotStep === 'reset-password' && 'Set New Password'}
            {forgotStep === 'done'           && 'Password Reset'}
          </h3>
          <p className="text-xs text-gray-500">
            {forgotStep === 'enter-email'    && 'Enter your registered email'}
            {forgotStep === 'enter-otp'      && `OTP sent to ${forgotEmail}`}
            {forgotStep === 'reset-password' && 'Choose a strong new password'}
            {forgotStep === 'done'           && 'You can now login with new password'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4">
        {['enter-email','enter-otp','reset-password'].map((step, i) => {
          const steps: ForgotStep[] = ['enter-email','enter-otp','reset-password'];
          const currentIdx = steps.indexOf(forgotStep as ForgotStep);
          const done   = i < currentIdx || forgotStep === 'done';
          const active = steps[i] === forgotStep;
          return (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div style={{ width:26, height:26, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, background: done?'#16a34a':active?'#1a56db':'#e2e8f0', color: done||active?'#fff':'#94a3b8' }}>
                {done ? '✓' : i+1}
              </div>
              {i < 2 && <div style={{ flex:1, height:2, background: done?'#16a34a':'#e2e8f0', borderRadius:2 }} />}
            </div>
          );
        })}
      </div>
      {forgotStep === 'enter-email' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Registered Email</Label>
            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input type="email" placeholder="your.email@securevote.gov.in" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className="pl-9" /></div>
          </div>
          <Button type="button" className="w-full" onClick={handleForgotSendOtp}>Send Reset OTP</Button>
        </div>
      )}
      {forgotStep === 'enter-otp' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Enter OTP</Label>
            <Input placeholder="Enter 6-digit OTP (demo: 123456)" value={forgotOtp} onChange={e => setForgotOtp(e.target.value)} maxLength={6} />
            <p className="text-xs text-gray-500">Didn't receive?{' '}<button type="button" className="text-blue-600 underline" onClick={() => toast.success('OTP resent')}>Resend OTP</button></p>
          </div>
          <Button type="button" className="w-full" onClick={handleForgotVerifyOtp}>Verify OTP</Button>
        </div>
      )}
      {forgotStep === 'reset-password' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>New Password</Label>
            <div className="relative">
              <Input type={showNewPwd?'text':'password'} placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-1/2 -translate-y-1/2">{showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <div className="relative">
              <Input type={showConfirmPwd?'text':'password'} placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="absolute right-3 top-1/2 -translate-y-1/2">{showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && <p className="text-xs text-red-500">Passwords do not match</p>}
            {confirmPassword && newPassword === confirmPassword  && <p className="text-xs text-green-600">✓ Passwords match</p>}
          </div>
          <Button type="button" className="w-full" onClick={handleResetPassword}><KeyRound className="w-4 h-4 mr-2" /> Reset Password</Button>
        </div>
      )}
      {forgotStep === 'done' && (
        <div className="text-center py-4 space-y-3">
          <div style={{ width:56, height:56, borderRadius:'50%', background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto' }}><CheckCircle2 className="w-8 h-8 text-green-600" /></div>
          <p className="text-green-700 font-semibold">Password Reset Successful!</p>
          <p className="text-sm text-gray-500">Redirecting back to login...</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{glowCSS}</style>
      <button className="theme-toggle-btn" onClick={() => setIsDark(!isDark)} title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
        {isDark ? <Sun style={{ width:18, height:18 }} /> : <Moon style={{ width:18, height:18 }} />}
      </button>

      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">

        {/* PAGE HEADER */}
        <div className="w-full text-center mb-8">
          <div className="inline-flex items-center gap-3 justify-center">
            <div style={{ width:2, height:32, background:'linear-gradient(to bottom, #1a56db, #7e3af2)', borderRadius:2 }} />
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-600 dark:text-blue-400 mb-0.5">Government of India</p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Election Commission of India</h1>
            </div>
            <div style={{ width:2, height:32, background:'linear-gradient(to bottom, #7e3af2, #1a56db)', borderRadius:2 }} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Secure Online Voting System · सुरक्षित ऑनलाइन मतदान प्रणाली</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <div style={{ height:1, width:60, background:'linear-gradient(to right, transparent, #1a56db)' }} />
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#1a56db' }} />
            <div style={{ height:1, width:120, background:'#e2e8f0' }} />
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#7e3af2' }} />
            <div style={{ height:1, width:60, background:'linear-gradient(to left, transparent, #7e3af2)' }} />
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

          {/* LEFT SIDE */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SecureVote Pro</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">RBAC Platform</p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Enterprise Voting System</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">Role-based access control with military-grade encryption, blockchain verification, and complete transparency.</p>
            </div>
            <div className="grid gap-3 pt-2">
              {FEATURE_CARDS.map((item, i) => {
                const isHovered = hoveredFeature === i;
                return (
                  <div key={i} className="feature-card" onMouseEnter={() => setHoveredFeature(i)} onMouseLeave={() => setHoveredFeature(null)}
                    style={{ background: isHovered ? (isDark ? item.darkBg : item.bg) : undefined, borderColor: isHovered ? item.border : undefined }}>
                    <div className="feature-card-icon" style={{ background: isHovered ? item.color : (isDark ? '#334155' : '#f1f5f9') }}>
                      <CheckCircle2 style={{ width:18, height:18, color: isHovered ? '#ffffff' : item.color, transition:'color 0.25s ease' }} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-sm" style={{ color: isHovered ? item.color : undefined, transition:'color 0.25s ease' }}>{item.title}</h3>
                      <p className="text-xs mt-0.5" style={{ color: isHovered ? item.color+'bb' : undefined, transition:'color 0.25s ease' }}>{item.desc}</p>
                    </div>
                    {isHovered && <div style={{ marginLeft:'auto', color:item.color, fontSize:18, fontWeight:700, flexShrink:0 }}>→</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — GLOW CARD */}
          <div className="glow-card-wrapper">
            <div className="glow-card-inner">
              <Card className="w-full shadow-2xl border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl dark:text-white">
                    {forgotStep !== 'idle' ? 'Account Recovery' : 'Secure Access Portal'}
                  </CardTitle>
                  <CardDescription>
                    {forgotStep !== 'idle' ? 'Reset your password securely' : 'Login with your authorized credentials'}
                  </CardDescription>
                </CardHeader>
                <CardContent>

                  {forgotStep !== 'idle' ? renderForgotPassword() : (
                    <form onSubmit={handleLogin} className="space-y-6">

                      {/* ROLE SELECT */}
                      <div className="space-y-2">
                        <Label>Select Role</Label>
                        <button type="button" onClick={() => { setShowRoles(!showRoles); clearError('role'); }}
                          className={`w-full border rounded-md px-3 py-2 text-left dark:text-white ${errors.role ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}>
                          {selectedRole ? selectedRole.toUpperCase() : 'Choose Role'}
                        </button>
                        {errors.role && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><span>⚠</span> {errors.role}</p>}
                        {showRoles && (
                          <div className="max-h-28 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-md">
                            {roles.map(role => (
                              <button key={role} type="button" onClick={() => { setSelectedRole(role); setShowRoles(false); resetVoterFlow(); }}
                                className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm dark:text-white">
                                {role.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* ── VOTER FLOW ── */}
                      {selectedRole === 'voter' && (
                        <div className="space-y-4">

                          {/* Step indicator */}
                          <div className="flex items-center gap-1.5">
                            {voterStepLabels.map((label, i) => {
                              const done   = i < voterStepIndex;
                              const active = i === voterStepIndex;
                              return (
                                <div key={i} className="flex items-center gap-1.5 flex-1">
                                  <div className="flex flex-col items-center gap-0.5" style={{ minWidth:0 }}>
                                    <div style={{ width:22, height:22, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, background: done?'#16a34a':active?'#1a56db':'#e2e8f0', color: done||active?'#fff':'#94a3b8' }}>
                                      {done ? '✓' : i+1}
                                    </div>
                                    <span style={{ fontSize:9, color: active?'#1a56db':done?'#16a34a':'#94a3b8', fontWeight:600, whiteSpace:'nowrap' }}>{label}</span>
                                  </div>
                                  {i < 2 && <div style={{ flex:1, height:1.5, background: done?'#16a34a':'#e2e8f0', borderRadius:2, marginBottom:12 }} />}
                                </div>
                              );
                            })}
                          </div>

                          {/* ── STEP 1: Number entry ── */}
                          {voterStep === 'number' && (
                            <>
                              <div className="space-y-2">
                                <Label>Verification Method</Label>
                                <button type="button" onClick={() => setShowVoterMethods(!showVoterMethods)}
                                  className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-left dark:text-white">
                                  {voterMethod ? voterMethod.toUpperCase() : 'Choose Aadhaar or ECI'}
                                </button>
                                {showVoterMethods && (
                                  <div className="max-h-24 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-md">
                                    {voterOptions.map(option => (
                                      <button key={option} type="button" onClick={() => { setVoterMethod(option); setShowVoterMethods(false); }}
                                        className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm dark:text-white">
                                        {option.toUpperCase()}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {voterMethod && (
                                <div className="space-y-2">
                                  <Label>Enter {voterMethod}</Label>
                                  <Input
                                    placeholder={voterMethod === 'aadhaar number' ? '1234-5678-9012 (12 digits)' : 'ECI-VTR-001'}
                                    value={voterNumber}
                                    className={errors.voterNumber ? 'border-red-500' : ''}
                                    onChange={e => { setVoterNumber(e.target.value); clearError('voterNumber'); }}
                                    onBlur={() => { if (voterNumber) { const err = voterMethod === 'aadhaar number' ? validateAadhaar(voterNumber) : validateECI(voterNumber); if (err) setErrors(prev => ({ ...prev, voterNumber: err })); } }}
                                  />
                                  {errors.voterNumber && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span> {errors.voterNumber}</p>}
                                </div>
                              )}
                              {voterMethod && voterNumber && (
                                <Button type="button" className="w-full" onClick={sendOTP} disabled={otpLoading}>
                                  {otpLoading ? 'Sending OTP...' : 'Send OTP →'}
                                </Button>
                              )}
                            </>
                          )}

                          {/* ── STEP 2: OTP entry ── */}
                          {voterStep === 'otp' && (
                            <>
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
                                OTP sent to your registered mobile for <strong>{voterNumber}</strong>
                              </div>
                              {voterName && (
                                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200">
                                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                  <span className="text-sm text-green-700 dark:text-green-400 font-medium">Voter found: {voterName}</span>
                                </div>
                              )}
                              <div className="space-y-2">
                                <Label>Enter OTP</Label>
                                <Input
                                  placeholder="Enter 6-digit OTP"
                                  value={otp}
                                  maxLength={6}
                                  className={errors.otp ? 'border-red-500' : ''}
                                  onChange={e => { setOtp(e.target.value.replace(/\D/g,'')); clearError('otp'); }}
                                />
                                {errors.otp && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span> {errors.otp}</p>}
                              </div>
                              <Button type="button" className="w-full" onClick={verifyOTP} disabled={otpLoading}>
                                {otpLoading ? 'Verifying...' : 'Verify OTP →'}
                              </Button>
                              <button type="button" className="text-xs text-blue-600 hover:underline w-full text-center"
                                onClick={() => { setVoterStep('number'); setOtp(''); setErrors({}); }}>
                                ← Change {voterMethod}
                              </button>
                            </>
                          )}

                          {/* ── STEP 3a: Create password (new voter) ── */}
                          {voterStep === 'create-password' && (
                            <>
                              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 text-sm text-green-700">
                                <p className="font-semibold">✅ OTP Verified! New account created.</p>
                                <p className="text-xs mt-0.5">Create a password to secure future logins.</p>
                              </div>
                              <div className="space-y-2">
                                <Label>Create Password</Label>
                                <div className="relative">
                                  <Input
                                    type={showVoterPwd ? 'text' : 'password'}
                                    placeholder="Minimum 6 characters"
                                    value={voterPassword}
                                    className={errors.voterPassword ? 'border-red-500' : ''}
                                    onChange={e => { setVoterPassword(e.target.value); clearError('voterPassword'); }}
                                  />
                                  <button type="button" onClick={() => setShowVoterPwd(!showVoterPwd)} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {showVoterPwd ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                                  </button>
                                </div>
                                {/* Password strength bar */}
                                {voterPassword && (() => {
                                  const s = getPasswordStrength(voterPassword);
                                  return (
                                    <div>
                                      <div style={{ height:4, background:'#e2e8f0', borderRadius:4, overflow:'hidden', marginTop:6 }}>
                                        <div style={{ height:'100%', width:`${(s.score/4)*100}%`, background:s.color, borderRadius:4, transition:'width 0.3s ease' }}/>
                                      </div>
                                      <p style={{ fontSize:11, color:s.color, fontWeight:600, marginTop:3 }}>{s.label}</p>
                                    </div>
                                  );
                                })()}
                                {errors.voterPassword && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span> {errors.voterPassword}</p>}
                              </div>
                              <div className="space-y-2">
                                <Label>Confirm Password</Label>
                                <div className="relative">
                                  <Input
                                    type={showVoterConfirm ? 'text' : 'password'}
                                    placeholder="Re-enter your password"
                                    value={voterConfirmPwd}
                                    className={errors.voterConfirmPwd ? 'border-red-500' : ''}
                                    onChange={e => { setVoterConfirmPwd(e.target.value); clearError('voterConfirmPwd'); }}
                                  />
                                  <button type="button" onClick={() => setShowVoterConfirm(!showVoterConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {showVoterConfirm ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                                  </button>
                                </div>
                                {voterConfirmPwd && voterPassword !== voterConfirmPwd && <p className="text-xs text-red-500">Passwords do not match</p>}
                                {voterConfirmPwd && voterPassword === voterConfirmPwd && voterPassword.length >= 6 && <p className="text-xs text-green-600">✓ Passwords match</p>}
                                {errors.voterConfirmPwd && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span> {errors.voterConfirmPwd}</p>}
                              </div>
                              <Button type="button" className="w-full" onClick={handleCreatePassword} disabled={pwdLoading}>
                                <Lock className="w-4 h-4 mr-2"/>
                                {pwdLoading ? 'Creating account...' : '🎉 Create Account & Login'}
                              </Button>
                              <button type="button" className="text-xs text-gray-400 hover:text-gray-600 w-full text-center hover:underline"
                                onClick={handleSkipPassword}>
                                Skip for now (login without password)
                              </button>
                            </>
                          )}

                          {/* ── STEP 3b: Enter password (returning voter) ── */}
                          {voterStep === 'enter-password' && (
                            <>
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 text-sm text-blue-700">
                                <p className="font-semibold">✅ OTP Verified!</p>
                                <p className="text-xs mt-0.5">Welcome back, <strong>{voterName}</strong>. Enter your password to continue.</p>
                              </div>
                              <div className="space-y-2">
                                <Label>Your Password</Label>
                                <div className="relative">
                                  <Input
                                    type={showVoterPwd ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={voterPassword}
                                    className={errors.voterPassword ? 'border-red-500' : ''}
                                    onChange={e => { setVoterPassword(e.target.value); clearError('voterPassword'); }}
                                    onKeyDown={e => { if (e.key === 'Enter') handleEnterPassword(); }}
                                    autoFocus
                                  />
                                  <button type="button" onClick={() => setShowVoterPwd(!showVoterPwd)} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {showVoterPwd ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                                  </button>
                                </div>
                                {errors.voterPassword && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span> {errors.voterPassword}</p>}
                              </div>
                              <Button type="button" className="w-full" onClick={handleEnterPassword} disabled={pwdLoading}>
                                <Lock className="w-4 h-4 mr-2"/>
                                {pwdLoading ? 'Signing in...' : 'Secure Login →'}
                              </Button>
                              <button type="button" className="text-xs text-blue-600 hover:underline w-full text-center"
                                onClick={() => { setVoterStep('otp'); setVoterPassword(''); setErrors({}); }}>
                                ← Back to OTP
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* ── OFFICER LOGIN ── */}
                      {selectedRole !== 'voter' && selectedRole !== '' && (
                        <>
                          <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input type="email" placeholder="your.email@securevote.gov.in" value={loginEmail} disabled={isLoading}
                              className={errors.loginEmail ? 'border-red-500' : ''}
                              onChange={e => { setLoginEmail(e.target.value); clearError('loginEmail'); }}
                              onBlur={() => { const err = validateEmail(loginEmail); if (err) setErrors(prev => ({...prev, loginEmail: err})); }}
                            />
                            {errors.loginEmail && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span> {errors.loginEmail}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label>Password</Label>
                            <div className="relative">
                              <Input type={showPassword?'text':'password'} placeholder="••••••••" value={loginPassword} disabled={isLoading}
                                className={errors.loginPassword ? 'border-red-500' : ''}
                                onChange={e => { setLoginPassword(e.target.value); clearError('loginPassword'); }}
                                onBlur={() => { const err = validatePassword(loginPassword); if (err) setErrors(prev => ({...prev, loginPassword: err})); }}
                              />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            {errors.loginPassword && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span> {errors.loginPassword}</p>}
                            <div className="flex justify-end">
                              <button type="button" onClick={() => { setForgotEmail(loginEmail); setForgotStep('enter-email'); }}
                                className="text-xs text-blue-600 hover:text-blue-700 hover:underline">
                                Forgot password?
                              </button>
                            </div>
                          </div>
                          <Button type="submit" className="w-full" disabled={isLoading}>
                            <Lock className="w-4 h-4 mr-2" />
                            {isLoading ? 'Signing in...' : 'Secure Login'}
                          </Button>
                        </>
                      )}

                    </form>
                  )}

                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
