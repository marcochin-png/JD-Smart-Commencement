import React, { useCallback } from 'react';
import { parseMarkdownToHTML } from '../lib/markdown';

type Option = { label: string; value: string; followUp?: string };

interface RichSystemResponseProps {
  message: string;
  options: Option[];
  progress?: { current: number; total: number; section: string };
  timestamp?: number;
  t: {
    progressLabel: string;
    whyNeedThis: string;
    whyNeedThisText: string;
  };
  onOptionClick: (value: string) => void;
}

function RichSystemResponse({ message, options, progress, timestamp, t, onOptionClick }: RichSystemResponseProps) {
  const handleHelperToggle = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const helperContent = e.currentTarget.nextElementSibling as HTMLElement;
    helperContent.classList.toggle('expanded');
  }, []);

  const handleOptionClick = useCallback((e: React.MouseEvent<HTMLButtonElement>, value: string) => {
    e.stopPropagation();
    onOptionClick(value);
  }, [onOptionClick]);

  return (
    <div className="rich-system-response">
      {/* Progress Indicator */}
      {progress && (
        <div className="response-progress">
          <span className="progress-label">{t.progressLabel}：</span>
          <span className="progress-current">{progress.current}</span>
          <span className="progress-divider">/</span>
          <span className="progress-total">{progress.total}</span>
          <span className="progress-section">（{progress.section}）</span>
        </div>
      )}

      {/* Official System Message */}
      <div className="response-message" style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: 1.5 }}>
        <div dangerouslySetInnerHTML={parseMarkdownToHTML(message)} />
      </div>

      {/* Contextual Helper */}
      <div className="response-helper">
        <button
          type="button"
          className="helper-toggle"
          onClick={handleHelperToggle}
        >
          <span className="helper-icon">?</span>
          <span className="helper-label">{t.whyNeedThis}</span>
        </button>
        <div className="helper-content">
          <p>{t.whyNeedThisText}</p>
        </div>
      </div>

      {/* Rich Action Cards */}
      <div className="response-actions">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className="action-card"
            onClick={(e) => handleOptionClick(e, opt.value)}
          >
            <div className="action-card-content">
              <span className="action-card-text">{opt.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Timestamp */}
      {timestamp && (
        <div className="chat-timestamp" style={{ marginTop: '8px' }}>
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
}

export default React.memo(RichSystemResponse);
