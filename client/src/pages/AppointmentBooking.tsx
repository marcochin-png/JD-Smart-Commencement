import React, { useState, useEffect } from "react";
import { Menu, X, Globe, Type } from "lucide-react";
import { handleFontControlClick, initializeTextSize } from "../lib/accessibility";
import AppShellHeader from "../components/layout/AppShellHeader";

type Step = 'intro' | 'input' | 'result' | 'verification' | 'confirmed';

const translations = {
  zh: {
    breadcrumb: "勞資審裁處電子服務 > 預約會面",
    pageTitle: "預約會面",
    help: "幫助",
    language: "語言",
    fontSize: "字體大小",
    continue: "繼續",
    back: "返回",
    accept: "接受預約",
    suggestAnother: "建議另一日期",
    terminate: "終止預約會面程序",
    confirm: "確認",
    cancel: "取消",
    return: "返回",
    introTitle: "預約會面說明",
    introText: "請輸入您的勞資審裁處案件編號以預約會面時間。系統將根據法庭排期為您安排最早的可用會面時間。",
    ldRefLabel: "勞資審裁處案件編號",
    contactTelLabel: "聯絡電話號碼",
    noOfClaimantsLabel: "申索人數目",
    importantNotice: "重要提示",
    noticeText: [
      "請確保所提供的聯絡電話號碼正確無誤。",
      "如需更改預約時間，請至少提前3個工作日通知。",
      "請準時到達，遲到可能需要重新預約。"
    ],
    appointmentResult: "預約結果",
    appointmentDate: "預約日期",
    appointmentTime: "預約時間",
    appointmentLocation: "預約地點",
    location: "勞資審裁處 - 九龍加士居道36號地下",
    confirmSuggest: "您確定要放棄此預約日期嗎？",
    verification: "驗證",
    enterCaptcha: "請輸入圖中顯示的字符",
    confirmed: "預約已確認",
    confirmedText: "您的預約已成功確認。請保存以下資料以供參考。",
    referenceNo: "參考編號",
    reminders: "提醒事項",
    reminderText: [
      "請準時到達預約地點。",
      "如需更改，請提前3個工作日通知。",
      "請攜帶相關文件出席會面。"
    ]
  },
  en: {
    breadcrumb: "Labour Tribunal e-Services > Appointment Booking",
    pageTitle: "Appointment Booking",
    help: "Help",
    language: "Language",
    fontSize: "Font Size",
    continue: "Continue",
    back: "Back",
    accept: "Accept Appointment",
    suggestAnother: "Suggest Another Date",
    terminate: "Terminate the appointment booking process",
    confirm: "Confirm",
    cancel: "Cancel",
    return: "Return",
    introTitle: "Appointment Booking Instructions",
    introText: "Please enter your Labour Tribunal case reference number to book an appointment. The system will arrange the earliest available appointment time based on court scheduling.",
    ldRefLabel: "Labour Tribunal Case Reference No.",
    contactTelLabel: "Contact Telephone No.",
    noOfClaimantsLabel: "No. of Claimants",
    importantNotice: "Important Notice",
    noticeText: [
      "Please ensure the contact telephone number provided is correct.",
      "If you need to reschedule, please notify at least 3 working days in advance.",
      "Please arrive on time. Late arrival may require rescheduling."
    ],
    appointmentResult: "Appointment Result",
    appointmentDate: "Appointment Date",
    appointmentTime: "Appointment Time",
    appointmentLocation: "Appointment Location",
    location: "Labour Tribunal - 36 Gascoigne Road, G/F, Kowloon",
    confirmSuggest: "Are you sure to give up this appointment date?",
    verification: "Verification",
    enterCaptcha: "Please enter the characters shown in the image",
    confirmed: "Appointment Confirmed",
    confirmedText: "Your appointment has been successfully confirmed. Please save the following information for reference.",
    referenceNo: "Reference No.",
    reminders: "Reminders",
    reminderText: [
      "Please arrive on time at the appointment location.",
      "If you need to reschedule, please notify at least 3 working days in advance.",
      "Please bring relevant documents to the appointment."
    ]
  }
};

interface FormData {
  ldRefPrefix: string;
  ldRefYear: string;
  ldRefNumber: string;
  contactTel: string;
  noOfClaimants: string;
}

