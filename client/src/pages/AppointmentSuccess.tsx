import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, MapPin, Phone } from 'lucide-react';
import { initializeTextSize } from '../lib/accessibility';
import AppShellHeader from '../components/layout/AppShellHeader';
import { homeTypographyScale } from '../const';

type Language = 'zh' | 'en';
type PartyRole = 'claimant' | 'defendant';

type AppointmentLocation = {
  id?: string;
  name: string;
  address: string;
};

type PersonalData = {
  ldRefNo: string;
  claimantName: string;
  claimants: string;
  hkid: string;
  address: string;
  contactTel: string;
};

const translations = {
  zh: {
    brandEyebrow: '勞資審裁處 / Labour Tribunal',
    brandTitle: '網上啟動平台',
    successTitle: '預約成功',
    successSubtitle: '你的預約已確認',
    personalInfoTitle: '申索人資料',
    claimantNameLabel: '申索人姓名',
    claimantsLabel: '申索人人數',
    importantNoticeTitle: '重要提示',
    importantNotice: '請帶備所有與本案有關的正本文件，並於預約時間前至少 15 分鐘到達勞資審裁處。如需更改或取消預約，請盡早通知本處。',
    expectationTitle: '重要：首次會面須知',
    expectationWarning: '此預約為案件管理及文件核對用途，並非正式聆訊。請準時到達，並預留足夠時間完成登記程序。',
    locationValue: '九龍加士居道 36 號勞資審裁處',
    referenceLabel: '預約參考編號',
    referenceValue: 'LT-APT-2026-04121',
    appointmentDateLabel: '預約日期',
    appointmentTimeLabel: '預約時間',
    locationLabel: '預約地點',
    contactLabel: '查詢電話',
    contactValue: '2625 0056',
    ldRefLabel: '勞工處檔案編號',
    hkidLabel: '香港身份證號碼',
    addressLabel: '通訊地址',
    contactTelLabel: '聯絡電話',
    printLabel: '列印確認通知',
    backLabel: '返回主頁'
  },
  en: {
    brandEyebrow: 'Labour Tribunal / Judiciary',
    brandTitle: 'Online Commencement Platform',
    successTitle: 'Appointment Confirmed',
    successSubtitle: 'Your appointment has been reserved',
    personalInfoTitle: 'Claimant Information',
    claimantNameLabel: 'Claimant Name',
    claimantsLabel: 'No. of Claimants',
    importantNoticeTitle: 'Important Notice',
    importantNotice: 'Please bring all original documents relevant to this case and arrive at the Labour Tribunal at least 15 minutes before your appointment. If you need to reschedule or cancel, please notify the Tribunal as early as possible.',
    expectationTitle: 'Important: First Interview Expectations',
    expectationWarning: 'This appointment is for case intake and document checking only. It is not a formal hearing. Please arrive on time and allow enough time for registration.',
    locationValue: 'Labour Tribunal, 36 Gascoigne Road, Kowloon',
    referenceLabel: 'Appointment Reference Number',
    referenceValue: 'LT-APT-2026-04121',
    appointmentDateLabel: 'Appointment Date',
    appointmentTimeLabel: 'Appointment Time',
    locationLabel: 'Appointment Location',
    contactLabel: 'Contact Number',
    contactValue: '2625 0056',
    ldRefLabel: 'Labour Department Reference No.',
    hkidLabel: 'HKID / Business Registration No.',
    addressLabel: 'Correspondence Address',
    contactTelLabel: 'Contact Telephone',
    printLabel: 'Print Confirmation',
    backLabel: 'Return to Homepage'
  }
} as const;

