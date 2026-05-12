import React from 'react';
import { CheckCircle, Calendar, Clock, MapPin, AlertCircle, HelpCircle } from 'lucide-react';
import { initializeTextSize } from '../lib/accessibility';
import AppShellHeader from './layout/AppShellHeader';
import { replaceAppLocation } from '../lib/navigation';

interface AppointmentData {
  date: string;
  time: string;
  location: string;
}

interface AppointmentSuccessProps {
  appointmentData: AppointmentData;
  lang?: 'en' | 'zh';
}

const translations = {
  en: {
    title: 'Your Appointment has been confirmed',
    brandEyebrow: 'JUDICIARY LABOUR TRIBUNAL',
    brandTitle: 'Appointment Booking',
    secureConnection: 'Secure Connection',
    detailsHeader: 'Appointment Details',
    date: 'Appointment Date',
    time: 'Appointment Time',
    location: 'Appointment Location',
    remindersHeader: 'Crucial Reminders',
    reminders: [
      'Claimant should report to the Labour Tribunal on the date of appointment.',
      'Please bring along all relevant documents relating to this labour dispute and arrive the Labour Tribunal at the specific time and date of the appointment.',
      'Please be punctual because there are appointments in each and every session of time.',
      'Furthermore, you will have to pay the filing fee before our Accounts Office closes. The closing hours of our Accounts Office is 5:30 pm from Mondays to Fridays.',
      'If you no longer require this appointment for whatever reason, please cancel via this web page or the telephone appointment booking service at 2625 0056.'
    ],
    returnBtn: 'Return to Homepage'
  },
  zh: {
    title: '你的預約已確認',
    brandEyebrow: '司法機構 勞資審裁處',
    brandTitle: '預約時間',
    secureConnection: '安全加密連線',
    detailsHeader: '預約詳情',
    date: '預約日期',
    time: '預約時間',
    location: '預約地點',
    remindersHeader: '重要提示',
    reminders: [
      '申索人必須於預約日期前往勞資審裁處報到。',
      '請帶備所有與此勞資糾紛相關的文件，並於指定的時間和日期抵達勞資審裁處。',
      '由於每個時段均有其他預約，請務必準時出席。',
      '此外，你必須在我們的會計部辦公時間結束前繳交立案費。會計部的辦公時間為星期一至五下午 5:30 前。',
      '如果你因任何原因不再需要此預約，請透過此網頁或致電 2625 0056 電話預約系統取消預約。'
    ],
    returnBtn: '返回主頁'
  }
};

const AppointmentSuccess: React.FC<AppointmentSuccessProps> = ({ appointmentData, lang = 'en' }) => {
  const t = translations[lang];
  const [helpOpen, setHelpOpen] = React.useState(false);

  React.useEffect(() => {
    if (typeof initializeTextSize === 'function') {
      initializeTextSize();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F5FA]">
      <AppShellHeader
        brandEyebrow={t.brandEyebrow}
        brandTitle={t.brandTitle}
        pageTitle={t.title}
        language={lang}
        onToggleLanguage={() => {
          const newLang = lang === 'zh' ? 'en' : 'zh';
          replaceAppLocation(`/appointment-booking?lang=${newLang}`);
        }}
        desktopActions={(
          <button
            type="button"
            className="text-button"
            onClick={() => setHelpOpen(!helpOpen)}
            aria-label={lang === 'zh' ? '幫助' : 'Help'}
            style={{
              padding: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#ffffff',
              borderRadius: '4px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(80, 116, 171, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        )}
      />

      <main className="main-content" style={{
        background: '#F0F5FA',
        minHeight: 'calc(100vh - 72px)',
        padding: '2rem 1rem'
      }}>
        <section className="centered-panel wide-panel" style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div className="hero-chat-card animate-slide-in-up" style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 4px 24px rgba(1, 32, 86, 0.08)',
            padding: '3rem'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 style={{
                fontFamily: 'Noto Sans TC, sans-serif',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#012056',
                margin: '0 0 0.75rem 0',
                letterSpacing: '-0.02em',
                lineHeight: '1.2'
              }}>
                {t.title}
              </h1>
            </div>

            {/* Details Section with Icons */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontFamily: 'Noto Sans TC, sans-serif',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#012056',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid #E5E7EB'
              }}>{t.detailsHeader}</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                {/* Date */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    padding: '0.75rem',
                    background: '#F4F7FB',
                    borderRadius: '0.5rem',
                    color: '#012056'
                  }}>
                    <Calendar style={{ width: '24px', height: '24px' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>{t.date}</p>
                    <p style={{ fontSize: '1rem', fontWeight: 500, color: '#111827' }}>{appointmentData.date}</p>
                  </div>
                </div>

                {/* Time */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    padding: '0.75rem',
                    background: '#F4F7FB',
                    borderRadius: '0.5rem',
                    color: '#012056'
                  }}>
                    <Clock style={{ width: '24px', height: '24px' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>{t.time}</p>
                    <p style={{ fontSize: '1rem', fontWeight: 500, color: '#111827' }}>{appointmentData.time}</p>
                  </div>
                </div>

                {/* Location */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    padding: '0.75rem',
                    background: '#F4F7FB',
                    borderRadius: '0.5rem',
                    color: '#012056'
                  }}>
                    <MapPin style={{ width: '24px', height: '24px' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>{t.location}</p>
                    <p style={{ fontSize: '1rem', fontWeight: 500, color: '#111827', lineHeight: 1.4 }}>{appointmentData.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Crucial Reminders Section */}
            <div style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '0.75rem',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <AlertCircle style={{ width: '24px', height: '24px', color: '#012056' }} />
                <h2 style={{
                  fontFamily: 'Noto Sans TC, sans-serif',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: '#012056',
                  margin: 0
                }}>{t.remindersHeader}</h2>
              </div>
              <ul style={{
                listStyle: 'disc',
                paddingLeft: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.875rem',
                color: '#374151',
                lineHeight: 1.6
              }}>
                {t.reminders.map((reminder, index) => (
                  <li key={index} style={{ lineHeight: '1.6' }}>{reminder}</li>
                ))}
              </ul>
            </div>

            {/* Action Footer */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => replaceAppLocation('')}
                style={{
                  background: '#012056',
                  color: '#FFFFFF',
                  padding: '0.75rem 2rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: 'none'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#02307d'}
                onMouseOut={(e) => e.currentTarget.style.background = '#012056'}
              >
                {t.returnBtn}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AppointmentSuccess;
