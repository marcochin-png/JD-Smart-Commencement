import { useState, useEffect } from 'react';
import { HelpCircle, Briefcase, FileText, Calendar, Eye, Users, Paperclip, Search, Phone, IdCard, Clipboard, Building2, MessageSquare, Gavel, FileEdit, MapPin, Upload, CheckCircle, Info, AlertCircle, MonitorUp, Menu, X, Globe, Type, Lock, Shield, Scale, AlertTriangle, UploadCloud, CalendarCheck } from 'lucide-react';
import { handleFontControlClick, initializeTextSize } from '../lib/accessibility';
import AppShellHeader from '../components/layout/AppShellHeader';
import OfficerPortal from '../components/OfficerPortal';
import EvidenceComparison from '../components/EvidenceComparison';

interface TranslationItem {
  icon: string;
  title: string;
  description: string;
}

interface PreparationItem {
  icon: string;
  text: string;
}

interface FallbackAction {
  text: string;
  icon: string;
}

interface Translations {
  mainTitle: string;
  howCanIHelpYou: string;
  claimantRole: string;
  claimantDesc: string;
  defendantStartTitle: string;
  defendantStartDesc: string;
  defendantBtn: string;
  defendantRole: string;
  defendantDesc: string;
  brandEyebrow: string;
  brandTitle: string;
  headerLabel: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroDescription: string;
  heroNote: string;
  servicePill: string;
  chatIntro: string;
  statusLabel: string;
  voiceLabel: string;
  uploadLabel: string;
  sendLabel: string;
  trustHeading: string;
  trustText: string;
  scenarioTitle: string;
  scenarioDescription: string;
  nextStepsTitle: string;
  nextStepsDescription: string;
  helpTitle: string;
  helpDescription: string;
  footerLine1: string;
  footerLine2: string;
  processSteps: TranslationItem[];
  preparationTitle: string;
  preparationDescription: string;
  preparationItems: PreparationItem[];
  nextStepCards: TranslationItem[];
  fallbackActions: FallbackAction[];
  helpLabel: string;
  elodgmentPortal: string;
}

interface HomeProps {
  onStartChat: (role: 'claimant' | 'defendant', language: 'zh' | 'en') => void;
}

