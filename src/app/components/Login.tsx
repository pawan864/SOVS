import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  Shield, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, KeyRound, Zap,
  Mail, Sun, Moon, Palette, BookOpen, ChevronDown, ChevronRight,
  Fingerprint, UserCog, Info, AlertCircle, HelpCircle, FileText,
  Monitor, Smartphone, Wifi, Key, Languages,
} from 'lucide-react';
import { toast } from 'sonner';

const API = 'https://sovs-backend-bf8j.onrender.com/api';
type ForgotStep = 'idle' | 'enter-email' | 'enter-otp' | 'reset-password' | 'done';
type VoterStep  = 'number' | 'otp' | 'create-password' | 'enter-password';
type Lang = 'en' | 'hi';

// ── Translations ──────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    govtLabel: 'Government of India',
    commissionTitle: 'Election Commission of India',
    subtitle: 'Secure Online Voting System · सुरक्षित ऑनलाइन मतदान प्रणाली',
    platformSub: 'RBAC Platform',
    heroDesc: 'Role-based access control with military-grade encryption, blockchain verification, and complete transparency.',
    feat1Title: 'End-to-End Encryption', feat1Desc: 'AES-256 encryption with blockchain verification',
    feat2Title: 'RBAC Security',         feat2Desc: 'Role-based access with granular permissions',
    feat3Title: 'Anonymous Voting',      feat3Desc: 'Complete privacy with audit trail',
    cardTitle: 'Secure Access Portal', cardDesc: 'Login with your authorized credentials',
    recoveryTitle: 'Account Recovery',  recoveryDesc: 'Reset your password securely',
    selectRole: 'Select Role', chooseRole: 'Choose Role',
    verifyMethod: 'Verification Method', chooseMethod: 'Choose Aadhaar or ECI',
    enterLabel: 'Enter',
    sendOtp: 'Send OTP →', sendingOtp: 'Sending OTP...',
    otpSentMsg: 'OTP sent to your registered mobile for',
    voterFound: 'Voter found:',
    enterOtp: 'Enter OTP', otpPlaceholder: 'Enter 6-digit OTP',
    verifyOtpBtn: 'Verify OTP →', verifying: 'Verifying...',
    changeMethod: '← Change',
    otpVerifiedNew: '✅ OTP Verified! New account created.',
    createPwdHint: 'Create a password to secure future logins.',
    createPwd: 'Create Password', pwdPlaceholder: 'Minimum 6 characters',
    confirmPwd: 'Confirm Password', rePwdPlaceholder: 'Re-enter your password',
    pwdNoMatch: 'Passwords do not match', pwdMatch: '✓ Passwords match',
    createAccount: '🎉 Create Account & Login', creating: 'Creating account...',
    skipPwd: 'Skip for now (login without password)',
    otpVerifiedBack: '✅ OTP Verified!', welcomeBack: 'Welcome back,',
    enterPwdCont: 'Enter your password to continue.',
    yourPwd: 'Your Password', enterPwdPh: 'Enter your password',
    secureLogin: 'Secure Login →', signingIn: 'Signing in...',
    backToOtp: '← Back to OTP',
    emailAddr: 'Email Address', emailPh: 'your.email@securevote.gov.in',
    password: 'Password', forgotPwd: 'Forgot password?',
    secureLoginBtn: 'Secure Login',
    forgotTitle: 'Forgot Password', verifyOtpTitle: 'Verify OTP',
    setNewPwd: 'Set New Password', pwdResetTitle: 'Password Reset',
    enterRegEmail: 'Enter your registered email',
    otpSentTo: 'OTP sent to', chooseStrongPwd: 'Choose a strong new password',
    nowLogin: 'You can now login with new password',
    regEmail: 'Registered Email', sendResetOtp: 'Send Reset OTP',
    didntReceive: "Didn't receive?", resendOtp: 'Resend OTP',
    newPassword: 'New Password', enterNewPwd: 'Enter new password',
    confirmPassword: 'Confirm Password', confirmNewPwd: 'Confirm new password',
    resetPwd: 'Reset Password',
    pwdResetSuccess: 'Password Reset Successful!', redirecting: 'Redirecting back to login...',
    stepId: 'ID Verification', stepOtp: 'OTP Verify',
    stepCreatePwd: 'Create Password', stepPwdLogin: 'Password Login',
    manualTitle: '📖 User Manual & Help Guide',
    manualSubtitle: 'Step-by-step instructions, demo credentials & troubleshooting',
    manualNote: 'This is a government-grade secure voting platform. For demo/testing, use OTP 123456 and the credentials in the Demo section. Backend may take ~50s to wake up on first request.',
    systemOnline: 'System Online',
    versionLabel: 'SecureVote Pro · Election Commission of India · Version 2.0',
    tw1: 'Enterprise Voting System', tw2: 'Secure Digital Democracy',
    tw3: 'Trusted Electoral Platform', tw4: 'Blockchain-Verified Voting',
    langToggle: 'हिंदी',
  },
  hi: {
    govtLabel: 'भारत सरकार',
    commissionTitle: 'भारत निर्वाचन आयोग',
    subtitle: 'सुरक्षित ऑनलाइन मतदान प्रणाली · Secure Online Voting System',
    platformSub: 'आरबीएसी प्लेटफॉर्म',
    heroDesc: 'सैन्य-स्तरीय एन्क्रिप्शन, ब्लॉकचेन सत्यापन और पूर्ण पारदर्शिता के साथ भूमिका-आधारित एक्सेस नियंत्रण।',
    feat1Title: 'एंड-टू-एंड एन्क्रिप्शन', feat1Desc: 'ब्लॉकचेन सत्यापन के साथ AES-256 एन्क्रिप्शन',
    feat2Title: 'आरबीएसी सुरक्षा',         feat2Desc: 'विस्तृत अनुमतियों के साथ भूमिका-आधारित पहुँच',
    feat3Title: 'गुमनाम मतदान',             feat3Desc: 'ऑडिट ट्रेल के साथ पूर्ण गोपनीयता',
    cardTitle: 'सुरक्षित एक्सेस पोर्टल', cardDesc: 'अपने अधिकृत क्रेडेंशियल से लॉगिन करें',
    recoveryTitle: 'खाता पुनर्प्राप्ति', recoveryDesc: 'अपना पासवर्ड सुरक्षित रूप से रीसेट करें',
    selectRole: 'भूमिका चुनें', chooseRole: 'भूमिका चुनें',
    verifyMethod: 'सत्यापन विधि', chooseMethod: 'आधार या ईसीआई चुनें',
    enterLabel: 'दर्ज करें',
    sendOtp: 'OTP भेजें →', sendingOtp: 'OTP भेजा जा रहा है...',
    otpSentMsg: 'के लिए आपके पंजीकृत मोबाइल पर OTP भेजा गया',
    voterFound: 'मतदाता मिला:',
    enterOtp: 'OTP दर्ज करें', otpPlaceholder: '6 अंकों का OTP दर्ज करें',
    verifyOtpBtn: 'OTP सत्यापित करें →', verifying: 'सत्यापित हो रहा है...',
    changeMethod: '← बदलें',
    otpVerifiedNew: '✅ OTP सत्यापित! नया खाता बनाया गया।',
    createPwdHint: 'भविष्य के लॉगिन सुरक्षित करने के लिए पासवर्ड बनाएं।',
    createPwd: 'पासवर्ड बनाएं', pwdPlaceholder: 'न्यूनतम 6 अक्षर',
    confirmPwd: 'पासवर्ड की पुष्टि करें', rePwdPlaceholder: 'पासवर्ड दोबारा दर्ज करें',
    pwdNoMatch: 'पासवर्ड मेल नहीं खाते', pwdMatch: '✓ पासवर्ड मेल खाते हैं',
    createAccount: '🎉 खाता बनाएं और लॉगिन करें', creating: 'खाता बनाया जा रहा है...',
    skipPwd: 'अभी छोड़ें (बिना पासवर्ड के लॉगिन)',
    otpVerifiedBack: '✅ OTP सत्यापित!', welcomeBack: 'वापस स्वागत है,',
    enterPwdCont: 'जारी रखने के लिए अपना पासवर्ड दर्ज करें।',
    yourPwd: 'आपका पासवर्ड', enterPwdPh: 'अपना पासवर्ड दर्ज करें',
    secureLogin: 'सुरक्षित लॉगिन →', signingIn: 'लॉगिन हो रहा है...',
    backToOtp: '← OTP पर वापस जाएं',
    emailAddr: 'ईमेल पता', emailPh: 'your.email@securevote.gov.in',
    password: 'पासवर्ड', forgotPwd: 'पासवर्ड भूल गए?',
    secureLoginBtn: 'सुरक्षित लॉगिन',
    forgotTitle: 'पासवर्ड भूल गए', verifyOtpTitle: 'OTP सत्यापित करें',
    setNewPwd: 'नया पासवर्ड सेट करें', pwdResetTitle: 'पासवर्ड रीसेट',
    enterRegEmail: 'अपना पंजीकृत ईमेल दर्ज करें',
    otpSentTo: 'OTP भेजा गया', chooseStrongPwd: 'एक मजबूत नया पासवर्ड चुनें',
    nowLogin: 'अब आप नए पासवर्ड से लॉगिन कर सकते हैं',
    regEmail: 'पंजीकृत ईमेल', sendResetOtp: 'रीसेट OTP भेजें',
    didntReceive: 'नहीं मिला?', resendOtp: 'OTP दोबारा भेजें',
    newPassword: 'नया पासवर्ड', enterNewPwd: 'नया पासवर्ड दर्ज करें',
    confirmPassword: 'पासवर्ड की पुष्टि करें', confirmNewPwd: 'नया पासवर्ड दोबारा दर्ज करें',
    resetPwd: 'पासवर्ड रीसेट करें',
    pwdResetSuccess: 'पासवर्ड सफलतापूर्वक रीसेट हुआ!', redirecting: 'लॉगिन पर वापस जा रहे हैं...',
    stepId: 'पहचान सत्यापन', stepOtp: 'OTP सत्यापन',
    stepCreatePwd: 'पासवर्ड बनाएं', stepPwdLogin: 'पासवर्ड लॉगिन',
    manualTitle: '📖 उपयोगकर्ता पुस्तिका और सहायता',
    manualSubtitle: 'चरण-दर-चरण निर्देश, डेमो क्रेडेंशियल और समस्या निवारण',
    manualNote: 'यह एक सरकारी-स्तरीय सुरक्षित मतदान प्लेटफॉर्म है। डेमो के लिए OTP 123456 और नीचे दिए गए डेमो अनुभाग के क्रेडेंशियल का उपयोग करें। पहले अनुरोध पर बैकएंड को जागने में ~50 सेकंड लग सकते हैं।',
    systemOnline: 'सिस्टम ऑनलाइन',
    versionLabel: 'SecureVote Pro · भारत निर्वाचन आयोग · संस्करण 2.0',
    tw1: 'एंटरप्राइज़ मतदान प्रणाली', tw2: 'सुरक्षित डिजिटल लोकतंत्र',
    tw3: 'विश्वसनीय निर्वाचन मंच',    tw4: 'ब्लॉकचेन-सत्यापित मतदान',
    langToggle: 'English',
  },
} as const;

