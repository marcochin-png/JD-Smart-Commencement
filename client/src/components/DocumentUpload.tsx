import React, { useState, useCallback } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';

interface DocumentUploadProps {
  language: 'zh' | 'en';
  uploadedFiles: File[];
  onFileUpload: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onClose: () => void;
  onProceedToNextStep: () => void;
  uploadAttemptCount: number;
  onSetUploadAttemptCount: (count: number) => void;
  onAddMessage: (message: any) => void;
  makeId: (prefix: string) => string;
}

function DocumentUpload({
  language,
  uploadedFiles,
  onFileUpload,
  onRemoveFile,
  onClose,
  onProceedToNextStep,
  uploadAttemptCount,
  onSetUploadAttemptCount,
  onAddMessage,
  makeId
}: DocumentUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFileUpload(files);
  }, [onFileUpload]);

  const handleProceedToNextStep = useCallback(() => {
    // Unhappy Path: First upload attempt triggers rejection with loading buffer
    if (uploadAttemptCount === 0) {
      setIsAnalyzing(true);
      
      setTimeout(() => {
        setIsAnalyzing(false);
        onClose();
        onSetUploadAttemptCount(1);
        
        onAddMessage({
          id: makeId('b'),
          from: 'bot',
          text: language === 'zh' 
            ? '⚠️ 系統偵測到你上傳的文件（銀行紀錄 / 糧單）過於模糊，且未能辨識到僱主的完整公司名稱。為了加快法庭處理進度，請重新拍攝並上傳清晰的文件正本。' 
            : '⚠️ The system detected that the uploaded document (Bank Records / Payslips) is too blurry and the full employer company name cannot be recognized. To expedite court processing, please retake the photo and upload a clear copy of the original document.',
          options: [
            { label: language === 'zh' ? '📸 重新上傳文件' : '📸 Re-upload Document', value: '重新上傳文件' },
            { label: language === 'zh' ? '暫時沒有更清晰的版本，繼續下一步' : 'Proceed without clearer version', value: 'Proceed without clearer version' }
          ],
          ts: Date.now()
        });
      }, 2000);
      return;
    }
    
    // Happy Path: Second attempt or onwards proceeds normally
    onClose();
    onProceedToNextStep();
  }, [uploadAttemptCount, onClose, onSetUploadAttemptCount, onAddMessage, onProceedToNextStep, makeId, language]);

  const handleMouseOverLabel = useCallback((e: React.MouseEvent<HTMLLabelElement>) => {
    e.currentTarget.style.background = 'rgba(80, 116, 171, 0.05)';
  }, []);

  const handleMouseOutLabel = useCallback((e: React.MouseEvent<HTMLLabelElement>) => {
    e.currentTarget.style.background = '#F8F9FA';
  }, []);

  const handleMouseOverRemove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = '#ef4444';
    e.currentTarget.style.color = '#ffffff';
  }, []);

  const handleMouseOutRemove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'transparent';
    e.currentTarget.style.color = '#ef4444';
  }, []);

  return (
    <div className="document-upload" style={{
      background: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 4px 24px rgba(1, 32, 86, 0.08)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <div className="upload-header" style={{
        padding: '1.5rem',
        borderBottom: '3px solid #012056',
        background: '#F8F9FA'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <h3 className="upload-title" style={{
            fontFamily: 'Noto Sans TC, sans-serif',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#012056',
            margin: 0
          }}>{language === 'zh' ? '上傳證明文件' : 'Upload Evidence Documents'}</h3>
        </div>
        <p className="upload-subtitle" style={{
          fontFamily: 'Noto Sans TC, sans-serif',
          fontSize: '0.875rem',
          color: '#1A202C',
          margin: 0
        }}>{language === 'zh' ? '支援格式：PDF、DOC、DOCX、JPG、PNG、XLS、XLSX' : 'Supported formats: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX'}</p>
      </div>

      {/* Scrollable Content Area */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {/* Upload Area */}
        <div className="upload-area" style={{ padding: '1.5rem' }}>
          <input
            type="file"
            id="document-upload"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <label htmlFor="document-upload" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '2rem',
            background: '#F8F9FA',
            border: '2px dashed #5074ab',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={handleMouseOverLabel}
          onMouseOut={handleMouseOutLabel}>
            <div className="icon-container icon-stroke" style={{ width: '4rem', height: '4rem', borderRadius: '1rem' }}>
              <Upload style={{ width: '2rem', height: '2rem' }} />
            </div>
            <div style={{
              fontFamily: 'Noto Sans TC, sans-serif',
              fontSize: '1rem',
              fontWeight: 500,
              color: '#012056',
              textAlign: 'center'
            }}>{language === 'zh' ? '點擊或拖拽文件至此上傳' : 'Click or drag files here to upload'}</div>
          </label>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="uploaded-files-section" style={{ padding: '1.5rem', borderBottom: '1px solid #E6F0FA' }}>
            <h4 className="section-title" style={{
              fontFamily: 'Noto Sans TC, sans-serif',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#012056',
              margin: '0 0 1rem 0'
            }}>
              {language === 'zh' ? '已上傳文件' : 'Uploaded Files'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {uploadedFiles.map((file, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: '#F8F9FA',
                  border: '2px solid #E6F0FA',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: 'Noto Sans TC, sans-serif',
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        color: '#012056'
                      }}>{file.name}</div>
                      <div style={{
                        fontFamily: 'Noto Sans TC, sans-serif',
                        fontSize: '0.8125rem',
                        color: '#64748b'
                      }}>{(file.size / 1024).toFixed(2)} KB</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    style={{ 
                      padding: '0.5rem',
                      background: 'transparent',
                      border: '2px solid #ef4444',
                      color: '#ef4444',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={handleMouseOverRemove}
                    onMouseOut={handleMouseOutRemove}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Simple Acknowledgment Box */}
        {uploadedFiles.length > 0 && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#F0F7FF', border: '1px solid #80B2FF', borderRadius: '0.5rem' }}>
            <h4 style={{ color: '#012056', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem 0', fontSize: '0.9375rem' }}>
              <CheckCircle size={18} />
              {language === 'zh' ? '文件已成功上傳' : 'Documents Successfully Uploaded'}
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#4A5568', margin: 0 }}>
              {language === 'zh'
                ? '✅ 已成功接收文件。系統已將文件安全存檔。'
                : '✅ Document successfully received. The document has been securely archived.'}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="upload-actions" style={{ padding: '1.5rem', borderTop: '1px solid #E6F0FA', display: 'flex', gap: '0.75rem' }}>
        {uploadedFiles.length > 0 && (
          <button
            type="button"
            className="button-primary"
            onClick={handleProceedToNextStep}
            disabled={isAnalyzing}
            style={{ borderRadius: 0, background: isAnalyzing ? '#94a3b8' : 'var(--success)', borderColor: isAnalyzing ? '#94a3b8' : 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, opacity: isAnalyzing ? 0.7 : 1, cursor: isAnalyzing ? 'not-allowed' : 'pointer' }}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <span>{language === 'zh' ? '系統處理中...' : 'System processing...'}</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>{language === 'zh' ? '完成，繼續下一步' : 'Complete, proceed to next step'}</span>
              </>
            )}
          </button>
        )}
        <button
          type="button"
          className="button-secondary"
          onClick={onClose}
          style={{ borderRadius: 0 }}
        >
          {language === 'zh' ? '關閉' : 'Close'}
        </button>
      </div>
    </div>
  );
}

export default React.memo(DocumentUpload);