const translations: Record<'zh' | 'en', Translations> = {
    zh: {
    mainTitle: '勞資審裁處網上啟動平台',
    howCanIHelpYou: '有什麼可以幫你？',
    claimantRole: '我是申索人',
    claimantDesc: '提出欠薪及解僱補償申索',
    defendantStartTitle: '被告人回應',
    defendantStartDesc: '提交抗辯書、證人供詞及反申索資料',
    defendantBtn: '回應申索',
    defendantRole: '我是被告人',
    defendantDesc: '提交抗辯書及反申索資料',
    brandEyebrow: '司法機構 勞資審裁處',
    brandTitle: '勞資審裁處網上啟動平台',
    headerLabel: '',
    heroEyebrow: '',
    heroHeadline: '協助準備入稟文件',
    heroDescription: '本系統協助你整理資料並草擬《表格1》及《表格2》。請回答以下問題，系統會引領你完成申索程序。',
    heroNote: '本系統提供程序指引，不構成法律意見。請以官方指引為準。',
    servicePill: '',
    chatIntro: '您好，歡迎使用勞資審裁處網上啟動平台。我是您的程序指引助理，專門協助你了解勞資審裁處的相關程序。有什麼可以幫你？',
    statusLabel: '已準備',
    voiceLabel: '語音',
    uploadLabel: '上傳',
    sendLabel: '提交',
    trustHeading: '重要提示：',
    trustText: '本系統提供程序指引，不構成法律意見。請以官方指引為準。',
    scenarioTitle: '網上申索流程',
    scenarioDescription: '系統會透過以下四個步驟，協助你輕鬆完成申索程序。',
    nextStepsTitle: '程序指引',
    nextStepsDescription: '系統會提供清晰的程序步驟，讓你知道接下來應該執行的程序。',
    helpTitle: '其他協助方式',
    helpDescription: '如果你希望直接使用人工協助或傳統渠道，請選擇以下選項。',
    footerLine1: ' 2026 香港司法機構。版權所有。',
    footerLine2: '網上啟動平台 | 勞資審裁處服務',
    processSteps: [
      { title: '智能初步評估', description: '系統會透過互動對話，初步了解你的受僱背景、爭議詳情及申索項目，並協助梳理案情。', icon: 'MessageSquare' },
      { title: '上傳證明文件', description: '請準備並上傳相關證據（如僱傭合約、銀行紀錄或通訊截圖），系統將自動提取關鍵資料以輔助核實。', icon: 'UploadCloud' },
      { title: '系統草擬及核實', description: '系統會根據收集的資料，自動為你草擬《表格1》及《表格2》，並透過數碼身份認證協助你核實身份。', icon: 'FileText' },
      { title: '確認及預約會面', description: '確認資料無誤後，系統會即時為你安排前往勞資審裁處與調查主任會面的時間，完成初步建檔。', icon: 'CalendarCheck' },
    ],
    preparationTitle: '入稟前準備清單',
    preparationDescription: '準備以下文件，系統會協助整理並填入申索表格：',
    preparationItems: [
      { icon: 'IdCard', text: '香港身份證' },
      { icon: 'Clipboard', text: '勞工處案件轉介編號（如有）' },
      { icon: 'Building2', text: '僱主/公司的準確地址（非郵政信箱）' },
      { icon: 'Briefcase', text: '工資單、合約、強積金供款紀錄' },
      { icon: 'MessageSquare', text: '與僱主的通訊紀錄' },
    ],
    nextStepCards: [
      { title: '填寫表格1及2', description: '系統會根據你的回答，生成申索書標題及內容。', icon: 'FileText' },
      { title: '核實被告人地址', description: '查詢公司註冊地址或獨資經營業務地址，確保文件能有效送達。', icon: 'Search' },
      { title: '上傳證明文件', description: '上傳工資單、合約等文件，系統會提取關鍵資料。', icon: 'Upload' },
      { title: '預約到審裁處會面', description: '預約時間到勞資審裁處登記處，職員會協助你完成申索。', icon: 'Calendar' },
    ],
    fallbackActions: [
      { text: '直接預約', icon: 'Calendar' },
      { text: '查詢案件', icon: 'Search' },
      { text: '找職員協助', icon: 'Users' },
      { text: '使用傳統服務目錄', icon: 'Clipboard' },
    ],
    helpLabel: '服務說明',
    elodgmentPortal: '電子提交平台',
  },
  en: {
    mainTitle: 'Labour Tribunal Online Commencement',
    howCanIHelpYou: 'How can I help you?',
    claimantRole: 'I am the Claimant',
    claimantDesc: 'File a claim for unpaid wages and compensation',
    defendantStartTitle: 'Defendant Response',
    defendantStartDesc: 'Submit defence, witness statements, and counterclaim details',
    defendantBtn: 'Respond to Claim',
    defendantRole: 'I am the Defendant',
    defendantDesc: 'Submit defence and counterclaim details',
    brandEyebrow: 'JUDICIARY LABOUR TRIBUNAL',
    brandTitle: 'Online Commencement',
    headerLabel: '',
    heroEyebrow: '',
    heroHeadline: 'Prepare Your Claim Forms',
    heroDescription: 'This system assists you in organising information and drafting "Form 1" and "Form 2". Please answer the following questions, and the system will guide you through the claim process.',
    heroNote: 'This system provides procedural guidance only and does not constitute legal advice. Please rely on official guidance.',
    servicePill: '',
    chatIntro: 'Hello, welcome to the Labour Tribunal Online Commencement platform. I am your procedural guidance assistant, specialized in helping you understand the Labour Tribunal claim process. How can I help you?',
    statusLabel: 'Ready',
    voiceLabel: 'Voice',
    uploadLabel: 'Upload',
    sendLabel: 'Submit',
    trustHeading: 'Important note:',
    trustText: 'This system provides procedural guidance only and does not constitute legal advice. Please rely on official guidance.',
    scenarioTitle: 'Online Claim Process',
    scenarioDescription: 'The system will help you complete the claim process in four easy steps.',
    nextStepsTitle: 'Procedural Guidance',
    nextStepsDescription: 'The system provides clear procedural steps to guide you through the claim process.',
    helpTitle: 'Other assistance options',
    helpDescription: 'If you want direct support or traditional channels, choose one of these options.',
    footerLine1: ' 2026 Hong Kong Judiciary. All rights reserved.',
    footerLine2: 'Online Commencement | Judiciary Labour Tribunal Service',
    processSteps: [
      { title: 'Smart Intake Assessment', description: 'The system uses interactive dialogue to understand your employment background, dispute details, and claim items, helping to organize your case.', icon: 'MessageSquare' },
      { title: 'Document Upload & OCR', description: 'Please prepare and upload relevant evidence (such as employment contracts, bank records, or communication screenshots). The system will automatically extract key data to assist with verification.', icon: 'UploadCloud' },
      { title: 'Drafting & Verification', description: 'Based on the collected data, the system will automatically draft "Form 1" and "Form 2" for you and help you verify your identity through Digital Identity Authentication.', icon: 'FileText' },
      { title: 'Confirmation & Booking', description: 'After confirming the data is correct, the system will immediately arrange a time for you to meet with the Tribunal Officer at the Labour Tribunal, completing the initial filing.', icon: 'CalendarCheck' },
    ],
    preparationTitle: 'Pre-Claim Checklist',
    preparationDescription: 'Prepare the following documents, and the system will assist in organising and completing your claim forms:',
    preparationItems: [
      { icon: 'IdCard', text: 'Hong Kong Identity Card' },
      { icon: 'Clipboard', text: 'Labour Department case referral number (if applicable)' },
      { icon: 'Building2', text: "Accurate address of employer/company (not a PO Box)" },
      { icon: 'Briefcase', text: 'Payslips, employment contract, MPF contribution records' },
      { icon: 'MessageSquare', text: 'Communication records with employer' },
    ],
    nextStepCards: [
      { title: 'Complete Form 1 & 2', description: 'The system will generate your claim form title and content based on your answers.', icon: 'FileText' },
      { title: 'Verify Defendant Address', description: 'Look up company registration address or sole proprietorship business address to ensure effective service.', icon: 'Search' },
      { title: 'Upload Evidence Documents', description: 'Upload payslips, contracts and the system will assist in organizing your records.', icon: 'Upload' },
      { title: 'Book Tribunal Appointment', description: 'Schedule a time to meet with staff at the Labour Tribunal Registry.', icon: 'Calendar' },
    ],
    fallbackActions: [
      { text: 'Book appointment', icon: 'Calendar' },
      { text: 'Check case', icon: 'Search' },
      { text: 'Find staff help', icon: 'Users' },
      { text: 'Use traditional service directory', icon: 'Clipboard' },
    ],
    helpLabel: 'Service information',
    elodgmentPortal: 'E-Lodgement Platform',
  },
};

