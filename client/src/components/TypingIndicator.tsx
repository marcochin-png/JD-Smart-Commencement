/**
 * TypingIndicator Component
 * Shows a "thinking" animation when the bot is processing
 */

export default function TypingIndicator() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '12px 16px',
      background: '#F8F9FA',
      borderRadius: '12px',
      width: 'fit-content',
      marginBottom: '8px'
    }}>
      <div className="typing-dot" style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#012056',
        animation: 'typingBounce 1.4s infinite ease-in-out both'
      }} />
      <div className="typing-dot" style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#012056',
        animation: 'typingBounce 1.4s infinite ease-in-out both',
        animationDelay: '0.2s'
      }} />
      <div className="typing-dot" style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#012056',
        animation: 'typingBounce 1.4s infinite ease-in-out both',
        animationDelay: '0.4s'
      }} />
    </div>
  );
}
