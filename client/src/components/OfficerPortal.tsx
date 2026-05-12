import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  CircleAlert,
  CircleCheckBig,
  Clock3,
  Download,
  Eye,
  FileSearch,
  FileText,
  Highlighter,
  Printer,
  RefreshCcw,
  Search,
} from 'lucide-react';
import { handleFontControlClick, initializeTextSize } from '../lib/accessibility';
import Form1PreviewModal from './Form1PreviewModal';
import Form2PreviewModal from './Form2PreviewModal';
import Form3PreviewModal from './Form3PreviewModal';

interface OfficerPortalProps {
  onBack: () => void;
  language?: 'zh' | 'en';
}

type QueueStatus = 'pending_review' | 'docs_in_review' | 'docs_validated' | 'summary_generated' | 'forms_ready' | 'pending_defendant';
type DocumentReviewStatus = 'pending' | 'accepted' | 'reupload_requested';
type RejectReason = 'blurry' | 'missing_signature' | 'incomplete_pages' | 'mismatch' | 'other';
type FormKey = 'form1' | 'form2' | 'form3';

const DOCUMENT_CATEGORY_DEFS = [
  { key: 'contracts', labelZh: '僱傭合約', labelEn: 'Employment Contracts' },
  { key: 'payslips', labelZh: '糧單', labelEn: 'Payslips' },
  { key: 'bank-records', labelZh: '銀行紀錄', labelEn: 'Bank Records' },
  { key: 'attendance', labelZh: '出勤紀錄', labelEn: 'Attendance Records' },
  { key: 'termination', labelZh: '解僱或離職文件', labelEn: 'Termination / Exit Records' },
  { key: 'mpf', labelZh: '強積金紀錄', labelEn: 'MPF Records' },
  { key: 'communications', labelZh: '通訊紀錄', labelEn: 'Communications' },
  { key: 'identity', labelZh: '身份證明', labelEn: 'Identity Documents' },
  { key: 'medical', labelZh: '病假或醫療文件', labelEn: 'Medical / Sick Leave Documents' },
  { key: 'tax', labelZh: '稅務或報稅文件', labelEn: 'Tax Documents' },
  { key: 'other', labelZh: '其他文件', labelEn: 'Other Documents' },
  { key: 'unreadable', labelZh: '無法辨認', labelEn: 'Unreadable' },
] as const;

type OcrField = {
  labelZh: string;
  labelEn: string;
  value: string;
  confidence: number;
};

type ReviewedDocument = {
  id: string;
  fileName: string;
  categoryKey: string;
  uploadedAt: string;
  pageCount: number;
  sourceType: 'pdf' | 'image';
  originalHintZh: string;
  originalHintEn: string;
  ocrSummaryZh: string;
  ocrSummaryEn: string;
  ocrFields: OcrField[];
  reviewStatus: DocumentReviewStatus;
  rejectReason?: RejectReason;
  rejectNote?: string;
};

type DocumentCategory = {
  key: string;
  labelZh: string;
  labelEn: string;
  documents: ReviewedDocument[];
};

type ReadinessStatus = 'complete' | 'pending' | 'missing';

type ReadinessChecklistItem = {
  key: string;
  categoryKey: string;
  group: 'required' | 'supporting';
  labelZh: string;
  labelEn: string;
  requiredCount: number;
  uploadedCount: number;
  validatedCount: number;
  status: ReadinessStatus;
  contextZh: string;
  contextEn: string;
};

type QueueCase = {
  id: string;
  caseRef: string;
  claimant: string;
  filingDate: string;
  status: QueueStatus;
  intake: {
    personalInfo: Array<{ labelZh: string; labelEn: string; value: string }>;
    employerInfo: Array<{ labelZh: string; labelEn: string; value: string }>;
    claimItems: Array<{ itemZh: string; itemEn: string; amount: string; noteZh: string; noteEn: string }>;
  };
  documents: DocumentCategory[];
  summary?: {
    factsZh: string[];
    factsEn: string[];
    issuesZh: string[];
    issuesEn: string[];
    fileReadinessZh: string;
    fileReadinessEn: string;
  };
};

const T = {
  zh: {
    brandEyebrow: '司法機構 勞資審裁處',
    brandTitle: '勞資審裁處網上啟動平台',
    pageTitle: '調查主任工作台',
    pageSubtitle: '案件佇列、文件核實、摘要確認及正式表格',
    back: '返回',
    queueTitle: '已分派案件',
    queueSubtitle: '先核對入稟資料及文件，再確認文件已就緒及開啟正式表格。',
    caseRef: '案件編號',
    claimant: '申索人',
    filingDate: '入稟日期',
    status: '狀態',
    openCase: '開啟案件',
    backToQueue: '返回案件列表',
    intakeSummary: '入稟摘要',
    personalInfo: '當事人資料',
    employerInfo: '僱主資料',
    claimItems: '申索項目',
    documentsTitle: '文件及 OCR 審查',
    docsInstruction: '按文件類別檢視 OCR 結果、原始檔案提示及逐份文件核實。',
    uploaded: '已上傳',
    retrieveOriginal: '檢視原始文件',
    ocrResult: 'OCR 提取結果',
    originalDocument: '原始文件',
    accepted: '已接受',
    pending: '待審核',
    reuploadRequested: '已要求重傳',
    acceptDocument: '接受此文件',
    rejectDocument: '要求重新上傳',
    rejectReason: '拒收原因',
    rejectNote: '補充說明',
    rejectPlaceholder: '請輸入要通知申索人的具體原因',
    reasonBlurry: '影像模糊',
    reasonMissingSignature: '缺少簽署',
    reasonIncompletePages: '頁面不完整',
    reasonMismatch: '內容與案件不符',
    reasonOther: '其他',
    reasonWrongMonth: '非指定月份',
    categoryReady: '類別已完成核實',
    categoryNeedsAction: '仍有文件待處理',
    categoryAcceptedState: '已完成',
    categoryPendingState: '待跟進',
    categoryRejectedState: '需處理',
    noCategoryDocuments: '此類別目前沒有任何上傳文件。',
    noCategoryDocumentsShort: '此分類未有上傳文件。',
    summaryTitle: '文件就緒確認',
    summaryLocked: '須先完成全部文件核實，方可確認文件已就緒。',
    generateSummary: '確認文件已就緒',
    overrideConfirm: 'Override / 強制確認',
    generatingSummary: '正在整理案件事實及文件核實結果...',
    summaryGenerated: '文件已確認就緒',
    readinessOverview: '整體就緒進度',
    requiredDocuments: '必要文件',
    supportingDocuments: '支持文件',
    requiredMissingWarning: '尚欠必要文件',
    requiredMissingHint: '有必要文件仍未上傳或未完成核實。',
    forceConfirmHint: '如需測試流程，可使用強制確認。',
    demoApproveAll: '示範用：全部標示為已接受',
    demoReadyNow: '示範用：一鍵設為全部就緒',
    readyItems: '必備文件已就緒',
    validatedCount: '已核實',
    uploadedCount: '已上傳',
    allClaimsTag: '適用於所有申索',
    unpaidWagesTag: '適用於: 欠薪',
    noticeTag: '適用於: 代通知金',
    optionalTag: '建議但非必要',
    agreedFacts: '已整理事實',
    keyIssues: '主要爭議',
    fileReadiness: '文件就緒狀態',
    officialForms: '正式表格',
    formsNote: '文件確認就緒後，方可在此預覽及列印正式表格。',
    formsLocked: '請先按「確認文件已就緒」才顯示正式表格。',
    previewPdf: 'Preview PDF',
    print: 'Print',
    form1Label: '表格1',
    form2Label: '表格2',
    form3Label: '表格3（聆訊通知書）',
    nextStepRibbon: '下一步：等待被告人回應及證據提交',
    queuePending: '待檢視',
    queueReview: '文件核實中',
    queueValidated: '文件已核實',
    queueSummary: '文件已就緒',
    queueForms: '表格已備妥',
    queueDefendant: '待被告回應',
    viewHint: '按一下列開案件詳情',
    docsAcceptedCounter: '已接受文件',
    docsRejectedCounter: '需重傳文件',
    docsPendingCounter: '待處理文件',
    categoryCount: '上傳數量',
    ocrConfidence: '辨識信心',
    downloadOcr: '匯出 OCR 摘要',
    noSummaryYet: '尚未確認文件就緒',
    previewInline: '文件預覽',
    clickToExpand: '按預覽可放大檢視',
    highlightMode: '標示重點',
    highlightOn: '已開啟重點標示，可點選欄位或預覽作標記。',
    highlightOff: '開啟後可點選欄位或預覽作重點標示。',
    clearHighlights: '清除標示',
  },
  en: {
    brandEyebrow: 'JUDICIARY LABOUR TRIBUNAL',
    brandTitle: 'Online Commencement',
    pageTitle: 'Investigating Officer Portal',
    pageSubtitle: 'Case queue, document validation, readiness confirmation and official forms',
    back: 'Back',
    queueTitle: 'Assigned Case Queue',
    queueSubtitle: 'Review the intake and validate documents before confirming readiness and unlocking the official forms.',
    caseRef: 'Case Ref',
    claimant: 'Claimant',
    filingDate: 'Filing Date',
    status: 'Status',
    openCase: 'Open Case',
    backToQueue: 'Back to Case List',
    intakeSummary: 'Intake Summary',
    personalInfo: 'Personal Info',
    employerInfo: 'Employer Info',
    claimItems: 'Claim Items',
    documentsTitle: 'Documents & OCR Review',
    docsInstruction: 'Expand a document category to inspect OCR results, original-file hints, and review each document.',
    uploaded: 'Uploaded',
    retrieveOriginal: 'Retrieve/View Original Document',
    ocrResult: 'OCR Processing Results',
    originalDocument: 'Original Document',
    accepted: 'Accepted',
    pending: 'Pending',
    reuploadRequested: 'Re-upload Requested',
    acceptDocument: 'Accept Document',
    rejectDocument: 'Reject & Request Re-upload',
    rejectReason: 'Reason for rejection',
    rejectNote: 'Additional note',
    rejectPlaceholder: 'Tell the claimant exactly what needs to be corrected',
    reasonBlurry: 'Blurry image',
    reasonMissingSignature: 'Missing signature',
    reasonIncompletePages: 'Incomplete pages',
    reasonMismatch: 'Document mismatch',
    reasonOther: 'Other',
    reasonWrongMonth: 'Wrong month',
    categoryReady: 'All documents in this category have been reviewed',
    categoryNeedsAction: 'There are still documents requiring action',
    categoryAcceptedState: 'Completed',
    categoryPendingState: 'Pending',
    categoryRejectedState: 'Action needed',
    noCategoryDocuments: 'There are currently no uploaded documents in this category.',
    noCategoryDocumentsShort: 'No uploaded documents in this category.',
    summaryTitle: 'Document Readiness Confirmation',
    summaryLocked: 'All documents must be accepted before readiness can be confirmed.',
    generateSummary: 'Confirm Documents Ready',
    overrideConfirm: 'Override / Force Confirm',
    generatingSummary: 'Structuring the case facts and validation result...',
    summaryGenerated: 'Documents confirmed ready',
    readinessOverview: 'Overall readiness',
    requiredDocuments: 'Required Documents',
    supportingDocuments: 'Supporting Documents',
    requiredMissingWarning: 'Required documents missing',
    requiredMissingHint: 'Some required documents are still missing or not yet validated.',
    forceConfirmHint: 'Use force confirm if you need to test the downstream flow.',
    demoApproveAll: 'Demo: Mark all as accepted',
    demoReadyNow: 'Demo: Set everything ready',
    readyItems: 'required items ready',
    validatedCount: 'Validated',
    uploadedCount: 'Uploaded',
    allClaimsTag: 'Applies to all claims',
    unpaidWagesTag: 'Applies to: Unpaid wages',
    noticeTag: 'Applies to: Notice in lieu',
    optionalTag: 'Recommended but optional',
    agreedFacts: 'Structured facts',
    keyIssues: 'Key issues',
    fileReadiness: 'Readiness status',
    officialForms: 'Official Forms',
    formsNote: 'Once the documents are confirmed ready, the official forms become available here for preview and print only.',
    formsLocked: 'Confirm document readiness first to display the official forms.',
    previewPdf: 'Preview PDF',
    print: 'Print',
    form1Label: 'Form 1',
    form2Label: 'Form 2',
    form3Label: 'Form 3 (Notice of Hearing)',
    nextStepRibbon: 'Next Step: Pending Defendant Intake & Evidence Submission',
    queuePending: 'Pending Review',
    queueReview: 'Docs In Review',
    queueValidated: 'Docs Validated',
    queueSummary: 'Documents Ready',
    queueForms: 'Forms Ready',
    queueDefendant: 'Pending Defendant',
    viewHint: 'Click a row to open the case workbench',
    docsAcceptedCounter: 'Accepted docs',
    docsRejectedCounter: 'Re-upload docs',
    docsPendingCounter: 'Pending docs',
    categoryCount: 'Upload count',
    ocrConfidence: 'OCR confidence',
    downloadOcr: 'Export OCR Summary',
    noSummaryYet: 'Document readiness not confirmed yet',
    previewInline: 'Document Preview',
    clickToExpand: 'Click preview to enlarge',
    highlightMode: 'Highlight Mode',
    highlightOn: 'Highlight mode is on. Click a field or preview to mark it.',
    highlightOff: 'Turn on highlight mode to mark key fields or previews.',
    clearHighlights: 'Clear Highlights',
  },
} as const;