// Memoized icon maps outside component to avoid recreation on each render
const processStepIconMap: Record<string, React.ElementType> = {
  MessageSquare: MessageSquare,
  UploadCloud: UploadCloud,
  FileText: FileText,
  CalendarCheck: CalendarCheck,
};

const preparationItemIconMap: Record<string, React.ElementType> = {
  IdCard: IdCard,
  Clipboard: Clipboard,
  Building2: Building2,
  Briefcase: Briefcase,
  MessageSquare: MessageSquare,
};

const fallbackActionIconMap: Record<string, React.ElementType> = {
  Calendar: Calendar,
  Search: Search,
  Users: Users,
  Clipboard: Clipboard,
};

export default function Home({ onStartChat }: HomeProps) {
  const initialView = (() => {
    const view = new URLSearchParams(window.location.search).get('view');
    if (view === 'officer' || view === 'evidence') {
      return view;
    }
    return 'home';
  })() as 'home' | 'officer' | 'evidence';
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [helpOpen, setHelpOpen] = useState(false);
  const [jurisdictionModalOpen, setJurisdictionModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'officer' | 'evidence'>(initialView);

  // Initialize text size on mount
  useEffect(() => {
    initializeTextSize();
  }, []);

  useEffect(() => {
    const syncViewFromQuery = () => {
      const view = new URLSearchParams(window.location.search).get('view');
      setActiveView(view === 'officer' || view === 'evidence' ? view : 'home');
    };

    window.addEventListener('popstate', syncViewFromQuery);
    return () => window.removeEventListener('popstate', syncViewFromQuery);
  }, []);

  const currentText = translations[language];

  // Conditional rendering for demo views
  if (activeView === 'officer') return <OfficerPortal onBack={() => setActiveView('home')} language={language} />;
  if (activeView === 'evidence') return <EvidenceComparison onBack={() => setActiveView('home')} language={language} />;

  const scenarioIcons = [
    <Briefcase className="chip-icon" key="briefcase" />,
    <FileText className="chip-icon" key="file" />,
    <Calendar className="chip-icon" key="calendar" />,
    <Eye className="chip-icon" key="eye" />,
    <Users className="chip-icon" key="users" />,
  ];

  const nextIcons = [
    <FileText className="card-icon" key="file-1" />,
    <Paperclip className="card-icon" key="paperclip" />,
    <Search className="card-icon" key="search" />,
    <Phone className="card-icon" key="phone" />,
  ];

  const fallbackIcons = [
    <Calendar className="button-icon" key="cal-2" />,
    <Search className="button-icon" key="search-2" />,
    <Users className="button-icon" key="users-2" />,
    <FileText className="button-icon" key="file-2" />,
  ];

  return (
    <div className="page-shell">
      <AppShellHeader
        brandEyebrow={currentText.brandEyebrow}
        brandTitle={currentText.brandTitle}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        desktopActions={
          <button
            type="button"
            className="rounded-full border border-white/20 bg-white/10 p-2 text-white shadow-sm hover:border-white/35 hover:bg-white/15"
            onClick={() => setHelpOpen(!helpOpen)}
            aria-label={language === 'zh' ? '幫助' : 'Help'}
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        }
      />

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
            style={{ backdropFilter: 'blur(4px)' }}
          />
          
          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-xl pt-safe" style={{
            animation: 'slideInRight 0.3s ease-out'
          }}>
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderBottomColor: '#E2E8F0' }}>
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Noto Sans TC, sans-serif', color: '#012056' }}>
                {language === 'zh' ? '選單' : 'Menu'}
              </h2>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="touch-target flex items-center justify-center p-2 rounded-lg hover:bg-gray-100"
                aria-label={language === 'zh' ? '關閉' : 'Close'}
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Drawer Content */}
            <div className="p-4 space-y-4">
              {/* Language Toggle */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Noto Sans TC, sans-serif', color: '#64748B' }}>
                  {language === 'zh' ? '語言' : 'Language'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage(language === 'zh' ? 'en' : 'zh');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors touch-target"
                  style={{ borderColor: '#E2E8F0', fontFamily: 'Noto Sans TC, sans-serif' }}
                >
                  <Globe size={20} />
                  <span className="font-medium">{language === 'zh' ? 'EN' : '中文'}</span>
                </button>
              </div>
              
              {/* Font Size Controls */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Noto Sans TC, sans-serif', color: '#64748B' }}>
                  {language === 'zh' ? '字體大小' : 'Font Size'}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFontControlClick('sm')}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors touch-target"
                    style={{ borderColor: '#E2E8F0', fontFamily: 'Noto Sans TC, sans-serif' }}
                  >
                    <Type size={16} />
                    <span className="text-sm">A</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFontControlClick('md')}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors touch-target"
                    style={{ borderColor: '#012056', backgroundColor: '#F0F5FA', fontFamily: 'Noto Sans TC, sans-serif' }}
                  >
                    <Type size={18} />
                    <span className="text-base font-medium">A</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFontControlClick('lg')}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors touch-target"
                    style={{ borderColor: '#E2E8F0', fontFamily: 'Noto Sans TC, sans-serif' }}
                  >
                    <Type size={20} />
                    <span className="text-lg">A</span>
                  </button>
                </div>
              </div>
              
              {/* Help Button */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setHelpOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors touch-target"
                  style={{ borderColor: '#E2E8F0', fontFamily: 'Noto Sans TC, sans-serif' }}
                >
                  <HelpCircle size={20} />
                  <span className="font-medium">{language === 'zh' ? '幫助' : 'Help'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="main-content" style={{
        background: '#F0F5FA',
        minHeight: 'calc(100vh - 72px)',
        padding: '2rem 1rem'
      }}>
        <section className="hero-chat centered-panel wide-panel" style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div className="hero-chat-card animate-slide-in-up" style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 4px 24px rgba(1, 32, 86, 0.08)',
            padding: '3rem',
            marginBottom: '2rem'
          }}>
            {/* Main Title */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h1 className="text-gradient" style={{
                fontFamily: 'Noto Sans TC, sans-serif',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                margin: '0 0 1rem 0',
                letterSpacing: '-0.04em',
                lineHeight: '1.1'
              }}>
                {currentText.mainTitle}
              </h1>
              {/* Notice Bar 1 - Info */}
              <div className="hover-lift" style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '1.25rem 2rem',
                background: '#ffffff',
                borderLeft: '4px solid #012056',
                marginBottom: '16px',
                borderRadius: '8px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <span className="icon-container icon-container-xs icon-stroke">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                </span>
                <p style={{
                  fontFamily: 'Noto Sans TC, sans-serif',
                  fontSize: '1rem',
                  color: '#1A202C',
                  margin: 0,
                  lineHeight: '1.6',
                  fontWeight: 500
                }}>
                  {currentText.heroDescription}
                </p>
              </div>
              {/* Notice Bar 2 - Disclaimer */}
              <div style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '1rem 1.5rem',
                background: '#F8F9FA',
                borderLeft: '4px solid #5074ab',
                borderRadius: '4px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <span className="icon-container icon-container-xs icon-stroke">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </span>
                <p style={{
                  fontFamily: 'Noto Sans TC, sans-serif',
                  fontSize: '0.9375rem',
                  color: '#1A202C',
                  margin: 0,
                  lineHeight: '1.5',
                  fontWeight: 400
                }}>
                  {currentText.heroNote}
                </p>
              </div>
            </div>

            <article className="chat-card" style={{
              background: '#F8F9FA',
              borderRadius: '8px',
              padding: '1rem md:p-8',
              border: '1px solid #E6F0FA'
            }}>
              {/* How can I help you */}
              <h2 style={{
                fontFamily: 'Noto Sans TC, sans-serif',
                fontSize: '1.125rem md:text-[1.375rem]',
                fontWeight: 600,
                color: '#012056',
                margin: '0 0 1rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {currentText.howCanIHelpYou}
              </h2>

              <div className="chat-card-header">
                <div style={{ flex: 1 }}>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2" style={{ marginBottom: '1rem' }}>
                    <button
                      type="button"
                      className="hover-lift"
                      onClick={() => onStartChat('claimant', language)}
                      style={{
                        background: 'linear-gradient(135deg, #123b7a 0%, #1f5aa6 100%)',
                        border: '1px solid rgba(18, 59, 122, 0.18)',
                        borderRadius: '16px',
                        padding: '1.25rem 1.5rem',
                        textAlign: 'left',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        minHeight: '200px',
                        color: '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <div>
                        <span className="icon-container icon-container-sm" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>
                          <Users className="w-5 h-5" />
                        </span>
                        <div style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.2, color: '#ffffff' }}>
                          {currentText.claimantRole}
                        </div>
                        <p style={{ margin: '0.6rem 0 0 0', fontSize: '0.95rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.88)' }}>
                          {currentText.claimantDesc}
                        </p>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#ffffff' }}>
                        <span>{language === 'zh' ? '開始申索' : 'Start Claim'}</span>
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    </button>

                    <button
                      type="button"
                      className="hover-lift"
                      onClick={() => onStartChat('defendant', language)}
                      style={{
                        background: 'linear-gradient(135deg, #0f4c5c 0%, #146c7e 100%)',
                        border: '1px solid rgba(15, 76, 92, 0.18)',
                        borderRadius: '16px',
                        padding: '1.25rem 1.5rem',
                        textAlign: 'left',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        minHeight: '200px',
                        color: '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <div>
                        <span className="icon-container icon-container-sm" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>
                          <Building2 className="w-5 h-5" />
                        </span>
                        <div style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.2, color: '#ffffff' }}>
                          {currentText.defendantRole}
                        </div>
                        <p style={{ margin: '0.6rem 0 0 0', fontSize: '0.95rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.88)' }}>
                          {currentText.defendantDesc}
                        </p>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#ffffff' }}>
                        <span>{currentText.defendantBtn}</span>
                        <FileText className="w-4 h-4" />
                      </div>
                    </button>
                  </div>

                  <div className="action-cards-grid grid-cols-1 md:grid-cols-2" style={{
                    display: 'grid',
                    gap: '0.75rem'
                  }}>
                    {/* Primary Action Card */}
                    <button
                      type="button"
                      className="action-card action-card-secondary hover-lift shimmer"
                      onClick={() => {
                        const encoded = encodeURIComponent(language === 'zh' ? '我被僱主拖欠薪金' : 'My employer owes me wages');
                        window.history.pushState({}, '', `/chat?msg=${encoded}&lang=${language}`);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '16px',
                        padding: '1.25rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--navy-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        textAlign: 'left',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        minHeight: '64px'
                      }}
                    >
                      <span className="icon-container icon-container-sm icon-stroke">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="16"/>
                          <line x1="8" y1="12" x2="16" y2="12"/>
                        </svg>
                      </span>
                      <span>{language === 'zh' ? '我被僱主拖欠薪金' : 'My employer owes me wages'}</span>
                    </button>

                    {/* Secondary Action Card 2 */}
                    <button
                      type="button"
                      className="action-card action-card-secondary hover-lift"
                      onClick={() => {
                        window.history.pushState({}, '', `/chat?scenario=upload&lang=${language}`);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '16px',
                        padding: '1.25rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--navy-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        textAlign: 'left',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        minHeight: '64px'
                      }}
                    >
                      <span className="icon-container icon-container-sm icon-stroke">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                      </span>
                      <span>{language === 'zh' ? '我想補交 / 上傳文件' : 'I want to submit/upload documents'}</span>
                    </button>

                    {/* Secondary Action Card 3 */}
                    <button
                      type="button"
                      className="action-card action-card-secondary hover-lift"
                      onClick={() => {
                        window.history.pushState({}, '', `/chat?scenario=status&lang=${language}`);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '16px',
                        padding: '1.25rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--navy-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        textAlign: 'left',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        minHeight: '64px'
                      }}
                    >
                      <span className="icon-container icon-container-sm icon-stroke">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                      </span>
                      <span>{language === 'zh' ? '我想查詢案件' : 'I want to check my case'}</span>
                    </button>

                    {/* Secondary Action Card 4 */}
                    <button
                      type="button"
                      className="action-card action-card-secondary hover-lift"
                      onClick={() => {
                        window.history.pushState({}, '', `/chat?scenario=reschedule&lang=${language}`);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '16px',
                        padding: '1.25rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--navy-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        textAlign: 'left',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        minHeight: '64px'
                      }}
                    >
                      <span className="icon-container icon-container-sm icon-stroke">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </span>
                      <span>{language === 'zh' ? '我想更改預約' : 'I want to change my appointment'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* e-Lodgment Portal Navigation Card */}
              <div className="hover-lift" style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-md)'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    window.history.pushState({}, '', `/elodgment?lang=${language}`);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="shimmer"
                  style={{
                    width: '100%',
                    background: 'var(--navy-primary)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    fontFamily: 'Noto Sans TC, sans-serif'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--navy-medium)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'var(--navy-primary)';
                  }}
                >
                  <MonitorUp size={24} style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>{currentText.elodgmentPortal}</span>
                </button>
              </div>

              {/* Important Notice Section */}
              <div className="important-notice-section" style={{
                marginTop: '1.5rem',
                padding: '1rem md:p-5',
                background: '#E6F0FA',
                border: '2px solid #012056',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem md:gap-3', marginBottom: '0.75rem md:mb-4' }}>
                  <span className="icon-container icon-container-sm icon-stroke">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </span>
                  <h3 style={{
                    fontFamily: 'Noto Sans TC',
                    fontSize: '1rem md:text-[1.125rem]',
                    fontWeight: 600,
                    color: '#012056',
                    margin: 0
                  }}>
                    {language === 'zh' ? '重要通知' : 'Important Notice'}
                  </h3>
                </div>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem md:gap-3'
                }}>
                  <li style={{
                    fontSize: '0.875rem md:text-[0.9375rem]',
                    color: '#1a2a3a',
                    lineHeight: 1.6,
                    padding: '0.375rem 0 md:p-2',
                    borderBottom: '1px solid rgba(15, 23, 36, 0.06)'
                  }}>
                    <strong>{language === 'zh' ? '預約須知：' : 'Booking Notice:'}</strong><br/>
                    {language === 'zh' 
                      ? '在提交申索前，必須通過本網頁或電話預約系統（電話：2625 0056）進行預約。'
                      : 'Before filing your claim, you must make an appointment through this webpage or the telephone booking service at Tel. No. 2625 0056.'}
                  </li>
                  <li style={{
                    fontSize: '0.875rem md:text-[0.9375rem]',
                    color: '#1a2a3a',
                    lineHeight: 1.6,
                    padding: '0.5rem 0',
                    borderBottom: '1px solid rgba(15, 23, 36, 0.06)'
                  }}>
                    <strong>{language === 'zh' ? '查詢或更改：' : 'Check or Change:'}</strong><br/>
                    {language === 'zh' 
                      ? '預約後，您可憑參考編號及聯絡電話號碼再次查詢、取消或更改預約。'
                      : 'After booking, you can check, cancel or change your appointment by providing the reference number and contact telephone number again.'}
                  </li>
                  <li style={{
                    fontSize: '0.875rem md:text-[0.9375rem]',
                    color: '#1a2a3a',
                    lineHeight: 1.6,
                    padding: '0.5rem 0'
                  }}>
                    <strong>{language === 'zh' ? '版權聲明：' : 'Copyright:'}</strong><br/>
                    {language === 'zh' 
                      ? '本網頁資料僅供私人使用，嚴禁作商業用途。版權屬香港特別行政區政府所有。'
                      : 'The information on this web page is for private use only. Reproduction for commercial purposes is strictly prohibited. The copyright rests with the Hong Kong Special Administrative Region Government.'}
                  </li>
                </ul>
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 72, 96, 0.06)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#0f4860'
                }}>
                  <a href="#" style={{ color: '#0f4860', textDecoration: 'underline' }}>
                    {language === 'zh' ? '颱風及暴雨警告安排' : 'Typhoon and Rainstorm Warning Arrangements'}
                  </a>
                </div>
              </div>
            </article>
          </div>

          <div className="scenario-panel animate-slide-in-up" style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(1, 32, 86, 0.08)',
              padding: '2.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '3px solid #012056'
              }}>
                <span className="icon-container icon-stroke">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                </span>
                <div>
                  <p style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#5074ab',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    margin: 0
                  }}>{currentText.scenarioTitle}</p>
                  <h3 style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#012056',
                    margin: 0
                  }}>{currentText.scenarioTitle}</h3>
                </div>
              </div>
              <p style={{
                fontFamily: 'Noto Sans TC, sans-serif',
                fontSize: '1rem',
                color: '#1A202C',
                lineHeight: 1.6,
                marginBottom: '1.5rem'
              }}>{currentText.scenarioDescription}</p>
              <div className="scenario-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                alignItems: 'stretch'
              }}>
                {currentText.processSteps.map((step, i) => {
                  const IconComponent = processStepIconMap[step.icon as string] || FileEdit;
                  return (
                    <div
                      key={step.title}
                      className="scenario-chip"
                      style={{
                        cursor: 'default',
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #E6F0FA',
                        borderRadius: '12px',
                        padding: '1.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 24px rgba(1, 32, 86, 0.08)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="icon-container icon-stroke">
                          <IconComponent style={{ width: '28px', height: '28px' }} />
                        </div>
                        <h3 style={{
                          fontFamily: 'Noto Sans TC, sans-serif',
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: '#012056',
                          margin: 0
                        }}>{step.title}</h3>
                      </div>
                      <p style={{
                        fontFamily: 'Noto Sans TC, sans-serif',
                        fontSize: '1.0625rem',
                        fontWeight: 500,
                        color: '#1A202C',
                        lineHeight: 1.6,
                        margin: 0
                      }}>{step.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Preparation Checklist */}
          <div className="preparation-panel animate-slide-in-up" style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(1, 32, 86, 0.08)',
              padding: '2.5rem',
              marginBottom: '2rem'
            }}>
              <div className="preparation-header" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '3px solid #012056'
              }}>
                <span className="icon-container icon-stroke">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                    <path d="M9 14h6"/>
                    <path d="M9 10h6"/>
                    <path d="M9 18h6"/>
                  </svg>
                </span>
                <div>
                  <p style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#5074ab',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    margin: 0
                  }}>{currentText.preparationTitle}</p>
                  <h4 style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#012056',
                    margin: 0
                  }}>{currentText.preparationTitle}</h4>
                </div>
              </div>
              <p style={{
                fontFamily: 'Noto Sans TC, sans-serif',
                fontSize: '1rem',
                color: '#1A202C',
                marginBottom: '1.5rem',
                lineHeight: 1.6
              }}>{currentText.preparationDescription}</p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem'
              }}>
                {currentText.preparationItems?.map((item, i) => {
                  const IconComponent = preparationItemIconMap[item.icon as string] || CheckCircle;
                  return (
                    <li key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      fontSize: '0.9375rem',
                      color: '#1a2a3a',
                      padding: '1rem',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0'
                    }}>
                      <div className="icon-container icon-container-sm icon-stroke">
                        <IconComponent style={{ width: '20px', height: '20px' }} />
                      </div>
                      <span style={{
                        fontFamily: 'Noto Sans TC, sans-serif',
                        lineHeight: 1.5,
                        fontWeight: 500
                      }}>{item.text}</span>
                    </li>
                  );
                })}
              </ul>
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem 1.25rem',
                background: 'rgba(201, 162, 39, 0.08)',
                borderLeft: '3px solid #c9a227',
                borderRadius: '4px',
                fontSize: '0.875rem',
                color: '#64748b',
                fontFamily: 'Noto Sans TC, sans-serif'
              }}>
                <strong>{language === 'zh' ? '提示：' : 'Note: '}</strong>
                {language === 'zh' 
                  ? '郵政信箱不能作為被告人地址。有限公司需提供註冊辦事處地址；獨資經營需提供業務主要地址。'
                  : 'PO Box cannot be used as defendant address. Limited companies must provide registered office address; sole proprietorships must provide principal place of business.'}
              </div>
            </div>
          </div>
        </section>

        {/* Internal Demo Views Section */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto 2rem auto'
        }}>
          <div className="mt-12 bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200 max-w-7xl mx-auto shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-slate-400" />
              {language === 'zh' ? '調查主任平台' : 'Tribunal Officer Portal'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => setActiveView('officer')} className="bg-white border border-slate-200 p-5 rounded-xl hover:shadow-md hover:border-indigo-300 text-left transition-all duration-200 group">
                <Shield className="w-7 h-7 text-indigo-600 mb-3 group-hover:scale-110 transition-transform" />
                <div className="font-semibold text-slate-900 text-lg mb-1">{language === 'zh' ? '調查主任工作台' : 'Officer Portal'}</div>
                <div className="text-sm text-slate-500 leading-relaxed">{language === 'zh' ? '結構化案件摘要及《表格 1/2》擬稿預覽' : 'Structured Summary & Form 1/2 Drafting'}</div>
              </button>
              <button onClick={() => setActiveView('evidence')} className="bg-white border border-slate-200 p-5 rounded-xl hover:shadow-md hover:border-teal-300 text-left transition-all duration-200 group">
                <Scale className="w-7 h-7 text-teal-600 mb-3 group-hover:scale-110 transition-transform" />
                <div className="font-semibold text-slate-900 text-lg mb-1">{language === 'zh' ? '證據及爭議點比對' : 'Evidence Comparison'}</div>
                <div className="text-sm text-slate-500 leading-relaxed">{language === 'zh' ? '雙方證據矩陣及系統調解策略分析' : 'Dispute Matrix & System Conciliation Support'}</div>
              </button>
            </div>
          </div>
        </section>

        {/* Floating help button */}
        <button
          type="button"
          className="fab-help"
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          aria-label="Help and contact"
        >
          <span aria-hidden>?</span>
          <span className="label">Help & Contact</span>
        </button>

        {/* Small inline CTA: scroll to chat - placed after hero so it appears near top visually */}
        <div style={{display: 'none'}} aria-hidden>
          {/* hidden container for progressive enhancement if needed */}
        </div>

        <section className="fallback-section" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 4px 24px rgba(1, 32, 86, 0.08)',
            padding: '2.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '3px solid #012056'
            }}>
              <span className="icon-container icon-stroke">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </span>
              <div>
                <p style={{
                  fontFamily: 'Noto Sans TC, sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#5074ab',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  margin: 0
                }}>{currentText.helpTitle}</p>
                <h2 style={{
                  fontFamily: 'Noto Sans TC, sans-serif',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#012056',
                  margin: 0
                }}>{currentText.helpTitle}</h2>
              </div>
            </div>
            <p style={{
              fontFamily: 'Noto Sans TC, sans-serif',
              fontSize: '1rem',
              color: '#1A202C',
              marginBottom: '1.5rem',
              lineHeight: 1.6
            }}>{currentText.helpDescription}</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {currentText.fallbackActions.map((action, i) => {
                const IconComponent = fallbackActionIconMap[action.icon as string] || HelpCircle;
                return (
                  <button key={action.text} type="button" style={{
                    background: '#FFFFFF',
                    border: '2px solid #5074ab',
                    borderRadius: '8px',
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#012056',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem'
                  }}
                  onClick={() => {
                    if (action.text === '直接預約' || action.text === 'Book appointment') {
                      setJurisdictionModalOpen(true);
                    }
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(80, 116, 171, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    <div className="icon-container icon-container-sm icon-stroke">
                      <IconComponent style={{ width: '20px', height: '20px' }} />
                    </div>
                    <span>{action.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer style={{
        background: '#012056',
        color: '#ffffff',
        padding: '2rem 1rem',
        textAlign: 'center',
        borderTop: '3px solid #5074ab'
      }}>
        <p style={{
          fontFamily: 'Noto Sans TC, sans-serif',
          fontSize: '0.875rem',
          margin: '0.5rem 0',
          color: '#ffffff'
        }}>{currentText.footerLine1}</p>
        <p style={{
          fontFamily: 'Noto Sans TC, sans-serif',
          fontSize: '0.875rem',
          margin: '0.5rem 0',
          color: '#5074ab'
        }}>{currentText.footerLine2}</p>
      </footer>

      {/* Jurisdiction Limit Modal */}
      {jurisdictionModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 4px 24px rgba(1, 32, 86, 0.15)',
            padding: '2.5rem',
            maxWidth: '1200px',
            width: '90%',
            margin: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#E6F0FA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertCircle style={{ width: '24px', height: '24px', color: '#012056' }} />
              </div>
              <h2 style={{
                fontFamily: 'Noto Sans TC, sans-serif',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#012056',
                margin: 0
              }}>
                {language === 'zh' ? '重要提示' : 'Important Notice'}
              </h2>
            </div>
            
            <p style={{
              fontFamily: 'Noto Sans TC, sans-serif',
              fontSize: '1rem',
              color: '#1A202C',
              lineHeight: '1.6',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              {language === 'zh' 
                ? '由2021年9月17日開始，勞資審裁處審理的申索額已由超過$8,000改為超過$15,000。'
                : 'The jurisdictional limit of Labour Tribunal has changed from over $8,000 to over $15,000 w.e.f. 17 Sep 2021.'}
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setJurisdictionModalOpen(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#FFFFFF',
                  border: '2px solid #012056',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#012056',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Noto Sans TC, sans-serif'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#F8F9FA'}
                onMouseOut={(e) => e.currentTarget.style.background = '#FFFFFF'}
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  setJurisdictionModalOpen(false);
                  window.location.href = `/appointment-booking?lang=${language}`;
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#012056',
                  border: '2px solid #012056',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Noto Sans TC, sans-serif'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#02307d'}
                onMouseOut={(e) => e.currentTarget.style.background = '#012056'}
              >
                {language === 'zh' ? '繼續' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