function getMockPersonalData(language: Language, role: PartyRole): PersonalData {
  if (role === 'defendant') {
    return language === 'zh'
      ? {
          ldRefNo: 'LD-DEF-2026-0184',
          claimantName: '宏達工程有限公司',
          claimants: '1',
          hkid: 'BR 48297163',
          address: '香港九龍觀塘開源道 55 號開聯工業中心 12 樓',
          contactTel: '9345 8821'
        }
      : {
          ldRefNo: 'LD-DEF-2026-0184',
          claimantName: 'Wang Tat Engineering Limited',
          claimants: '1',
          hkid: 'BR 48297163',
          address: '12/F, Hoi Luen Industrial Centre, 55 Hoi Yuen Road, Kwun Tong, Kowloon',
          contactTel: '9345 8821'
        };
  }

  return language === 'zh'
    ? {
        ldRefNo: 'LD-CLM-2026-0412',
        claimantName: '陳小玲',
        claimants: '1',
        hkid: 'M123456(7)',
        address: '新界沙田乙明邨明信樓 8 樓 12 室',
        contactTel: '6123 4567'
      }
    : {
        ldRefNo: 'LD-CLM-2026-0412',
        claimantName: 'Chan Siu Ling',
        claimants: '1',
        hkid: 'M123456(7)',
        address: 'Flat 12, 8/F, Ming Shun House, Jat Min Chuen, Sha Tin, New Territories',
        contactTel: '6123 4567'
      };
}

