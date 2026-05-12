import React, { useEffect, useMemo, useState } from 'react';
import { Printer, X } from 'lucide-react';
import { officerTypography } from '../const';

interface InitialHearingSummaryModalProps {
  language: 'zh' | 'en';
  onClose: () => void;
  summaryData: any;
}

const T = {
  zh: {
    modalTitle: '預覽事實摘要書',
    printBtn: '列印',
    closeBtn: '關閉',
    officialHeader: '《勞資審裁處（表格）規則》',
    officialHeaderRight: '第25C章',
    officialSubHeader: '事實摘要書',
    officialEnglishTitle: 'SUMMARY OF FACTS',
    subNote: '〔標題如表格1所示〕',
    schedule: '附表',
    formNo: '表格6',
    ruleRef: '〔第14(1)條及（一般）規則第8(a)條〕',
    toPresidingOfficer: '呈審裁官：',
    intro: '本人 {officer}，是調查主任，於 {receivedDate} 收到司法常務主任交來本事實摘要副本一份。本人已對此案中載的事實予以查訊，現將其摘要列如下：',
    caseNo: '案件編號',
    firstHearingDate: '首次聆訊日期',
    hearingLocation: '聆訊地點',
    adjudicator: '審裁官',
    parties: '與訟各方',
    claimant: '申索人',
    defendant: '被告人',
    claimNature: '申索性質',
    facts: '重要事實摘要',
    issues: '爭議事項',
    outstanding: '尚待提交文件／證據',
    conciliation: '和解焦點',
    directions: '初步聆訊需作指示事項',
    preparedBy: '調查主任',
    date: '日期',
    item1: '根據一項於 {startDate} 訂立的口頭╱書面僱傭合約，申索人同意按以下條款受僱於被告人：',
    item2: '申索人已於 {endDate} 遭被告人解僱。',
    item3: '解僱是以口頭╱書面形式作出。',
    item4: '被告人已於 {endDate} 離職，不再為申索人服務。',
    item5: '被告人並無╱有向申索人給予離職通知。',
    item6: '申索人於 {illnessDate} 患病，並已通知被告人。',
    item7: '申索人及被告人均同意以下事實：',
    item8: '申索人對以下事實有爭議：',
    item9: '被告人對以下事實有爭議：',
    item10: '本人認為以下事實對審裁處有幫助：',
    item11: '以下的人拒絕會見本人：',
    item12: '以下的人曾會見本人，但拒絕作任何供述╱答覆本人提出的任何問題：',
    datedLine: '日期：{date}',
    noteText: '本表格須於所需的查訊完畢後24小時內以一式兩份填妥並交付司法常務主任。',
    amendedRef: '（2014年第20號第19條）',
  },
  en: {
    modalTitle: 'Preview Summary of Facts',
    printBtn: 'Print',
    closeBtn: 'Close',
    officialHeader: 'Labour Tribunal (Forms) Rules',
    officialHeaderRight: 'Cap. 25C',
    officialSubHeader: 'SUMMARY OF FACTS',
    officialEnglishTitle: 'SUMMARY OF FACTS',
    subNote: '[title as in Form 1]',
    schedule: 'Schedule',
    formNo: 'Form 6',
    ruleRef: '[s. 14(1) & (Gen.) rule 8(a)]',
    toPresidingOfficer: 'To the Presiding Officer:',
    intro: 'I, {officer}, tribunal officer, on the {receivedDate}, received a copy of this claim from the registrar and have inquired into the facts thereof, a summary of which is set out in the following:',
    caseNo: 'Case No.',
    firstHearingDate: 'Date of the First Hearing',
    hearingLocation: 'Hearing Location',
    adjudicator: 'Adjudicator',
    parties: 'Parties',
    claimant: 'Claimant',
    defendant: 'Defendant',
    claimNature: 'Nature of Claim',
    facts: 'Summary of Material Facts',
    issues: 'Issues in Dispute',
    outstanding: 'Outstanding Documents / Evidence',
    conciliation: 'Conciliation Focus',
    directions: 'Matters for Direction at Call-over Hearing',
    preparedBy: 'Tribunal Officer',
    date: 'Date',
    item1: 'By a contract of employment made on {startDate}, the claimant agreed to serve the defendant on the following terms:',
    item2: 'The claimant was dismissed from the service of the defendant on {endDate}.',
    item3: 'The dismissal was made orally/in writing.',
    item4: 'The defendant left the service of the claimant on {endDate}.',
    item5: 'The defendant gave no notice/days\' notice to the claimant of the intention to leave service.',
    item6: 'The claimant became ill on {illnessDate} and informed the defendant accordingly.',
    item7: 'The following facts are agreed by the claimant and the defendant:',
    item8: 'The claimant disputes the following facts:',
    item9: 'The defendant disputes the following facts:',
    item10: 'The following facts are, in my opinion, of assistance to the tribunal:',
    item11: 'The following persons have refused to be interviewed by me:',
    item12: 'The following persons have been interviewed by me but have refused to make any statement/answer any question put to them:',
    datedLine: 'Dated this {date}',
    noteText: 'To be completed in duplicate and delivered to the registrar not later than 24 hours after the completion of the necessary inquiries.',
    amendedRef: '(L.N. 125 of 1995; 20 of 2014 s. 19)',
  },
};

