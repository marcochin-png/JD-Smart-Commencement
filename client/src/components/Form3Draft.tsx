import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Printer,
  Download,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  User,
  Building2,
} from 'lucide-react';
import AppShellHeader from './layout/AppShellHeader';

interface Form3DraftProps {
  onBack: () => void;
  language: 'zh' | 'en';
}

type Translation = {
  pageTitle: string;
  backButton: string;
  issuanceReadiness: string;
  form1Confirmed: string;
  form2Confirmed: string;
  claimantSigned: string;
  disputeSummary: string;
  contactDetails: string;
  hearingSetup: string;
  hearingDate: string;
  hearingTime: string;
  hearingVenue: string;
  presidingOfficer: string;
  hearingLanguage: string;
  serviceMethod: string;
  noticeScope: string;
  claimNumber: string;
  parties: string;
  claimItems: string;
  disputeFocus: string;
  missingItems: string;
  officerActions: string;
  generateForm3: string;
  printForm3: string;
  exportPdf: string;
  backToPortal: string;
  draftStatus: string;
  form3Note: string;
  readinessComplete: string;
  readinessPending: string;
  tribunalTitle: string;
  noticeOfHearing: string;
  claimant: string;
  defendant: string;
  hearingDetailsLabel: string;
  noticeParagraph: string;
  registryOfficer: string;
  issueDate: string;
  signature: string;
  seal: string;
  hearingLanguageChinese: string;
  hearingLanguageEnglish: string;
  serviceByPostEmail: string;
  serviceByPost: string;
  serviceByEmail: string;
  sectionOfficerUse: string;
};

const translations: Record<'zh' | 'en', Translation> = {
  zh: {
    pageTitle: '表格3擬定 - 聆訊通知書',
    backButton: '返回調查主任工作台',
    issuanceReadiness: '發出準備情況',
    form1Confirmed: '表格1已確認',
    form2Confirmed: '表格2已確認',
    claimantSigned: '申索人已簽署',
    disputeSummary: '爭議摘要已備妥',
    contactDetails: '聯絡及送達資料已備妥',
    hearingSetup: '聆訊設定',
    hearingDate: '聆訊日期',
    hearingTime: '聆訊時間',
    hearingVenue: '聆訊地點',
    presidingOfficer: '主審主任',
    hearingLanguage: '聆訊語言',
    serviceMethod: '送達方式',
    noticeScope: '通知範圍',
    claimNumber: '申索編號',
    parties: '當事人',
    claimItems: '申索項目',
    disputeFocus: '爭議焦點',
    missingItems: '缺失項目（主任備註）',
    officerActions: '調查主任操作',
    generateForm3: '生成表格3草稿',
    printForm3: '打印表格3',
    exportPdf: '匯出PDF',
    backToPortal: '返回工作台',
    draftStatus: '草稿 / 待簽發',
    form3Note: '備註：表格3應於表格1及表格2經申索人簽署確認後發出。',
    readinessComplete: '已完成',
    readinessPending: '待處理',
    tribunalTitle: '勞資審裁處',
    noticeOfHearing: '聆訊通知書',
    claimant: '申索人',
    defendant: '被告人',
    hearingDetailsLabel: '聆訊詳情',
    noticeParagraph:
      '茲通知各當事人，上述案件已排期聆訊。各當事人須親身出席，或按審裁處指示安排代表出席。',
    registryOfficer: '登記處主任',
    issueDate: '發出日期',
    signature: '簽署',
    seal: '印章',
    hearingLanguageChinese: '中文',
    hearingLanguageEnglish: '英文',
    serviceByPostEmail: '郵寄及電郵',
    serviceByPost: '郵寄',
    serviceByEmail: '電郵',
    sectionOfficerUse: '主任內部處理',
  },
  en: {
    pageTitle: 'Form 3 Draft - Notice of Hearing',
    backButton: 'Back to Officer Portal',
    issuanceReadiness: 'Issuance Readiness',
    form1Confirmed: 'Form 1 Confirmed',
    form2Confirmed: 'Form 2 Confirmed',
    claimantSigned: 'Claimant Signed',
    disputeSummary: 'Dispute Summary Ready',
    contactDetails: 'Contact / Service Details Ready',
    hearingSetup: 'Hearing Setup',
    hearingDate: 'Hearing Date',
    hearingTime: 'Hearing Time',
    hearingVenue: 'Hearing Venue',
    presidingOfficer: 'Presiding Officer',
    hearingLanguage: 'Hearing Language',
    serviceMethod: 'Service Method',
    noticeScope: 'Notice Scope',
    claimNumber: 'Claim Number',
    parties: 'Parties',
    claimItems: 'Claim Items',
    disputeFocus: 'Dispute Focus',
    missingItems: 'Missing Items (Officer Note)',
    officerActions: 'Officer Actions',
    generateForm3: 'Generate Form 3 Draft',
    printForm3: 'Print Form 3',
    exportPdf: 'Export PDF',
    backToPortal: 'Back to Portal',
    draftStatus: 'Draft / Pending Issue',
    form3Note:
      'Note: Form 3 should be issued only after Form 1 and Form 2 are confirmed and signed by the claimant.',
    readinessComplete: 'Complete',
    readinessPending: 'Pending',
    tribunalTitle: 'IN THE LABOUR TRIBUNAL',
    noticeOfHearing: 'NOTICE OF HEARING',
    claimant: 'Claimant',
    defendant: 'Defendant',
    hearingDetailsLabel: 'Hearing Details',
    noticeParagraph:
      'Notice is hereby given to all parties that the above case has been listed for hearing. All parties must attend in person, or by representative as directed by the Tribunal.',
    registryOfficer: 'Registry Officer',
    issueDate: 'Issue Date',
    signature: 'Signature',
    seal: 'Seal',
    hearingLanguageChinese: 'Chinese',
    hearingLanguageEnglish: 'English',
    serviceByPostEmail: 'Post and Email',
    serviceByPost: 'Post',
    serviceByEmail: 'Email',
    sectionOfficerUse: 'Officer Internal Use',
  },
};