export default function AppointmentSuccess() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialLanguage = searchParams.get('lang') === 'en' ? 'en' : 'zh';
  const role: PartyRole = searchParams.get('role') === 'defendant' ? 'defendant' : 'claimant';

  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentLocation, setAppointmentLocation] = useState<AppointmentLocation | null>(null);

  useEffect(() => {
    initializeTextSize();

    const savedDate = sessionStorage.getItem('selectedApptDate');
    const savedTime = sessionStorage.getItem('selectedApptTime');
    const savedLocation = sessionStorage.getItem('selectedApptLocation');

    if (savedDate) {
      setAppointmentDate(savedDate);
    }

    if (savedTime) {
      setAppointmentTime(savedTime);
    }

    if (savedLocation) {
      try {
        setAppointmentLocation(JSON.parse(savedLocation) as AppointmentLocation);
      } catch {
        setAppointmentLocation(null);
      }
    }
  }, []);

  const t = translations[language];
  const isDefendantFlow = role === 'defendant';
  const personalData = getMockPersonalData(language, role);
  const successTitle = isDefendantFlow
    ? (language === 'zh' ? '調查主任會面已確認' : 'Investigating Officer Interview Confirmed')
    : t.successTitle;
  const successSubtitle = isDefendantFlow
    ? (language === 'zh' ? '你的被告人口供會面時間已預留' : 'Your defence interview appointment has been reserved')
    : t.successSubtitle;
  const personalInfoTitle = isDefendantFlow
    ? (language === 'zh' ? '被告人資料' : 'Defendant Information')
    : t.personalInfoTitle;
  const partyNameLabel = isDefendantFlow
    ? (language === 'zh' ? '被告人姓名／公司名稱' : 'Defendant Name / Company Name')
    : t.claimantNameLabel;
  const partyCountLabel = isDefendantFlow
    ? (language === 'zh' ? '被告人數目' : 'No. of Defendants')
    : t.claimantsLabel;
  const importantNoticeTitle = isDefendantFlow
    ? (language === 'zh' ? '請帶備的正本文件' : 'Original Documents to Bring')
    : t.importantNoticeTitle;
  const importantNotice = isDefendantFlow
    ? (language === 'zh'
      ? '請攜帶以下正本文件出席與調查主任的會面：\n• 商業登記證或香港身份證\n• 僱傭合約及任何修訂\n• 糧單、強積金供款及出勤紀錄\n• 解僱信、辭職信或相關通訊紀錄\n• 任何擬依賴的證人陳述或支持文件\n\n如需更改或取消預約，請至少提前 3 個工作日通知本處。'
      : 'Please bring the following original documents to your interview with the Investigating Officer:\n• Business Registration Certificate or HKID\n• Employment contract and any amendments\n• Payslips, MPF contribution records and attendance records\n• Dismissal letter, resignation letter or related communications\n• Any witness statements or supporting documents you intend to rely on\n\nTo reschedule or cancel the appointment, please notify the Tribunal at least 3 working days in advance.')
    : t.importantNotice;
  const expectationTitle = isDefendantFlow
    ? (language === 'zh' ? '重要：被告人口供會面須知' : 'Important: Defendant Interview Expectations')
    : t.expectationTitle;
  const expectationWarning = isDefendantFlow
    ? (language === 'zh'
      ? '此會面為調查主任錄取口供及整理文件之用，並非正式聆訊。\n\n當日不會裁定責任或命令付款。\n\n請準時到達，並帶同所有正本文件。'
      : 'This meeting is for the Investigating Officer to record your defence statement and organise documents. It is not a formal hearing.\n\nNo liability or payment order will be determined on that day.\n\nPlease arrive on time with all original documents.')
    : t.expectationWarning;
  const displayLocation = appointmentLocation
    ? `${appointmentLocation.name}\n${appointmentLocation.address}`
    : t.locationValue;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-shell">
      <AppShellHeader
        brandEyebrow={t.brandEyebrow}
        brandTitle={t.brandTitle}
        pageTitle={successTitle}
        pageSubtitle={successSubtitle}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
      />

      <main className="main-content" style={{
        background: '#F0F5FA',
        minHeight: 'calc(100vh - 72px)',
        padding: '2rem 1rem'
      }}>
        <section className="success-section" style={{
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <div className="success-card animate-slide-in-up" style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 4px 24px rgba(1, 32, 86, 0.08)',
            padding: '1.5rem md:p-12',
            marginBottom: '1rem md:mb-8'
          }}>
            {/* Success Icon */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1rem md:mb-6'
            }}>
              <div className="icon-container icon-stroke icon-container-circle" style={{ width: '60px md:w-20', height: '60px md:h-20', borderRadius: '50%' }}>
                <CheckCircle style={{ width: '36px md:w-12', height: '36px md:h-12' }} />
              </div>
            </div>

            {/* Success Title */}
            <h1 style={{
              fontFamily: 'Noto Sans TC, sans-serif',
              fontSize: homeTypographyScale.pageTitle,
              fontWeight: 700,
              color: '#012056',
              margin: '0 0 0.5rem',
              textAlign: 'center',
              letterSpacing: '-0.02em'
            }}>{successTitle}</h1>
            <p style={{
              fontFamily: 'Noto Sans TC, sans-serif',
              fontSize: homeTypographyScale.body,
              color: '#64748b',
              margin: '0 0 1.5rem',
              textAlign: 'center'
            }}>{successSubtitle}</p>

            {/* Reference Number */}
            <div style={{
              background: 'rgba(201, 162, 39, 0.08)',
              border: '2px solid #c9a227',
              borderRadius: '8px',
              padding: '1rem md:p-5',
              textAlign: 'center',
              marginBottom: '1.5rem md:mb-8'
            }}>
              <span style={{
                fontFamily: 'Noto Sans TC, sans-serif',
                fontSize: homeTypographyScale.metadata,
                color: '#64748b',
                display: 'block',
                marginBottom: '0.375rem'
              }}>{t.referenceLabel}</span>
              <span className="reference-value">{t.referenceValue}</span>
            </div>

            {/* Appointment Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr md:grid-cols-2 lg:grid-cols-3',
              gap: '0.75rem md:gap-4',
              marginBottom: '1.5rem md:mb-8'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem md:gap-3',
                padding: '0.75rem md:p-4',
                background: '#f8fafc',
                border: '2px solid #e2e8f0',
                borderRadius: '8px'
              }}>
                <div className="icon-container icon-container-sm icon-stroke">
                  <Calendar style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <span style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: homeTypographyScale.helper,
                    color: '#64748b',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>{t.appointmentDateLabel}</span>
                  <span style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: homeTypographyScale.body,
                    fontWeight: 600,
                    color: '#0f3040'
                  }}>{appointmentDate || (language === 'zh' ? '2026年4月21日 (星期二)' : '21 April 2026 (Tuesday)')}</span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem md:gap-3',
                padding: '0.75rem md:p-4',
                background: '#f8fafc',
                border: '2px solid #e2e8f0',
                borderRadius: '8px'
              }}>
                <div className="icon-container icon-container-sm icon-stroke">
                  <Clock style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <span style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: homeTypographyScale.helper,
                    color: '#64748b',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>{t.appointmentTimeLabel}</span>
                  <span style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: homeTypographyScale.body,
                    fontWeight: 600,
                    color: '#0f3040'
                  }}>{appointmentTime || (language === 'zh' ? '下午 2:30 - 3:30' : '2:30 - 3:30 pm')}</span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem md:gap-3',
                padding: '0.75rem md:p-4',
                background: '#f8fafc',
                border: '2px solid #e2e8f0',
                borderRadius: '8px'
              }}>
                <div className="icon-container icon-container-sm icon-stroke">
                  <MapPin style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <span style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: homeTypographyScale.helper,
                    color: '#64748b',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>{t.locationLabel}</span>
                  <span style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: homeTypographyScale.body,
                    fontWeight: 600,
                    color: '#0f3040'
                  }}>{displayLocation}</span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem md:gap-3',
                padding: '0.75rem md:p-4',
                background: '#f8fafc',
                border: '2px solid #e2e8f0',
                borderRadius: '8px'
              }}>
                <div className="icon-container icon-container-sm icon-stroke">
                  <Phone style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <span style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: homeTypographyScale.helper,
                    color: '#64748b',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>{t.contactLabel}</span>
                  <span style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: homeTypographyScale.body,
                    fontWeight: 600,
                    color: '#0f3040'
                  }}>{t.contactValue}</span>
                </div>
              </div>
            </div>

            {/* Personal Information Section - Collected from prior steps */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              background: 'rgba(201, 162, 39, 0.05)',
              border: '2px solid #c9a227',
              borderRadius: '8px'
            }}>
              <h3 style={{
                fontFamily: 'Noto Sans TC, sans-serif',
                fontSize: homeTypographyScale.sectionHeading,
                fontWeight: 600,
                color: '#012056',
                margin: '0 0 1rem 0'
              }}>
                {personalInfoTitle}
              </h3>

              {/* Display LD Ref No. */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  padding: '1rem',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0'
                }}>
                  <div style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: homeTypographyScale.metadata,
                    color: '#64748b',
                    marginBottom: '0.25rem'
                  }}>{t.ldRefLabel}</div>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: homeTypographyScale.body,
                    fontWeight: 600,
                    color: '#012056'
                  }}>{personalData.ldRefNo}</div>
                </div>
                <div style={{
                  padding: '1rem',
                  background: 'rgba(15, 72, 96, 0.04)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(15, 72, 96, 0.08)'
                }}>
                  <div style={{
                    fontSize: homeTypographyScale.metadata,
                    color: '#495b6b',
                    marginBottom: '0.25rem'
                  }}>{partyCountLabel}</div>
                  <div style={{
                    fontSize: homeTypographyScale.body,
                    fontWeight: 600,
                    color: '#012056'
                  }}>{personalData.claimants}</div>
                </div>
              </div>

              {/* Party Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{
                  padding: '1rem',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0'
                }}>
                  <div style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: homeTypographyScale.metadata,
                    color: '#64748b',
                    marginBottom: '0.25rem'
                  }}>{partyNameLabel}</div>
                  <div style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: homeTypographyScale.body,
                    fontWeight: 600,
                    color: '#012056'
                  }}>{personalData.claimantName}</div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0'
                }}>
                  <div style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: homeTypographyScale.metadata,
                    color: '#64748b',
                    marginBottom: '0.25rem'
                  }}>{t.hkidLabel}</div>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: homeTypographyScale.body,
                    fontWeight: 600,
                    color: '#012056'
                  }}>{personalData.hkid}</div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0'
                }}>
                  <div style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: homeTypographyScale.metadata,
                    color: '#64748b',
                    marginBottom: '0.25rem'
                  }}>{t.addressLabel}</div>
                  <div style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: homeTypographyScale.body,
                    fontWeight: 600,
                    color: '#012056',
                    lineHeight: 1.5
                  }}>{personalData.address}</div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0'
                }}>
                  <div style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: homeTypographyScale.metadata,
                    color: '#64748b',
                    marginBottom: '0.25rem'
                  }}>{t.contactTelLabel}</div>
                  <div style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    fontSize: homeTypographyScale.body,
                    fontWeight: 600,
                    color: '#012056'
                  }}>{personalData.contactTel}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '2rem',
              justifyContent: 'center'
            }}>
              <button
                type="button"
                onClick={handlePrint}
                style={{
                  padding: '0.875rem 1.5rem',
                  background: '#0f3040',
                  color: '#ffffff',
                  border: '2px solid #0f3040',
                  borderRadius: '8px',
                  fontSize: homeTypographyScale.button,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Noto Sans TC, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#1a3a4a'}
                onMouseOut={(e) => e.currentTarget.style.background = '#0f3040'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                {t.printLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  window.history.pushState({}, '', '/');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                style={{
                  padding: '0.875rem 1.5rem',
                  background: '#ffffff',
                  color: '#012056',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: homeTypographyScale.button,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Noto Sans TC, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#c9a227';
                  e.currentTarget.style.background = 'rgba(201, 162, 39, 0.05)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#ffffff';
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                {t.backLabel}
              </button>
            </div>
          </div>
        </section>

        {/* Important Notice */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto 2rem auto',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(15, 48, 64, 0.08)',
          padding: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '3px solid #012056'
          }}>
            <h3 style={{
              fontFamily: 'Noto Sans TC, sans-serif',
              fontSize: homeTypographyScale.sectionHeading,
              fontWeight: 700,
              color: '#012056',
              margin: 0
            }}>{importantNoticeTitle}</h3>
          </div>
          <p style={{
            fontFamily: 'Noto Sans TC, sans-serif',
            fontSize: homeTypographyScale.body,
            color: '#64748b',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
            margin: 0
          }}>{importantNotice}</p>
        </div>

        {/* Expectation Management Warning - Yellow Box */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto 2rem auto',
          background: '#fefce8', // bg-yellow-50 equivalent
          border: '2px solid #f59e0b', // yellow-500 border
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <h3 style={{
              fontFamily: 'Noto Sans TC, sans-serif',
              fontSize: homeTypographyScale.sectionHeading,
              fontWeight: 700,
              color: '#92400e',
              margin: 0
            }}>{expectationTitle}</h3>
          </div>
          <p style={{
            fontFamily: 'Noto Sans TC, sans-serif',
            fontSize: homeTypographyScale.body,
            color: '#92400e',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
            margin: 0,
            fontWeight: 500
          }}>{expectationWarning}</p>
        </div>
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
          fontSize: homeTypographyScale.button,
          margin: '0.5rem 0',
          color: '#ffffff'
        }}>{language === 'zh' ? '© 2026 香港司法機構。版權所有。' : '© 2026 Hong Kong Judiciary. All rights reserved.'}</p>
        <p style={{
          fontFamily: 'Noto Sans TC, sans-serif',
          fontSize: homeTypographyScale.button,
          margin: '0.5rem 0',
          color: '#5074ab'
        }}>{language === 'zh' ? '網上啟動平台 | 勞資審裁處服務' : 'Online Commencement | Judiciary Labour Tribunal Service'}</p>
      </footer>
    </div>
  );
}