// ── Color themes ──────────────────────────────────────────────────
const COLOR_THEMES = [
  { name: 'Royal Blue', primary: '#1a56db', secondary: '#7e3af2', light: '#eff6ff', dark: '#1e3a5f', border: '#93c5fd' },
  { name: 'Emerald',    primary: '#059669', secondary: '#0d9488', light: '#ecfdf5', dark: '#064e3b', border: '#6ee7b7' },
  { name: 'Crimson',    primary: '#dc2626', secondary: '#db2777', light: '#fff1f2', dark: '#4c0519', border: '#fca5a5' },
  { name: 'Amber',      primary: '#d97706', secondary: '#b45309', light: '#fffbeb', dark: '#451a03', border: '#fcd34d' },
  { name: 'Violet',     primary: '#7c3aed', secondary: '#a21caf', light: '#f5f3ff', dark: '#3b0764', border: '#c4b5fd' },
  { name: 'Rose Gold',  primary: '#e11d48', secondary: '#be185d', light: '#fff1f2', dark: '#4c0519', border: '#fda4af' },
  { name: 'Cyan',       primary: '#0891b2', secondary: '#0e7490', light: '#ecfeff', dark: '#083344', border: '#67e8f9' },
  { name: 'Slate',      primary: '#475569', secondary: '#334155', light: '#f8fafc', dark: '#0f172a', border: '#94a3b8' },
];

// ── Manual sections (EN) ──────────────────────────────────────────
const MANUAL_EN = [
  { icon: <UserCog size={18}/>,    title: 'Getting Started',        color: '#1a56db',
    steps: [
      { icon: <Monitor size={14}/>,    text: 'Open SecureVote in a modern browser (Chrome, Firefox, Edge, Safari).' },
      { icon: <Shield size={14}/>,     text: 'Select your role — Voter, Admin, DM, SDM, or CDO.' },
      { icon: <Key size={14}/>,        text: 'Voters use Aadhaar / ECI Card; Officers use official email credentials.' },
    ] },
  { icon: <Fingerprint size={18}/>, title: 'Voter Login (OTP Flow)', color: '#059669',
    steps: [
      { icon: <Smartphone size={14}/>, text: 'Choose "Voter" and select Aadhaar or ECI Card as verification method.' },
      { icon: <Wifi size={14}/>,       text: 'Enter your 12-digit Aadhaar or ECI Card number and click "Send OTP".' },
      { icon: <Key size={14}/>,        text: 'Enter the 6-digit OTP received on your registered mobile.' },
      { icon: <Lock size={14}/>,       text: 'First-time users will be asked to set a password for future logins.' },
    ] },
  { icon: <UserCog size={18}/>,    title: 'Officer Login',          color: '#7c3aed',
    steps: [
      { icon: <Mail size={14}/>,       text: 'Select your officer role (Admin / DM / SDM / CDO).' },
      { icon: <Monitor size={14}/>,    text: 'Enter your official @securevote.gov.in email address.' },
      { icon: <Lock size={14}/>,       text: 'Enter your assigned password and click "Secure Login".' },
      { icon: <Shield size={14}/>,     text: 'Use "Forgot Password" to reset via OTP if needed.' },
    ] },
  { icon: <AlertCircle size={18}/>, title: 'Troubleshooting',       color: '#d97706',
    steps: [
      { icon: <Wifi size={14}/>,       text: 'Backend may take ~50s to wake up on first visit — please wait and retry.' },
      { icon: <Key size={14}/>,        text: 'If OTP not received, check your mobile number and try "Resend OTP".' },
      { icon: <Shield size={14}/>,     text: 'Accounts blocked after multiple failed attempts — contact electoral officer.' },
      { icon: <HelpCircle size={14}/>, text: 'For demo/testing, OTP is always 123456.' },
    ] },
  { icon: <Info size={18}/>,       title: 'Demo Credentials',       color: '#dc2626',
    steps: [
      { icon: <UserCog size={14}/>,    text: 'Admin: admin@securevote.gov.in / admin123' },
      { icon: <UserCog size={14}/>,    text: 'DM: dm@securevote.gov.in / dm123' },
      { icon: <UserCog size={14}/>,    text: 'SDM: sdm@securevote.gov.in / sdm123' },
      { icon: <FileText size={14}/>,   text: 'Voter OTP (Demo): 123456 — works with any registered Aadhaar/ECI number.' },
    ] },
  { icon: <Shield size={18}/>,     title: 'Security & Privacy',     color: '#0891b2',
    steps: [
      { icon: <Lock size={14}/>,       text: 'All data encrypted with AES-256 and transmitted over HTTPS.' },
      { icon: <Shield size={14}/>,     text: 'Votes are anonymized — your identity is never linked to your ballot.' },
      { icon: <Key size={14}/>,        text: 'Session tokens expire automatically after inactivity.' },
      { icon: <FileText size={14}/>,   text: 'Full blockchain-backed audit trail maintained for every action.' },
    ] },
];

// ── Manual sections (HI) ──────────────────────────────────────────
const MANUAL_HI = [
  { icon: <UserCog size={18}/>,    title: 'शुरुआत कैसे करें',              color: '#1a56db',
    steps: [
      { icon: <Monitor size={14}/>,    text: 'आधुनिक ब्राउज़र (Chrome, Firefox, Edge, Safari) में SecureVote पोर्टल खोलें।' },
      { icon: <Shield size={14}/>,     text: 'ड्रॉपडाउन से भूमिका चुनें — मतदाता, व्यवस्थापक, डीएम, एसडीएम, या सीडीओ।' },
      { icon: <Key size={14}/>,        text: 'मतदाता आधार या ईसीआई नंबर उपयोग करें; अधिकारी ईमेल क्रेडेंशियल का उपयोग करें।' },
    ] },
  { icon: <Fingerprint size={18}/>, title: 'मतदाता लॉगिन (OTP प्रक्रिया)', color: '#059669',
    steps: [
      { icon: <Smartphone size={14}/>, text: '"मतदाता" भूमिका चुनें और आधार या ईसीआई कार्ड सत्यापन विधि चुनें।' },
      { icon: <Wifi size={14}/>,       text: '12 अंकों का आधार या ईसीआई नंबर दर्ज करें और "OTP भेजें" पर क्लिक करें।' },
      { icon: <Key size={14}/>,        text: 'पंजीकृत मोबाइल पर प्राप्त 6 अंकों का OTP दर्ज करें।' },
      { icon: <Lock size={14}/>,       text: 'पहली बार के उपयोगकर्ताओं को पासवर्ड सेट करने के लिए कहा जाएगा।' },
    ] },
  { icon: <UserCog size={18}/>,    title: 'अधिकारी लॉगिन',               color: '#7c3aed',
    steps: [
      { icon: <Mail size={14}/>,       text: 'ड्रॉपडाउन से अधिकारी भूमिका (व्यवस्थापक / डीएम / एसडीएम / सीडीओ) चुनें।' },
      { icon: <Monitor size={14}/>,    text: 'अपना आधिकारिक @securevote.gov.in ईमेल पता दर्ज करें।' },
      { icon: <Lock size={14}/>,       text: 'अपना पासवर्ड दर्ज करें और "सुरक्षित लॉगिन" पर क्लिक करें।' },
      { icon: <Shield size={14}/>,     text: 'यदि पासवर्ड याद न हो तो "पासवर्ड भूल गए" का उपयोग करें।' },
    ] },
  { icon: <AlertCircle size={18}/>, title: 'समस्या निवारण',               color: '#d97706',
    steps: [
      { icon: <Wifi size={14}/>,       text: 'पहली विज़िट पर बैकएंड को जागने में ~50 सेकंड लग सकते हैं।' },
      { icon: <Key size={14}/>,        text: 'OTP न मिले तो मोबाइल नंबर जांचें और "OTP दोबारा भेजें" आज़माएं।' },
      { icon: <Shield size={14}/>,     text: 'कई विफल प्रयासों के बाद खाते अवरुद्ध हो जाते हैं।' },
      { icon: <HelpCircle size={14}/>, text: 'डेमो के लिए OTP हमेशा 123456 होता है।' },
    ] },
  { icon: <Info size={18}/>,       title: 'डेमो क्रेडेंशियल',             color: '#dc2626',
    steps: [
      { icon: <UserCog size={14}/>,    text: 'व्यवस्थापक: admin@securevote.gov.in / admin123' },
      { icon: <UserCog size={14}/>,    text: 'डीएम: dm@securevote.gov.in / dm123' },
      { icon: <UserCog size={14}/>,    text: 'एसडीएम: sdm@securevote.gov.in / sdm123' },
      { icon: <FileText size={14}/>,   text: 'मतदाता OTP (डेमो): 123456 — किसी भी पंजीकृत नंबर के साथ काम करता है।' },
    ] },
  { icon: <Shield size={18}/>,     title: 'सुरक्षा और गोपनीयता',          color: '#0891b2',
    steps: [
      { icon: <Lock size={14}/>,       text: 'सभी डेटा AES-256 एन्क्रिप्टेड और HTTPS पर प्रसारित होता है।' },
      { icon: <Shield size={14}/>,     text: 'मत अनाम होते हैं — आपकी पहचान कभी मतपत्र से नहीं जुड़ती।' },
      { icon: <Key size={14}/>,        text: 'सत्र टोकन निष्क्रियता के बाद स्वतः समाप्त हो जाते हैं।' },
      { icon: <FileText size={14}/>,   text: 'प्रत्येक क्रिया के लिए पूर्ण ब्लॉकचेन ऑडिट ट्रेल बनाए रखा जाता है।' },
    ] },
];