const REJECT_REASON_OPTIONS: RejectReason[] = ['blurry', 'missing_signature', 'incomplete_pages', 'mismatch', 'other'];

function withAllCategories(categories: DocumentCategory[]): DocumentCategory[] {
  const map = new Map(categories.map((category) => [category.key, category]));
  return DOCUMENT_CATEGORY_DEFS.map((definition) => {
    const existing = map.get(definition.key);
    return {
      key: definition.key,
      labelZh: definition.labelZh,
      labelEn: definition.labelEn,
      documents: existing?.documents ?? [],
    };
  });
}

function createDemoDocument(categoryKey: string, index: number): ReviewedDocument {
  const uploadedAt = `2026-04-18 10:${String(10 + index).padStart(2, '0')}`;

  if (categoryKey === 'identity') {
    return {
      id: `demo-${categoryKey}-${index}`,
      fileName: `hkid-copy-demo-${index}.pdf`,
      categoryKey,
      uploadedAt,
      pageCount: 1,
      sourceType: 'pdf',
      originalHintZh: '示範文件：身份證明副本清晰可見。',
      originalHintEn: 'Demo file: identity document copy is clearly visible.',
      ocrSummaryZh: '已擷取姓名及證件號碼。',
      ocrSummaryEn: 'Name and identity number have been extracted.',
      ocrFields: [
        { labelZh: '文件類別', labelEn: 'Document Type', value: '香港身份證副本', confidence: 99 },
        { labelZh: '姓名', labelEn: 'Name', value: 'CHAN Tai Man', confidence: 98 },
      ],
      reviewStatus: 'accepted',
    };
  }

  if (categoryKey === 'termination') {
    return {
      id: `demo-${categoryKey}-${index}`,
      fileName: `termination-letter-demo-${index}.pdf`,
      categoryKey,
      uploadedAt,
      pageCount: 1,
      sourceType: 'pdf',
      originalHintZh: '示範文件：離職通知書內容完整。',
      originalHintEn: 'Demo file: termination notice is complete.',
      ocrSummaryZh: '已擷取終止日期及通知安排。',
      ocrSummaryEn: 'Termination date and notice arrangement have been extracted.',
      ocrFields: [
        { labelZh: '終止日期', labelEn: 'Termination Date', value: '2026-03-31', confidence: 97 },
        { labelZh: '通知安排', labelEn: 'Notice Arrangement', value: '即時終止 / Immediate termination', confidence: 95 },
      ],
      reviewStatus: 'accepted',
    };
  }

  return {
    id: `demo-${categoryKey}-${index}`,
    fileName: `${categoryKey}-demo-${index}.pdf`,
    categoryKey,
    uploadedAt,
    pageCount: 1,
    sourceType: 'pdf',
    originalHintZh: '示範文件：內容清晰可辨。',
    originalHintEn: 'Demo file: content is clearly legible.',
    ocrSummaryZh: '已成功提取主要欄位。',
    ocrSummaryEn: 'Key fields extracted successfully.',
    ocrFields: [
      { labelZh: '狀態', labelEn: 'Status', value: 'Ready for demo', confidence: 99 },
    ],
    reviewStatus: 'accepted',
  };
}

