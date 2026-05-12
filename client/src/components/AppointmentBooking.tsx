import React, { useState, useCallback } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { generateAppointmentDates } from '../lib/dateUtils';
import { getTimeSlots, getLocations, Location } from '../constants/appointmentData';

interface AppointmentBookingProps {
  language: 'zh' | 'en';
  onClose: () => void;
  onComplete?: (details: {
    date: string;
    time: string;
    location: Location;
  }) => void;
}

function AppointmentBooking({ language, onClose, onComplete }: AppointmentBookingProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableDates = generateAppointmentDates(5, language);
  const timeSlots = getTimeSlots(language);
  const locations = getLocations(language);

  const handleConfirmBooking = useCallback(() => {
    if (!selectedDate || !selectedTime || !selectedLocation) return;
    setIsSubmitting(true);
    const selectedLocationData = locations.find((location) => location.id === selectedLocation);
    if (!selectedLocationData) {
      setIsSubmitting(false);
      return;
    }
    
    // Save appointment data to sessionStorage for success page
    sessionStorage.setItem('selectedApptDate', selectedDate);
    sessionStorage.setItem('selectedApptTime', selectedTime);
    sessionStorage.setItem('selectedApptLocation', JSON.stringify(selectedLocationData));
    
    // Simulate booking process
    setTimeout(() => {
      if (onComplete) {
        onComplete({
          date: selectedDate,
          time: selectedTime,
          location: selectedLocationData,
        });
        return;
      }
      window.history.pushState({}, '', `/appointment-success?lang=${language}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, 1000);
  }, [selectedDate, selectedTime, selectedLocation, language, locations, onComplete]);

  const handleMouseOver = useCallback((e: React.MouseEvent<HTMLButtonElement>, isSelected: boolean) => {
    if (!isSelected) {
      e.currentTarget.style.borderColor = '#c9a227';
    }
  }, []);

  const handleMouseOut = useCallback((e: React.MouseEvent<HTMLButtonElement>, isSelected: boolean) => {
    if (!isSelected) {
      e.currentTarget.style.borderColor = '#e2e8f0';
    }
  }, []);

  const handleConfirmMouseOver = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!(isSubmitting || !selectedDate || !selectedTime || !selectedLocation)) {
      e.currentTarget.style.background = '#b89220';
    }
  }, [isSubmitting, selectedDate, selectedTime, selectedLocation]);

  const handleConfirmMouseOut = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!(isSubmitting || !selectedDate || !selectedTime || !selectedLocation)) {
      e.currentTarget.style.background = '#c9a227';
    }
  }, [isSubmitting, selectedDate, selectedTime, selectedLocation]);

  return (
    <>
      {/* Scrollable Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem', width: '100%' }}>
        <div className="booking-header" style={{
          padding: '1.5rem',
          borderBottom: '3px solid #012056',
          background: '#F8F9FA',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h3 className="booking-title" style={{
              fontFamily: 'Noto Sans TC, sans-serif',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#012056',
              margin: 0
            }}>{language === 'zh' ? '預約時間' : 'Select Appointment Time'}</h3>
          </div>
          <p className="booking-subtitle" style={{
            fontFamily: 'Noto Sans TC, sans-serif',
            fontSize: '0.875rem',
            color: '#1A202C',
            margin: 0
          }}>{language === 'zh' ? '請選擇你的預約日期、時間及地點' : 'Please select your appointment date, time, and location'}</p>
        </div>

        {/* Date Selection */}
        <div className="booking-section" style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', width: '100%' }}>
          <div className="section-label" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
            fontFamily: 'Noto Sans TC, sans-serif',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#0f3040'
          }}>
            <Calendar className="section-icon" style={{ color: '#c9a227' }} />
            <span>{language === 'zh' ? '選擇日期' : 'Select Date'}</span>
          </div>
          <div className="date-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            width: '100%'
          }}>
            {availableDates.map((date) => (
              <button
                key={date}
                type="button"
                className={`date-option ${selectedDate === date ? 'selected' : ''}`}
                onClick={() => setSelectedDate(date)}
                style={{
                  padding: '0.75rem',
                  background: selectedDate === date ? '#c9a227' : '#ffffff',
                  color: selectedDate === date ? '#ffffff' : '#0f3040',
                  border: `2px solid ${selectedDate === date ? '#c9a227' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Noto Sans TC, sans-serif'
                }}
                onMouseOver={(e) => handleMouseOver(e, selectedDate === date)}
                onMouseOut={(e) => handleMouseOut(e, selectedDate === date)}
              >
                {date}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className="booking-section" style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <div className="section-label" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
            fontFamily: 'Noto Sans TC, sans-serif',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#0f3040'
          }}>
            <Clock className="section-icon" style={{ color: '#c9a227' }} />
            <span>{language === 'zh' ? '選擇時間' : 'Select Time'}</span>
          </div>
          <div className="time-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '0.75rem',
            width: '100%'
          }}>
            {timeSlots.map((time) => (
              <button
                key={time}
                type="button"
                className={`time-option ${selectedTime === time ? 'selected' : ''}`}
                onClick={() => setSelectedTime(time)}
                style={{
                  padding: '0.75rem',
                  background: selectedTime === time ? '#c9a227' : '#ffffff',
                  color: selectedTime === time ? '#ffffff' : '#0f3040',
                  border: `2px solid ${selectedTime === time ? '#c9a227' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Noto Sans TC, sans-serif'
                }}
                onMouseOver={(e) => handleMouseOver(e, selectedTime === time)}
                onMouseOut={(e) => handleMouseOut(e, selectedTime === time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Location Selection */}
        <div className="booking-section" style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <div className="section-label" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
            fontFamily: 'Noto Sans TC, sans-serif',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#0f3040'
          }}>
            <MapPin className="section-icon" style={{ color: '#c9a227' }} />
            <span>{language === 'zh' ? '選擇地點' : 'Select Location'}</span>
          </div>
          <div className="location-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '0.75rem',
            width: '100%'
          }}>
            {locations.map((location) => (
              <button
                key={location.id}
                type="button"
                className={`location-option ${selectedLocation === location.id ? 'selected' : ''}`}
                onClick={() => setSelectedLocation(location.id)}
                style={{
                  padding: '1rem',
                  background: selectedLocation === location.id ? '#c9a227' : '#ffffff',
                  color: selectedLocation === location.id ? '#ffffff' : '#0f3040',
                  border: `2px solid ${selectedLocation === location.id ? '#c9a227' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
                onMouseOver={(e) => handleMouseOver(e, selectedLocation === location.id)}
                onMouseOut={(e) => handleMouseOut(e, selectedLocation === location.id)}
              >
                <div className="location-name" style={{
                  fontFamily: 'Noto Sans TC, sans-serif',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  marginBottom: '0.25rem'
                }}>{location.name}</div>
                <div className="location-address" style={{
                  fontFamily: 'Noto Sans TC, sans-serif',
                  fontSize: '0.8125rem',
                  color: selectedLocation === location.id ? 'rgba(255,255,255,0.9)' : '#64748b'
                }}>{location.address}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Button - Outside scrollable area */}
      <div 
        className="booking-actions" 
        style={{ 
          padding: '1.5rem', 
          borderTop: '3px solid #c9a227', 
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)', 
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          width: '100%',
          maxWidth: 'none'
        }}
      >
        {/* Confirm Button */}
        <button 
          type="button" 
          className="btn-tactile"
          onClick={handleConfirmBooking} 
          disabled={isSubmitting || !selectedDate || !selectedTime || !selectedLocation}
          style={{ 
            width: '100%',
            padding: '0.875rem 1.5rem', 
            background: (isSubmitting || !selectedDate || !selectedTime || !selectedLocation) ? '#94a3b8' : '#c9a227', 
            color: '#ffffff', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '1rem', 
            fontWeight: '600', 
            cursor: (isSubmitting || !selectedDate || !selectedTime || !selectedLocation) ? 'not-allowed' : 'pointer',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.5rem',
            transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
            fontFamily: 'Noto Sans TC, sans-serif'
          }}
          onMouseOver={handleConfirmMouseOver}
          onMouseOut={handleConfirmMouseOut}
        >
          {isSubmitting ? (
            <span>{language === 'zh' ? '處理中...' : 'Processing...'}</span>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>{language === 'zh' ? '確認預約' : 'Confirm Appointment'}</span>
            </>
          )}
        </button>

        {/* Cancel / Close Button */}
        <button 
          type="button" 
          className="btn-tactile"
          onClick={onClose} 
          style={{ 
            width: '100%',
            padding: '0.875rem 1.5rem', 
            background: 'transparent', 
            color: '#64748b', 
            border: '1px solid #cbd5e1', 
            borderRadius: '8px', 
            fontSize: '1rem', 
            fontWeight: '600', 
            cursor: 'pointer',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontFamily: 'Noto Sans TC, sans-serif',
            transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)'
          }}
        >
          <span>{language === 'zh' ? '取消預約' : 'Cancel Booking'}</span>
        </button>
      </div>
    </>
  );
}

export default React.memo(AppointmentBooking);