export default function Form3Draft({ onBack, language }: Form3DraftProps) {
  const t = translations[language];

  const [hearingDate, setHearingDate] = useState('2026-06-15');
  const [hearingTime, setHearingTime] = useState('10:30');
  const [hearingVenue, setHearingVenue] = useState(
    language === 'zh'
      ? '九龍加士居道36號勞資審裁處 3樓聆訊室A'
      : 'Hearing Room A, 3/F, Labour Tribunal, 36 Gascoigne Road, Kowloon'
  );
  const [presidingOfficer, setPresidingOfficer] = useState(
    language === 'zh' ? '李主任' : 'Officer Lee'
  );
  const [hearingLanguage, setHearingLanguage] = useState<'zh' | 'en'>(language);
  const [serviceMethod, setServiceMethod] = useState('post-email');
  const [form3Generated, setForm3Generated] = useState(false);

  const form1Confirmed = true;
  const form2Confirmed = true;
  const claimantSigned = true;
  const disputeSummaryReady = true;
  const contactDetailsReady = true;

  const claimNumber = 'LT 26-2026-0148';
  const claimantName = language === 'zh' ? '陳大文' : 'CHAN Tai Man';
  const defendantName =
    language === 'zh' ? 'ABC科技有限公司' : 'ABC Technology Limited';
  const claimItems =
    language === 'zh'
      ? '欠薪、代通知金、遣散費'
      : 'Unpaid wages, payment in lieu of notice, severance payment';
  const disputeFocus =
    language === 'zh'
      ? '固定津貼是否應納入工資定義以計算申索金額'
      : 'Whether fixed allowance should be included in the wage definition for claim calculation';
  const missingItems =
    language === 'zh'
      ? '尚待被告提供過去12個月津貼分項紀錄'
      : 'Defendant to provide allowance breakdown records for the last 12 months';

  const readinessItems = [
    { label: t.form1Confirmed, done: form1Confirmed },
    { label: t.form2Confirmed, done: form2Confirmed },
    { label: t.claimantSigned, done: claimantSigned },
    { label: t.disputeSummary, done: disputeSummaryReady },
    { label: t.contactDetails, done: contactDetailsReady },
  ];

  const issueDate = useMemo(() => {
    const d = new Date();
    return language === 'zh'
      ? `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
      : d.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
  }, [language]);

  const resolvedHearingLanguage =
    hearingLanguage === 'zh' ? t.hearingLanguageChinese : t.hearingLanguageEnglish;

  const resolvedServiceMethod =
    serviceMethod === 'post'
      ? t.serviceByPost
      : serviceMethod === 'email'
      ? t.serviceByEmail
      : t.serviceByPostEmail;

  const handleGenerate = () => setForm3Generated(true);

  const handlePrint = () => window.print();

  const handleExportPdf = () => window.print();

  return (
    <>
      <div className="page-shell form3-page">
        <AppShellHeader
          brandEyebrow={language === 'zh' ? '司法機構 勞資審裁處' : 'Judiciary Labour Tribunal'}
          brandTitle={language === 'zh' ? '網上啟動平台' : 'Online Commencement Platform'}
          pageTitle={t.pageTitle}
          language={language}
          onToggleLanguage={() => window.history.replaceState({}, '', `?lang=${language === 'zh' ? 'en' : 'zh'}`)}
          onBack={onBack}
          backLabel={t.backButton}
          desktopActions={(
            <div
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: '999px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {t.draftStatus}
            </div>
          )}
          containerWidthClassName="max-w-[1400px]"
          zIndexClassName="z-40"
        />

        <main
          style={{
            background: '#F0F5FA',
            minHeight: 'calc(100vh - 72px)',
            padding: '1.25rem',
          }}
        >
          <section
            style={{
              maxWidth: '1400px',
              margin: '0 auto',
            }}
          >
            <div className="form3-layout">
              <aside className="form3-panel no-print" style={{ padding: '1rem' }}>
                <div className="panel-section">
                  <h2 className="section-title">{t.issuanceReadiness}</h2>
                  <div className="readiness-list">
                    {readinessItems.map((item) => (
                      <div key={item.label} className="readiness-item">
                        <div className="readiness-left">
                          {item.done ? (
                            <CheckCircle size={16} color="#2f855a" />
                          ) : (
                            <AlertCircle size={16} color="#b7791f" />
                          )}
                          <span>{item.label}</span>
                        </div>
                        <span className={item.done ? 'status-done' : 'status-pending'}>
                          {item.done ? t.readinessComplete : t.readinessPending}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel-section">
                  <h2 className="section-title">{t.hearingSetup}</h2>

                  <label className="field">
                    <span className="field-label">
                      <Calendar size={14} />
                      {t.hearingDate}
                    </span>
                    <input
                      type="date"
                      value={hearingDate}
                      onChange={(e) => setHearingDate(e.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span className="field-label">
                      <Calendar size={14} />
                      {t.hearingTime}
                    </span>
                    <input
                      type="time"
                      value={hearingTime}
                      onChange={(e) => setHearingTime(e.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span className="field-label">
                      <MapPin size={14} />
                      {t.hearingVenue}
                    </span>
                    <input
                      type="text"
                      value={hearingVenue}
                      onChange={(e) => setHearingVenue(e.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span className="field-label">
                      <User size={14} />
                      {t.presidingOfficer}
                    </span>
                    <input
                      type="text"
                      value={presidingOfficer}
                      onChange={(e) => setPresidingOfficer(e.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span className="field-label">
                      <FileText size={14} />
                      {t.hearingLanguage}
                    </span>
                    <select
                      value={hearingLanguage}
                      onChange={(e) => setHearingLanguage(e.target.value as 'zh' | 'en')}
                    >
                      <option value="zh">{t.hearingLanguageChinese}</option>
                      <option value="en">{t.hearingLanguageEnglish}</option>
                    </select>
                  </label>

                  <label className="field">
                    <span className="field-label">
                      <Building2 size={14} />
                      {t.serviceMethod}
                    </span>
                    <select
                      value={serviceMethod}
                      onChange={(e) => setServiceMethod(e.target.value)}
                    >
                      <option value="post-email">{t.serviceByPostEmail}</option>
                      <option value="post">{t.serviceByPost}</option>
                      <option value="email">{t.serviceByEmail}</option>
                    </select>
                  </label>
                </div>

                <div className="panel-section">
                  <h2 className="section-title">{t.noticeScope}</h2>
                  <div className="scope-card">
                    <div className="scope-row">
                      <span className="scope-label">{t.claimNumber}</span>
                      <span className="scope-value mono">{claimNumber}</span>
                    </div>
                    <div className="scope-row">
                      <span className="scope-label">{t.parties}</span>
                      <span className="scope-value">
                        {claimantName} / {defendantName}
                      </span>
                    </div>
                    <div className="scope-row">
                      <span className="scope-label">{t.claimItems}</span>
                      <span className="scope-value">{claimItems}</span>
                    </div>
                    <div className="scope-row">
                      <span className="scope-label">{t.disputeFocus}</span>
                      <span className="scope-value">{disputeFocus}</span>
                    </div>
                    <div className="scope-row">
                      <span className="scope-label">{t.missingItems}</span>
                      <span className="scope-value">{missingItems}</span>
                    </div>
                  </div>
                </div>

                <div className="panel-section">
                  <h2 className="section-title">{t.officerActions}</h2>
                  <div className="action-stack">
                    <button type="button" className="btn btn-primary" onClick={handleGenerate}>
                      <FileText size={16} />
                      {t.generateForm3}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={handlePrint}>
                      <Printer size={16} />
                      {t.printForm3}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={handleExportPdf}>
                      <Download size={16} />
                      {t.exportPdf}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={onBack}>
                      <ArrowLeft size={16} />
                      {t.backToPortal}
                    </button>
                  </div>

                  <div className="note-box">
                    <strong>{t.sectionOfficerUse}</strong>
                    <p>{t.form3Note}</p>
                  </div>
                </div>
              </aside>

              <section className="form3-preview print-area">
                <div className="preview-toolbar no-print">
                  <div>
                    <div className="preview-title">{t.noticeOfHearing}</div>
                    <div className="preview-subtitle">
                      {form3Generated ? t.draftStatus : t.generateForm3}
                    </div>
                  </div>
                </div>

                <div className="document-paper">
                  <div className="doc-header">
                    <div className="doc-crest">HKSAR</div>
                    <div className="doc-tribunal">{t.tribunalTitle}</div>
                    <div className="doc-title">{t.noticeOfHearing}</div>
                  </div>

                  <div className="doc-meta">
                    <div className="doc-meta-row">
                      <span>{t.claimNumber}</span>
                      <strong>{claimNumber}</strong>
                    </div>
                    <div className="doc-meta-row">
                      <span>{t.claimant}</span>
                      <strong>{claimantName}</strong>
                    </div>
                    <div className="doc-meta-row">
                      <span>{t.defendant}</span>
                      <strong>{defendantName}</strong>
                    </div>
                  </div>

                  <div className="doc-section">
                    <div className="doc-section-title">{t.hearingDetailsLabel}</div>
                    <table className="doc-table">
                      <tbody>
                        <tr>
                          <td>{t.hearingDate}</td>
                          <td>{hearingDate}</td>
                        </tr>
                        <tr>
                          <td>{t.hearingTime}</td>
                          <td>{hearingTime}</td>
                        </tr>
                        <tr>
                          <td>{t.hearingVenue}</td>
                          <td>{hearingVenue}</td>
                        </tr>
                        <tr>
                          <td>{t.presidingOfficer}</td>
                          <td>{presidingOfficer}</td>
                        </tr>
                        <tr>
                          <td>{t.hearingLanguage}</td>
                          <td>{resolvedHearingLanguage}</td>
                        </tr>
                        <tr>
                          <td>{t.serviceMethod}</td>
                          <td>{resolvedServiceMethod}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="doc-paragraph">{t.noticeParagraph}</div>

                  <div className="doc-section">
                    <div className="doc-section-title">{t.noticeScope}</div>
                    <table className="doc-table">
                      <tbody>
                        <tr>
                          <td>{t.claimItems}</td>
                          <td>{claimItems}</td>
                        </tr>
                        <tr>
                          <td>{t.disputeFocus}</td>
                          <td>{disputeFocus}</td>
                        </tr>
                        <tr>
                          <td>{t.missingItems}</td>
                          <td>{missingItems}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="signature-grid">
                    <div className="signature-box">
                      <div className="signature-line" />
                      <div className="signature-label">{t.registryOfficer}</div>
                    </div>
                    <div className="signature-box">
                      <div className="signature-line" />
                      <div className="signature-label">{t.signature}</div>
                    </div>
                    <div className="signature-box">
                      <div className="signature-line" />
                      <div className="signature-label">{t.seal}</div>
                    </div>
                  </div>

                  <div className="doc-footer">
                    <div>
                      {t.issueDate}: <strong>{issueDate}</strong>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </section>
        </main>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .form3-page {
          background: #f0f5fa;
          color: #0f172a;
        }

        .form3-layout {
          display: grid;
          grid-template-columns: 360px minmax(0, 1fr);
          gap: 16px;
          align-items: start;
        }

        .form3-panel,
        .form3-preview {
          background: #ffffff;
          border: 1px solid #d9e2ec;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(1, 32, 86, 0.08);
        }

        .panel-section + .panel-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        .section-title {
          margin: 0 0 12px 0;
          font-size: 0.95rem;
          line-height: 1.3;
          font-weight: 700;
          color: #012056;
        }

        .readiness-list {
          display: grid;
          gap: 8px;
        }

        .readiness-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.8rem;
        }

        .readiness-left {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .status-done,
        .status-pending {
          font-size: 0.75rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .status-done {
          color: #2f855a;
        }

        .status-pending {
          color: #b7791f;
        }

        .field {
          display: grid;
          gap: 6px;
          margin-bottom: 10px;
        }

        .field-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #334155;
        }

        .field input,
        .field select {
          width: 100%;
          min-height: 38px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 0.85rem;
          color: #0f172a;
          background: #ffffff;
        }

        .scope-card {
          display: grid;
          gap: 10px;
          padding: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .scope-row {
          display: grid;
          gap: 4px;
        }

        .scope-label {
          font-size: 0.74rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .scope-value {
          font-size: 0.84rem;
          line-height: 1.5;
          color: #0f172a;
          word-break: break-word;
        }

        .mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .action-stack {
          display: grid;
          gap: 10px;
        }

        .btn {
          width: 100%;
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0.75rem 1rem;
        }

        .btn-primary {
          background: #012056;
          color: #ffffff;
          border: 1px solid #012056;
        }

        .btn-primary:hover {
          background: #0b3171;
        }

        .btn-secondary {
          background: #ffffff;
          color: #012056;
          border: 1px solid #cbd5e1;
        }

        .btn-secondary:hover,
        .btn-ghost:hover {
          background: #f8fafc;
        }

        .btn-ghost {
          background: transparent;
          color: #334155;
          border: 1px dashed #cbd5e1;
        }

        .note-box {
          margin-top: 12px;
          padding: 12px;
          border-radius: 8px;
          background: rgba(201, 162, 39, 0.08);
          border: 1px solid rgba(201, 162, 39, 0.35);
        }

        .note-box strong {
          display: block;
          margin-bottom: 6px;
          font-size: 0.78rem;
          color: #7c5a00;
        }

        .note-box p {
          margin: 0;
          font-size: 0.8rem;
          line-height: 1.55;
          color: #5b4a1c;
        }

        .preview-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid #e2e8f0;
          background: #fbfdff;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
        }

        .preview-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #012056;
        }

        .preview-subtitle {
          margin-top: 4px;
          font-size: 0.78rem;
          color: #64748b;
        }

        .document-paper {
          width: min(100%, 820px);
          margin: 0 auto;
          background: #ffffff;
          padding: 32px 40px;
          min-height: 1120px;
          color: #111111;
          font-family: "Times New Roman", "Noto Serif TC", serif;
        }

        .doc-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .doc-crest {
          font-size: 0.8rem;
          letter-spacing: 0.12em;
          margin-bottom: 10px;
        }

        .doc-tribunal {
          font-size: 1.35rem;
          font-weight: 700;
          line-height: 1.3;
          margin-bottom: 8px;
        }

        .doc-title {
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        .doc-meta {
          margin-bottom: 24px;
          border: 1px solid #d4d4d4;
        }

        .doc-meta-row {
          display: grid;
          grid-template-columns: 180px 1fr;
          border-bottom: 1px solid #d4d4d4;
        }

        .doc-meta-row:last-child {
          border-bottom: none;
        }

        .doc-meta-row span,
        .doc-meta-row strong {
          padding: 10px 12px;
          font-size: 0.95rem;
          line-height: 1.4;
        }

        .doc-meta-row span {
          background: #fafafa;
          border-right: 1px solid #d4d4d4;
          font-weight: 600;
        }

        .doc-section {
          margin-bottom: 24px;
        }

        .doc-section-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .doc-table {
          width: 100%;
          border-collapse: collapse;
        }

        .doc-table td {
          border: 1px solid #d4d4d4;
          padding: 10px 12px;
          vertical-align: top;
          font-size: 0.95rem;
          line-height: 1.45;
        }

        .doc-table td:first-child {
          width: 180px;
          background: #fafafa;
          font-weight: 600;
        }

        .doc-paragraph {
          margin: 22px 0;
          font-size: 1rem;
          line-height: 1.9;
          text-align: justify;
        }

        .signature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 48px;
        }

        .signature-box {
          text-align: center;
        }

        .signature-line {
          border-bottom: 1px solid #222222;
          height: 40px;
          margin-bottom: 8px;
        }

        .signature-label {
          font-size: 0.92rem;
        }

        .doc-footer {
          margin-top: 40px;
          font-size: 0.95rem;
        }

        @media (max-width: 1024px) {
          .form3-layout {
            grid-template-columns: 1fr;
          }

          .document-paper {
            padding: 24px 20px;
            min-height: auto;
          }

          .doc-meta-row,
          .signature-grid {
            grid-template-columns: 1fr;
          }

          .doc-meta-row span {
            border-right: none;
            border-bottom: 1px solid #d4d4d4;
          }

          .doc-table td:first-child {
            width: 140px;
          }
        }

        @media print {
          body * {
            visibility: hidden;
          }

          .print-area,
          .print-area * {
            visibility: visible;
          }

          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: none;
            background: #ffffff;
          }

          .document-paper {
            width: 100%;
            max-width: none;
            min-height: auto;
            padding: 18mm 16mm;
            box-shadow: none;
          }

          .no-print {
            display: none !important;
          }

          @page {
            size: A4;
            margin: 12mm;
          }
        }
      `}</style>
    </>
  );
}