const buildMockCases = (): QueueCase[] => [
  {
    id: 'case-1',
    caseRef: 'LBTC 1234/2026',
    claimant: '陳大文 / CHAN Tai Man',
    filingDate: '2026-04-18',
    status: 'pending_review',
    intake: {
      personalInfo: [
        { labelZh: '申索人姓名', labelEn: 'Claimant Name', value: '陳大文 / CHAN Tai Man' },
        { labelZh: '香港身份證', labelEn: 'HKID', value: 'A123456(7)' },
        { labelZh: '聯絡電話', labelEn: 'Contact Number', value: '9123 4567' },
        { labelZh: '聯絡地址', labelEn: 'Contact Address', value: '九龍油麻地窩打老道123號456室' },
      ],
      employerInfo: [
        { labelZh: '僱主名稱', labelEn: 'Employer Name', value: 'XYZ 餐廳有限公司 / XYZ Restaurant Limited' },
        { labelZh: '商業登記號碼', labelEn: 'Business Registration No.', value: '12345678' },
        { labelZh: '僱主地址', labelEn: 'Employer Address', value: '九龍尖沙咀彌敦道100號10樓' },
      ],
      claimItems: [
        {
          itemZh: '欠薪（2026年3月）',
          itemEn: 'Unpaid wages (March 2026)',
          amount: 'HKD 12,000',
          noteZh: '主張被告未支付最後一個月工資。',
          noteEn: 'Claimant says the final month salary was not paid.',
        },
        {
          itemZh: '固定津貼',
          itemEn: 'Fixed allowance',
          amount: 'HKD 3,000',
          noteZh: '申索人主張此津貼屬工資一部分。',
          noteEn: 'Claimant says this allowance forms part of wages.',
        },
        {
          itemZh: '代通知金及遣散費',
          itemEn: 'Wages in lieu and severance',
          amount: 'HKD 22,500',
          noteZh: '計算基準受津貼是否屬工資影響。',
          noteEn: 'The calculation basis depends on whether the allowance is wages.',
        },
      ],
    },
    documents: withAllCategories([
      {
        key: 'contracts',
        labelZh: '僱傭合約',
        labelEn: 'Employment Contracts',
        documents: [
          {
            id: 'doc-1',
            fileName: 'employment-contract-2024.pdf',
            categoryKey: 'contracts',
            uploadedAt: '2026-04-18 09:15',
            pageCount: 4,
            sourceType: 'pdf',
            originalHintZh: '原始文件顯示月薪結構：底薪 HKD 12,000，另列津貼。',
            originalHintEn: 'Original file shows a salary structure with HKD 12,000 base pay plus allowance.',
            ocrSummaryZh: '已擷取受僱日期、職位及月薪結構。未見明確說明津貼是否酌情。',
            ocrSummaryEn: 'Employment dates, role and salary structure extracted. No clear clause describing the allowance as discretionary.',
            ocrFields: [
              { labelZh: '受僱日期', labelEn: 'Employment Start', value: '2024-01-01', confidence: 97 },
              { labelZh: '職位', labelEn: 'Position', value: 'Waiter', confidence: 95 },
              { labelZh: '底薪', labelEn: 'Base Salary', value: 'HKD 12,000', confidence: 96 },
              { labelZh: '津貼', labelEn: 'Allowance', value: 'HKD 3,000', confidence: 91 },
            ],
            reviewStatus: 'accepted',
          },
        ],
      },
      {
        key: 'payslips',
        labelZh: '糧單',
        labelEn: 'Payslips',
        documents: [
          {
            id: 'doc-2',
            fileName: 'payslip-2026-01.jpg',
            categoryKey: 'payslips',
            uploadedAt: '2026-04-18 09:19',
            pageCount: 1,
            sourceType: 'image',
            originalHintZh: '原圖可見底薪及固定津貼分開列示，簽名清楚。',
            originalHintEn: 'Original image clearly shows separate line items for base salary and fixed allowance with a visible signature.',
            ocrSummaryZh: '成功擷取總薪金 HKD 15,000，與銀行入帳可比對。',
            ocrSummaryEn: 'Successfully extracted total remuneration of HKD 15,000 for cross-checking with bank credits.',
            ocrFields: [
              { labelZh: '期間', labelEn: 'Period', value: '2026-01', confidence: 96 },
              { labelZh: '底薪', labelEn: 'Base Salary', value: 'HKD 12,000', confidence: 95 },
              { labelZh: '固定津貼', labelEn: 'Fixed Allowance', value: 'HKD 3,000', confidence: 94 },
            ],
            reviewStatus: 'pending',
          },
          {
            id: 'doc-3',
            fileName: 'payslip-2026-02.jpg',
            categoryKey: 'payslips',
            uploadedAt: '2026-04-18 09:20',
            pageCount: 1,
            sourceType: 'image',
            originalHintZh: '影像邊角略模糊，但金額仍大致可見。',
            originalHintEn: 'Image edges are slightly blurred, though the key figures remain mostly visible.',
            ocrSummaryZh: '已提取主要薪酬欄位，但簽署區辨識偏弱。',
            ocrSummaryEn: 'Main payroll fields extracted, but the signature region was only weakly recognised.',
            ocrFields: [
              { labelZh: '期間', labelEn: 'Period', value: '2026-02', confidence: 93 },
              { labelZh: '底薪', labelEn: 'Base Salary', value: 'HKD 12,000', confidence: 89 },
              { labelZh: '固定津貼', labelEn: 'Fixed Allowance', value: 'HKD 3,000', confidence: 88 },
            ],
            reviewStatus: 'pending',
          },
          {
            id: 'doc-4',
            fileName: 'payslip-2026-03.jpg',
            categoryKey: 'payslips',
            uploadedAt: '2026-04-18 09:21',
            pageCount: 1,
            sourceType: 'image',
            originalHintZh: '最後爭議月份糧單，列示底薪與津貼。',
            originalHintEn: 'Payslip for the disputed final month showing base salary and allowance.',
            ocrSummaryZh: '已擷取爭議月份薪酬結構，與申索金額直接相關。',
            ocrSummaryEn: 'Extracted remuneration structure for the disputed month, directly relevant to the pleaded claim amount.',
            ocrFields: [
              { labelZh: '期間', labelEn: 'Period', value: '2026-03', confidence: 95 },
              { labelZh: '底薪', labelEn: 'Base Salary', value: 'HKD 12,000', confidence: 92 },
              { labelZh: '固定津貼', labelEn: 'Fixed Allowance', value: 'HKD 3,000', confidence: 90 },
            ],
            reviewStatus: 'pending',
          },
        ],
      },
      {
        key: 'bank-records',
        labelZh: '銀行紀錄',
        labelEn: 'Bank Records',
        documents: [
          {
            id: 'doc-5',
            fileName: 'bank-credit-summary.pdf',
            categoryKey: 'bank-records',
            uploadedAt: '2026-04-18 09:24',
            pageCount: 2,
            sourceType: 'pdf',
            originalHintZh: '原始文件可見 2026年1至3月入帳額均為 HKD 15,000。',
            originalHintEn: 'Original file shows monthly credits of HKD 15,000 from Jan to Mar 2026.',
            ocrSummaryZh: '銀行入帳額與糧單總額相符，可支援固定津貼恆常性爭議。',
            ocrSummaryEn: 'Bank credits match payslip totals and may support the dispute on the regularity of the allowance.',
            ocrFields: [
              { labelZh: '2026年1月入帳', labelEn: 'Jan 2026 Credit', value: 'HKD 15,000', confidence: 97 },
              { labelZh: '2026年2月入帳', labelEn: 'Feb 2026 Credit', value: 'HKD 15,000', confidence: 96 },
              { labelZh: '2026年3月入帳', labelEn: 'Mar 2026 Credit', value: 'HKD 15,000', confidence: 96 },
            ],
            reviewStatus: 'accepted',
          },
        ],
      },
      {
        key: 'unreadable',
        labelZh: '無法辨認',
        labelEn: 'Unreadable',
        documents: [],
      },
    ]),
    summary: {
      factsZh: [
        '申索人表面上已提交足以顯示連續性受僱背景的合約、糧單及銀行入帳材料。',
        '現有糧單及銀行紀錄均顯示每月 HKD 15,000 的總薪酬，其中固定津貼為 HKD 3,000。',
        '現階段未見合約中有清晰條文界定該津貼屬酌情發放。',
      ],
      factsEn: [
        'On the face of the materials, the claimant has produced sufficient contract, payslip and bank-credit records showing an apparently continuous employment relationship.',
        'The current payslips and bank records each show a monthly total remuneration of HKD 15,000 including a HKD 3,000 fixed allowance.',
        'At this stage, no clear contractual clause has been identified defining the allowance as discretionary.',
      ],
      issuesZh: [
        '固定津貼是否屬《僱傭條例》下的工資一部分。',
        '代通知金及遣散費是否應以 HKD 15,000 而非 HKD 12,000 作為計算基數。',
        '2026年2月糧單簽署區模糊，是否需要補交清晰版本。',
      ],
      issuesEn: [
        'Whether the fixed allowance forms part of wages under the Employment Ordinance.',
        'Whether wages in lieu and severance should be calculated on HKD 15,000 rather than HKD 12,000.',
        'Whether a clearer version of the February 2026 payslip should be required due to the weak signature region.',
      ],
      fileReadinessZh: '現有文件足以支持下一步程序，可開啟正式表格預覽及列印，並交接至待被告回應階段。',
      fileReadinessEn: 'The current document set is sufficient for the next procedural step, so the official forms may be opened for preview and print before handover to the defendant-response stage.',
    },
  },
  {
    id: 'case-2',
    caseRef: 'LBTC 1288/2026',
    claimant: '李美玲 / LEE Mei Ling',
    filingDate: '2026-04-22',
    status: 'docs_in_review',
    intake: {
      personalInfo: [
        { labelZh: '申索人姓名', labelEn: 'Claimant Name', value: '李美玲 / LEE Mei Ling' },
        { labelZh: '香港身份證', labelEn: 'HKID', value: 'B234567(8)' },
        { labelZh: '聯絡電話', labelEn: 'Contact Number', value: '9555 2198' },
        { labelZh: '聯絡地址', labelEn: 'Contact Address', value: '新界沙田第一城24座17樓F室' },
      ],
      employerInfo: [
        { labelZh: '僱主名稱', labelEn: 'Employer Name', value: 'Bright Laundry Co.' },
        { labelZh: '商業登記號碼', labelEn: 'Business Registration No.', value: '88653219' },
        { labelZh: '僱主地址', labelEn: 'Employer Address', value: '新界葵涌貨櫃碼頭路18號3樓' },
      ],
      claimItems: [
        {
          itemZh: '代通知金',
          itemEn: 'Wages in lieu of notice',
          amount: 'HKD 9,800',
          noteZh: '申索人主張未獲足夠通知。',
          noteEn: 'Claimant says insufficient notice was given.',
        },
      ],
    },
    documents: withAllCategories([
      {
        key: 'contracts',
        labelZh: '僱傭合約',
        labelEn: 'Employment Contracts',
        documents: [
          {
            id: 'doc-6',
            fileName: 'lee-contract.pdf',
            categoryKey: 'contracts',
            uploadedAt: '2026-04-22 14:05',
            pageCount: 3,
            sourceType: 'pdf',
            originalHintZh: '合約原件完整，附上入職日期及基本薪金。',
            originalHintEn: 'Contract copy is complete and includes commencement date and base salary.',
            ocrSummaryZh: '合約主要條款已成功辨識。',
            ocrSummaryEn: 'Main contractual terms have been successfully recognised.',
            ocrFields: [
              { labelZh: '入職日期', labelEn: 'Commencement Date', value: '2025-06-01', confidence: 98 },
              { labelZh: '底薪', labelEn: 'Base Salary', value: 'HKD 9,800', confidence: 97 },
            ],
            reviewStatus: 'accepted',
          },
        ],
      },
      {
        key: 'communications',
        labelZh: '通訊紀錄',
        labelEn: 'Communications',
        documents: [],
      },
    ]),
  },
  {
    id: 'case-3',
    caseRef: 'LBTC 1312/2026',
    claimant: '黃婉兒 / WONG Yuen Yi',
    filingDate: '2026-04-24',
    status: 'docs_in_review',
    intake: {
      personalInfo: [
        { labelZh: '申索人姓名', labelEn: 'Claimant Name', value: '黃婉兒 / WONG Yuen Yi' },
        { labelZh: '香港身份證', labelEn: 'HKID', value: 'C345678(9)' },
        { labelZh: '聯絡電話', labelEn: 'Contact Number', value: '9788 1203' },
        { labelZh: '聯絡地址', labelEn: 'Contact Address', value: '香港北角英皇道88號12樓B室' },
      ],
      employerInfo: [
        { labelZh: '僱主名稱', labelEn: 'Employer Name', value: 'Star Fitness Club' },
        { labelZh: '商業登記號碼', labelEn: 'Business Registration No.', value: '55329177' },
        { labelZh: '僱主地址', labelEn: 'Employer Address', value: '香港銅鑼灣告士打道280號5樓' },
      ],
      claimItems: [
        { itemZh: '欠薪及年假薪酬', itemEn: 'Unpaid wages and annual leave pay', amount: 'HKD 18,400', noteZh: '申索人主張最後兩星期工資及未放年假薪酬未獲支付。', noteEn: 'Claimant alleges the final two weeks wages and annual leave pay remain unpaid.' },
      ],
    },
    documents: withAllCategories([
      {
        key: 'contracts',
        labelZh: '僱傭合約',
        labelEn: 'Employment Contracts',
        documents: [
          {
            id: 'doc-7',
            fileName: 'wong-employment-contract.pdf',
            categoryKey: 'contracts',
            uploadedAt: '2026-04-24 11:05',
            pageCount: 5,
            sourceType: 'pdf',
            originalHintZh: '合約載有職位、底薪及休假安排。',
            originalHintEn: 'Contract includes role, base salary and leave arrangement.',
            ocrSummaryZh: '已提取主要聘用條款。',
            ocrSummaryEn: 'Key employment terms extracted.',
            ocrFields: [
              { labelZh: '職位', labelEn: 'Position', value: 'Receptionist', confidence: 98 },
              { labelZh: '月薪', labelEn: 'Monthly Salary', value: 'HKD 16,800', confidence: 96 },
            ],
            reviewStatus: 'accepted',
          },
        ],
      },
      {
        key: 'communications',
        labelZh: '通訊紀錄',
        labelEn: 'Communications',
        documents: [
          {
            id: 'doc-8',
            fileName: 'leave-whatsapp-thread.pdf',
            categoryKey: 'communications',
            uploadedAt: '2026-04-24 11:09',
            pageCount: 8,
            sourceType: 'pdf',
            originalHintZh: '訊息顯示申索人曾追討未放年假薪酬。',
            originalHintEn: 'Messages show the claimant asking for unpaid annual leave pay.',
            ocrSummaryZh: '對話內容與申索項目相關。',
            ocrSummaryEn: 'Conversation appears relevant to the pleaded items.',
            ocrFields: [
              { labelZh: '對話日期', labelEn: 'Chat Date', value: '2026-04-10', confidence: 95 },
              { labelZh: '主題', labelEn: 'Topic', value: 'Annual leave pay', confidence: 93 },
            ],
            reviewStatus: 'pending',
          },
        ],
      },
    ]),
  },
  {
    id: 'case-4',
    caseRef: 'LBTC 1360/2026',
    claimant: '周志明 / CHAU Chi Ming',
    filingDate: '2026-04-27',
    status: 'pending_review',
    intake: {
      personalInfo: [
        { labelZh: '申索人姓名', labelEn: 'Claimant Name', value: '周志明 / CHAU Chi Ming' },
        { labelZh: '香港身份證', labelEn: 'HKID', value: 'D456789(0)' },
        { labelZh: '聯絡電話', labelEn: 'Contact Number', value: '9211 7802' },
        { labelZh: '聯絡地址', labelEn: 'Contact Address', value: '九龍觀塘協和街31號9樓A室' },
      ],
      employerInfo: [
        { labelZh: '僱主名稱', labelEn: 'Employer Name', value: 'Metro Warehouse Services Ltd.' },
        { labelZh: '商業登記號碼', labelEn: 'Business Registration No.', value: '66412093' },
        { labelZh: '僱主地址', labelEn: 'Employer Address', value: '九龍荔枝角長裕街18號工業中心7樓' },
      ],
      claimItems: [
        { itemZh: '代通知金', itemEn: 'Wages in lieu of notice', amount: 'HKD 11,500', noteZh: '申索人稱即日被終止僱傭。', noteEn: 'Claimant says the employment was terminated immediately.' },
      ],
    },
    documents: withAllCategories([
      {
        key: 'termination',
        labelZh: '解僱或離職文件',
        labelEn: 'Termination / Exit Records',
        documents: [
          {
            id: 'doc-9',
            fileName: 'termination-slip.jpg',
            categoryKey: 'termination',
            uploadedAt: '2026-04-27 16:30',
            pageCount: 1,
            sourceType: 'image',
            originalHintZh: '終止通知字跡略淡。',
            originalHintEn: 'Termination note is slightly faint.',
            ocrSummaryZh: '已提取終止日期，但簽署位不清晰。',
            ocrSummaryEn: 'Termination date extracted but signature area is unclear.',
            ocrFields: [
              { labelZh: '終止日期', labelEn: 'Termination Date', value: '2026-04-26', confidence: 91 },
              { labelZh: '通知方式', labelEn: 'Notice Type', value: '即時', confidence: 84 },
            ],
            reviewStatus: 'pending',
          },
        ],
      },
    ]),
  },
  {
    id: 'case-5',
    caseRef: 'LBTC 1404/2026',
    claimant: '何嘉欣 / HO Ka Yan',
    filingDate: '2026-04-29',
    status: 'docs_validated',
    intake: {
      personalInfo: [
        { labelZh: '申索人姓名', labelEn: 'Claimant Name', value: '何嘉欣 / HO Ka Yan' },
        { labelZh: '香港身份證', labelEn: 'HKID', value: 'E567890(1)' },
        { labelZh: '聯絡電話', labelEn: 'Contact Number', value: '9344 6612' },
        { labelZh: '聯絡地址', labelEn: 'Contact Address', value: '新界元朗教育路92號15樓C室' },
      ],
      employerInfo: [
        { labelZh: '僱主名稱', labelEn: 'Employer Name', value: 'Golden Taste Bakery' },
        { labelZh: '商業登記號碼', labelEn: 'Business Registration No.', value: '44287651' },
        { labelZh: '僱主地址', labelEn: 'Employer Address', value: '新界屯門青山公路18號地下' },
      ],
      claimItems: [
        { itemZh: '休息日薪酬', itemEn: 'Rest day pay', amount: 'HKD 6,300', noteZh: '申索人指長期未獲支付法定休息日薪酬。', noteEn: 'Claimant says statutory rest day pay was not paid over an extended period.' },
      ],
    },
    documents: withAllCategories([
      {
        key: 'attendance',
        labelZh: '出勤紀錄',
        labelEn: 'Attendance Records',
        documents: [
          {
            id: 'doc-10',
            fileName: 'attendance-roster-march.pdf',
            categoryKey: 'attendance',
            uploadedAt: '2026-04-29 09:12',
            pageCount: 3,
            sourceType: 'pdf',
            originalHintZh: '更表完整，可見每週工作六天。',
            originalHintEn: 'Roster is complete and shows six working days per week.',
            ocrSummaryZh: '已提取主要出勤模式。',
            ocrSummaryEn: 'Main attendance pattern extracted.',
            ocrFields: [
              { labelZh: '工作天數', labelEn: 'Working Days', value: '6 days / week', confidence: 96 },
              { labelZh: '月份', labelEn: 'Month', value: '2026-03', confidence: 97 },
            ],
            reviewStatus: 'accepted',
          },
        ],
      },
      {
        key: 'payslips',
        labelZh: '糧單',
        labelEn: 'Payslips',
        documents: [
          {
            id: 'doc-11',
            fileName: 'bakery-payslip-march.pdf',
            categoryKey: 'payslips',
            uploadedAt: '2026-04-29 09:18',
            pageCount: 1,
            sourceType: 'pdf',
            originalHintZh: '糧單內容清晰。',
            originalHintEn: 'Payslip content is clear.',
            ocrSummaryZh: '薪金欄位已完整提取。',
            ocrSummaryEn: 'Salary fields fully extracted.',
            ocrFields: [
              { labelZh: '總薪金', labelEn: 'Gross Pay', value: 'HKD 14,200', confidence: 98 },
              { labelZh: '月份', labelEn: 'Month', value: '2026-03', confidence: 98 },
            ],
            reviewStatus: 'accepted',
          },
        ],
      },
    ]),
  },
  {
    id: 'case-6',
    caseRef: 'LBTC 1455/2026',
    claimant: '鄭國強 / CHENG Kwok Keung',
    filingDate: '2026-05-02',
    status: 'pending_defendant',
    intake: {
      personalInfo: [
        { labelZh: '申索人姓名', labelEn: 'Claimant Name', value: '鄭國強 / CHENG Kwok Keung' },
        { labelZh: '香港身份證', labelEn: 'HKID', value: 'F678901(2)' },
        { labelZh: '聯絡電話', labelEn: 'Contact Number', value: '9881 4432' },
        { labelZh: '聯絡地址', labelEn: 'Contact Address', value: '九龍深水埗福華街31號7樓D室' },
      ],
      employerInfo: [
        { labelZh: '僱主名稱', labelEn: 'Employer Name', value: 'Urban Transport Repairs' },
        { labelZh: '商業登記號碼', labelEn: 'Business Registration No.', value: '71920384' },
        { labelZh: '僱主地址', labelEn: 'Employer Address', value: '九龍新蒲崗大有街22號4樓' },
      ],
      claimItems: [
        { itemZh: '遣散費', itemEn: 'Severance payment', amount: 'HKD 28,900', noteZh: '申索人主張服務年資符合遣散費資格。', noteEn: 'Claimant alleges the service period qualifies for severance payment.' },
      ],
    },
    documents: withAllCategories([
      {
        key: 'contracts',
        labelZh: '僱傭合約',
        labelEn: 'Employment Contracts',
        documents: [
          {
            id: 'doc-12',
            fileName: 'cheng-contract.pdf',
            categoryKey: 'contracts',
            uploadedAt: '2026-05-02 10:04',
            pageCount: 4,
            sourceType: 'pdf',
            originalHintZh: '合約與續約條款完整。',
            originalHintEn: 'Contract and renewal terms are complete.',
            ocrSummaryZh: '聘用期及薪酬條款已核實。',
            ocrSummaryEn: 'Employment period and pay terms have been verified.',
            ocrFields: [
              { labelZh: '受僱日期', labelEn: 'Employment Start', value: '2021-05-01', confidence: 98 },
              { labelZh: '月薪', labelEn: 'Monthly Salary', value: 'HKD 18,500', confidence: 97 },
            ],
            reviewStatus: 'accepted',
          },
        ],
      },
      {
        key: 'mpf',
        labelZh: '強積金紀錄',
        labelEn: 'MPF Records',
        documents: [
          {
            id: 'doc-13',
            fileName: 'mpf-history.pdf',
            categoryKey: 'mpf',
            uploadedAt: '2026-05-02 10:09',
            pageCount: 6,
            sourceType: 'pdf',
            originalHintZh: '強積金供款紀錄可支持受僱年資。',
            originalHintEn: 'MPF contribution history supports length of service.',
            ocrSummaryZh: '供款期間連續。',
            ocrSummaryEn: 'Contribution period appears continuous.',
            ocrFields: [
              { labelZh: '供款開始', labelEn: 'Contribution Start', value: '2021-06', confidence: 95 },
              { labelZh: '最後供款', labelEn: 'Last Contribution', value: '2026-03', confidence: 95 },
            ],
            reviewStatus: 'accepted',
          },
        ],
      },
    ]),
  },
];

