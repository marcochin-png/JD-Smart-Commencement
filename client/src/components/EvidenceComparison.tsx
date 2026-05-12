import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, MapPin, FileText } from 'lucide-react';
import InitialHearingSummaryModal from './InitialHearingSummaryModal';
import AppShellHeader from './layout/AppShellHeader';
import { officerTypography } from '../const';
import { handleFontControlClick, initializeTextSize } from '../lib/accessibility';

interface EvidenceComparisonProps {
  onBack: () => void;
  language?: 'zh' | 'en';
}

export default function EvidenceComparison({ onBack, language: initialLanguage = 'zh' }: EvidenceComparisonProps) {
  const [language, setLanguage] = useState<'zh' | 'en'>(initialLanguage);
  const [showHighlights, setShowHighlights] = useState(false);
  const [showInitialHearingSummaryModal, setShowInitialHearingSummaryModal] = useState(false);

  useEffect(() => {
    initializeTextSize();
  }, []);

  useEffect(() => {
    setLanguage(initialLanguage);
  }, [initialLanguage]);

  const translations = {
    zh: {
      brandEyebrow: '司法機構 勞資審裁處',
      brandTitle: '勞資審裁處網上啟動平台',
      pageTitle: '證據及爭議點比對',
      pageSubtitle: '雙方證據結構化對照、爭議點矩陣及系統調解策略分析',
      back: '返回',
      keywordHighlightOn: '關鍵詞高亮：開',
      keywordHighlightOff: '關鍵詞高亮：關',
      claimantTrackLabel: '申索人證據軸線',
      employerTrackLabel: '被告人證據軸線',
      // Claimant Evidence
      claimantEvidence: '申索人證據',
      claimantOverview: '申索人證據概覽',
      claimantOverviewText: '申索人提交的材料主要用於證明固定津貼於受僱期間按月發放，並與基本薪金一併作為恆常報酬處理。',
      payslipTitle: '糧單 - 2026年3月',
      basicSalary: '底薪',
      fixedAllowance: '固定津貼',
      total: '合共',
      bankMatched: '銀行出糧紀錄已配對糧單金額',
      claimantPosition: '申索人立場：該津貼為每月固定發放，非酌情性質，應視為底薪一部分以計算代通知金及遣散費。',
      claimantEvidenceBundle: '已提交材料',
      claimantEvidenceItem1: '2025年10月至2026年3月糧單均列出固定津貼港幣 3,000 元，名稱及金額一致。',
      claimantEvidenceItem2: '相應銀行入帳紀錄顯示每月實收金額與糧單總額一致，未見按業績浮動。',
      claimantEvidenceItem3: '僱傭合約列明月薪結構包含底薪及津貼，但未有寫明須達表現門檻方可發放。',
      claimantImpactTitle: '申索人主張重點',
      claimantImpactText: '申索人據此主張，計算代通知金及遣散費時，應以每月港幣 15,000 元作為工資基數，而非僅以底薪港幣 12,000 元計算。',
      // Employer Evidence
      employerEvidence: '被告人證據',
      downloadAllDocuments: '下載全部文件',
      employerOverview: '被告人證據概覽',
      employerOverviewText: '被告人材料重點在於將固定津貼描述為政策上可調整、非保證發放的酌情項目，藉此排除其工資性質。',
      handbookTitle: '員工手冊 第4.2節',
      handbookText: '津貼屬酌情性質，並不構成保證底薪的一部分。',
      employerPosition: '被告人立場：合約及員工守則列明津貼屬酌情性質，遣散費僅應以底薪計算。',
      employerEvidenceBundle: '已提交材料',
      employerEvidenceItem1: '員工手冊第 4.2 節列明津貼不構成保證底薪的一部分，並保留公司調整權。',
      employerEvidenceItem2: '被告人指出個別月份曾有不同職員未獲發同額津貼，藉此說明該項目並非一律固定。',
      employerEvidenceItem3: '被告人現時僅提交政策文件及部分薪酬紀錄，尚未完整交出過去 12 個月的津貼發放清單。',
      employerImpactTitle: '被告人抗辯重點',
      employerImpactText: '被告人主張，即使申索人過往多月收到相同金額，亦不代表其法律上已轉化為保證工資，因此遣散費基數應維持港幣 12,000 元。',
      // Disputed Issues Matrix
      comparisonMatrix: '爭議點矩陣',
      dimension: '維度',
      claimant: '申索人',
      employer: '被告人',
      status: '狀態',
      matrixIntro: '以下各列以具體案件事實比對雙方說法、已見文件內容及爭議程度。',
      // Matrix rows
      employmentRelationship: '僱傭關係',
      restaurantClosure: '餐廳結業',
      outstandingWages: '欠薪責任',
      natureOfAllowance: '津貼性質',
      severanceBasis: '遣散費計算基數',
      employmentRelationshipClaimantText: '申索人依靠僱傭合約及入職起薪紀錄，指其自 2024年1月1日 至 2026年3月31日 一直受僱於被告。',
      employmentRelationshipEmployerText: '被告人沒有否認受僱期間，亦承認申索人於餐廳結業前一直在職。',
      restaurantClosureClaimantText: '申索人稱餐廳於 2026年3月31日 停止營運，其後即被通知終止僱傭。',
      restaurantClosureEmployerText: '被告人承認結業日期，但正式結業或解僱通知文件仍未齊備。',
      outstandingWagesClaimantText: '申索人指結業前最後月份仍有工資、代通知金及遣散費未按其主張的工資基數結清。',
      outstandingWagesEmployerText: '被告人只部分承認付款責任，並認為即使有欠款，相關法定款項亦應按底薪港幣 12,000 元計算。',
      natureOfAllowanceClaimantText: '申索人依據連續數月糧單及銀行入帳，主張港幣 3,000 元固定津貼屬每月恆常發放的工資一部分。',
      natureOfAllowanceEmployerText: '被告人依據員工手冊第 4.2 節，主張該津貼屬酌情項目，只是實務上多月發放，並非保證工資。',
      severanceBasisClaimantText: '申索人以底薪港幣 12,000 元加固定津貼港幣 3,000 元，主張應按每月港幣 15,000 元作法定計算基數。',
      severanceBasisEmployerText: '被告人堅持固定津貼不具工資性質，因此遣散費及代通知金基數應維持每月港幣 12,000 元。',
      // Matrix values
      admitted: '承認',
      reliedOn: '依賴',
      claimed: '聲稱',
      partlyDisputed: '部分爭議',
      partOfWages: '固定工資',
      discretionaryOnly: '酌情性質',
      // Matrix statuses
      statusNotDisputed: '無爭議',
      statusPartialDispute: '部分爭議',
      statusCoreLegalDispute: '核心法律爭議',
      statusConsequentialDispute: '衍生爭議',
      // Officer Support Callouts
      officerSupport: '調查主任支援',
      reviewFocus: '比對後審查重點',
      reviewFocusText: '雙方對僱傭關係、結業時間及基本薪金大致沒有爭議，核心差異集中於固定津貼是否具恆常性，以及該差異如何影響法定款項計算。',
      missingItems: '待補交文件',
      missingItemsText: '尚欠爭議月份前後的完整糧單序列、正式結業/解僱通知書，以及被告人過去 12 個月津貼發放清單，以核對津貼是否真正具恆常性。',
      conciliationFocus: '調解重點',
      conciliationFocusText: '主要爭議並非僱傭關係是否存在，而是固定津貼在實際發放方式上是否已構成工資一部分。比對時應集中檢視條款文字與實際支付模式是否一致。',
      factualSummarySupport: '事實摘要支援',
      factualSummarySupportText: '系統已按申索人、被告人、無爭議事實及核心法律爭議整理證據索引，方便主任直接生成初步聆訊事實摘要。',
      exportPrehearingSummary: '匯出初步聆訊事實摘要',
      // Pre-hearing Summary Modal
      printBtn: '列印摘要',
      summaryHeader: 'IN THE LABOUR TRIBUNAL OF THE HONG KONG SAR',
      summaryTitle: 'SUMMARY OF FACTS AND ISSUES FOR PRESIDING OFFICER',
      summaryTitleZh: '勞資審裁處 - 初步聆訊事實摘要',
      section1Title: '案件資料',
      section1TitleEn: 'Case Details',
      claimNo: '申索編號',
      summaryClaimant: '申索人',
      summaryDefendant: '被告人',
      section2Title: '無爮議事實 - 已確認',
      section2TitleEn: 'Agreed Facts - Confirmed',
      section3Title: '核心法律爭議',
      section3TitleEn: 'Core Disputed Issues',
      issue: '爭議點',
      issueEn: 'Issue',
      issueDesc: '港幣 3,000 元「固定津貼」的法律性質',
      issueDescEn: 'The legal definition of the HKD 3,000 "Fixed Allowance"',
      claimantCase: '申索人立場',
      claimantCaseEn: "Claimant's Case",
      claimantCaseText: '該津貼為非酌情性質，每月固定發放，不論績效如何均應計入遣散費。（申索基數：港幣 15,000 元）',
      claimantCaseTextEn: 'The allowance is non-discretionary, paid monthly regardless of performance, and should be included in the calculation of Severance Payment. (Claim basis: HKD 15,000)',
      defendantCase: '被告人立場',
      defendantCaseEn: "Defendant's Case",
      defendantCaseText: '依據員工手冊第 4.2 節，該津貼純屬酌情性質，不構成保證工資的一部分。（計算基數：港幣 12,000 元）',
      defendantCaseTextEn: 'Relying on Section 4.2 of the Staff Handbook, the allowance is strictly discretionary and not part of guaranteed wages. (Calculated basis: HKD 12,000)',
      section4Title: '調查主任備註及證據狀態',
      section4TitleEn: 'Investigation Officer\'s Notes & Evidence Status',
      docEvidence: '文件證據',
      docEvidenceEn: 'Documentary Evidence',
      docEvidenceText: '已取得僱傭合約及配對的銀行紀錄。',
      docEvidenceTextEn: 'Employment Contract and matching Bank Records obtained.',
      missingEvidence: '缺失證據',
      missingEvidenceEn: 'Missing Evidence',
      missingEvidenceText: '尚欠一個具爭議月份的糧單。已要求被告人提供過去 12 個月的佣金/津貼派發紀錄，以確立其「恆常性」。',
      missingEvidenceTextEn: 'One payslip for the disputed period is missing. Defendant has been requested to produce commission/allowance distribution records for the past 12 months to establish "regularity".',
      conciliationStatus: '調解狀態',
      conciliationStatusEn: 'Conciliation Status',
      conciliationStatusText: '待處理 / 雙方對法定工資的法律解讀分歧較大。',
      conciliationStatusTextEn: 'Pending / Parties deeply divided on the legal interpretation of statutory wages.'
    },
    en: {
      brandEyebrow: 'JUDICIARY LABOUR TRIBUNAL',
      brandTitle: 'Online Commencement',
      pageTitle: 'Evidence Comparison',
      pageSubtitle: 'Structured evidence comparison, dispute matrix and system conciliation support',
      back: 'Back',
      keywordHighlightOn: 'Keyword highlight: On',
      keywordHighlightOff: 'Keyword highlight: Off',
      claimantTrackLabel: 'Claimant evidence track',
      employerTrackLabel: 'Defendant evidence track',
      // Claimant Evidence
      claimantEvidence: 'Claimant Evidence',
      claimantOverview: 'Claimant Evidence Overview',
      claimantOverviewText: 'The claimant materials are directed to showing that the fixed allowance was paid monthly throughout employment and was treated in practice as part of regular remuneration.',
      payslipTitle: 'Payslip - March 2026',
      basicSalary: 'Basic Salary',
      fixedAllowance: 'Fixed Allowance',
      total: 'Total',
      bankMatched: 'Bank record matched to payroll amount',
      claimantPosition: 'Claimant position: The allowance is paid regularly and is non-discretionary, thus it must be included in the calculation of wages in lieu of notice and severance payment.',
      claimantEvidenceBundle: 'Materials produced',
      claimantEvidenceItem1: 'Payslips from Oct 2025 to Mar 2026 each show a fixed allowance of HKD 3,000 under the same label and amount.',
      claimantEvidenceItem2: 'Matching bank credits reflect the same monthly total as the payslips, with no apparent performance-based variation.',
      claimantEvidenceItem3: 'The employment contract records a monthly remuneration structure of salary plus allowance, without stating any performance threshold for payment.',
      claimantImpactTitle: 'Claimant contention',
      claimantImpactText: 'On that basis, the claimant contends that wages in lieu of notice and severance should be calculated on HKD 15,000 per month rather than the basic salary of HKD 12,000 alone.',
      // Employer Evidence
      employerEvidence: 'Defendant Evidence',
      downloadAllDocuments: 'Download all documents',
      employerOverview: 'Defendant Evidence Overview',
      employerOverviewText: 'The defendant materials attempt to characterise the fixed allowance as a policy-based, adjustable and non-guaranteed payment, so as to exclude it from wages.',
      handbookTitle: 'Staff Handbook Section 4.2',
      handbookText: 'Allowances are discretionary and do not form part of the guaranteed basic salary.',
      employerPosition: 'Defendant position: Contract and handbook explicitly state the allowance is discretionary. Severance should be based on basic salary only.',
      employerEvidenceBundle: 'Materials produced',
      employerEvidenceItem1: 'Section 4.2 of the Staff Handbook states that allowances do not form part of guaranteed basic salary and remain subject to company adjustment.',
      employerEvidenceItem2: 'The defendant says that some staff in other months did not receive the same level of allowance, to argue that the payment was not universally fixed.',
      employerEvidenceItem3: 'At present the defendant has produced policy documents and only part of the payroll record, but not the full 12-month allowance distribution history.',
      employerImpactTitle: 'Defendant contention',
      employerImpactText: 'The defendant argues that repeated payment of the same amount does not, by itself, convert the allowance into guaranteed wages in law, so severance should remain calculated on HKD 12,000.',
      // Disputed Issues Matrix
      comparisonMatrix: 'Disputed Issues Matrix',
      dimension: 'Dimension',
      claimant: 'Claimant',
      employer: 'Employer',
      status: 'Status',
      matrixIntro: 'Each row below compares the parties against specific facts, available documents and the practical dispute level in this case.',
      // Matrix rows
      employmentRelationship: 'Employment relationship',
      restaurantClosure: 'Restaurant closure',
      outstandingWages: 'Outstanding wages',
      natureOfAllowance: 'Nature of allowance',
      severanceBasis: 'Severance calculation basis',
      employmentRelationshipClaimantText: 'The claimant relies on the employment contract and commencement records to say he was employed from 1 Jan 2024 to 31 Mar 2026 without interruption.',
      employmentRelationshipEmployerText: 'The defendant does not deny the period of employment and accepts that the claimant remained employed until the restaurant closure.',
      restaurantClosureClaimantText: 'The claimant says the restaurant ceased operation on 31 Mar 2026 and that his employment ended immediately after that closure.',
      restaurantClosureEmployerText: 'The defendant accepts the closure date, but the formal closure or termination document has not yet been fully produced.',
      outstandingWagesClaimantText: 'The claimant says the final period still involved unpaid wages, wages in lieu of notice and severance calculated on his asserted wage basis.',
      outstandingWagesEmployerText: 'The defendant only partly accepts liability and says that any statutory sums should in any event be calculated on the basic salary of HKD 12,000.',
      natureOfAllowanceClaimantText: 'The claimant relies on repeated payslips and matching bank credits to argue that the HKD 3,000 fixed allowance was a regular part of monthly wages.',
      natureOfAllowanceEmployerText: 'The defendant relies on Section 4.2 of the Staff Handbook to argue that the allowance remained discretionary, even if it was often paid in practice.',
      severanceBasisClaimantText: 'The claimant adds the HKD 12,000 basic salary and HKD 3,000 fixed allowance, contending that statutory sums should be assessed on HKD 15,000 per month.',
      severanceBasisEmployerText: 'The defendant says the allowance has no wage character in law, so severance and notice pay should remain based on HKD 12,000 per month.',
      // Matrix values
      admitted: 'Admitted',
      reliedOn: 'Relied on',
      claimed: 'Claimed',
      partlyDisputed: 'Partly disputed',
      partOfWages: 'Part of wages',
      discretionaryOnly: 'Discretionary only',
      // Matrix statuses
      statusNotDisputed: 'Not disputed',
      statusPartialDispute: 'Partial Dispute',
      statusCoreLegalDispute: 'Core Legal Dispute',
      statusConsequentialDispute: 'Consequential Dispute',
      // Officer Support Callouts
      officerSupport: 'Officer Support',
      reviewFocus: 'Post-comparison review focus',
      reviewFocusText: 'The parties broadly align on the employment relationship, closure timing and basic salary. The real divergence is whether the fixed allowance was regular in practice, and how that affects the statutory calculations.',
      missingItems: 'Missing items',
      missingItemsText: 'The surrounding sequence of payslips for the disputed period, the formal closure or termination notice, and the defendant’s 12-month allowance distribution record are still outstanding.',
      conciliationFocus: 'Conciliation focus',
      conciliationFocusText: 'The main dispute is not whether employment existed, but whether the fixed allowance, viewed against the actual payment pattern, had become part of wages despite the written policy wording.',
      factualSummarySupport: 'Factual summary support',
      factualSummarySupportText: 'The system has organised the claimant evidence, defendant evidence, agreed facts and core disputed issue references so they can be carried directly into a pre-hearing summary.',
      exportPrehearingSummary: 'Export Pre-hearing Summary',
      // Pre-hearing Summary Modal
      printBtn: 'Print Summary',
      summaryHeader: 'IN THE LABOUR TRIBUNAL OF THE HONG KONG SAR',
      summaryTitle: 'SUMMARY OF FACTS AND ISSUES FOR PRESIDING OFFICER',
      summaryTitleZh: '勞資審裁處 - 初步聆訊事實摘要',
      section1Title: 'Case Details',
      section1TitleEn: 'Case Details',
      claimNo: 'Claim No.',
      summaryClaimant: 'Claimant',
      summaryDefendant: 'Defendant',
      section2Title: 'Agreed Facts - Confirmed',
      section2TitleEn: 'Agreed Facts - Confirmed',
      section3Title: 'Core Disputed Issues',
      section3TitleEn: 'Core Disputed Issues',
      issue: 'Issue',
      issueEn: 'Issue',
      issueDesc: 'The legal definition of the HKD 3,000 "Fixed Allowance"',
      issueDescEn: 'The legal definition of the HKD 3,000 "Fixed Allowance"',
      claimantCase: "Claimant's Case",
      claimantCaseEn: "Claimant's Case",
      claimantCaseText: 'The allowance is non-discretionary, paid monthly regardless of performance, and should be included in the calculation of Severance Payment. (Claim basis: HKD 15,000)',
      claimantCaseTextEn: 'The allowance is non-discretionary, paid monthly regardless of performance, and should be included in the calculation of Severance Payment. (Claim basis: HKD 15,000)',
      defendantCase: "Defendant's Case",
      defendantCaseEn: "Defendant's Case",
      defendantCaseText: 'Relying on Section 4.2 of the Staff Handbook, the allowance is strictly discretionary and not part of guaranteed wages. (Calculated basis: HKD 12,000)',
      defendantCaseTextEn: 'Relying on Section 4.2 of the Staff Handbook, the allowance is strictly discretionary and not part of guaranteed wages. (Calculated basis: HKD 12,000)',
      section4Title: 'Investigation Officer\'s Notes & Evidence Status',
      section4TitleEn: 'Investigation Officer\'s Notes & Evidence Status',
      docEvidence: 'Documentary Evidence',
      docEvidenceEn: 'Documentary Evidence',
      docEvidenceText: 'Employment Contract and matching Bank Records obtained.',
      docEvidenceTextEn: 'Employment Contract and matching Bank Records obtained.',
      missingEvidence: 'Missing Evidence',
      missingEvidenceEn: 'Missing Evidence',
      missingEvidenceText: 'One payslip for the disputed period is missing. Defendant has been requested to produce commission/allowance distribution records for the past 12 months to establish "regularity".',
      missingEvidenceTextEn: 'One payslip for the disputed period is missing. Defendant has been requested to produce commission/allowance distribution records for the past 12 months to establish "regularity".',
      conciliationStatus: 'Conciliation Status',
      conciliationStatusEn: 'Conciliation Status',
      conciliationStatusText: 'Pending / Parties deeply divided on the legal interpretation of statutory wages.',
      conciliationStatusTextEn: 'Pending / Parties deeply divided on the legal interpretation of statutory wages.'
    }
  };

  const t = translations[language];
  const highlightClass = showHighlights
    ? 'rounded-md border border-amber-300 bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-900 shadow-[inset_0_-1px_0_rgba(146,64,14,0.14)]'
    : 'font-semibold text-slate-900';
  const pageBodyClass = 'text-[15px] leading-7 text-slate-700';
  const pageBodyMutedClass = 'text-[15px] leading-7 text-slate-600';
  const sectionEyebrowClass = 'text-[11px] font-semibold uppercase tracking-[0.14em]';
  const statusPillClass = 'rounded-full px-3 py-1 text-xs font-semibold';

  const downloadEvidenceBundle = (party: 'claimant' | 'defendant') => {
    const isClaimant = party === 'claimant';
    const title = isClaimant ? t.claimantEvidence : t.employerEvidence;
    const fileName = `${isClaimant ? 'claimant' : 'defendant'}-evidence-bundle-${language}.txt`;
    const sections = isClaimant
      ? [
          t.claimantOverview,
          t.claimantOverviewText,
          '',
          t.claimantEvidenceBundle,
          t.claimantEvidenceItem1,
          t.claimantEvidenceItem2,
          t.claimantEvidenceItem3,
          '',
          t.payslipTitle,
          `${t.basicSalary}: $12,000`,
          `${t.fixedAllowance}: $3,000`,
          `${t.total}: $15,000`,
          '',
          t.bankMatched,
          '',
          t.claimantImpactTitle,
          t.claimantImpactText,
          t.claimantPosition,
        ]
      : [
          t.employerOverview,
          t.employerOverviewText,
          '',
          t.employerEvidenceBundle,
          t.employerEvidenceItem1,
          t.employerEvidenceItem2,
          t.employerEvidenceItem3,
          '',
          t.handbookTitle,
          t.handbookText,
          '',
          language === 'zh' ? '被告回應' : 'Defendant response',
          language === 'zh' ? '被告人不同意申索人所採用的遣散費工資基準。' : 'Defendant disputes the claimant\'s wage basis for severance.',
          '',
          t.employerImpactTitle,
          t.employerImpactText,
          t.employerPosition,
        ];

    const blob = new Blob([`${title}\n\n${sections.join('\n')}`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-shell">
      {/* Header - Reuse portal shell */}
      <AppShellHeader
        brandEyebrow={t.brandEyebrow}
        brandTitle={t.brandTitle}
        pageTitle={t.pageTitle}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
        onBack={onBack}
        backLabel={t.back}
      />

      {/* Main Content */}
      <main style={{ background: '#F0F5FA', minHeight: 'calc(100vh - 72px)', padding: '0' }}>
        <section className="mx-auto w-full max-w-[1880px] p-6 md:p-10">
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={() => setShowHighlights((current) => !current)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${showHighlights ? 'border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${showHighlights ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
              {showHighlights ? t.keywordHighlightOn : t.keywordHighlightOff}
            </button>
          </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
              {/* Claimant Evidence */}
              <div className="rounded-3xl border border-blue-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(239,246,255,0.92))] shadow-sm p-6">
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-blue-100 pb-3">
                  <div>
                    <div className={`${sectionEyebrowClass} text-blue-700`}>{t.claimantTrackLabel}</div>
                    <h2 className={`${officerTypography.sectionHeading} mt-1 text-slate-900`}>{t.claimantEvidence}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => downloadEvidenceBundle('claimant')}
                      className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                    >
                      <FileText className="h-4 w-4" />
                      {t.downloadAllDocuments}
                    </button>
                    <div className={`${statusPillClass} border border-blue-200 bg-white text-blue-700`}>
                      {language === 'zh' ? '申索人' : 'Claimant'}
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-blue-100 bg-white/85 px-4 py-4">
                      <div className={`${officerTypography.cardHeading} mb-2`}>{t.claimantOverview}</div>
                      <p className={pageBodyMutedClass}>{t.claimantOverviewText}</p>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4">
                      <div className={`${officerTypography.cardHeading} mb-2`}>{t.claimantEvidenceBundle}</div>
                      <div className="space-y-2.5">
                        <p className={pageBodyMutedClass}>{language === 'zh' ? <>2025年10月至2026年3月糧單均列出 <span className={highlightClass}>固定津貼港幣 3,000 元</span>，名稱及金額一致。</> : <>Payslips from Oct 2025 to Mar 2026 each show a <span className={highlightClass}>fixed allowance of HKD 3,000</span> under the same label and amount.</>}</p>
                        <p className={pageBodyMutedClass}>{language === 'zh' ? <>相應銀行入帳紀錄顯示每月實收金額與糧單總額一致，未見按 <span className={highlightClass}>業績浮動</span>。</> : <>Matching bank credits reflect the same monthly total as the payslips, with no apparent <span className={highlightClass}>performance-based variation</span>.</>}</p>
                        <p className={pageBodyMutedClass}>{language === 'zh' ? <>僱傭合約列明月薪結構包含 <span className={highlightClass}>底薪及津貼</span>，但未有寫明須達表現門檻方可發放。</> : <>The employment contract records a monthly remuneration structure of <span className={highlightClass}>salary plus allowance</span>, without stating any performance threshold for payment.</>}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4">
                      <div className={`${officerTypography.cardHeading} mb-3`}>{t.payslipTitle}</div>
                      <div className="space-y-3">
                        <div className={`flex items-center justify-between ${pageBodyMutedClass}`}>
                          <span>{t.basicSalary}</span>
                          <span className="font-semibold text-slate-800">$12,000</span>
                        </div>
                        <div className={`flex items-center justify-between ${pageBodyMutedClass}`}>
                          <span>{t.fixedAllowance}</span>
                          <span className="font-semibold text-amber-700"><span className={highlightClass}>$3,000</span></span>
                        </div>
                        <div className={`flex items-center justify-between border-t border-slate-200 pt-3 ${pageBodyClass}`}>
                          <span className="font-semibold">{t.total}</span>
                          <span className="font-bold text-slate-900">$15,000</span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4">
                      <div className={`${officerTypography.cardHeading} mb-2 text-slate-900`}>{language === 'zh' ? '核對結果' : 'Cross-check result'}</div>
                      <p className={pageBodyClass}>{t.bankMatched}</p>
                    </div>
                  </div>
                </div>
                <div className={`mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 ${pageBodyMutedClass}`}>
                  <div className="mb-2 text-sm font-semibold leading-6 text-slate-900">{t.claimantImpactTitle}</div>
                  <p className={`${pageBodyMutedClass} mb-3`}>{language === 'zh' ? <>申索人據此主張，計算代通知金及遣散費時，應以每月 <span className={highlightClass}>港幣 15,000 元</span> 作為工資基數，而非僅以 <span className={highlightClass}>底薪港幣 12,000 元</span> 計算。</> : <>On that basis, the claimant contends that wages in lieu of notice and severance should be calculated on <span className={highlightClass}>HKD 15,000 per month</span> rather than the <span className={highlightClass}>basic salary of HKD 12,000</span> alone.</>}</p>
                  <p className={pageBodyMutedClass}>{t.claimantPosition}</p>
                </div>
              </div>

              {/* Defendant Evidence */}
              <div className="rounded-3xl border border-violet-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(245,243,255,0.92))] shadow-sm p-6">
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-violet-100 pb-3">
                  <div>
                    <div className={`${sectionEyebrowClass} text-violet-700`}>{t.employerTrackLabel}</div>
                    <h2 className={`${officerTypography.sectionHeading} mt-1 text-slate-900`}>{t.employerEvidence}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => downloadEvidenceBundle('defendant')}
                      className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-50"
                    >
                      <FileText className="h-4 w-4" />
                      {t.downloadAllDocuments}
                    </button>
                    <div className={`${statusPillClass} border border-violet-200 bg-white text-violet-700`}>
                      {language === 'zh' ? '被告人' : 'Defendant'}
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-violet-100 bg-white/85 px-4 py-4">
                      <div className={`${officerTypography.cardHeading} mb-2`}>{t.employerOverview}</div>
                      <p className={pageBodyMutedClass}>{t.employerOverviewText}</p>
                    </div>
                    <div className="rounded-2xl border border-violet-100 bg-white px-4 py-4">
                      <div className={`${officerTypography.cardHeading} mb-2`}>{t.employerEvidenceBundle}</div>
                      <div className="space-y-2.5">
                        <p className={pageBodyMutedClass}>{language === 'zh' ? <>員工手冊第 4.2 節列明津貼不構成 <span className={highlightClass}>保證底薪的一部分</span>，並保留公司調整權。</> : <>Section 4.2 of the Staff Handbook states that allowances do not form part of <span className={highlightClass}>guaranteed basic salary</span> and remain subject to company adjustment.</>}</p>
                        <p className={pageBodyMutedClass}>{language === 'zh' ? <>被告人指出個別月份曾有不同職員未獲發同額津貼，藉此說明該項目並非 <span className={highlightClass}>一律固定</span>。</> : <>The defendant says that some staff in other months did not receive the same level of allowance, to argue that the payment was not <span className={highlightClass}>universally fixed</span>.</>}</p>
                        <p className={pageBodyMutedClass}>{language === 'zh' ? <>被告人現時僅提交政策文件及部分薪酬紀錄，尚未完整交出過去 12 個月的 <span className={highlightClass}>津貼發放清單</span>。</> : <>At present the defendant has produced policy documents and only part of the payroll record, but not the full <span className={highlightClass}>12-month allowance distribution history</span>.</>}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-violet-100 bg-white px-4 py-4">
                      <div className={`${officerTypography.cardHeading} mb-2`}>{t.handbookTitle}</div>
                      <p className={`${pageBodyMutedClass} mb-3`}>{language === 'zh' ? '第4.2節' : 'Section 4.2'}</p>
                      <p className={`${pageBodyMutedClass} italic`}>
                        "<span className={highlightClass}>{t.handbookText}</span>"
                      </p>
                    </div>
                    <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-4">
                      <div className={`${officerTypography.cardHeading} mb-2 text-slate-900`}>{language === 'zh' ? '被告回應' : 'Defendant response'}</div>
                      <p className={pageBodyClass}>{language === 'zh' ? '被告人不同意申索人所採用的遣散費工資基準。' : 'Defendant disputes the claimant\'s wage basis for severance.'}</p>
                    </div>
                  </div>
                </div>
                <div className={`mt-4 rounded-2xl border border-violet-100 bg-violet-50 p-4 ${pageBodyMutedClass}`}>
                  <div className="mb-2 text-sm font-semibold leading-6 text-slate-900">{t.employerImpactTitle}</div>
                  <p className={`${pageBodyMutedClass} mb-3`}>{language === 'zh' ? <>被告人主張，即使申索人過往多月收到相同金額，亦不代表其法律上已轉化為 <span className={highlightClass}>保證工資</span>，因此遣散費基數應維持 <span className={highlightClass}>港幣 12,000 元</span>。</> : <>The defendant argues that repeated payment of the same amount does not, by itself, convert the allowance into <span className={highlightClass}>guaranteed wages</span> in law, so severance should remain calculated on <span className={highlightClass}>HKD 12,000</span>.</>}</p>
                  <p className={pageBodyMutedClass}>{t.employerPosition}</p>
                </div>
              </div>
              </div>

              {/* Disputed Issues Matrix */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h2 className={`${officerTypography.sectionHeading} border-b border-slate-100 pb-3 mb-4`}>{t.comparisonMatrix}</h2>
                <p className={`${pageBodyMutedClass} mb-4`}>{t.matrixIntro}</p>
                <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr>
                      <th className={`bg-slate-50 text-slate-600 font-semibold p-3 ${officerTypography.table}`}>{t.dimension}</th>
                      <th className={`bg-blue-50 text-blue-700 font-semibold p-3 ${officerTypography.table}`}>{t.claimant}</th>
                      <th className={`bg-violet-50 text-violet-700 font-semibold p-3 ${officerTypography.table}`}>{t.employer}</th>
                      <th className={`bg-slate-50 text-slate-600 font-semibold p-3 ${officerTypography.table}`}>{t.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={pageBodyClass + ' p-3 border-b border-slate-100 align-top font-semibold text-slate-900'}>{t.employmentRelationship}</td>
                      <td className={pageBodyMutedClass + ' p-3 border-b border-slate-100 align-top'}>{t.employmentRelationshipClaimantText}</td>
                      <td className={pageBodyMutedClass + ' p-3 border-b border-slate-100 align-top'}>{t.employmentRelationshipEmployerText}</td>
                      <td className="p-3 border-b border-slate-100 align-top">
                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold">{t.statusNotDisputed}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className={pageBodyClass + ' p-3 border-b border-slate-100 align-top font-semibold text-slate-900'}>{t.restaurantClosure}</td>
                      <td className={pageBodyMutedClass + ' p-3 border-b border-slate-100 align-top'}>{t.restaurantClosureClaimantText}</td>
                      <td className={pageBodyMutedClass + ' p-3 border-b border-slate-100 align-top'}>{t.restaurantClosureEmployerText}</td>
                      <td className="p-3 border-b border-slate-100 align-top">
                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold">{t.statusNotDisputed}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className={pageBodyClass + ' p-3 border-b border-slate-100 align-top font-semibold text-slate-900'}>{t.outstandingWages}</td>
                      <td className={pageBodyMutedClass + ' p-3 border-b border-slate-100 align-top'}>{t.outstandingWagesClaimantText}</td>
                      <td className={pageBodyMutedClass + ' p-3 border-b border-slate-100 align-top'}>{t.outstandingWagesEmployerText}</td>
                      <td className="p-3 border-b border-slate-100 align-top">
                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-semibold">{t.statusPartialDispute}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className={pageBodyClass + ' p-3 border-b border-slate-100 align-top font-semibold text-slate-900'}>{t.natureOfAllowance}</td>
                      <td className={pageBodyMutedClass + ' p-3 border-b border-slate-100 align-top'}>{t.natureOfAllowanceClaimantText}</td>
                      <td className={pageBodyMutedClass + ' p-3 border-b border-slate-100 align-top'}>{t.natureOfAllowanceEmployerText}</td>
                      <td className="p-3 border-b border-slate-100 align-top">
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">{t.statusCoreLegalDispute}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className={pageBodyClass + ' p-3 align-top font-semibold text-slate-900'}>{t.severanceBasis}</td>
                      <td className={pageBodyMutedClass + ' p-3 align-top'}>{t.severanceBasisClaimantText}</td>
                      <td className={pageBodyMutedClass + ' p-3 align-top'}>{t.severanceBasisEmployerText}</td>
                      <td className="p-3 align-top">
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-semibold">{t.statusConsequentialDispute}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>

              {/* Officer Support Callouts */}
              <div>
                <h2 className={`${officerTypography.sectionHeading} mb-4`}>{t.officerSupport}</h2>
                
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <h3 className={`${officerTypography.cardHeading} mb-2`}>{t.reviewFocus}</h3>
                    <p className={pageBodyMutedClass}>{t.reviewFocusText}</p>
                  </div>

                  {/* Callout 1: Missing Items */}
                  <div className="bg-gradient-to-b from-[#fbfaf7] to-[#f2eee8] border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className={`${officerTypography.cardHeading} mb-1`}>{t.missingItems}</h3>
                        <p className={pageBodyMutedClass}>{t.missingItemsText}</p>
                      </div>
                    </div>
                  </div>

                  {/* Callout 2: Conciliation Focus */}
                  <div className="bg-gradient-to-b from-[#fbfaf7] to-[#f2eee8] border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className={`${officerTypography.cardHeading} mb-1`}>{t.conciliationFocus}</h3>
                        <p className={pageBodyMutedClass}>{t.conciliationFocusText}</p>
                      </div>
                    </div>
                  </div>

                  {/* Callout 3: Factual Summary Support */}
                  <div className="bg-gradient-to-b from-[#fbfaf7] to-[#f2eee8] border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className={`${officerTypography.cardHeading} mb-1`}>{t.factualSummarySupport}</h3>
                        <p className={`${pageBodyMutedClass} mb-3`}>{t.factualSummarySupportText}</p>
                        <button onClick={() => setShowInitialHearingSummaryModal(true)} className={`px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors ${officerTypography.button}`}>
                          {language === 'zh' ? '預覽初步聆訊事實摘要' : 'Preview Initial Hearing Summary'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </section>
      </main>

      {/* Initial Hearing Summary Modal */}
      {showInitialHearingSummaryModal && (
        <InitialHearingSummaryModal
          language={language}
          onClose={() => setShowInitialHearingSummaryModal(false)}
          summaryData={{
            caseNo: 'LBTC / 2026',
            claimant: language === 'zh' ? '陳大文' : 'CHAN Tai Man',
            defendant: language === 'zh' ? 'XYZ 餐廳' : 'XYZ Restaurant',
            claimNature: language === 'zh' ? '支付欠薪、代通知金、遣散費' : 'Unpaid wages, payment in lieu of notice, severance payment',
            firstHearingDate: language === 'zh' ? '2026年5月8日' : '8 May 2026',
            hearingLocation: language === 'zh' ? '九龍城法院大樓 勞資審裁處' : 'Labour Tribunal, Kowloon City Law Courts Building',
            adjudicator: language === 'zh' ? '待委派審裁官' : 'Adjudicator to be assigned',
            facts: language === 'zh'
              ? '1. 根據現有材料，申索人指其自 2024年1月1日 起受僱於被告人經營之餐廳，至 2026年3月31日 為止；被告人現階段並無否認僱傭關係存在及受僱期間。\n2. 雙方大致承認餐廳於 2026年3月31日 結業，申索人其後離職；惟正式結業通知或終止僱傭文件尚未齊備。\n3. 雙方對申索人底薪為每月港幣 12,000 元一事並無重大爭議；本案主要分歧在於每月港幣 3,000 元固定津貼是否屬《僱傭條例》所指工資一部分。\n4. 申索人已提交 2025年10月至2026年3月糧單、相應銀行入帳紀錄及僱傭合約，據以主張固定津貼連續按月發放，並與基本薪金一併構成恆常報酬。\n5. 被告人則依據員工手冊第 4.2 節，主張該津貼屬酌情項目，不構成保證底薪的一部分；惟被告人現時尚未完整提供過去 12 個月津貼發放紀錄。\n6. 申索人因此主張，其欠薪、代通知金及遣散費應按每月港幣 15,000 元計算；被告人則主張有關法定款項基數應維持每月港幣 12,000 元。'
              : '1. On the materials presently available, the Claimant says that he was employed by the Defendant’s restaurant from 1 January 2024 until 31 March 2026, and the Defendant does not at this stage dispute the existence or duration of that employment relationship.\n2. The parties broadly accept that the restaurant ceased operations on 31 March 2026 and that the Claimant left employment thereafter; however, the formal closure notice or termination document has not yet been fully produced.\n3. There is no substantial dispute that the Claimant’s basic salary was HKD 12,000 per month. The principal issue is whether the monthly HKD 3,000 fixed allowance formed part of wages within the meaning of the Employment Ordinance.\n4. The Claimant has produced payslips from Oct 2025 to Mar 2026, matching bank credit records and the employment contract, and relies on those documents to say that the fixed allowance was paid continuously each month as part of his regular remuneration.\n5. The Defendant relies on Section 4.2 of the Staff Handbook and says that the allowance was discretionary and did not form part of guaranteed basic salary; however, the Defendant has not yet fully produced the 12-month allowance distribution records.\n6. Accordingly, the Claimant says that unpaid wages, wages in lieu of notice and severance should be assessed on HKD 15,000 per month, whereas the Defendant says that the statutory calculations should remain based on HKD 12,000 per month.',
            issues: language === 'zh'
              ? '1. 港幣 3,000 元固定津貼在本案實際支付安排下，是否已構成《僱傭條例》所指的工資一部分。\n2. 若固定津貼屬工資一部分，申索人主張之欠薪、代通知金及遣散費是否應按每月港幣 15,000 元計算。\n3. 若固定津貼僅屬酌情項目，則相關法定款項是否應按底薪港幣 12,000 元計算。\n4. 被告人目前未完整提交津貼發放紀錄，對固定津貼是否具恆常性及非酌情性之判斷有何影響。'
              : '1. Whether the HKD 3,000 fixed allowance, viewed in light of the actual payment pattern in this case, formed part of wages under the Employment Ordinance.\n2. If the fixed allowance formed part of wages, whether the Claimant’s unpaid wages, wages in lieu of notice and severance should be calculated on HKD 15,000 per month.\n3. If the fixed allowance remained purely discretionary, whether the relevant statutory sums should instead be calculated on the basic salary of HKD 12,000.\n4. What weight should be given to the Defendant’s present failure to produce the complete allowance distribution records when assessing regularity and non-discretionary payment.',
            outstanding: language === 'zh'
              ? '1. 爭議月份前後之完整糧單序列，以核對固定津貼是否持續及一致地發放。\n2. 正式結業通知或終止僱傭文件，以釐清終止背景及日期。\n3. 被告人過去 12 個月之津貼發放紀錄或薪酬清單，以判斷固定津貼是否屬恆常及非酌情支付。\n4. 如有相關內部政策、通訊紀錄或補充書面陳述，亦可協助釐清津貼性質。'
              : '1. The complete sequence of payslips around the disputed period, so that continuity and consistency of the allowance can be verified.\n2. The formal closure notice or termination document, to clarify the termination context and date.\n3. The Defendant’s 12-month allowance distribution record or payroll schedule, to assess whether the fixed allowance was regular and non-discretionary in practice.\n4. Any relevant internal policy documents, communications, or supplemental statements that may assist in clarifying the nature of the allowance.',
            conciliation: language === 'zh'
              ? '就現階段材料觀之，本案和解空間主要取決於雙方能否先就固定津貼之實際支付模式收窄爭議。倘雙方接受以現有文件先行界定爭議範圍，則可圍繞每月港幣 12,000 元與港幣 15,000 元兩個計算基數之差額，探討分項處理或按差額協商之可行性。'
              : 'On the materials presently available, the scope for conciliation is likely to depend on whether the parties can first narrow the dispute concerning the actual payment pattern of the fixed allowance. If the issue can be confined on the present documents, there may be room to explore itemised resolution or difference-based discussion between the HKD 12,000 and HKD 15,000 calculation bases.',
            directions: language === 'zh'
              ? '1. 指示申索人及被告人於 14 日內提交尚欠文件，包括爭議月份前後糧單、結業或終止通知，以及津貼發放紀錄。\n2. 指示被告人說明員工手冊第 4.2 節於本案實際支付安排中的適用方式，並提交可支持其酌情性主張之文件。\n3. 指示雙方就港幣 3,000 元固定津貼是否屬工資一部分提交簡短書面陳詞。\n4. 如有需要，可於下一次聆訊前要求雙方就各自採用之法定款項計算基數提交對照表。'
              : '1. Direct the Claimant and the Defendant to file the outstanding materials within 14 days, including the surrounding payslips for the disputed period, the closure or termination notice, and the allowance distribution records.\n2. Direct the Defendant to explain how Section 4.2 of the Staff Handbook is said to apply to the actual payment arrangement in this case, and to produce any supporting documents for the discretionary-payment contention.\n3. Direct both parties to lodge short written submissions on whether the HKD 3,000 fixed allowance formed part of wages.\n4. If necessary, direct the parties to produce a comparative schedule showing their respective calculation bases for the statutory sums before the next hearing.'
          }}
        />
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed.inset-0 > div {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .fixed.inset-0 > div > div:first-child {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