const getPwdStrength = (pwd: string) => {
  let s = 0;
  if (pwd.length >= 8) s++; if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++; if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return [
    { score:s, label:'Too short', labelHi:'बहुत छोटा', color:'#ef4444' },
    { score:s, label:'Weak',      labelHi:'कमज़ोर',     color:'#f97316' },
    { score:s, label:'Fair',      labelHi:'ठीक है',     color:'#eab308' },
    { score:s, label:'Good',      labelHi:'अच्छा',      color:'#3b82f6' },
    { score:s, label:'Strong',    labelHi:'मज़बूत',      color:'#22c55e' },
  ][s];
};

// ── Typewriter ────────────────────────────────────────────────────
function useTypewriter(phrases: readonly string[], speed = 65, delSpeed = 30, pause = 1800) {
  const [text, setText]      = useState('');
  const [pi, setPi]          = useState(0);
  const [ci, setCi]          = useState(0);
  const [del, setDel]        = useState(false);
  useEffect(() => {
    const cur = phrases[pi];
    const t = setTimeout(() => {
      if (!del) {
        if (ci < cur.length) { setText(cur.slice(0, ci + 1)); setCi(c => c + 1); }
        else setTimeout(() => setDel(true), pause);
      } else {
        if (ci > 0) { setText(cur.slice(0, ci - 1)); setCi(c => c - 1); }
        else { setDel(false); setPi(i => (i + 1) % phrases.length); }
      }
    }, del ? delSpeed : speed);
    return () => clearTimeout(t);
  }, [ci, del, pi, phrases, speed, delSpeed, pause]);
  return text;
}