function statusToWorkflow(documents: DocumentCategory[], summaryGenerated: boolean): QueueStatus {
  const allDocs = documents.flatMap((category) => category.documents);
  const acceptedCount = allDocs.filter((doc) => doc.reviewStatus === 'accepted').length;
  const rejectedCount = allDocs.filter((doc) => doc.reviewStatus === 'reupload_requested').length;
  if (summaryGenerated && acceptedCount === allDocs.length && allDocs.length > 0) {
    return 'pending_defendant';
  }
  if (summaryGenerated) {
    return 'summary_generated';
  }
  if (acceptedCount === allDocs.length && allDocs.length > 0) {
    return 'docs_validated';
  }
  if (acceptedCount > 0 || rejectedCount > 0) {
    return 'docs_in_review';
  }
  return 'pending_review';
}

function statusBadge(status: QueueStatus, t: typeof T.zh | typeof T.en) {
  switch (status) {
    case 'pending_review':
      return { label: t.queuePending, className: 'bg-slate-100 text-slate-700 border-slate-200' };
    case 'docs_in_review':
      return { label: t.queueReview, className: 'bg-amber-50 text-amber-800 border-amber-200' };
    case 'docs_validated':
      return { label: t.queueValidated, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'summary_generated':
      return { label: t.queueSummary, className: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'forms_ready':
      return { label: t.queueForms, className: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'pending_defendant':
      return { label: t.queueDefendant, className: 'bg-violet-50 text-violet-700 border-violet-200' };
  }
}

function getConfidenceBadgeClass(confidence: number) {
  if (confidence >= 90) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
  if (confidence >= 70) {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }
  return 'border-rose-200 bg-rose-50 text-rose-700';
}

function getCategoryReviewState(documents: ReviewedDocument[]) {
  if (documents.some((doc) => doc.reviewStatus === 'reupload_requested')) {
    return 'rejected' as const;
  }
  if (documents.length > 0 && documents.every((doc) => doc.reviewStatus === 'accepted')) {
    return 'accepted' as const;
  }
  return 'pending' as const;
}

function getCategoryIndicator(state: ReturnType<typeof getCategoryReviewState>, t: typeof T.zh | typeof T.en) {
  if (state === 'accepted') {
    return { symbol: '✅', label: t.categoryAcceptedState, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
  if (state === 'rejected') {
    return { symbol: '⚠️', label: t.categoryRejectedState, className: 'bg-rose-50 text-rose-700 border-rose-200' };
  }
  return { symbol: '🟠', label: t.categoryPendingState, className: 'bg-amber-50 text-amber-700 border-amber-200' };
}

function getDocumentReviewIndicator(status: DocumentReviewStatus, t: typeof T.zh | typeof T.en) {
  if (status === 'accepted') {
    return { label: t.accepted, className: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
  }
  if (status === 'reupload_requested') {
    return { label: t.reuploadRequested, className: 'border-rose-200 bg-rose-50 text-rose-700' };
  }
  return { label: t.pending, className: 'border-amber-200 bg-amber-50 text-amber-700' };
}

function getRejectReasonLabel(reason: RejectReason, t: typeof T.zh | typeof T.en) {
  if (reason === 'blurry') return t.reasonBlurry;
  if (reason === 'missing_signature') return t.reasonMissingSignature;
  if (reason === 'incomplete_pages') return t.reasonIncompletePages;
  if (reason === 'mismatch') return t.reasonWrongMonth;
  return t.reasonOther;
}

function getReadinessStatusIcon(status: ReadinessStatus) {
  if (status === 'complete') return '✅';
  if (status === 'pending') return '🟠';
  return '⭕';
}

function getReadinessStatusClass(status: ReadinessStatus) {
  if (status === 'complete') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'pending') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-rose-200 bg-rose-50 text-rose-700';
}

function buildReadinessChecklist(caseItem: QueueCase): ReadinessChecklistItem[] {
  const documentsByCategory = new Map(caseItem.documents.map((category) => [category.key, category.documents]));
  const hasNoticeClaim = caseItem.intake.claimItems.some((item) => /代通知金|notice/i.test(`${item.itemZh} ${item.itemEn}`));

  const createItem = (
    key: string,
    group: 'required' | 'supporting',
    categoryKey: string,
    labelZh: string,
    labelEn: string,
    requiredCount: number,
    contextZh: string,
    contextEn: string,
  ): ReadinessChecklistItem => {
    const docs = documentsByCategory.get(categoryKey) ?? [];
    const uploadedCount = docs.length;
    const validatedCount = docs.filter((doc) => doc.reviewStatus === 'accepted').length;
    const status: ReadinessStatus = requiredCount > 0
      ? uploadedCount < requiredCount
        ? 'missing'
        : validatedCount >= requiredCount
          ? 'complete'
          : 'pending'
      : uploadedCount === 0
        ? 'missing'
        : validatedCount === uploadedCount
          ? 'complete'
          : 'pending';

    return { key, group, categoryKey, labelZh, labelEn, requiredCount, uploadedCount, validatedCount, status, contextZh, contextEn };
  };

  const items: ReadinessChecklistItem[] = [
    createItem('employment-contract', 'required', 'contracts', '僱傭合約', 'Employment Contract', 1, '適用於所有申索', 'Applies to all claims'),
    createItem('payslips', 'required', 'payslips', '糧單', 'Payslips', 3, '適用於: 欠薪', 'Applies to: Unpaid wages'),
    createItem('identity', 'required', 'identity', '身份證明', 'Identity Document', 1, '適用於所有申索', 'Applies to all claims'),
    createItem('termination', 'required', 'termination', '解僱或離職文件', 'Termination Letter', hasNoticeClaim ? 1 : 0, '適用於: 代通知金', 'Applies to: Notice in lieu'),
    createItem('bank-records', 'supporting', 'bank-records', '銀行紀錄', 'Bank Statements', 0, '建議但非必要', 'Recommended but optional'),
    createItem('attendance', 'supporting', 'attendance', '出勤紀錄', 'Attendance Records', 0, '建議但非必要', 'Recommended but optional'),
  ];

  return items;
}

function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export default function OfficerPortal({ onBack, language: initialLanguage = 'zh' }: OfficerPortalProps) {
  const [language, setLanguage] = useState<'zh' | 'en'>(initialLanguage);
  const [cases, setCases] = useState<QueueCase[]>(buildMockCases);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [expandedCategoryKey, setExpandedCategoryKey] = useState<string | null>(null);
  const [expandedDocumentId, setExpandedDocumentId] = useState<string | null>(null);
  const [showForm1Modal, setShowForm1Modal] = useState(false);
  const [showForm2Modal, setShowForm2Modal] = useState(false);
  const [showForm3Modal, setShowForm3Modal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<ReviewedDocument | null>(null);
  const [summaryLoadingCaseId, setSummaryLoadingCaseId] = useState<string | null>(null);
  const [summaryGeneratedCaseIds, setSummaryGeneratedCaseIds] = useState<string[]>([]);
  const [autoPrintForm, setAutoPrintForm] = useState<FormKey | null>(null);
  const [highlightMode, setHighlightMode] = useState(false);
  const [highlightedTargets, setHighlightedTargets] = useState<string[]>([]);

  useEffect(() => {
    initializeTextSize();
  }, []);

  useEffect(() => {
    setLanguage(initialLanguage);
  }, [initialLanguage]);

  useEffect(() => {
    if (!autoPrintForm) {
      return;
    }
    const timer = window.setTimeout(() => {
      window.print();
      setAutoPrintForm(null);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [autoPrintForm, showForm1Modal, showForm2Modal, showForm3Modal]);

  const t = T[language];

  const selectedCase = useMemo(() => cases.find((item) => item.id === selectedCaseId) ?? null, [cases, selectedCaseId]);
  const queueCases = useMemo(
    () =>
      cases.map((caseItem) => ({
        ...caseItem,
        status: statusToWorkflow(caseItem.documents, summaryGeneratedCaseIds.includes(caseItem.id)),
      })),
    [cases, summaryGeneratedCaseIds],
  );

  const selectedCaseDocuments = selectedCase?.documents.flatMap((category) => category.documents) ?? [];
  const acceptedDocs = selectedCaseDocuments.filter((doc) => doc.reviewStatus === 'accepted').length;
  const rejectedDocs = selectedCaseDocuments.filter((doc) => doc.reviewStatus === 'reupload_requested').length;
  const pendingDocs = selectedCaseDocuments.filter((doc) => doc.reviewStatus === 'pending').length;
  const readinessChecklist = selectedCase ? buildReadinessChecklist(selectedCase) : [];
  const requiredChecklist = readinessChecklist.filter((item) => item.group === 'required' && item.requiredCount > 0);
  const supportingChecklist = readinessChecklist.filter((item) => item.group === 'supporting');
  const requiredCompleteCount = requiredChecklist.filter((item) => item.status === 'complete').length;
  const requiredPendingCount = requiredChecklist.filter((item) => item.status === 'pending').length;
  const requiredMissingCount = requiredChecklist.filter((item) => item.status === 'missing').length;
  const readinessPercent = requiredChecklist.length > 0 ? Math.round((requiredCompleteCount / requiredChecklist.length) * 100) : 0;
  const canGenerateSummary = !!selectedCase && requiredChecklist.length > 0 && requiredMissingCount === 0 && requiredPendingCount === 0;
  const selectedSummaryGenerated = !!selectedCase && summaryGeneratedCaseIds.includes(selectedCase.id);
  const activeCategory = selectedCase?.documents.find((category) => category.key === expandedCategoryKey) ?? selectedCase?.documents[0] ?? null;
  const activeDocuments = activeCategory?.documents ?? [];
  const activeDocument = activeDocuments.find((doc) => doc.id === expandedDocumentId) ?? activeDocuments[0] ?? null;

  useEffect(() => {
    if (!selectedCase) {
      return;
    }
    const nextCategoryKey = selectedCase.documents[0]?.key ?? null;
    setExpandedCategoryKey((current) => {
      if (current && selectedCase.documents.some((category) => category.key === current)) {
        return current;
      }
      return nextCategoryKey;
    });
  }, [selectedCase]);

  useEffect(() => {
    if (!activeCategory) {
      setExpandedDocumentId(null);
      return;
    }
    const nextDocumentId = activeCategory.documents[0]?.id ?? null;
    setExpandedDocumentId((current) => {
      if (current && activeCategory.documents.some((doc) => doc.id === current)) {
        return current;
      }
      return nextDocumentId;
    });
  }, [activeCategory]);

  const updateDocument = (documentId: string, updater: (doc: ReviewedDocument) => ReviewedDocument) => {
    setCases((currentCases) =>
      currentCases.map((caseItem) => {
        if (caseItem.id !== selectedCaseId) {
          return caseItem;
        }
        return {
          ...caseItem,
          documents: caseItem.documents.map((category) => ({
            ...category,
            documents: category.documents.map((doc) => (doc.id === documentId ? updater(doc) : doc)),
          })),
        };
      }),
    );
  };

  const handleAcceptDocument = (documentId: string) => {
    updateDocument(documentId, (doc) => ({
      ...doc,
      reviewStatus: 'accepted',
      rejectReason: undefined,
      rejectNote: undefined,
    }));
  };

  const handleRejectDocument = (documentId: string) => {
    updateDocument(documentId, (doc) => ({
      ...doc,
      reviewStatus: 'reupload_requested',
      rejectReason: doc.rejectReason ?? 'blurry',
      rejectNote: doc.rejectNote ?? '',
    }));
  };

  const handleRejectReason = (documentId: string, reason: RejectReason) => {
    updateDocument(documentId, (doc) => ({ ...doc, rejectReason: reason }));
  };

  const handleRejectNote = (documentId: string, value: string) => {
    updateDocument(documentId, (doc) => ({ ...doc, rejectNote: value }));
  };

  const handleGenerateSummary = (force = false) => {
    if (!selectedCase || (!canGenerateSummary && !force)) {
      return;
    }
    setSummaryLoadingCaseId(selectedCase.id);
    window.setTimeout(() => {
      setSummaryLoadingCaseId(null);
      setSummaryGeneratedCaseIds((current) => (current.includes(selectedCase.id) ? current : [...current, selectedCase.id]));
    }, 1200);
  };

  const handleDemoApproveAllDocuments = () => {
    if (!selectedCase) {
      return;
    }

    setCases((currentCases) =>
      currentCases.map((caseItem) => {
        if (caseItem.id !== selectedCase.id) {
          return caseItem;
        }

        return {
          ...caseItem,
          documents: caseItem.documents.map((category) => ({
            ...category,
            documents: category.documents.map((doc) => ({
              ...doc,
              reviewStatus: 'accepted',
              rejectReason: undefined,
              rejectNote: undefined,
            })),
          })),
        };
      }),
    );
  };

  const handleDemoReadyNow = () => {
    if (!selectedCase || summaryLoadingCaseId === selectedCase.id) {
      return;
    }

    const readinessItems = buildReadinessChecklist(selectedCase);

    setCases((currentCases) =>
      currentCases.map((caseItem) => {
        if (caseItem.id !== selectedCase.id) {
          return caseItem;
        }

        const requiredByCategory = new Map(
          readinessItems
            .filter((item) => item.group === 'required' && item.requiredCount > 0)
            .map((item) => [item.categoryKey, item]),
        );

        return {
          ...caseItem,
          documents: caseItem.documents.map((category) => {
            const normalizedDocuments = category.documents.map((doc) => ({
              ...doc,
              reviewStatus: 'accepted' as const,
              rejectReason: undefined,
              rejectNote: undefined,
            }));
            const requiredItem = requiredByCategory.get(category.key);
            const missingCount = requiredItem ? Math.max(0, requiredItem.requiredCount - normalizedDocuments.length) : 0;
            const demoDocuments = Array.from({ length: missingCount }, (_, index) => createDemoDocument(category.key, index + 1));

            return {
              ...category,
              documents: [...normalizedDocuments, ...demoDocuments],
            };
          }),
        };
      }),
    );

    setSummaryLoadingCaseId(selectedCase.id);
    window.setTimeout(() => {
      setSummaryLoadingCaseId(null);
      setSummaryGeneratedCaseIds((current) => (current.includes(selectedCase.id) ? current : [...current, selectedCase.id]));
    }, 600);
  };

  const handlePreviewForm = (formKey: FormKey, autoPrint = false) => {
    if (formKey === 'form1') setShowForm1Modal(true);
    if (formKey === 'form2') setShowForm2Modal(true);
    if (formKey === 'form3') setShowForm3Modal(true);
    if (autoPrint) {
      setAutoPrintForm(formKey);
    }
  };

  const handleDownloadOcr = () => {
    if (!selectedCase) {
      return;
    }
    const lines = selectedCase.documents.flatMap((category) => [
      `${language === 'zh' ? '類別' : 'Category'}: ${language === 'zh' ? category.labelZh : category.labelEn}`,
      ...category.documents.flatMap((doc) => [
        `${language === 'zh' ? '文件' : 'Document'}: ${doc.fileName}`,
        ...doc.ocrFields.map((field) => `${language === 'zh' ? field.labelZh : field.labelEn}: ${field.value} (${t.ocrConfidence} ${field.confidence}%)`),
        '',
      ]),
    ]);
    downloadTextFile(`${selectedCase.caseRef}-ocr-summary.txt`, lines.join('\n'));
  };

  const handleOpenOriginalPreview = (document: ReviewedDocument) => {
    setPreviewDocument(document);
  };

  const toggleHighlightTarget = (targetId: string) => {
    if (!highlightMode) {
      return;
    }
    setHighlightedTargets((current) => (current.includes(targetId) ? current.filter((item) => item !== targetId) : [...current, targetId]));
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff_0%,_#eef4fb_45%,_#e8eef7_100%)] text-slate-900">
      <header
        className="sticky top-0 z-30 border-b-0 text-white shadow-sm backdrop-blur"
        style={{
          background: 'rgba(1, 32, 86, 0.95)',
          borderBottom: '3px solid #5074ab',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div className="mx-auto flex w-full max-w-[1880px] items-center justify-between gap-4 px-4 py-0 md:px-8">
          <div className="flex items-center gap-3 md:gap-5">
            <button
              type="button"
              onClick={selectedCase ? () => setSelectedCaseId(null) : onBack}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:border-white/35 hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              {selectedCase ? t.backToQueue : t.back}
            </button>
            <div className="flex items-center gap-2 md:gap-0">
              <img src="/logo.png" alt="Hong Kong Judiciary Logo" className="h-12 w-auto md:h-24" />
              <div
                className="hidden md:block"
                style={{
                  borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
                  height: '48px',
                  margin: '0 24px',
                }}
              ></div>
              <div className="text-white">
                <p
                  className="hidden text-white md:block"
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    margin: 0,
                    marginBottom: '4px',
                  }}
                >
                  {t.brandEyebrow}
                </p>
                <h1
                  className="text-white"
                  style={{
                    fontSize: '26px',
                    fontWeight: 'bold',
                    margin: 0,
                    letterSpacing: '-0.01em',
                    lineHeight: '1.2',
                  }}
                >
                  {t.brandTitle}
                </h1>
                <div className="mt-1 hidden items-center gap-2 md:flex">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span className="text-[13px] font-normal text-white">{language === 'zh' ? '安全加密連線' : 'Secure Connection'}</span>
                </div>
                <div className="mt-0.5 text-base font-semibold text-white">{t.pageTitle}</div>
                <div className="mt-1 text-sm text-white">{t.pageSubtitle}</div>
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <button type="button" className="border-none bg-transparent px-2 text-sm text-white" onClick={() => handleFontControlClick('sm')}>A</button>
            <button type="button" className="border-none bg-transparent px-2 text-base text-white underline" onClick={() => handleFontControlClick('md')}>A</button>
            <button type="button" className="border-none bg-transparent px-2 text-lg text-white" onClick={() => handleFontControlClick('lg')}>A</button>
            <button
              type="button"
              onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
              className="rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:border-white/35 hover:bg-white/15"
              aria-label={language === 'zh' ? 'Switch to English' : '切換至中文'}
            >
              {language === 'zh' ? 'EN' : '中文'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1880px] px-4 py-5 md:px-8 md:py-6">
        {!selectedCase ? (
          <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{t.queueTitle}</div>
              <h2 className="mt-1 text-lg font-semibold text-slate-900 md:text-xl">{t.queueSubtitle}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-base">
                <thead className="bg-slate-50/90 text-left text-sm uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3">{t.caseRef}</th>
                    <th className="px-5 py-3">{t.claimant}</th>
                    <th className="px-5 py-3">{t.filingDate}</th>
                    <th className="px-5 py-3">{t.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {queueCases.map((caseItem) => {
                    const badge = statusBadge(caseItem.status, t);
                    return (
                      <tr
                        key={caseItem.id}
                        className="border-t border-slate-100 transition-colors hover:bg-[#f6f9ff]"
                        onClick={() => setSelectedCaseId(caseItem.id)}
                      >
                        <td className="px-5 py-4 font-semibold text-slate-900">{caseItem.caseRef}</td>
                        <td className="px-5 py-4 text-slate-700">{caseItem.claimant}</td>
                        <td className="px-5 py-4 text-slate-600">{caseItem.filingDate}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-sm font-semibold ${badge.className}`}>{badge.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3 rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(242,247,255,0.95))] px-6 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{selectedCase.caseRef}</div>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">{selectedCase.claimant}</h2>
                <div className="mt-1 text-base text-slate-600">{language === 'zh' ? '文件先行核實，確認文件已就緒後，才開啟正式表格。' : 'Validate the documents first, confirm readiness, and then unlock the official forms.'}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-3 py-2 text-sm text-slate-700 shadow-sm">
                  {t.docsAcceptedCounter}: <span className="font-semibold text-emerald-700">{acceptedDocs}</span>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-3 py-2 text-sm text-slate-700 shadow-sm">
                  {t.docsRejectedCounter}: <span className="font-semibold text-amber-700">{rejectedDocs}</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm">
                  {t.docsPendingCounter}: <span className="font-semibold text-slate-700">{pendingDocs}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)] 2xl:grid-cols-[360px_minmax(0,1fr)]">
              <aside className="space-y-4">
                <div className="rounded-[28px] border border-white/70 bg-white/92 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{t.intakeSummary}</div>
                  <div className="space-y-4 text-base">
                    <section>
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500"><FileSearch className="h-4 w-4" />{t.personalInfo}</div>
                      <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        {selectedCase.intake.personalInfo.map((row) => (
                          <div key={row.labelEn} className="grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-sm">
                            <div className="font-semibold text-slate-500">{language === 'zh' ? row.labelZh : row.labelEn}</div>
                            <div className="text-slate-800">{row.value}</div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500"><Search className="h-4 w-4" />{t.employerInfo}</div>
                      <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        {selectedCase.intake.employerInfo.map((row) => (
                          <div key={row.labelEn} className="grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-sm">
                            <div className="font-semibold text-slate-500">{language === 'zh' ? row.labelZh : row.labelEn}</div>
                            <div className="text-slate-800">{row.value}</div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500"><FileText className="h-4 w-4" />{t.claimItems}</div>
                      <div className="space-y-2">
                        {selectedCase.intake.claimItems.map((item) => (
                          <div key={item.itemEn} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="text-base font-semibold text-slate-900">{language === 'zh' ? item.itemZh : item.itemEn}</div>
                              <div className="rounded-full bg-white px-2 py-1 text-sm font-semibold text-slate-700">{item.amount}</div>
                            </div>
                            <div className="mt-2 text-sm text-slate-600">{language === 'zh' ? item.noteZh : item.noteEn}</div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </aside>

              <div className="space-y-4">
                <div className="rounded-[28px] border border-white/70 bg-white/92 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{t.documentsTitle}</div>
                      <div className="mt-1 text-base text-slate-600">{t.docsInstruction}</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadOcr}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Download className="h-4 w-4" />
                      {t.downloadOcr}
                    </button>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(0,1fr)]">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
                      <div className="h-[600px] max-h-[calc(100vh-260px)] space-y-2 overflow-y-auto pr-1">
                        {selectedCase.documents.map((category) => {
                          const categoryDocs = category.documents;
                          const uploadCount = categoryDocs.length;
                          const categoryComplete = categoryDocs.length > 0 && categoryDocs.every((doc) => doc.reviewStatus !== 'pending');
                          const categoryState = getCategoryReviewState(categoryDocs);
                          const categoryIndicator = getCategoryIndicator(categoryState, t);
                          const isActive = expandedCategoryKey === category.key;

                          return (
                            <button
                              key={category.key}
                              type="button"
                              onClick={() => setExpandedCategoryKey(category.key)}
                              className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${isActive ? 'border-[#8fb3ea] bg-[#eaf2ff] shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base leading-none">{categoryIndicator.symbol}</span>
                                    <div className={`truncate text-base font-semibold ${isActive ? 'text-[#012056]' : 'text-slate-900'}`}>{language === 'zh' ? category.labelZh : category.labelEn}</div>
                                  </div>
                                  <div className="mt-1 text-sm text-slate-500">
                                    {uploadCount === 0 ? t.noCategoryDocumentsShort : categoryComplete ? t.categoryReady : t.categoryNeedsAction}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${categoryIndicator.className}`}>{categoryIndicator.label}</span>
                                  <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-right">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{t.categoryCount}</div>
                                    <div className={`mt-0.5 text-xl font-black leading-none tabular-nums ${uploadCount === 0 ? 'text-slate-300' : isActive ? 'text-[#012056]' : categoryComplete ? 'text-emerald-700' : 'text-slate-700'}`}>{uploadCount}</div>
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="h-[600px] max-h-[calc(100vh-260px)] overflow-hidden">
                        {activeCategory ? (
                          <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto]">
                            <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <div className="text-base font-semibold text-slate-900">{language === 'zh' ? activeCategory.labelZh : activeCategory.labelEn}</div>
                                  <div className="mt-1 text-sm text-slate-500">{activeDocuments.length === 0 ? t.noCategoryDocumentsShort : `${activeDocuments.length} ${t.uploaded}`}</div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setHighlightMode((current) => !current)}
                                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${highlightMode ? 'border-[#8fb3ea] bg-[#eaf2ff] text-[#012056]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                                  >
                                    <Highlighter className="h-4 w-4" />
                                    {t.highlightMode}
                                  </button>
                                  {highlightedTargets.length > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => setHighlightedTargets([])}
                                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                    >
                                      {t.clearHighlights}
                                    </button>
                                  ) : null}
                                </div>
                                {activeDocuments.length > 1 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {activeDocuments.map((doc) => {
                                      const documentIndicator = getDocumentReviewIndicator(doc.reviewStatus, t);

                                      return (
                                        <button
                                          key={doc.id}
                                          type="button"
                                          onClick={() => setExpandedDocumentId(doc.id)}
                                          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${expandedDocumentId === doc.id ? 'border-[#8fb3ea] bg-[#eaf2ff] text-[#012056]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                                        >
                                          <span>{doc.fileName.replace(/\.[^.]+$/, '')}</span>
                                          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${documentIndicator.className}`}>
                                            {documentIndicator.label}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                ) : null}
                              </div>
                            </div>

                            <div className="overflow-y-auto px-4 py-4">
                              {activeDocument ? (
                                <div className="grid gap-4 lg:grid-cols-2">
                                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                      <Search className="h-4 w-4" />{t.ocrResult}
                                    </div>
                                    <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                      <span>{t.uploaded}: {activeDocument.uploadedAt}</span>
                                      <span>{activeDocument.pageCount} {language === 'zh' ? '頁' : 'pages'}</span>
                                      <span>{activeDocument.sourceType.toUpperCase()}</span>
                                    </div>
                                    <p className="mb-3 text-xs leading-6 text-slate-600">{language === 'zh' ? activeDocument.ocrSummaryZh : activeDocument.ocrSummaryEn}</p>
                                    <div className="mb-3 text-xs text-slate-500">{highlightMode ? t.highlightOn : t.highlightOff}</div>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                      {activeDocument.ocrFields.map((field) => (
                                        <button
                                          key={`${activeDocument.id}-${field.labelEn}`}
                                          type="button"
                                          onClick={() => toggleHighlightTarget(`${activeDocument.id}-${field.labelEn}`)}
                                          className={`rounded-lg border bg-white px-3 py-2.5 text-left ${highlightedTargets.includes(`${activeDocument.id}-${field.labelEn}`) ? 'border-[#f3c969] bg-[#fff8db] shadow-[0_0_0_1px_rgba(243,201,105,0.35)]' : 'border-slate-200'} ${highlightMode ? 'cursor-pointer hover:border-[#f3c969]' : 'cursor-default'}`}
                                        >
                                          <div className="flex items-start justify-between gap-2">
                                            <span className="text-sm font-semibold text-slate-500">{language === 'zh' ? field.labelZh : field.labelEn}</span>
                                            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getConfidenceBadgeClass(field.confidence)}`}>{field.confidence}%</span>
                                          </div>
                                          <div className="mt-1 text-sm font-medium text-slate-900">{field.value}</div>
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                      <Eye className="h-4 w-4" />{t.originalDocument}
                                    </div>
                                    <p className="mb-4 text-xs leading-6 text-slate-600">{language === 'zh' ? activeDocument.originalHintZh : activeDocument.originalHintEn}</p>
                                    <button
                                      type="button"
                                      className={`mb-4 block w-full overflow-hidden rounded-2xl border bg-white text-left shadow-sm ${highlightedTargets.includes(`${activeDocument.id}-preview`) ? 'border-[#f3c969] bg-[#fff8db]' : 'border-slate-200'} ${highlightMode ? 'hover:border-[#f3c969]' : 'hover:border-slate-300'}`}
                                      onClick={() => {
                                        if (highlightMode) {
                                          toggleHighlightTarget(`${activeDocument.id}-preview`);
                                          return;
                                        }
                                        handleOpenOriginalPreview(activeDocument);
                                      }}
                                    >
                                      <div className="border-b border-slate-200 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{t.previewInline}</div>
                                      <div className="flex min-h-[240px] items-center justify-center bg-[linear-gradient(180deg,_#f8fafc,_#e8eef7)] p-4">
                                        <div className="w-full max-w-[320px] rounded-xl border border-slate-300 bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
                                          <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                            <span>{activeDocument.sourceType.toUpperCase()}</span>
                                            <span>{activeDocument.pageCount} {language === 'zh' ? '頁' : 'pages'}</span>
                                          </div>
                                          <div className="space-y-2">
                                            <div className="h-2 rounded bg-slate-200"></div>
                                            <div className="h-2 w-5/6 rounded bg-slate-200"></div>
                                            <div className="h-2 w-2/3 rounded bg-slate-200"></div>
                                            <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-10 text-center text-xs text-slate-500">
                                              {activeDocument.fileName}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="px-3 py-2 text-xs text-slate-500">{t.clickToExpand}</div>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                                  {t.noCategoryDocuments}
                                </div>
                              )}
                            </div>

                            <div className="sticky bottom-0 border-t border-slate-200 bg-white px-4 py-4">
                              {activeDocument ? (
                                <div className="space-y-3">
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <div className="mb-2 text-xs font-semibold text-slate-600">{t.rejectReason}</div>
                                    <div className="flex flex-wrap gap-2">
                                      {(['blurry', 'missing_signature', 'mismatch'] as RejectReason[]).map((reason) => (
                                        <button
                                          key={reason}
                                          type="button"
                                          onClick={() => handleRejectReason(activeDocument.id, reason)}
                                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${activeDocument.rejectReason === reason ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                                        >
                                          {getRejectReasonLabel(reason, t)}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleAcceptDocument(activeDocument.id)}
                                      className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                                    >
                                      <CircleCheckBig className="h-4 w-4" />
                                      {t.acceptDocument}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRejectDocument(activeDocument.id)}
                                      className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                                    >
                                      <RefreshCcw className="h-4 w-4" />
                                      {t.rejectDocument}
                                    </button>
                                    <button
                                      type="button"
                                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                      onClick={() => handleOpenOriginalPreview(activeDocument)}
                                    >
                                      <Eye className="h-4 w-4" />
                                      {t.retrieveOriginal}
                                    </button>
                                  </div>

                                  {activeDocument.reviewStatus === 'reupload_requested' ? (
                                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                                      <div className="mb-2 text-xs font-semibold text-rose-700">{t.rejectReason}</div>
                                      <select
                                        value={activeDocument.rejectReason ?? 'blurry'}
                                        onChange={(event) => handleRejectReason(activeDocument.id, event.target.value as RejectReason)}
                                        className="mb-3 w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm"
                                      >
                                        {REJECT_REASON_OPTIONS.map((reason) => (
                                          <option key={reason} value={reason}>
                                            {getRejectReasonLabel(reason, t)}
                                          </option>
                                        ))}
                                      </select>
                                      <div className="mb-2 text-xs font-semibold text-rose-700">{t.rejectNote}</div>
                                      <input
                                        value={activeDocument.rejectNote ?? ''}
                                        onChange={(event) => handleRejectNote(activeDocument.id, event.target.value)}
                                        placeholder={t.rejectPlaceholder}
                                        className="w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm"
                                      />
                                    </div>
                                  ) : null}
                                </div>
                              ) : (
                                <div className="text-sm text-slate-500">{t.noCategoryDocuments}</div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center px-6 text-sm text-slate-500">{t.noCategoryDocuments}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/70 bg-white/92 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t.summaryTitle}</div>
                      <div className="mt-1 text-sm text-slate-600">{selectedSummaryGenerated ? t.summaryGenerated : canGenerateSummary ? t.summaryLocked : t.requiredMissingHint}</div>
                    </div>
                  </div>

                  <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{t.readinessOverview}</div>
                        <div className="mt-1 text-xs text-slate-500">{requiredCompleteCount}/{requiredChecklist.length} {t.readyItems}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {!selectedSummaryGenerated ? (
                          <button
                            type="button"
                            onClick={handleDemoReadyNow}
                            disabled={summaryLoadingCaseId === selectedCase?.id}
                            className="inline-flex items-center gap-2 rounded-full border border-[#8fb3ea] bg-[#eaf2ff] px-3.5 py-2 text-xs font-semibold text-[#012056] hover:bg-[#dce9ff] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <BadgeCheck className="h-4 w-4" />
                            {t.demoReadyNow}
                          </button>
                        ) : null}
                        <div className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${requiredMissingCount > 0 ? 'border-rose-200 bg-rose-50 text-rose-700' : requiredPendingCount > 0 ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                          {readinessPercent}%
                        </div>
                      </div>
                    </div>
                    <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${requiredMissingCount > 0 ? 'bg-rose-500' : requiredPendingCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${readinessPercent}%` }}
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t.requiredDocuments}</div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {requiredChecklist.map((item) => (
                            <div key={item.key} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                              <div className="flex items-start gap-2">
                                <span className="text-sm leading-5">{getReadinessStatusIcon(item.status)}</span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm font-semibold text-slate-900">{language === 'zh' ? item.labelZh : item.labelEn}</div>
                                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getReadinessStatusClass(item.status)}`}>({item.uploadedCount}/{item.requiredCount})</span>
                                  </div>
                                  <div className="mt-1 text-xs text-slate-500">[{language === 'zh' ? item.contextZh : item.contextEn}]</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t.supportingDocuments}</div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {supportingChecklist.map((item) => (
                            <div key={item.key} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                              <div className="flex items-start gap-2">
                                <span className="text-sm leading-5">{getReadinessStatusIcon(item.status)}</span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm font-semibold text-slate-900">{language === 'zh' ? item.labelZh : item.labelEn}</div>
                                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getReadinessStatusClass(item.status)}`}>({item.uploadedCount}/{item.requiredCount})</span>
                                  </div>
                                  <div className="mt-1 text-xs text-slate-500">[{language === 'zh' ? item.contextZh : item.contextEn}]</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{t.validatedCount}: {acceptedDocs}</span>
                      <span>{t.uploadedCount}: {selectedCaseDocuments.length}</span>
                      {requiredMissingCount > 0 ? <span className="font-semibold text-rose-600">{t.requiredMissingWarning}</span> : null}
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenerateSummary(false)}
                      disabled={!canGenerateSummary || summaryLoadingCaseId === selectedCase?.id || selectedSummaryGenerated}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-sm ${canGenerateSummary ? 'bg-[#012056] text-white hover:bg-[#0b2f73]' : 'cursor-not-allowed bg-slate-200 text-slate-500'}`}
                    >
                      <BadgeCheck className="h-4 w-4" />
                      {summaryLoadingCaseId === selectedCase?.id ? t.generatingSummary : t.generateSummary}
                    </button>
                    {!selectedSummaryGenerated ? (
                      <button
                        type="button"
                        onClick={handleDemoApproveAllDocuments}
                        disabled={summaryLoadingCaseId === selectedCase?.id}
                        className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CircleCheckBig className="h-4 w-4" />
                        {t.demoApproveAll}
                      </button>
                    ) : null}
                    {!selectedSummaryGenerated ? (
                      <button
                        type="button"
                        onClick={() => handleGenerateSummary(true)}
                        disabled={summaryLoadingCaseId === selectedCase?.id}
                        className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CircleAlert className="h-4 w-4" />
                        {t.overrideConfirm}
                      </button>
                    ) : null}
                  </div>
                  {!canGenerateSummary && !selectedSummaryGenerated ? (
                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      <div className="font-semibold">{t.requiredMissingWarning}</div>
                      <div className="mt-1 text-xs">{t.forceConfirmHint}</div>
                    </div>
                  ) : null}

                  {summaryLoadingCaseId === selectedCase.id ? (
                    <div className="grid gap-3 md:grid-cols-3">
                      {[0, 1, 2].map((item) => (
                        <div key={item} className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="mb-3 h-3 w-24 rounded bg-slate-200"></div>
                          <div className="space-y-2">
                            <div className="h-3 rounded bg-slate-200"></div>
                            <div className="h-3 rounded bg-slate-200"></div>
                            <div className="h-3 w-3/4 rounded bg-slate-200"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : selectedSummaryGenerated && selectedCase.summary ? (
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"><BadgeCheck className="h-4 w-4" />{t.agreedFacts}</div>
                        <ul className="space-y-2 text-sm text-slate-700">
                          {(language === 'zh' ? selectedCase.summary.factsZh : selectedCase.summary.factsEn).map((fact) => (
                            <li key={fact} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500"></span><span>{fact}</span></li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"><CircleAlert className="h-4 w-4" />{t.keyIssues}</div>
                        <ul className="space-y-2 text-sm text-slate-700">
                          {(language === 'zh' ? selectedCase.summary.issuesZh : selectedCase.summary.issuesEn).map((issue) => (
                            <li key={issue} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500"></span><span>{issue}</span></li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"><Clock3 className="h-4 w-4" />{t.fileReadiness}</div>
                        <div className="text-sm text-slate-700">{language === 'zh' ? selectedCase.summary.fileReadinessZh : selectedCase.summary.fileReadinessEn}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">{t.noSummaryYet}</div>
                  )}
                </div>

                {selectedSummaryGenerated ? (
                  <div className="rounded-[28px] border border-white/70 bg-white/92 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                    <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t.officialForms}</div>
                    <div className="mb-4 text-sm text-slate-600">{t.formsNote}</div>
                    <div className="space-y-3">
                      {([
                        { key: 'form1', label: t.form1Label },
                        { key: 'form2', label: t.form2Label },
                        { key: 'form3', label: t.form3Label },
                      ] as Array<{ key: FormKey; label: string }>).map((form) => (
                        <div key={form.key} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,_rgba(248,250,252,0.9),_rgba(255,255,255,0.98))] px-4 py-3 shadow-sm">
                          <div className="font-semibold text-slate-900">{form.label}</div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handlePreviewForm(form.key, false)}
                              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4" />
                              {t.previewPdf}
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePreviewForm(form.key, true)}
                              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <Printer className="h-4 w-4" />
                              {t.print}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700">
                      {t.nextStepRibbon}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/75 p-5 text-sm text-slate-500 shadow-sm">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t.officialForms}</div>
                    <div className="mt-2">{t.formsLocked}</div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {showForm1Modal && <Form1PreviewModal language={language} onClose={() => setShowForm1Modal(false)} />}
      {showForm2Modal && <Form2PreviewModal language={language} onClose={() => setShowForm2Modal(false)} />}
      {showForm3Modal && <Form3PreviewModal language={language} onClose={() => setShowForm3Modal(false)} />}
      {previewDocument ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm" onClick={() => setPreviewDocument(null)}>
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.35)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t.originalDocument}</div>
                <div className="mt-1 text-base font-semibold text-slate-900">{previewDocument.fileName}</div>
                <div className="mt-1 text-xs text-slate-500">{previewDocument.sourceType.toUpperCase()} · {previewDocument.pageCount} {language === 'zh' ? '頁' : 'pages'} · {t.uploaded}: {previewDocument.uploadedAt}</div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocument(null)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                {language === 'zh' ? '關閉' : 'Close'}
              </button>
            </div>
            <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="min-h-[520px] overflow-auto bg-[linear-gradient(180deg,_#edf3fb,_#dce7f7)] p-6">
                <div className="mx-auto w-full max-w-3xl rounded-[24px] border border-slate-300 bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.18)]">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    <span>{previewDocument.sourceType === 'pdf' ? 'PDF Preview' : 'Image Preview'}</span>
                    <span>{previewDocument.pageCount} {language === 'zh' ? '頁' : 'pages'}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-40 rounded bg-slate-200"></div>
                    <div className="h-3 w-11/12 rounded bg-slate-200"></div>
                    <div className="h-3 w-4/5 rounded bg-slate-200"></div>
                    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-16 text-center">
                      <div className="text-sm font-semibold text-slate-800">{previewDocument.fileName}</div>
                      <div className="mt-2 text-xs leading-6 text-slate-500">{language === 'zh' ? previewDocument.originalHintZh : previewDocument.originalHintEn}</div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {previewDocument.ocrFields.map((field) => (
                        <div key={`preview-${previewDocument.id}-${field.labelEn}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="text-xs font-semibold text-slate-500">{language === 'zh' ? field.labelZh : field.labelEn}</div>
                          <div className="mt-1 text-sm font-medium text-slate-900">{field.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <aside className="border-t border-slate-200 bg-slate-50 p-5 lg:border-l lg:border-t-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{language === 'zh' ? '文件摘要' : 'Document Summary'}</div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{language === 'zh' ? previewDocument.originalHintZh : previewDocument.originalHintEn}</p>
                <div className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">{language === 'zh' ? '檔案格式' : 'Format'}</span>
                    <span className="font-semibold uppercase">{previewDocument.sourceType}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">{language === 'zh' ? '頁數' : 'Pages'}</span>
                    <span className="font-semibold">{previewDocument.pageCount}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">{t.status}</span>
                    <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${getDocumentReviewIndicator(previewDocument.reviewStatus, t).className}`}>{getDocumentReviewIndicator(previewDocument.reviewStatus, t).label}</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