export default function InitialHearingSummaryModal({ language, onClose, summaryData }: InitialHearingSummaryModalProps) {
  const t = T[language];
  const [showHighlights, setShowHighlights] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handlePrint = () => window.print();

  const highlightClass = showHighlights
    ? 'rounded-sm border border-amber-300 bg-amber-100 px-1 py-0.5 font-semibold text-amber-900'
    : 'font-semibold text-slate-900';

  const highlightTerms = useMemo(
    () => language === 'zh'
      ? [
          '固定津貼',
          '港幣 3,000 元',
          '港幣 15,000 元',
          '港幣 12,000 元',
          '工資',
          '代通知金',
          '遣散費',
          '員工手冊第 4.2 節',
          '津貼發放紀錄',
          '2024年1月1日',
          '2026年3月31日',
        ]
      : [
          'fixed allowance',
          'HKD 3,000',
          'HKD 15,000',
          'HKD 12,000',
          'wages',
          'wages in lieu of notice',
          'severance',
          'Section 4.2',
          'allowance distribution records',
          '1 January 2024',
          '31 March 2026',
        ],
    [language]
  );

  const renderHighlightedText = (text: string) => {
    if (!text) return null;

    const sortedTerms = [...highlightTerms].sort((left, right) => right.length - left.length);
    const escapedTerms = sortedTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
    const parts = text.split(pattern);

    return parts.map((part, index) => {
      const matchedTerm = sortedTerms.find((term) => term.toLowerCase() === part.toLowerCase());

      if (!matchedTerm) {
        return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
      }

      return (
        <span key={`${part}-${index}`} className={highlightClass}>
          {part}
        </span>
      );
    });
  };

  const renderMultilineSection = (text: string) => {
    return text
      .split('\n')
      .filter(Boolean)
      .map((line, index) => (
        <p key={`${line}-${index}`} className={`${officerTypography.documentBody} whitespace-pre-wrap`}>
          {renderHighlightedText(line)}
        </p>
      ));
  };

  const formatTemplate = (template: string, values: Record<string, string>) => {
    return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
  };

  const dottedEntries = (values: string[], total = 4) => {
    return Array.from({ length: total }, (_, index) => values[index] || '................................................');
  };

  const claimantName = summaryData.claimant || 'CHAN Tai Man';
  const defendantName = summaryData.defendant || 'XYZ Restaurant';
  const officerName = summaryData.preparedBy || (language === 'zh' ? '陳調查主任' : 'CHAN, Tribunal Officer');
  const receivedDate = summaryData.firstHearingDate || (language === 'zh' ? '2026年5月8日' : '8 May 2026');
  const startDate = language === 'zh' ? '2024年1月1日' : '1 January 2024';
  const endDate = language === 'zh' ? '2026年3月31日' : '31 March 2026';
  const illnessDate = language === 'zh' ? '2026年3月20日' : '20 March 2026';
  const documentDate = language === 'zh' ? '2026年5月8日' : '8 May 2026';

  const agreedFacts = dottedEntries((summaryData.conciliation || '').split('\n').filter(Boolean).slice(0, 4));
  const claimantDisputes = dottedEntries((summaryData.issues || '').split('\n').filter(Boolean).slice(0, 4));
  const defendantDisputes = dottedEntries((summaryData.outstanding || '').split('\n').filter(Boolean).slice(0, 4));
  const tribunalHelpful = dottedEntries((summaryData.directions || '').split('\n').filter(Boolean).slice(0, 4));
  const refusedInterview = dottedEntries([]);
  const refusedStatement = dottedEntries([]);

  const renderDottedList = (items: string[]) => (
    <div className="mt-3 space-y-2 pl-5 text-[15px] leading-[1.85]">
      {items.map((item, index) => (
        <p key={`${item}-${index}`}>
          <span className="inline-block w-7">({String.fromCharCode(97 + index)})</span>
          <span>{renderHighlightedText(item)}</span>
        </p>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)' }} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full flex flex-col" style={{ maxWidth: '1440px', maxHeight: '92vh', overflow: 'hidden' }} onMouseDown={e => e.stopPropagation()}>
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0 rounded-t-2xl" style={{ background: '#f8fafc' }}>
          <h3 className={officerTypography.sectionHeading}>{t.modalTitle}</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHighlights((current) => !current)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors ${showHighlights ? 'border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'} ${officerTypography.button}`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${showHighlights ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
              {language === 'zh' ? (showHighlights ? '關鍵詞高亮：開' : '關鍵詞高亮：關') : (showHighlights ? 'Keyword highlight: On' : 'Keyword highlight: Off')}
            </button>
            <button onClick={handlePrint} className={`flex items-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors ${officerTypography.button}`}>
              <Printer className="w-5 h-5" />
              {t.printBtn}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>
        {/* Document preview area */}
        <div className="flex flex-row w-full h-full" style={{ minHeight: 0 }}>
          {/* Left panel: summary controls (optional, can be extended) */}
          <div className="hidden md:block w-[310px] bg-[linear-gradient(180deg,#f8fafc,#eef3f8)] border-r border-slate-200 p-6 overflow-y-auto" style={{ maxHeight: 'calc(92vh - 64px)' }}>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{language === 'zh' ? '摘要導覽' : 'Document Guide'}</p>
              <h4 className={`${officerTypography.sectionHeading} mt-2 mb-4`}>{language === 'zh' ? '事實摘要書內容' : 'Summary of Facts Contents'}</h4>
              <ul className="space-y-3 text-sm leading-6 text-slate-700">
                <li>01. {t.formNo}</li>
                <li>02. {t.toPresidingOfficer}</li>
                <li>03. {t.item1}</li>
                <li>04. {t.item7}</li>
                <li>05. {t.item8}</li>
                <li>06. {t.item9}</li>
                <li>07. {t.item10}</li>
                <li>08. {t.item11}</li>
                <li>09. {t.item12}</li>
              </ul>
            </div>
          </div>
          {/* Right panel: formal document preview */}
          <div className="flex-1 bg-[#eef1f5] overflow-y-auto" style={{ maxHeight: 'calc(92vh - 64px)' }}>
            <div className="mx-auto w-full max-w-[920px] p-6 md:p-8">
              <div id="initial-hearing-summary-print" className="mx-auto bg-white shadow-[0_20px_50px_rgba(15,23,42,0.10)] border border-slate-300" style={{ width: '100%', maxWidth: '210mm', minHeight: '297mm' }}>
                <div className="px-[18mm] pt-[14mm] pb-[14mm] text-slate-900" style={{ fontFamily: '"Noto Serif TC", "PMingLiU", serif' }}>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-end text-[12px] leading-5">
                    <div>
                      <p>{t.officialHeader}</p>
                      <div className="mt-1 border-b border-slate-900"></div>
                    </div>
                    <div className="px-8 text-center">{t.schedule}</div>
                    <div>
                      <p className="text-right">{t.officialHeaderRight}</p>
                      <div className="mt-1 border-b border-slate-900"></div>
                    </div>
                  </div>

                  <div className="mt-8 text-center leading-8">
                    <p className="text-[22px] font-semibold">{t.formNo}</p>
                    <p className="text-[15px]">{t.ruleRef}</p>
                    <p className="mt-3 text-[22px] font-semibold">{t.officialSubHeader}</p>
                    <p className="mt-1 text-[18px]">{t.officialEnglishTitle}</p>
                    <p className="mt-3 text-[14px] italic">{t.subNote}</p>
                  </div>

                  <div className="mt-8 border-t border-slate-300 pt-5 text-[15px] leading-[1.9]">
                    <p>
                      <span className="font-semibold">{t.toPresidingOfficer}</span>{' '}
                      {renderHighlightedText(formatTemplate(t.intro, {
                        officer: officerName,
                        receivedDate,
                      }))}
                    </p>
                  </div>

                  <div className="mt-7 space-y-6 text-[15px] leading-[1.9]">
                    <section>
                      <p>1. {renderHighlightedText(formatTemplate(t.item1, { startDate }))}</p>
                      {renderDottedList([
                        `${language === 'zh' ? '申索人' : 'Claimant'}: ${claimantName}`,
                        `${language === 'zh' ? '被告人' : 'Defendant'}: ${defendantName}`,
                        `${language === 'zh' ? '申索性質' : 'Nature of claim'}: ${summaryData.claimNature || (language === 'zh' ? '支付欠薪、代通知金、遣散費' : 'Unpaid wages, payment in lieu of notice, severance payment')}`,
                        `${language === 'zh' ? '聆訊地點' : 'Hearing venue'}: ${summaryData.hearingLocation || (language === 'zh' ? '九龍城法院大樓' : 'Kowloon City Law Courts Building')}`,
                      ])}
                    </section>

                    <section><p>2. {renderHighlightedText(formatTemplate(t.item2, { endDate }))}</p></section>
                    <section><p>3. {renderHighlightedText(t.item3)}</p></section>
                    <section><p>4. {renderHighlightedText(formatTemplate(t.item4, { endDate }))}</p></section>
                    <section><p>5. {renderHighlightedText(t.item5)}</p></section>
                    <section><p>6. {renderHighlightedText(formatTemplate(t.item6, { illnessDate }))}</p></section>

                    <section>
                      <p>7. {renderHighlightedText(t.item7)}</p>
                      {renderDottedList(agreedFacts)}
                    </section>

                    <section>
                      <p>8. {renderHighlightedText(t.item8)}</p>
                      {renderDottedList(claimantDisputes)}
                    </section>

                    <section>
                      <p>9. {renderHighlightedText(t.item9)}</p>
                      {renderDottedList(defendantDisputes)}
                    </section>

                    <section>
                      <p>10. {renderHighlightedText(t.item10)}</p>
                      {renderDottedList(tribunalHelpful)}
                    </section>

                    <section>
                      <p>11. {renderHighlightedText(t.item11)}</p>
                      {renderDottedList(refusedInterview)}
                    </section>

                    <section>
                      <p>12. {renderHighlightedText(t.item12)}</p>
                      {renderDottedList(refusedStatement)}
                    </section>

                    <div className="pt-6">
                      <p>{formatTemplate(t.datedLine, { date: documentDate })}</p>
                      <div className="mt-10 flex justify-end">
                        <div className="w-[220px] text-center">
                          <div className="border-b border-slate-400"></div>
                          <p className="mt-2">{t.preparedBy}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-400 pt-5 text-[13px] leading-[1.85]">
                      <p><span className="font-semibold mr-2">{language === 'zh' ? '註：' : 'Note:'}</span>{t.noteText}</p>
                      <p className="mt-2 text-right italic">{t.amendedRef}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