export default function AppointmentBooking() {
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    ldRefPrefix: '',
    ldRefYear: '',
    ldRefNumber: '',
    contactTel: '',
    noOfClaimants: ''
  });
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [captcha, setCaptcha] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [referenceNo, setReferenceNo] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang');
    if (lang === 'en' || lang === 'zh') setLanguage(lang);
    initializeTextSize();
  }, []);

  const t = translations[language];

  const handleContinue = () => {
    setCurrentStep('input');
  };

  const handleFormSubmit = () => {
    // Simulate getting appointment result
    setAppointmentData({
      date: '2026-05-15',
      time: '14:30',
      location: t.location
    });
    setCurrentStep('result');
  };

  const handleAccept = () => {
    setCurrentStep('verification');
  };

  const handleSuggestAnother = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSuggest = () => {
    setShowConfirmDialog(false);
    // Generate a new random appointment date/time
    const dates = ['2026-05-16', '2026-05-17', '2026-05-19', '2026-05-20', '2026-05-21'];
    const times = ['09:30', '10:00', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'];
    const randomDate = dates[Math.floor(Math.random() * dates.length)];
    const randomTime = times[Math.floor(Math.random() * times.length)];
    setAppointmentData({
      date: randomDate,
      time: randomTime,
      location: t.location
    });
  };

  const handleTerminate = () => {
    window.location.href = '/';
  };

  const handleVerification = () => {
    // Generate reference number
    const ref = `LR${new Date().getFullYear()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    setReferenceNo(ref);
    setCurrentStep('confirmed');
  };

  const renderIntro = () => (
    <div style={{ padding: '20px 0' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#012056' }}>{t.introTitle}</h2>
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#334155', marginBottom: '20px' }}>{t.introText}</p>
      <button
        type="button"
        onClick={handleContinue}
        style={{
          padding: '10px 24px',
          fontSize: '15px',
          backgroundColor: '#012056',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 500
        }}
      >
        {t.continue}
      </button>
    </div>
  );

  const renderInput = () => (
    <div style={{ padding: '20px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ padding: '12px 0', verticalAlign: 'top', width: '35%' }}>
              <label style={{ fontSize: '16px', fontWeight: 500, color: '#334155' }}>{t.ldRefLabel}</label>
            </td>
            <td style={{ padding: '12px 0' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={formData.ldRefPrefix}
                  onChange={(e) => setFormData({ ...formData, ldRefPrefix: e.target.value })}
                  style={{ width: '70px', padding: '10px 12px', fontSize: '16px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  placeholder="LR"
                />
                <input
                  type="text"
                  value={formData.ldRefYear}
                  onChange={(e) => setFormData({ ...formData, ldRefYear: e.target.value })}
                  style={{ width: '70px', padding: '10px 12px', fontSize: '16px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  placeholder="2026"
                />
                <input
                  type="text"
                  value={formData.ldRefNumber}
                  onChange={(e) => setFormData({ ...formData, ldRefNumber: e.target.value })}
                  style={{ width: '120px', padding: '10px 12px', fontSize: '16px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  placeholder="1234"
                />
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '12px 0', verticalAlign: 'top' }}>
              <label style={{ fontSize: '16px', fontWeight: 500, color: '#334155' }}>{t.contactTelLabel}</label>
            </td>
            <td style={{ padding: '12px 0' }}>
              <input
                type="text"
                value={formData.contactTel}
                onChange={(e) => setFormData({ ...formData, contactTel: e.target.value })}
                style={{ width: '300px', padding: '10px 12px', fontSize: '16px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </td>
          </tr>
          <tr>
            <td style={{ padding: '12px 0', verticalAlign: 'top' }}>
              <label style={{ fontSize: '16px', fontWeight: 500, color: '#334155' }}>{t.noOfClaimantsLabel}</label>
            </td>
            <td style={{ padding: '12px 0' }}>
              <input
                type="text"
                value={formData.noOfClaimants}
                onChange={(e) => setFormData({ ...formData, noOfClaimants: e.target.value })}
                style={{ width: '120px', padding: '10px 12px', fontSize: '16px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </td>
          </tr>
        </tbody>
      </table>
      
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '12px', color: '#92400e' }}>{t.importantNotice}</h3>
        <ul style={{ fontSize: '16px', lineHeight: '1.6', color: '#78350f', paddingLeft: '20px', margin: 0 }}>
          {t.noticeText.map((text, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>{text}</li>
          ))}
        </ul>
      </div>
      
      <div style={{ marginTop: '24px' }}>
        <button
          type="button"
          onClick={handleFormSubmit}
          style={{
            padding: '10px 24px',
            fontSize: '15px',
            backgroundColor: '#012056',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          {t.continue}
        </button>
      </div>
    </div>
  );

  const renderResult = () => (
    <div style={{ padding: '20px 0' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#012056' }}>{t.appointmentResult}</h2>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
        <tbody>
          <tr>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0', width: '35%' }}>
              <span style={{ fontSize: '16px', fontWeight: 500, color: '#64748b' }}>{t.ldRefLabel}</span>
            </td>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '16px', color: '#334155' }}>
                {formData.ldRefPrefix}/{formData.ldRefYear}/{formData.ldRefNumber}
              </span>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '16px', fontWeight: 500, color: '#64748b' }}>{t.contactTelLabel}</span>
            </td>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '16px', color: '#334155' }}>{formData.contactTel}</span>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '16px', fontWeight: 500, color: '#64748b' }}>{t.noOfClaimantsLabel}</span>
            </td>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '16px', color: '#334155' }}>{formData.noOfClaimants}</span>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '16px', fontWeight: 500, color: '#64748b' }}>{t.appointmentDate}</span>
            </td>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#012056' }}>{appointmentData?.date}</span>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '16px', fontWeight: 500, color: '#64748b' }}>{t.appointmentTime}</span>
            </td>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#012056' }}>{appointmentData?.time}</span>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '12px 0' }}>
              <span style={{ fontSize: '16px', fontWeight: 500, color: '#64748b' }}>{t.appointmentLocation}</span>
            </td>
            <td style={{ padding: '12px 0' }}>
              <span style={{ fontSize: '16px', color: '#334155' }}>{appointmentData?.location}</span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleAccept}
          style={{
            padding: '10px 24px',
            fontSize: '15px',
            backgroundColor: '#012056',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          {t.accept}
        </button>
        <button
          type="button"
          onClick={handleSuggestAnother}
          style={{
            padding: '10px 24px',
            fontSize: '15px',
            backgroundColor: '#fff',
            color: '#012056',
            border: '1px solid #012056',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          {t.suggestAnother}
        </button>
        <button
          type="button"
          onClick={handleTerminate}
          style={{
            padding: '10px 24px',
            fontSize: '15px',
            backgroundColor: '#fff',
            color: '#64748b',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          {t.terminate}
        </button>
      </div>
    </div>
  );

  const renderVerification = () => (
    <div style={{ padding: '20px 0' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#012056' }}>{t.verification}</h2>
      
      <div style={{ border: '2px solid #dc2626', padding: '24px', backgroundColor: '#fef2f2', marginBottom: '24px', borderRadius: '8px' }}>
        <div style={{ backgroundColor: '#e5e7eb', padding: '16px', marginBottom: '16px', textAlign: 'center', borderRadius: '4px' }}>
          <span style={{ fontSize: '26px', fontWeight: 'bold', letterSpacing: '4px', color: '#1f2937' }}>ABCD</span>
        </div>
        <div>
          <label style={{ fontSize: '16px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '8px' }}>{t.enterCaptcha}</label>
          <input
            type="text"
            value={captcha}
            onChange={(e) => setCaptcha(e.target.value)}
            style={{ width: '200px', padding: '10px 14px', fontSize: '18px', border: '1px solid #cbd5e1', borderRadius: '4px', letterSpacing: '2px' }}
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="button"
          onClick={handleVerification}
          style={{
            padding: '10px 24px',
            fontSize: '15px',
            backgroundColor: '#012056',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          {t.confirm}
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep('result')}
          style={{
            padding: '10px 24px',
            fontSize: '15px',
            backgroundColor: '#fff',
            color: '#64748b',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          {t.cancel}
        </button>
      </div>
    </div>
  );

  const renderConfirmed = () => (
    <div style={{ padding: '20px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ width: '64px', height: '64px', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '12px', color: '#16a34a' }}>{t.confirmed}</h2>
        <p style={{ fontSize: '17px', lineHeight: '1.6', color: '#475569', marginBottom: '24px' }}>{t.confirmedText}</p>
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
        <tbody>
          <tr>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0', width: '35%' }}>
              <span style={{ fontSize: '16px', fontWeight: 500, color: '#64748b' }}>{t.referenceNo}</span>
            </td>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#012056', letterSpacing: '1px' }}>{referenceNo}</span>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '16px', fontWeight: 500, color: '#64748b' }}>{t.appointmentDate}</span>
            </td>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#012056' }}>{appointmentData?.date}</span>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '16px', fontWeight: 500, color: '#64748b' }}>{t.appointmentTime}</span>
            </td>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#012056' }}>{appointmentData?.time}</span>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '12px 0' }}>
              <span style={{ fontSize: '16px', fontWeight: 500, color: '#64748b' }}>{t.appointmentLocation}</span>
            </td>
            <td style={{ padding: '12px 0' }}>
              <span style={{ fontSize: '16px', color: '#334155' }}>{appointmentData?.location}</span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '12px', color: '#0369a1' }}>{t.reminders}</h3>
        <ul style={{ fontSize: '16px', lineHeight: '1.6', color: '#0c4a6e', paddingLeft: '20px', margin: 0 }}>
          {t.reminderText.map((text, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>{text}</li>
          ))}
        </ul>
      </div>
      
      <div style={{ marginTop: '24px' }}>
        <button
          type="button"
          onClick={() => window.location.href = '/'}
          style={{
            padding: '10px 24px',
            fontSize: '15px',
            backgroundColor: '#012056',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          {t.return}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="page-shell">
        <AppShellHeader
          brandEyebrow={language === 'zh' ? '司法機構 勞資審裁處' : 'JUDICIARY LABOUR TRIBUNAL'}
          brandTitle={t.pageTitle}
          language={language}
          onToggleLanguage={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} style={{ backdropFilter: 'blur(4px)' }} />
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-xl pt-safe" style={{ animation: 'slideInRight 0.3s ease-out' }}>
              <div className="flex items-center justify-between p-4 border-b" style={{ borderBottomColor: '#E2E8F0' }}>
                <h2 className="text-lg font-semibold" style={{ fontFamily: 'Noto Sans TC, sans-serif', color: '#012056' }}>{language === 'zh' ? '選單' : 'Menu'}</h2>
                <button type="button" onClick={() => setMobileMenuOpen(false)} className="touch-target flex items-center justify-center p-2 rounded-lg hover:bg-gray-100" aria-label={language === 'zh' ? '關閉' : 'Close'}>
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Noto Sans TC, sans-serif', color: '#64748B' }}>{language === 'zh' ? '語言' : 'Language'}</label>
                  <button type="button" onClick={() => { setLanguage(language === 'zh' ? 'en' : 'zh'); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors touch-target" style={{ borderColor: '#E2E8F0', fontFamily: 'Noto Sans TC, sans-serif' }}>
                    <Globe size={20} />
                    <span className="font-medium">{language === 'zh' ? 'EN' : '中文'}</span>
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Noto Sans TC, sans-serif', color: '#64748B' }}>{language === 'zh' ? '字體大小' : 'Font Size'}</label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => handleFontControlClick('sm')} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors touch-target" style={{ borderColor: '#E2E8F0', fontFamily: 'Noto Sans TC, sans-serif' }}>
                      <Type size={16} />
                      <span className="text-sm">A</span>
                    </button>
                    <button type="button" onClick={() => handleFontControlClick('md')} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors touch-target" style={{ borderColor: '#012056', backgroundColor: '#F0F5FA', fontFamily: 'Noto Sans TC, sans-serif' }}>
                      <Type size={18} />
                      <span className="text-base font-medium">A</span>
                    </button>
                    <button type="button" onClick={() => handleFontControlClick('lg')} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors touch-target" style={{ borderColor: '#E2E8F0', fontFamily: 'Noto Sans TC, sans-serif' }}>
                      <Type size={20} />
                      <span className="text-lg">A</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <main style={{ background: '#F0F5FA', minHeight: 'calc(100vh - 6.25rem)', padding: '2rem 1rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ padding: '24px' }}>
                {currentStep === 'intro' && renderIntro()}
                {currentStep === 'input' && renderInput()}
                {currentStep === 'result' && renderResult()}
                {currentStep === 'verification' && renderVerification()}
                {currentStep === 'confirmed' && renderConfirmed()}
              </div>
            </div>
          </div>
        </main>
      </div>
      {showConfirmDialog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', minWidth: '400px', maxWidth: '90%' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#012056' }}>{language === 'zh' ? '確認' : 'Confirm'}</h3>
            <p style={{ fontSize: '17px', lineHeight: '1.6', color: '#334155', marginBottom: '24px' }}>{t.confirmSuggest}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                style={{ padding: '10px 24px', fontSize: '15px', backgroundColor: '#fff', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmSuggest}
                style={{ padding: '10px 24px', fontSize: '15px', backgroundColor: '#012056', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