// ── User Manual ───────────────────────────────────────────────────
function UserManual({ theme, lang, onOpenChange }: { theme: typeof COLOR_THEMES[0]; lang: Lang; onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen]                 = useState(false);
  const [expanded, setExpanded]         = useState<number | null>(null);
  const tx      = TRANSLATIONS[lang];
  const sections = lang === 'hi' ? MANUAL_HI : MANUAL_EN;

  return (
    <div style={{
      width: '100%', borderRadius: '0.75rem', overflow: 'hidden',
      border: `1px solid ${open ? theme.border : '#e2e8f0'}`,
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      boxShadow: open ? '0 20px 48px rgba(0,0,0,0.12),0 4px 16px rgba(0,0,0,0.08)' : '0 4px 16px rgba(0,0,0,0.06)',
    }} className="dark-manual-card">

      {/* Header */}
      <button onClick={() => { setOpen(o => { const next = !o; onOpenChange?.(next); return next; }); }} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 24px',
        background: open ? `linear-gradient(135deg,${theme.primary}12,${theme.secondary}08)` : 'rgba(255,255,255,0.98)',
        border: 'none', cursor: 'pointer', transition: 'background 0.3s ease',
        borderBottom: open ? '1px solid #f1f5f9' : 'none',
      }} className="dark-manual-btn">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${theme.primary},${theme.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookOpen size={18} style={{ color: '#fff' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }} className="dark-text">{tx.manualTitle}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{tx.manualSubtitle}</div>
          </div>
        </div>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: open ? `${theme.primary}18` : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s', flexShrink: 0 }}>
          <ChevronDown size={16} style={{ color: open ? theme.primary : '#64748b', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
        </div>
      </button>

      {/* Scrollable content */}
      <div style={{
        maxHeight: open ? '420px' : '0px',
        overflowY: open ? 'auto' : 'hidden', overflowX: 'hidden',
        transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1)',
        scrollbarWidth: 'thin', scrollbarColor: `${theme.primary}55 transparent`,
      } as React.CSSProperties} className="manual-scroll-area">
        <div style={{ padding: '0 24px 24px', background: 'rgba(255,255,255,0.98)' }} className="dark-manual-body">

          {/* Note */}
          <div style={{ padding: '12px 16px', borderRadius: 12, marginBottom: 16, background: `${theme.primary}0d`, border: `1.5px solid ${theme.border}`, display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 12 }}>
            <Info size={15} style={{ color: theme.primary, flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: theme.primary, lineHeight: 1.6, fontWeight: 500, margin: 0 }}>{tx.manualNote}</p>
          </div>

          {/* Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sections.map((sec, idx) => {
              const isOpen = expanded === idx;
              return (
                <div key={idx} style={{ borderRadius: 12, border: `1.5px solid ${isOpen ? sec.color + '40' : '#e2e8f0'}`, overflow: 'hidden', transition: 'border-color 0.25s, box-shadow 0.25s', boxShadow: isOpen ? `0 4px 20px ${sec.color}18` : 'none' }} className="dark-section-card">
                  <button onClick={() => setExpanded(isOpen ? null : idx)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: 'none', cursor: 'pointer', background: isOpen ? `${sec.color}0e` : 'transparent', transition: 'background 0.2s', textAlign: 'left' }} className="dark-section-btn">
                    <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: isOpen ? sec.color : `${sec.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.25s', color: isOpen ? '#fff' : sec.color }}>
                      {sec.icon}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, flex: 1, color: isOpen ? sec.color : '#1e293b', transition: 'color 0.2s' }} className="dark-text">{sec.title}</span>
                    <ChevronRight size={14} style={{ color: isOpen ? sec.color : '#94a3b8', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.25s, color 0.2s', flexShrink: 0 }} />
                  </button>
                  <div style={{ maxHeight: isOpen ? '400px' : '0px', overflow: 'hidden', transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)' }}>
                    <div style={{ padding: '4px 14px 14px' }}>
                      {sec.steps.map((step, si) => (
                        <div key={si} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderRadius: 8, marginBottom: 4, background: si % 2 === 0 ? `${sec.color}06` : 'transparent' }}>
                          <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: `${sec.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sec.color }}>{step.icon}</div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flex: 1 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: sec.color, borderRadius: 4, padding: '1px 5px', flexShrink: 0, marginTop: 1 }}>{si + 1}</span>
                            <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.55, margin: 0 }} className="dark-text-muted">{step.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }} className="dark-footer-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={14} style={{ color: theme.primary }} />
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{tx.versionLabel}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>{tx.systemOnline}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
export function Login() {
  const navigate = useNavigate();

  const [isDark, setIsDark]           = useState(() => typeof window !== 'undefined' && document.documentElement.classList.contains('dark'));
  const [manualOpen, setManualOpen]   = useState(false);
  const [lang, setLang]               = useState<Lang>('en');
  const [activeThemeIdx, setThemeIdx] = useState(0);
  const [showPalette, setShowPalette] = useState(false);
  const [hovFeat, setHovFeat]         = useState<number | null>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  const tx    = TRANSLATIONS[lang];
  const theme = COLOR_THEMES[activeThemeIdx];
  const typewriterText = useTypewriter([tx.tw1, tx.tw2, tx.tw3, tx.tw4]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent-primary',   theme.primary);
    root.style.setProperty('--accent-secondary', theme.secondary);
    root.style.setProperty('--accent-light',     theme.light);
    root.style.setProperty('--accent-dark',      theme.dark);
    root.style.setProperty('--accent-border',    theme.border);
  }, [activeThemeIdx, theme]);

  useEffect(() => {
    isDark ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) setShowPalette(false); };
    if (showPalette) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showPalette]);

  // Officer
  const [showPwd,      setShowPwd]      = useState(false);
  const [loginEmail,   setLoginEmail]   = useState('');
  const [loginPwd,     setLoginPwd]     = useState('');
  const [loading,      setLoading]      = useState(false);
  const [role,         setRole]         = useState('');
  const [showRoles,    setShowRoles]    = useState(false);

  // Voter
  const [vStep,        setVStep]        = useState<VoterStep>('number');
  const [vMethod,      setVMethod]      = useState('');
  const [showVMeth,    setShowVMeth]    = useState(false);
  const [vNum,         setVNum]         = useState('');
  const [vId,          setVId]          = useState('');
  const [vName,        setVName]        = useState('');
  const [otp,          setOtp]          = useState('');
  const [otpL,         setOtpL]         = useState(false);
  const [vPwd,         setVPwd]         = useState('');
  const [vConf,        setVConf]        = useState('');
  const [showVP,       setShowVP]       = useState(false);
  const [showVC,       setShowVC]       = useState(false);
  const [pwdL,         setPwdL]         = useState(false);

  const [errs, setErrs] = useState<Record<string, string>>({});
  const clrErr = (k: string) => setErrs(p => { const e = { ...p }; delete e[k]; return e; });

  // Forgot
  const [fStep,  setFStep]  = useState<ForgotStep>('idle');
  const [fEmail, setFEmail] = useState('');
  const [fOtp,   setFOtp]   = useState('');
  const [nPwd,   setNPwd]   = useState('');
  const [cPwd,   setCPwd]   = useState('');
  const [showNP, setShowNP] = useState(false);
  const [showCP, setShowCP] = useState(false);

  const roles  = ['voter', 'admin', 'dm', 'sdm', 'cdo'];
  const vOpts  = ['aadhaar number', 'eci card number'];
  const vStepIdx = ({ number:0, otp:1, 'create-password':2, 'enter-password':2 } as Record<string,number>)[vStep];
  const vLabels  = [tx.stepId, tx.stepOtp, vStep === 'enter-password' ? tx.stepPwdLogin : tx.stepCreatePwd];

  const FEATS = [
    { title: tx.feat1Title, desc: tx.feat1Desc, colorIdx: 0 },
    { title: tx.feat2Title, desc: tx.feat2Desc, colorIdx: 4 },
    { title: tx.feat3Title, desc: tx.feat3Desc, colorIdx: 1 },
  ];

  const valAadhaar = (v: string) => { const c = v.replace(/[-\s]/g,''); if (!v) return 'Aadhaar required'; if (!/^\d+$/.test(c)) return 'Digits only'; if (c.length !== 12) return '12 digits required'; return ''; };
  const valECI     = (v: string) => { if (!v) return 'ECI required'; if (v.trim().length < 5) return 'Min 5 chars'; if (!/^[A-Za-z0-9-]+$/.test(v.trim())) return 'Alphanumeric + hyphens'; return ''; };
  const valOTP     = (v: string) => { if (!v) return 'OTP required'; if (!/^\d{6}$/.test(v.trim())) return '6 digits required'; return ''; };
  const valEmail   = (v: string) => { if (!v) return 'Email required'; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Invalid email'; return ''; };
  const valPwd     = (v: string) => { if (!v) return 'Required'; if (v.length < 6) return 'Min 6 chars'; return ''; };

  const saveAuth = (token: string, user: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const resetVoter = () => { setVStep('number'); setVMethod(''); setVNum(''); setVId(''); setVName(''); setOtp(''); setVPwd(''); setVConf(''); setErrs({}); };

  const sendOTP = async () => {
    const err = vMethod === 'aadhaar number' ? valAadhaar(vNum) : valECI(vNum);
    if (err) { setErrs({ vNum: err }); return; }
    setErrs({}); setOtpL(true);
    try {
      const method = vMethod === 'aadhaar number' ? 'aadhaar' : 'eci';
      const res = await fetch(`${API}/auth/voter/send-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ method, number: vNum }) });
      const data = await res.json();
      toast.success('OTP sent!'); setVStep('otp');
      if (data.voterId) setVId(data.voterId); if (data.voterName) setVName(data.voterName);
    } catch { toast.success('OTP sent (demo: 123456)'); setVStep('otp'); }
    setOtpL(false);
  };

  const verifyOTP = async () => {
    const e = valOTP(otp); if (e) { setErrs({ otp: e }); return; }
    setErrs({}); setOtpL(true);
    const method = vMethod === 'aadhaar number' ? 'aadhaar' : 'eci';
    try {
      const res = await fetch(`${API}/auth/voter/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voterId: vId, otp: otp.trim(), method, number: vNum }) });
      const data = await res.json();
      if (data.blocked) { toast.error('🚫 Blocked', { description: data.message, duration: 8000 }); setOtpL(false); return; }
      if (data.needPassword) { if (data.voterId) setVId(data.voterId); if (data.voterName) setVName(data.voterName); setVStep('enter-password'); toast.success('OTP verified!'); setOtpL(false); return; }
      if (data.success && data.isNew) { if (data.user?.voterId) setVId(data.user.voterId); if (data.user?.name) setVName(data.user.name); localStorage.setItem('_tmp_token', data.token); localStorage.setItem('_tmp_user', JSON.stringify(data.user)); setVStep('create-password'); toast.success('OTP verified!'); setOtpL(false); return; }
      if (data.success && !data.isNew) { saveAuth(data.token, data.user); toast.success(`Welcome, ${data.user.name}!`); setTimeout(() => navigate('/voter-dashboard'), 500); setOtpL(false); return; }
      toast.error(data.message?.toLowerCase().includes('invalid otp') ? '❌ Invalid OTP' : data.message || 'Failed');
    } catch { toast.error('Cannot reach server'); }
    setOtpL(false);
  };

  const handleCreatePwd = async () => {
    const e = valPwd(vPwd); if (e) { setErrs({ vPwd: e }); return; }
    if (vPwd !== vConf) { setErrs({ vConf: tx.pwdNoMatch }); return; }
    setErrs({}); setPwdL(true);
    const tok = localStorage.getItem('_tmp_token'); const usr = JSON.parse(localStorage.getItem('_tmp_user') || '{}');
    try {
      await fetch(`${API}/auth/voter/set-password`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` }, body: JSON.stringify({ password: vPwd }) });
      localStorage.removeItem('_tmp_token'); localStorage.removeItem('_tmp_user');
      saveAuth(tok!, usr); toast.success('🎉 Welcome!'); setTimeout(() => navigate('/voter-dashboard'), 500);
    } catch {
      localStorage.removeItem('_tmp_token'); localStorage.removeItem('_tmp_user');
      if (tok && usr._id) { saveAuth(tok, usr); toast.success('Welcome!'); setTimeout(() => navigate('/voter-dashboard'), 500); }
      else toast.error('Cannot reach server');
    }
    setPwdL(false);
  };

  const handleSkip = () => { const tok = localStorage.getItem('_tmp_token'); const usr = JSON.parse(localStorage.getItem('_tmp_user') || '{}'); localStorage.removeItem('_tmp_token'); localStorage.removeItem('_tmp_user'); if (tok && usr._id) { saveAuth(tok, usr); toast.success(`Welcome!`); setTimeout(() => navigate('/voter-dashboard'), 500); } };

  const handleEnterPwd = async () => {
    const e = valPwd(vPwd); if (e) { setErrs({ vPwd: e }); return; }
    setErrs({}); setPwdL(true);
    const method = vMethod === 'aadhaar number' ? 'aadhaar' : 'eci';
    try {
      const res = await fetch(`${API}/auth/voter/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voterId: vId, otp: otp.trim(), method, number: vNum, password: vPwd }) });
      const data = await res.json();
      if (data.success) { saveAuth(data.token, data.user); toast.success(`Welcome, ${data.user.name}!`); setTimeout(() => navigate('/voter-dashboard'), 500); }
      else { toast.error(data.message || 'Incorrect password'); setErrs({ vPwd: data.message || 'Wrong password' }); }
    } catch { toast.error('Cannot reach server'); }
    setPwdL(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: loginEmail, password: loginPwd }) });
      const data = await res.json();
      if (data.success) {
        saveAuth(data.token, data.user); toast.success('Login successful!', { description: `Welcome, ${data.user.name}` });
        const routes: Record<string, string> = { admin: '/admin-dashboard', dm: '/dm-dashboard', sdm: '/sdm-dashboard', cdo: '/cdo-dashboard' };
        navigate(routes[data.user.role] || '/voter-dashboard');
      } else toast.error('Login failed', { description: data.message });
    } catch { toast.error('Cannot reach server'); }
    setLoading(false);
  };

  const fSendOtp = () => { if (!fEmail) { toast.error('Enter email'); return; } const v = ['admin@securevote.gov.in','dm@securevote.gov.in','sdm@securevote.gov.in','cdo@securevote.gov.in']; if (!v.includes(fEmail.toLowerCase())) { toast.error('Email not found'); return; } toast.success('OTP sent to ' + fEmail); setFStep('enter-otp'); };
  const fVerify  = () => { fOtp.trim() === '123456' ? setFStep('reset-password') : toast.error('Use 123456 for demo'); };
  const fReset   = () => { if (!nPwd || nPwd.length < 6) { toast.error('Min 6 chars'); return; } if (nPwd !== cPwd) { toast.error("No match"); return; } toast.success('Reset successful!'); setFStep('done'); setTimeout(() => { setFStep('idle'); setFEmail(''); setFOtp(''); setNPwd(''); setCPwd(''); }, 2000); };
  const cancelF  = () => { setFStep('idle'); setFEmail(''); setFOtp(''); setNPwd(''); setCPwd(''); };

  const css = `
    @keyframes borderPulse { 0%,100%{opacity:.6} 50%{opacity:1} }
    @keyframes paletteIn   { 0%{opacity:0;transform:translateY(12px) scale(.92)} 100%{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes swatchPop   { 0%{transform:scale(.6);opacity:0} 100%{transform:scale(1);opacity:1} }
    @keyframes blink       { 50%{opacity:0} }
    @keyframes pulse       { 0%,100%{opacity:1} 50%{opacity:.4} }
    @keyframes manualIn    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes langPop     { 0%{opacity:0;transform:scale(.85) translateY(6px)} 100%{opacity:1;transform:scale(1) translateY(0)} }

    .glow-card-wrapper { position:relative;border-radius:1rem;transition:transform .25s ease,box-shadow .25s ease; }
    .glow-card-wrapper:hover { transform:translateY(-4px);box-shadow:0 20px 48px rgba(99,102,241,.15),0 8px 24px rgba(0,0,0,.08); }
    .glow-card-wrapper::before { content:'';position:absolute;inset:-2px;border-radius:1.1rem;background:linear-gradient(135deg,var(--accent-primary),var(--accent-secondary),var(--accent-primary));opacity:0;transition:opacity .4s ease;z-index:0;animation:borderPulse 2.5s ease-in-out infinite; }
    .glow-card-wrapper:hover::before { opacity:1; }
    .glow-card-inner { position:relative;z-index:1;border-radius:1rem;overflow:hidden; }

    .feature-card { display:flex;align-items:flex-start;gap:12px;padding:16px;border-radius:12px;border:1.5px solid #e2e8f0;background:#fff;cursor:default;transition:all .25s ease; }
    .dark .feature-card { background:#1e293b;border-color:#334155; }
    .feature-card:hover { transform:translateX(6px);box-shadow:0 4px 20px rgba(0,0,0,.1); }
    .feature-card-icon { width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;transition:background .25s ease; }

    /* ── top-right fixed buttons ── */
    .topbar-btn { width:42px;height:42px;border-radius:50%;border:1.5px solid #e2e8f0;background:#fff;color:#1e293b;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.1);transition:all .25s ease; }
    .topbar-btn:hover { transform:scale(1.08);box-shadow:0 4px 14px rgba(0,0,0,.15); }
    .dark .topbar-btn { background:#1e293b;border-color:#334155;color:#f1f5f9; }

    /* ── Language button special ── */
    .lang-btn { position:fixed;top:16px;right:68px;z-index:1000;min-width:62px;height:42px;border-radius:22px;border:1.5px solid #e2e8f0;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;padding:0 12px;box-shadow:0 2px 8px rgba(0,0,0,.1);transition:all .25s ease; }
    .lang-btn:hover { transform:scale(1.06);box-shadow:0 4px 14px rgba(0,0,0,.15);border-color:var(--accent-primary); }
    .dark .lang-btn { background:#1e293b;border-color:#334155;color:#f1f5f9; }
    .lang-badge { font-size:10px;font-weight:800;letter-spacing:.04em;padding:2px 6px;border-radius:6px;background:var(--accent-primary);color:#fff;transition:background .3s; }

    .dark-mode-btn { position:fixed;top:16px;right:16px;z-index:1000; }

    /* ── Color FAB ── */
    .color-fab { position:fixed;bottom:20px;left:20px;z-index:1000;width:46px;height:46px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.18);transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease;background:conic-gradient(#ef4444 0deg 45deg,#f97316 45deg 90deg,#eab308 90deg 135deg,#22c55e 135deg 180deg,#06b6d4 180deg 225deg,#6366f1 225deg 270deg,#a855f7 270deg 315deg,#ec4899 315deg 360deg); }
    .color-fab:hover { transform:scale(1.12) rotate(20deg);box-shadow:0 8px 24px rgba(0,0,0,.22); }
    .color-fab-ring { width:32px;height:32px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;transition:background .3s; }
    .dark .color-fab-ring { background:#1e293b; }

    .pal-popup { position:fixed;bottom:76px;left:20px;z-index:999;background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;padding:14px;box-shadow:0 8px 32px rgba(0,0,0,.14);animation:paletteIn .22s cubic-bezier(.34,1.56,.64,1) forwards;min-width:200px; }
    .dark .pal-popup { background:#1e293b;border-color:#334155; }
    .pal-title { font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #f1f5f9; }
    .dark .pal-title { border-bottom-color:#334155; }
    .sw-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:8px; }
    .sw { display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;border:none;background:none;padding:0; }
    .sw-c { width:32px;height:32px;border-radius:50%;border:2.5px solid transparent;transition:transform .18s cubic-bezier(.34,1.56,.64,1),border-color .15s,box-shadow .15s;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff; }
    .sw:hover .sw-c { transform:scale(1.18); }
    .sw.act .sw-c { border-color:#1e293b;box-shadow:0 0 0 2px #fff,0 0 0 4px var(--accent-primary);transform:scale(1.12); }
    .dark .sw.act .sw-c { border-color:#f1f5f9;box-shadow:0 0 0 2px #1e293b,0 0 0 4px var(--accent-primary); }
    .sw-lbl { font-size:8.5px;color:#94a3b8;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:40px;text-align:center; }

    .tw-cursor { border-right:2.5px solid var(--accent-primary);animation:blink .85s step-end infinite;margin-left:2px;padding-right:2px; }

    /* Manual */
    .dark .dark-manual-card { border-color:#334155 !important;background:rgba(15,23,42,.98); }
    .dark .dark-manual-btn  { background:rgba(15,23,42,.98) !important;border-bottom-color:#1e293b !important; }
    .dark .dark-manual-body { background:rgba(15,23,42,.98) !important; }
    .dark .dark-text        { color:#f1f5f9 !important; }
    .dark .dark-text-muted  { color:#94a3b8 !important; }
    .dark .dark-section-card{ border-color:#334155 !important;background:rgba(30,41,59,.5); }
    .dark .dark-section-btn { background:transparent !important; }
    .dark .dark-footer-bar  { background:rgba(30,41,59,.8) !important;border-color:#334155 !important; }
    .manual-scroll-area::-webkit-scrollbar { width:5px; }
    .manual-scroll-area::-webkit-scrollbar-track { background:transparent; }
    .manual-scroll-area::-webkit-scrollbar-thumb { background:var(--accent-primary);border-radius:99px;opacity:.5; }
    .manual-wrapper { animation:manualIn .5s ease .3s both; }

    /* Language transition */
    .lang-fade { animation:langPop .25s ease both; }

    /* ── Footer border glow sweep ── */
    @keyframes borderSweep {
      0%   { background-position: 200% center; }
      100% { background-position: -200% center; }
    }
    .footer-border-glow {
      animation: borderSweep 3s linear infinite;
      background-size: 200% 100% !important;
    }

    /* ── Tricolour text sweep ── */
    @keyframes tricolourSweep {
      0%   { background-position: 200% center; }
      100% { background-position: -200% center; }
    }
    .tricolour-sweep {
      background: linear-gradient(
        90deg,
        #FF9933 0%,
        #FF9933 20%,
        #ffffff 33%,
        #ffffff 46%,
        #138808 60%,
        #138808 75%,
        #FF9933 88%,
        #FF9933 100%
      );
      background-size: 250% auto;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: tricolourSweep 4s linear infinite;
    }
  `;

  const renderForgot = () => (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <button type="button" onClick={cancelF} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><ArrowLeft className="w-4 h-4" /></button>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-base">
            {fStep==='enter-email'&&tx.forgotTitle}{fStep==='enter-otp'&&tx.verifyOtpTitle}{fStep==='reset-password'&&tx.setNewPwd}{fStep==='done'&&tx.pwdResetTitle}
          </h3>
          <p className="text-xs text-gray-500">
            {fStep==='enter-email'&&tx.enterRegEmail}{fStep==='enter-otp'&&`${tx.otpSentTo} ${fEmail}`}{fStep==='reset-password'&&tx.chooseStrongPwd}{fStep==='done'&&tx.nowLogin}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4">
        {['enter-email','enter-otp','reset-password'].map((step,i) => {
          const steps: ForgotStep[] = ['enter-email','enter-otp','reset-password'];
          const ci2 = steps.indexOf(fStep as ForgotStep);
          const done = i < ci2 || fStep==='done', active = steps[i]===fStep;
          return (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div style={{ width:26,height:26,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,background:done?'#16a34a':active?theme.primary:'#e2e8f0',color:done||active?'#fff':'#94a3b8' }}>{done?'✓':i+1}</div>
              {i<2&&<div style={{ flex:1,height:2,background:done?'#16a34a':'#e2e8f0',borderRadius:2 }}/>}
            </div>
          );
        })}
      </div>
      {fStep==='enter-email'&&(<div className="space-y-4"><div className="space-y-2"><Label>{tx.regEmail}</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/><Input type="email" placeholder={tx.emailPh} value={fEmail} onChange={e=>setFEmail(e.target.value)} className="pl-9"/></div></div><Button type="button" className="w-full" style={{background:theme.primary}} onClick={fSendOtp}>{tx.sendResetOtp}</Button></div>)}
      {fStep==='enter-otp'&&(<div className="space-y-4"><div className="space-y-2"><Label>{tx.enterOtp}</Label><Input placeholder={`${tx.otpPlaceholder} (demo: 123456)`} value={fOtp} onChange={e=>setFOtp(e.target.value)} maxLength={6}/><p className="text-xs text-gray-500">{tx.didntReceive}{' '}<button type="button" className="underline" style={{color:theme.primary}} onClick={()=>toast.success('OTP resent')}>{tx.resendOtp}</button></p></div><Button type="button" className="w-full" style={{background:theme.primary}} onClick={fVerify}>{tx.verifyOtpBtn}</Button></div>)}
      {fStep==='reset-password'&&(<div className="space-y-4">
        {[{lbl:tx.newPassword,val:nPwd,set:setNPwd,show:showNP,tog:()=>setShowNP(!showNP),ph:tx.enterNewPwd},{lbl:tx.confirmPassword,val:cPwd,set:setCPwd,show:showCP,tog:()=>setShowCP(!showCP),ph:tx.confirmNewPwd}].map(({lbl,val,set,show,tog,ph})=>(
          <div key={lbl} className="space-y-2"><Label>{lbl}</Label><div className="relative"><Input type={show?'text':'password'} placeholder={ph} value={val} onChange={e=>(set as any)(e.target.value)}/><button type="button" onClick={tog} className="absolute right-3 top-1/2 -translate-y-1/2">{show?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div></div>
        ))}
        {cPwd&&nPwd!==cPwd&&<p className="text-xs text-red-500">{tx.pwdNoMatch}</p>}
        {cPwd&&nPwd===cPwd&&<p className="text-xs text-green-600">{tx.pwdMatch}</p>}
        <Button type="button" className="w-full" style={{background:theme.primary}} onClick={fReset}><KeyRound className="w-4 h-4 mr-2"/>{tx.resetPwd}</Button>
      </div>)}
      {fStep==='done'&&(<div className="text-center py-4 space-y-3"><div style={{width:56,height:56,borderRadius:'50%',background:'#dcfce7',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto'}}><CheckCircle2 className="w-8 h-8 text-green-600"/></div><p className="text-green-700 font-semibold">{tx.pwdResetSuccess}</p><p className="text-sm text-gray-500">{tx.redirecting}</p></div>)}
    </div>
  );

  return (
    <>
      <style>{css}</style>

      {/* ── Language toggle — fixed top-right, left of dark mode ── */}
      <button className="lang-btn" onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')} title="Switch language">
        <Languages size={15} style={{ color: theme.primary, flexShrink: 0 }} />
        <span className="lang-badge">{lang === 'en' ? 'हिंदी' : 'EN'}</span>
      </button>

      {/* ── Dark mode toggle ── */}
      <button className="topbar-btn dark-mode-btn" onClick={() => setIsDark(!isDark)} title={isDark ? 'Light mode' : 'Dark mode'}>
        {isDark ? <Sun style={{ width: 18, height: 18 }} /> : <Moon style={{ width: 18, height: 18 }} />}
      </button>

      {/* ── Color FAB ── */}
      <div ref={paletteRef}>
        {showPalette && (
          <div className="pal-popup">
            <div className="pal-title">🎨 {lang === 'hi' ? 'रंग चुनें' : 'Choose Accent Color'}</div>
            <div className="sw-grid">
              {COLOR_THEMES.map((t, i) => (
                <button key={t.name} className={`sw ${activeThemeIdx === i ? 'act' : ''}`} onClick={() => setThemeIdx(i)} title={t.name} style={{ '--accent-primary': t.primary } as React.CSSProperties}>
                  <div className="sw-c" style={{ background: `linear-gradient(135deg,${t.primary},${t.secondary})`, animation: 'swatchPop .22s ease forwards' }}>{activeThemeIdx === i && '✓'}</div>
                  <span className="sw-lbl">{t.name}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: `linear-gradient(135deg,${theme.primary},${theme.secondary})` }} />
              <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Active: {theme.name}</span>
            </div>
          </div>
        )}
        <button className="color-fab" onClick={() => setShowPalette(p => !p)} title="Change accent color">
          <div className="color-fab-ring"><Palette style={{ width: 16, height: 16, color: theme.primary }} /></div>
        </button>
      </div>

      {/* ── Page ── */}
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">

        {/* Header with Snail-Spiral Mehndi + Tricolour Title */}
        <div className="w-full text-center mb-8 lang-fade" key={lang}>

          {/* Govt label */}
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: theme.primary }}>{tx.govtLabel}</p>

          {/* Snail mehndi LEFT + Tricolour title + Snail mehndi RIGHT — with flanking lines */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'nowrap' }}>

            {/* ── Left flanking line (same style as subtitle line) ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <div style={{ height: 1, width: 40, background: `linear-gradient(to right, transparent, ${theme.primary})` }} />
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: theme.primary, flexShrink: 0 }} />
              <div style={{ height: 1, width: 18, background: theme.primary, opacity: 0.5 }} />
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: theme.secondary, flexShrink: 0 }} />
            </div>

            {/* ── LEFT snail/spiral mehndi ── */}
            <svg width="170" height="60" viewBox="0 0 170 60" style={{ flexShrink: 0 }}>
              {/* Horizontal base line */}
              <line x1="8" y1="30" x2="162" y2="30" stroke="#8B5E1A" strokeWidth="1.2" opacity="0.5"/>

              {/* SNAIL 1 — large, centred at x=130, y=30 */}
              {/* Outer spiral arc */}
              <path d="M150 30 C150 18, 140 10, 130 10 C120 10, 112 18, 112 28 C112 36, 118 42, 126 42 C133 42, 138 37, 138 31 C138 26, 134 22, 130 22 C126 22, 123 25, 123 29 C123 32, 125 34, 128 34 C130 34, 132 32, 132 30" fill="none" stroke="#FF9933" strokeWidth="1.5" strokeLinecap="round"/>
              {/* Inner tight coil */}
              <path d="M132 30 C132 27, 130 25, 128 26 C126 27, 126 30, 128 31" fill="none" stroke="#8B5E1A" strokeWidth="1.2" strokeLinecap="round"/>
              {/* Snail dot centre */}
              <circle cx="129" cy="29" r="2" fill="#138808" opacity="0.85"/>
              {/* Snail tail curling right */}
              <path d="M150 30 C154 28, 158 24, 156 20 C154 16, 150 16, 148 19" fill="none" stroke="#FF9933" strokeWidth="1.2" strokeLinecap="round"/>
              {/* tiny tail-end dot */}
              <circle cx="148" cy="20" r="1.5" fill="#FF9933" opacity="0.7"/>

              {/* SNAIL 2 — medium, centred at x=92, y=30 */}
              <path d="M108 30 C108 21, 100 15, 92 15 C84 15, 77 22, 77 30 C77 37, 82 42, 89 42 C95 42, 99 38, 99 32 C99 27, 96 24, 92 24 C88 24, 86 27, 86 30 C86 33, 88 35, 91 35" fill="none" stroke="#138808" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M91 35 C93 35, 94 33, 93 31" fill="none" stroke="#8B5E1A" strokeWidth="1" strokeLinecap="round"/>
              <circle cx="92" cy="30" r="1.8" fill="#FF9933" opacity="0.9"/>
              {/* tail curling right */}
              <path d="M108 30 C112 28, 115 22, 113 18" fill="none" stroke="#138808" strokeWidth="1" strokeLinecap="round"/>
              <circle cx="113" cy="19" r="1.3" fill="#138808" opacity="0.65"/>

              {/* SNAIL 3 — small, centred at x=58, y=30 */}
              <path d="M70 30 C70 23, 64 18, 58 18 C52 18, 47 23, 47 30 C47 36, 51 40, 56 40 C60 40, 63 37, 63 33 C63 29, 61 27, 58 27 C56 27, 55 29, 56 31" fill="none" stroke="#8B5E1A" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M56 31 C57 32, 58 32, 59 31" fill="none" stroke="#FF9933" strokeWidth="1" strokeLinecap="round"/>
              <circle cx="58" cy="30" r="1.5" fill="#138808" opacity="0.85"/>
              {/* tail */}
              <path d="M70 30 C73 27, 75 23, 73 20" fill="none" stroke="#8B5E1A" strokeWidth="0.9" strokeLinecap="round"/>
              <circle cx="73" cy="21" r="1.2" fill="#8B5E1A" opacity="0.55"/>

              {/* SNAIL 4 — tiny, centred at x=28, y=30 */}
              <path d="M36 30 C36 25, 32 21, 28 21 C24 21, 20 25, 20 30 C20 35, 23 38, 27 38 C30 38, 32 36, 32 33 C32 31, 31 29, 29 29 C27 29, 26 31, 27 32" fill="none" stroke="#FF9933" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="28" cy="30" r="1.3" fill="#8B5E1A" opacity="0.8"/>
              {/* tail */}
              <path d="M36 30 C39 28, 41 25, 39 22" fill="none" stroke="#FF9933" strokeWidth="0.9" strokeLinecap="round"/>
              <circle cx="39" cy="23" r="1" fill="#FF9933" opacity="0.6"/>

              {/* End dot at x=8 */}
              <circle cx="10" cy="30" r="2.2" fill="#8B5E1A" opacity="0.55"/>
              <circle cx="10" cy="30" r="1" fill="#FF9933" opacity="0.7"/>

              {/* Decorative accent dots between snails */}
              <circle cx="119" cy="30" r="1.5" fill="#138808" opacity="0.5"/>
              <circle cx="75"  cy="30" r="1.5" fill="#FF9933" opacity="0.5"/>
              <circle cx="44"  cy="30" r="1.5" fill="#8B5E1A" opacity="0.45"/>
              <circle cx="160" cy="30" r="2"   fill="#8B5E1A" opacity="0.4"/>
            </svg>

            {/* ── Tricolour title: animated sweep like footer bar ── */}
            <h1
              className="tricolour-sweep"
              style={{
                fontSize: 'clamp(17px, 2.6vw, 27px)',
                fontWeight: 900,
                letterSpacing: '-0.01em',
                lineHeight: 1,
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {tx.commissionTitle}
            </h1>

            {/* ── RIGHT snail/spiral mehndi (mirror) ── */}
            <svg width="170" height="60" viewBox="0 0 170 60" style={{ flexShrink: 0, transform: 'scaleX(-1)' }}>
              <line x1="8" y1="30" x2="162" y2="30" stroke="#8B5E1A" strokeWidth="1.2" opacity="0.5"/>
              <path d="M150 30 C150 18, 140 10, 130 10 C120 10, 112 18, 112 28 C112 36, 118 42, 126 42 C133 42, 138 37, 138 31 C138 26, 134 22, 130 22 C126 22, 123 25, 123 29 C123 32, 125 34, 128 34 C130 34, 132 32, 132 30" fill="none" stroke="#FF9933" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M132 30 C132 27, 130 25, 128 26 C126 27, 126 30, 128 31" fill="none" stroke="#8B5E1A" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="129" cy="29" r="2" fill="#138808" opacity="0.85"/>
              <path d="M150 30 C154 28, 158 24, 156 20 C154 16, 150 16, 148 19" fill="none" stroke="#FF9933" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="148" cy="20" r="1.5" fill="#FF9933" opacity="0.7"/>
              <path d="M108 30 C108 21, 100 15, 92 15 C84 15, 77 22, 77 30 C77 37, 82 42, 89 42 C95 42, 99 38, 99 32 C99 27, 96 24, 92 24 C88 24, 86 27, 86 30 C86 33, 88 35, 91 35" fill="none" stroke="#138808" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M91 35 C93 35, 94 33, 93 31" fill="none" stroke="#8B5E1A" strokeWidth="1" strokeLinecap="round"/>
              <circle cx="92" cy="30" r="1.8" fill="#FF9933" opacity="0.9"/>
              <path d="M108 30 C112 28, 115 22, 113 18" fill="none" stroke="#138808" strokeWidth="1" strokeLinecap="round"/>
              <circle cx="113" cy="19" r="1.3" fill="#138808" opacity="0.65"/>
              <path d="M70 30 C70 23, 64 18, 58 18 C52 18, 47 23, 47 30 C47 36, 51 40, 56 40 C60 40, 63 37, 63 33 C63 29, 61 27, 58 27 C56 27, 55 29, 56 31" fill="none" stroke="#8B5E1A" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M56 31 C57 32, 58 32, 59 31" fill="none" stroke="#FF9933" strokeWidth="1" strokeLinecap="round"/>
              <circle cx="58" cy="30" r="1.5" fill="#138808" opacity="0.85"/>
              <path d="M70 30 C73 27, 75 23, 73 20" fill="none" stroke="#8B5E1A" strokeWidth="0.9" strokeLinecap="round"/>
              <circle cx="73" cy="21" r="1.2" fill="#8B5E1A" opacity="0.55"/>
              <path d="M36 30 C36 25, 32 21, 28 21 C24 21, 20 25, 20 30 C20 35, 23 38, 27 38 C30 38, 32 36, 32 33 C32 31, 31 29, 29 29 C27 29, 26 31, 27 32" fill="none" stroke="#FF9933" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="28" cy="30" r="1.3" fill="#8B5E1A" opacity="0.8"/>
              <path d="M36 30 C39 28, 41 25, 39 22" fill="none" stroke="#FF9933" strokeWidth="0.9" strokeLinecap="round"/>
              <circle cx="39" cy="23" r="1" fill="#FF9933" opacity="0.6"/>
              <circle cx="10" cy="30" r="2.2" fill="#8B5E1A" opacity="0.55"/>
              <circle cx="10" cy="30" r="1"   fill="#FF9933" opacity="0.7"/>
              <circle cx="119" cy="30" r="1.5" fill="#138808" opacity="0.5"/>
              <circle cx="75"  cy="30" r="1.5" fill="#FF9933" opacity="0.5"/>
              <circle cx="44"  cy="30" r="1.5" fill="#8B5E1A" opacity="0.45"/>
              <circle cx="160" cy="30" r="2"   fill="#8B5E1A" opacity="0.4"/>
            </svg>
            {/* ── Right flanking line (mirror) ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: theme.secondary, flexShrink: 0 }} />
              <div style={{ height: 1, width: 18, background: theme.secondary, opacity: 0.5 }} />
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: theme.primary, flexShrink: 0 }} />
              <div style={{ height: 1, width: 40, background: `linear-gradient(to left, transparent, ${theme.primary})` }} />
            </div>

          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{tx.subtitle}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <div style={{ height: 1, width: 60, background: `linear-gradient(to right,transparent,${theme.primary})` }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: theme.primary }} />
            <div style={{ height: 1, width: 120, background: '#e2e8f0' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: theme.secondary }} />
            <div style={{ height: 1, width: 60, background: `linear-gradient(to left,transparent,${theme.secondary})` }} />
          </div>
        </div>

                {/* Grid */}
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-start">

          {/* LEFT */}
          <div className="space-y-6 text-center lg:text-left lang-fade" key={`left-${lang}`} style={{ position: 'sticky', top: 24 }}>
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="p-4 rounded-2xl shadow-lg" style={{ background: `linear-gradient(135deg,${theme.primary},${theme.secondary})` }}>
                <Shield className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right,${theme.primary},${theme.secondary})` }}>SecureVote Pro</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{tx.platformSub}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white" style={{ minHeight: '2.5rem' }}>
                <span>{typewriterText}</span><span className="tw-cursor">&nbsp;</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">{tx.heroDesc}</p>
            </div>

            <div className="grid gap-3 pt-2">
              {FEATS.map((item, i) => {
                const hov = hovFeat === i;
                const t   = COLOR_THEMES[item.colorIdx];
                return (
                  <div key={i} className="feature-card" onMouseEnter={() => setHovFeat(i)} onMouseLeave={() => setHovFeat(null)}
                    style={{ background: hov ? (isDark ? t.dark : t.light) : undefined, borderColor: hov ? t.border : undefined }}>
                    <div className="feature-card-icon" style={{ background: hov ? t.primary : (isDark ? '#334155' : '#f1f5f9') }}>
                      <CheckCircle2 style={{ width: 18, height: 18, color: hov ? '#fff' : t.primary, transition: 'color .25s ease' }} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-sm" style={{ color: hov ? t.primary : undefined, transition: 'color .25s ease' }}>{item.title}</h3>
                      <p className="text-xs mt-0.5" style={{ color: hov ? t.primary + 'bb' : undefined, transition: 'color .25s ease' }}>{item.desc}</p>
                    </div>
                    {hov && <div style={{ marginLeft: 'auto', color: t.primary, fontSize: 18, fontWeight: 700, flexShrink: 0 }}>→</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="glow-card-wrapper">
              <div className="glow-card-inner">
                <Card className="w-full shadow-2xl border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-2xl dark:text-white lang-fade" key={`ct-${lang}`}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>

                        <span>{fStep !== 'idle' ? tx.recoveryTitle : tx.cardTitle}</span>

                        {/* ECI Logo — 3 thick tricolour bars with 3 circles above-right, bigger */}
                        {fStep === 'idle' && (
                          <div style={{ flexShrink: 0 }}>
                            <svg width="72" height="68" viewBox="0 0 72 68" fill="none">

                              {/* ── 3 teal circles stacked top-right ── */}
                              <circle cx="56" cy="10" r="9"   fill="#29B6C8"/>
                              <circle cx="62" cy="28" r="7"   fill="#29B6C8" opacity="0.85"/>
                              <circle cx="58" cy="44" r="5"   fill="#29B6C8" opacity="0.7"/>

                              {/* ── 3 thick horizontal bars (tricolour), rotated ~-12deg ── */}
                              {/* Black outer border rect — slightly larger */}
                              <rect x="4" y="14" width="48" height="46" rx="3"
                                fill="#1a1a1a"
                                transform="rotate(-12 28 37)"/>

                              {/* Saffron / Orange bar — top */}
                              <rect x="4" y="14" width="48" height="14" rx="2"
                                fill="#FF9933"
                                transform="rotate(-12 28 37)"/>

                              {/* White bar — middle */}
                              <rect x="4" y="28" width="48" height="14"
                                fill="#FFFFFF"
                                transform="rotate(-12 28 37)"/>

                              {/* Green bar — bottom */}
                              <rect x="4" y="42" width="48" height="18" rx="2"
                                fill="#138808"
                                transform="rotate(-12 28 37)"/>

                              {/* Black outline over all bars */}
                              <rect x="4" y="14" width="48" height="46" rx="3"
                                fill="none" stroke="#1a1a1a" strokeWidth="3"
                                transform="rotate(-12 28 37)"/>

                              {/* Divider line between saffron and white */}
                              <line x1="4" y1="28" x2="52" y2="28"
                                stroke="#1a1a1a" strokeWidth="1.8"
                                transform="rotate(-12 28 37)"/>

                              {/* Divider line between white and green */}
                              <line x1="4" y1="42" x2="52" y2="42"
                                stroke="#1a1a1a" strokeWidth="1.8"
                                transform="rotate(-12 28 37)"/>

                              {/* Ballot slot cut into top bar */}
                              <rect x="14" y="17" width="22" height="3.5" rx="1.5"
                                fill="#1a1a1a"
                                transform="rotate(-12 28 37)"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription className="lang-fade" key={`cd-${lang}`}>
                      {fStep !== 'idle' ? tx.recoveryDesc : tx.cardDesc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {fStep !== 'idle' ? renderForgot() : (
                      <form onSubmit={handleLogin} className="space-y-6 lang-fade" key={`form-${lang}`}>

                        {/* Role */}
                        <div className="space-y-2">
                          <Label>{tx.selectRole}</Label>
                          <button type="button" onClick={() => { setShowRoles(!showRoles); clrErr('role'); }}
                            className={`w-full border rounded-md px-3 py-2 text-left dark:text-white ${errs.role ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}>
                            {role ? role.toUpperCase() : tx.chooseRole}
                          </button>
                          {showRoles && (
                            <div className="max-h-28 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-md">
                              {roles.map(r => (
                                <button key={r} type="button" onClick={() => { setRole(r); setShowRoles(false); resetVoter(); }}
                                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm dark:text-white">
                                  {r.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* VOTER */}
                        {role === 'voter' && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-1.5">
                              {vLabels.map((lbl, i) => {
                                const done = i < vStepIdx, active = i === vStepIdx;
                                return (
                                  <div key={i} className="flex items-center gap-1.5 flex-1">
                                    <div className="flex flex-col items-center gap-0.5" style={{ minWidth: 0 }}>
                                      <div style={{ width:22,height:22,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,background:done?'#16a34a':active?theme.primary:'#e2e8f0',color:done||active?'#fff':'#94a3b8' }}>{done?'✓':i+1}</div>
                                      <span style={{ fontSize:9,color:active?theme.primary:done?'#16a34a':'#94a3b8',fontWeight:600,whiteSpace:'nowrap' }}>{lbl}</span>
                                    </div>
                                    {i < 2 && <div style={{ flex:1,height:1.5,background:done?'#16a34a':'#e2e8f0',borderRadius:2,marginBottom:12 }}/>}
                                  </div>
                                );
                              })}
                            </div>

                            {vStep === 'number' && (
                              <>
                                <div className="space-y-2">
                                  <Label>{tx.verifyMethod}</Label>
                                  <button type="button" onClick={() => setShowVMeth(!showVMeth)} className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-left dark:text-white">
                                    {vMethod ? vMethod.toUpperCase() : tx.chooseMethod}
                                  </button>
                                  {showVMeth && (
                                    <div className="max-h-24 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-md">
                                      {vOpts.map(o => (<button key={o} type="button" onClick={() => { setVMethod(o); setShowVMeth(false); }} className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm dark:text-white">{o.toUpperCase()}</button>))}
                                    </div>
                                  )}
                                </div>
                                {vMethod && (
                                  <div className="space-y-2">
                                    <Label>{tx.enterLabel} {vMethod}</Label>
                                    <Input placeholder={vMethod==='aadhaar number'?'1234-5678-9012':'ECI-VTR-001'} value={vNum} className={errs.vNum?'border-red-500':''}
                                      onChange={e=>{setVNum(e.target.value);clrErr('vNum');}}
                                      onBlur={()=>{if(vNum){const e=vMethod==='aadhaar number'?valAadhaar(vNum):valECI(vNum);if(e)setErrs(p=>({...p,vNum:e}));}}}/>
                                    {errs.vNum&&<p className="text-xs text-red-500">⚠ {errs.vNum}</p>}
                                  </div>
                                )}
                                {vMethod&&vNum&&(<Button type="button" className="w-full" style={{background:theme.primary}} onClick={sendOTP} disabled={otpL}>{otpL?tx.sendingOtp:tx.sendOtp}</Button>)}
                              </>
                            )}

                            {vStep === 'otp' && (
                              <>
                                <div className="p-3 rounded-lg border text-sm" style={{background:theme.light,borderColor:theme.border,color:theme.primary}}>{tx.otpSentMsg} <strong>{vNum}</strong></div>
                                {vName&&(<div className="flex items-center gap-2 p-2 bg-green-50 rounded-md border border-green-200"><CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0"/><span className="text-sm text-green-700 font-medium">{tx.voterFound} {vName}</span></div>)}
                                <div className="space-y-2">
                                  <Label>{tx.enterOtp}</Label>
                                  <Input placeholder={tx.otpPlaceholder} value={otp} maxLength={6} className={errs.otp?'border-red-500':''} onChange={e=>{setOtp(e.target.value.replace(/\D/g,''));clrErr('otp');}}/>
                                  {errs.otp&&<p className="text-xs text-red-500">⚠ {errs.otp}</p>}
                                </div>
                                <Button type="button" className="w-full" style={{background:theme.primary}} onClick={verifyOTP} disabled={otpL}>{otpL?tx.verifying:tx.verifyOtpBtn}</Button>
                                <button type="button" className="text-xs hover:underline w-full text-center" style={{color:theme.primary}} onClick={()=>{setVStep('number');setOtp('');setErrs({});}}>{tx.changeMethod} {vMethod}</button>
                              </>
                            )}

                            {vStep === 'create-password' && (
                              <>
                                <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-sm text-green-700"><p className="font-semibold">{tx.otpVerifiedNew}</p><p className="text-xs mt-0.5">{tx.createPwdHint}</p></div>
                                <div className="space-y-2">
                                  <Label>{tx.createPwd}</Label>
                                  <div className="relative">
                                    <Input type={showVP?'text':'password'} placeholder={tx.pwdPlaceholder} value={vPwd} className={errs.vPwd?'border-red-500':''} onChange={e=>{setVPwd(e.target.value);clrErr('vPwd');}}/>
                                    <button type="button" onClick={()=>setShowVP(!showVP)} className="absolute right-3 top-1/2 -translate-y-1/2">{showVP?<EyeOff className="w-4 h-4 text-gray-400"/>:<Eye className="w-4 h-4 text-gray-400"/>}</button>
                                  </div>
                                  {vPwd&&(()=>{const s=getPwdStrength(vPwd);return(<div><div style={{height:4,background:'#e2e8f0',borderRadius:4,overflow:'hidden',marginTop:6}}><div style={{height:'100%',width:`${(s.score/4)*100}%`,background:s.color,borderRadius:4,transition:'width .3s ease'}}/></div><p style={{fontSize:11,color:s.color,fontWeight:600,marginTop:3}}>{lang==='hi'?s.labelHi:s.label}</p></div>)})()}
                                  {errs.vPwd&&<p className="text-xs text-red-500">⚠ {errs.vPwd}</p>}
                                </div>
                                <div className="space-y-2">
                                  <Label>{tx.confirmPwd}</Label>
                                  <div className="relative">
                                    <Input type={showVC?'text':'password'} placeholder={tx.rePwdPlaceholder} value={vConf} className={errs.vConf?'border-red-500':''} onChange={e=>{setVConf(e.target.value);clrErr('vConf');}}/>
                                    <button type="button" onClick={()=>setShowVC(!showVC)} className="absolute right-3 top-1/2 -translate-y-1/2">{showVC?<EyeOff className="w-4 h-4 text-gray-400"/>:<Eye className="w-4 h-4 text-gray-400"/>}</button>
                                  </div>
                                  {vConf&&vPwd!==vConf&&<p className="text-xs text-red-500">{tx.pwdNoMatch}</p>}
                                  {vConf&&vPwd===vConf&&vPwd.length>=6&&<p className="text-xs text-green-600">{tx.pwdMatch}</p>}
                                  {errs.vConf&&<p className="text-xs text-red-500">⚠ {errs.vConf}</p>}
                                </div>
                                <Button type="button" className="w-full" style={{background:theme.primary}} onClick={handleCreatePwd} disabled={pwdL}><Lock className="w-4 h-4 mr-2"/>{pwdL?tx.creating:tx.createAccount}</Button>
                                <button type="button" className="text-xs text-gray-400 hover:text-gray-600 w-full text-center hover:underline" onClick={handleSkip}>{tx.skipPwd}</button>
                              </>
                            )}

                            {vStep === 'enter-password' && (
                              <>
                                <div className="p-3 rounded-lg border text-sm" style={{background:theme.light,borderColor:theme.border,color:theme.primary}}><p className="font-semibold">{tx.otpVerifiedBack}</p><p className="text-xs mt-0.5">{tx.welcomeBack} <strong>{vName}</strong>. {tx.enterPwdCont}</p></div>
                                <div className="space-y-2">
                                  <Label>{tx.yourPwd}</Label>
                                  <div className="relative">
                                    <Input type={showVP?'text':'password'} placeholder={tx.enterPwdPh} value={vPwd} className={errs.vPwd?'border-red-500':''} onChange={e=>{setVPwd(e.target.value);clrErr('vPwd');}} onKeyDown={e=>{if(e.key==='Enter')handleEnterPwd();}} autoFocus/>
                                    <button type="button" onClick={()=>setShowVP(!showVP)} className="absolute right-3 top-1/2 -translate-y-1/2">{showVP?<EyeOff className="w-4 h-4 text-gray-400"/>:<Eye className="w-4 h-4 text-gray-400"/>}</button>
                                  </div>
                                  {errs.vPwd&&<p className="text-xs text-red-500">⚠ {errs.vPwd}</p>}
                                </div>
                                <Button type="button" className="w-full" style={{background:theme.primary}} onClick={handleEnterPwd} disabled={pwdL}><Lock className="w-4 h-4 mr-2"/>{pwdL?tx.signingIn:tx.secureLogin}</Button>
                                <button type="button" className="text-xs hover:underline w-full text-center" style={{color:theme.primary}} onClick={()=>{setVStep('otp');setVPwd('');setErrs({});}}>{tx.backToOtp}</button>
                              </>
                            )}
                          </div>
                        )}

                        {/* OFFICER */}
                        {role !== 'voter' && role !== '' && (
                          <>
                            <div className="space-y-2">
                              <Label>{tx.emailAddr}</Label>
                              <Input type="email" placeholder={tx.emailPh} value={loginEmail} disabled={loading} className={errs.email?'border-red-500':''}
                                onChange={e=>{setLoginEmail(e.target.value);clrErr('email');}}
                                onBlur={()=>{const e=valEmail(loginEmail);if(e)setErrs(p=>({...p,email:e}));}}/>
                              {errs.email&&<p className="text-xs text-red-500">⚠ {errs.email}</p>}
                            </div>
                            <div className="space-y-2">
                              <Label>{tx.password}</Label>
                              <div className="relative">
                                <Input type={showPwd?'text':'password'} placeholder="••••••••" value={loginPwd} disabled={loading} className={errs.pwd?'border-red-500':''}
                                  onChange={e=>{setLoginPwd(e.target.value);clrErr('pwd');}}
                                  onBlur={()=>{const e=valPwd(loginPwd);if(e)setErrs(p=>({...p,pwd:e}));}}/>
                                <button type="button" onClick={()=>setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2">{showPwd?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button>
                              </div>
                              {errs.pwd&&<p className="text-xs text-red-500">⚠ {errs.pwd}</p>}
                              <div className="flex justify-end">
                                <button type="button" onClick={()=>{setFEmail(loginEmail);setFStep('enter-email');}} className="text-xs hover:underline" style={{color:theme.primary}}>{tx.forgotPwd}</button>
                              </div>
                            </div>
                            <Button type="submit" className="w-full" style={{background:theme.primary}} disabled={loading}><Lock className="w-4 h-4 mr-2"/>{loading?tx.signingIn:tx.secureLoginBtn}</Button>
                          </>
                        )}

                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Manual */}
            <div className="manual-wrapper">
              <UserManual theme={theme} lang={lang} onOpenChange={setManualOpen} />
            </div>

            {/* ── Info card — matches feature-card size & colour, hides when manual opens ── */}
            <div style={{
              maxHeight: manualOpen ? '0px' : '120px',
              overflow: 'hidden',
              transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1)',
            }}>
              {/* Two cards side-by-side, each matching feature-card width/height */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 0 }}>

                {/* Card 1 — same style as feature-card */}
                <div className="feature-card" style={{ flexDirection: 'column', gap: 6, padding: 16, cursor: 'default' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="feature-card-icon" style={{ background: isDark ? '#334155' : '#f1f5f9', width: 36, height: 36 }}>
                      <Shield style={{ width: 18, height: 18, color: '#059669' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: '#059669' }}>
                        {lang === 'hi' ? 'AES-256 एन्क्रिप्शन' : 'AES-256 Encryption'}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: '#059669bb' }}>
                        {lang === 'hi' ? 'ब्लॉकचेन सत्यापन' : 'Blockchain verified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2 — same style as feature-card */}
                <div className="feature-card" style={{ flexDirection: 'column', gap: 6, padding: 16, cursor: 'default' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="feature-card-icon" style={{ background: isDark ? '#334155' : '#f1f5f9', width: 36, height: 36 }}>
                      <Lock style={{ width: 18, height: 18, color: '#0891b2' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: '#0891b2' }}>
                        {lang === 'hi' ? 'ISO 27001 प्रमाणित' : 'ISO 27001 Certified'}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: '#0891b2bb' }}>
                        {lang === 'hi' ? 'सरकारी सुरक्षा मानक' : 'Govt security standard'}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Decorative line below cards — same style as header subtitle line ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
              <div style={{ height: 1, flex: 1, background: `linear-gradient(to right, transparent, ${theme.primary})` }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: theme.primary, flexShrink: 0 }} />
              <div style={{ height: 1, width: 60, background: '#e2e8f0' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: theme.secondary, flexShrink: 0 }} />
              <div style={{ height: 1, flex: 1, background: `linear-gradient(to left, transparent, ${theme.secondary})` }} />
            </div>

          </div>{/* end right column */}

        </div>{/* end main grid */}

        {/* ── Full-width footer sweep — below everything ── */}
        <div style={{ width: '100%', maxWidth: 1200, marginTop: 32 }}>
          {/* Decorative dots row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ height: 1, flex: 1, background: `linear-gradient(to right, transparent, ${theme.primary}40)`, transition: 'background 0.5s ease' }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: theme.primary, opacity: 0.5, transition: 'background 0.5s ease' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: theme.primary, transition: 'background 0.5s ease' }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: theme.primary, opacity: 0.5, transition: 'background 0.5s ease' }} />
            <div style={{ height: 1, flex: 1, background: `linear-gradient(to left, transparent, ${theme.secondary}40)`, transition: 'background 0.5s ease' }} />
          </div>

          {/* Main animated sweep bar — full width */}
          <div style={{ position: 'relative', height: 4, borderRadius: 99, overflow: 'hidden', background: `${theme.primary}18`, transition: 'background 0.5s ease' }}>
            <div className="footer-border-glow" style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(90deg, transparent 0%, ${theme.primary} 20%, ${theme.secondary} 50%, ${theme.primary} 80%, transparent 100%)`,
              backgroundSize: '200% 100%',
              transition: 'background 0.5s ease',
            }} />
          </div>

          {/* Copyright */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingBottom: 24 }}>
            <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, margin: 0 }}>
              © {new Date().getFullYear()} Election Commission of India · SecureVote Pro · All rights reserved
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: theme.primary, transition: 'background 0.5s ease', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 11, color: theme.primary, fontWeight: 700, transition: 'color 0.5s ease' }}>
                {lang === 'hi' ? 'सुरक्षित · एन्क्रिप्टेड · सत्यापित' : 'Secure · Encrypted · Verified'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}