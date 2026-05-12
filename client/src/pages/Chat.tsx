import React from 'react';

import ReactDOM from 'react-dom';

import { useCallback, useEffect, useRef, useState, FormEvent } from 'react';

import { ArrowLeft, Send, X, Calendar, Clock, MapPin, Check, Phone, Upload, FileText, CheckCircle, Info, AlertCircle, Menu, Globe, Type } from 'lucide-react';

import { streamChat, sendAnalytics, regenerateSessionId } from '../lib/chat';

import { handleFontControlClick, initializeTextSize } from '../lib/accessibility';

import { parseMarkdownToHTML } from '../lib/markdown';

import { Spinner } from '../components/ui/spinner';

import TypingIndicator from '../components/TypingIndicator';

import AppointmentBooking from '../components/AppointmentBooking';
import AppShellHeader from '../components/layout/AppShellHeader';

import DocumentUpload from '../components/DocumentUpload';



export type AttachmentMeta = { name: string; size: number; type?: string };



function useQueryParams() {

  try {

    const params = new URLSearchParams(window.location.search);

    return { 

      msg: params.get('msg') || '', 

      lang: (params.get('lang') || 'zh'),

      scenario: params.get('scenario') || null,

      role: params.get('role') || 'claimant'

    };

  } catch {

    return { msg: '', lang: 'zh', scenario: null, role: 'claimant' };

  }

}



type Option = { label: string; value: string; followUp?: string };



type ChatMessage = {

  id: string;

  from: 'user' | 'bot';

  text: string;

  attachments?: AttachmentMeta[];

  options?: Option[];

  nextSteps?: { title: string; description: string }[];

  error?: string;

  progress?: { current: number; total: number; section: string };

  ts: number;

  customAction?: 'upload_zone' | 'download_form18' | 'upload_dropzone' | 'system_extraction' | 'receipt_card' | 'show_evidence_popout';

  step?: number; // Workflow step number for progress tracking

  systemExtraction?: { documentType: string; extractedData: Array<{ label: string; value: string; confidence: number }> };

};



function makeId(prefix = 'id') {

  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

}



function extractNextSteps(raw: string) {

  if (!raw) return { steps: null, cleaned: raw };



  // try <NEXT_STEPS>...</NEXT_STEPS>

  const tagMatch = raw.match(/<NEXT_STEPS>([\s\S]*?)<\/NEXT_STEPS>/i);

  if (tagMatch) {

    const jsonText = tagMatch[1].trim();

    try {

      const parsed = JSON.parse(jsonText);

      return { steps: Array.isArray(parsed) ? parsed : parsed.steps || null, cleaned: raw.replace(tagMatch[0], '').trim() };

    } catch {}

  }



  // try fenced code block labelled NEXT_STEPS

  const fenceMatch = raw.match(/```NEXT_STEPS\s*([\s\S]*?)```/i);

  if (fenceMatch) {

    const jsonText = fenceMatch[1].trim();

    try {

      const parsed = JSON.parse(jsonText);

      return { steps: Array.isArray(parsed) ? parsed : parsed.steps || null, cleaned: raw.replace(fenceMatch[0], '').trim() };

    } catch {}

  }



  // try generic JSON code block

  const genericJson = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (genericJson) {

    const jsonText = genericJson[1].trim();

    try {

      const parsed = JSON.parse(jsonText);

      if (Array.isArray(parsed)) return { steps: parsed, cleaned: raw.replace(genericJson[0], '').trim() };

      if (parsed && parsed.next_steps) return { steps: parsed.next_steps, cleaned: raw.replace(genericJson[0], '').trim() };

    } catch {}

  }



  // fallback: look for a 'Suggested next steps' section and parse bullets

  const bulletsMatch = raw.match(/(?:Suggested next steps:|Suggested next steps|Suggested steps:|下一步建議|建議下一步)([\s\S]*)/i);

  if (bulletsMatch) {

    const listText = bulletsMatch[1];

    const lines = listText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    const steps: Array<any> = [];

    for (const line of lines) {

      const m = line.match(/^(?:-\s*|\d+\.\s*)?(.*)$/);

      if (m) steps.push({ title: m[1].trim() });

    }

    return { steps: steps.length ? steps : null, cleaned: raw.replace(bulletsMatch[0], '').trim() };

  }



  return { steps: null, cleaned: raw };

}



function extractOptions(raw: string): { options: Option[] | null; cleaned: string } {

  if (!raw) return { options: null, cleaned: raw };



  // Try <OPTIONS>...</OPTIONS>

  const tagMatch = raw.match(/<OPTIONS>([\s\S]*?)<\/OPTIONS>/i);

  if (tagMatch) {

    const jsonText = tagMatch[1].trim();

    try {

      const parsed = JSON.parse(jsonText);

      const options = Array.isArray(parsed) ? parsed : null;

      return { options, cleaned: raw.replace(tagMatch[0], '').trim() };

    } catch {}

  }



  // Try ```OPTIONS ... ```

  const fenceMatch = raw.match(/```OPTIONS\s*([\s\S]*?)```/i);

  if (fenceMatch) {

    const jsonText = fenceMatch[1].trim();

    try {

      const parsed = JSON.parse(jsonText);

      const options = Array.isArray(parsed) ? parsed : null;

      return { options, cleaned: raw.replace(fenceMatch[0], '').trim() };

    } catch {}

  }



  return { options: null, cleaned: raw };

}



export default function Chat() {

  const { msg: initial, lang, scenario, role } = useQueryParams();

  const [language, setLanguage] = useState<'zh' | 'en'>((lang && lang.toLowerCase().startsWith('en')) ? 'en' : 'zh');

  useEffect(() => {
    setLanguage((lang && lang.toLowerCase().startsWith('en')) ? 'en' : 'zh');
  }, [lang]);

  const handleLanguageChange = useCallback((nextLanguage: 'zh' | 'en') => {
    setLanguage(nextLanguage);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', nextLanguage);
    window.history.pushState({}, '', `${url.pathname}${url.search}`);
  }, []);



  // Initialize text size on mount

  useEffect(() => {

    initializeTextSize();

  }, []);



  // Typing indicator state

  const [isTyping, setIsTyping] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  

  const consumedOptionMessageIdsRef = useRef<Set<string>>(new Set());



  const i18n: Record<string, any> = {

    en: {

      brandEyebrow: 'JUDICIARY LABOUR TRIBUNAL',

      brandTitle: 'Online Commencement',

      placeholder: 'Please provide your claim details or additional information...',
      claimantPlaceholder: 'Please provide your claim details or additional information...',
      defendantPlaceholder: 'Please provide your defence details, witness information, or supporting documents...',

      sendLabel: 'Submit',

      retryLabel: 'Retry',

      loading: 'System is processing…',

      responseFailed: 'Response failed:',

      progressLabel: 'Progress',

      whyNeedThis: 'Why do we need this?',

      whyNeedThisText: 'This information is required to calculate benefits and determine the appropriate claim amount for your case.',

      hideHelper: 'Hide',

    },

    zh: {

      brandEyebrow: '司法機構 勞資審裁處',

      brandTitle: '勞資審裁處網上啟動平台',

      placeholder: '請提供你的申索詳情或補充資料...',
      claimantPlaceholder: '請提供你的申索詳情或補充資料...',
      defendantPlaceholder: '請提供你的抗辯內容、證人資料或支持文件...',

      sendLabel: '提交',

      retryLabel: '重試',

      loading: '系統正在處理⋯⋯',

      responseFailed: '回應失敗：',

      progressLabel: '進度',

      whyNeedThis: '為什麼需要此資料？',

      whyNeedThisText: '此資料用於計算權益及確定申索金額，以確保你的申索準確無誤。',

      hideHelper: '收起',

    },

  };









  const t = i18n[language];
  t.placeholder = role === 'defendant' ? t.defendantPlaceholder : t.claimantPlaceholder;

  

  // Scenario-specific initial messages

  const getScenarioInitialMessage = (scenario: string | null): ChatMessage => {

    if (scenario === 'upload') {

      return {

        id: makeId('b'),

        from: 'bot',

        text: language === 'zh'

          ? '如你已會見調查主任，並需補交文件（例如銀行月結單、WhatsApp 紀錄等），請輸入你的案件編號（例如 LBTC 1234/2026）。系統會列出尚待補交的文件清單。'

          : 'If you have already met with the investigating officer and need to submit supplementary documents (e.g., bank statements, WhatsApp records, etc.), please enter your case reference number (e.g., LBTC 1234/2026). The system will list the pending documents for you.',

        ts: Date.now()

      };

    } else if (scenario === 'status') {

      return {

        id: makeId('b'),

        from: 'bot',

        text: language === 'zh'

          ? '你好。你可以在此查詢案件的最新進度或下一次提訊（Call Over）的日期。為核實身份，請輸入你的案件編號及申索人香港身份證號碼首 4 位數字（例如：A123）。'

          : 'Hello. You can check the latest progress of your case or the date of the next Call Over here. To verify your identity, please enter your case reference number and the first 4 digits of the claimant\'s Hong Kong ID number (e.g., A123).',

        options: language === 'zh' ? [

          { label: '如何得知提訊日期？', value: '如何得知提訊日期？' },

          { label: '我聯絡不到調查主任怎麼辦？', value: '我聯絡不到調查主任怎麼辦？' }

        ] : [

          { label: 'How do I find out the Call Over date?', value: 'How do I find out the Call Over date?' },

          { label: 'What if I cannot contact the investigating officer?', value: 'What if I cannot contact the investigating officer?' }

        ],

        ts: Date.now()

      };

    } else if (scenario === 'reschedule') {

      return {

        id: makeId('b'),

        from: 'bot',

        text: language === 'zh'

          ? '注意：如需更改或取消與調查主任的會面預約，必須在原定日期前至少 3 個工作天通知審裁處。請提供你的預約編號（例如 LT-2026-0414-001），以便系統為你安排新的時間。'

          : 'Note: To change or cancel an appointment with the investigating officer, you must notify the Tribunal at least 3 working days before the original date. Please provide your appointment reference number (e.g., LT-2026-0414-001) so the system can arrange a new time for you.',

        options: language === 'zh' ? [

          { label: '我明天就要會面，現在可以改嗎？', value: '我明天就要會面，現在可以改嗎？' },

          { label: '我想完全取消這宗申索', value: '我想完全取消這宗申索' }

        ] : [

          { label: 'My meeting is tomorrow, can I change it now?', value: 'My meeting is tomorrow, can I change it now?' },

          { label: 'I want to cancel this claim completely', value: 'I want to cancel this claim completely' }

        ],

        ts: Date.now()

      };

    } else {

      // Default welcome message by role

      if (role === 'defendant') {

        return {

          id: makeId('b'),

          from: 'bot',

          text: language === 'zh'

            ? '你好，我是勞資審裁處的智能助理。我會協助你以被告人身分回應申索。請先告訴我：你是否已收到申索文件？'

            : 'Hello, I am the Labour Tribunal virtual assistant. I will help you respond to the claim as a defendant. Have you received the claim documents?',

          options: language === 'zh' ? [

            { label: '我有案件編號', value: '我有案件編號' },

            { label: '想先了解要準備什麼', value: '想先了解要準備什麼' },

            { label: '未收到任何文件', value: '未收到任何文件' }

          ] : [

            { label: 'I have the case number', value: 'I have the case number' },

            { label: 'What do I need to prepare?', value: 'What do I need to prepare?' },

            { label: 'I haven\'t received any documents', value: 'I haven\'t received any documents' }

          ],

          ts: Date.now()

        };

      }

      return {

        id: makeId('b'),

        from: 'bot',

        text: language === 'zh'

          ? '你好，我是勞資審裁處的智能助理。我注意到你想申索「拖欠薪金」。為協助你草擬申索表格，請告訴我：\n\n你最後受僱的職位是什麼？每月的底薪是多少？'

          : 'Hello, I am the Labour Tribunal smart assistant. I understand you want to claim "Unpaid Wages". To help draft your claim form, please tell me:\n\nWhat was your last job title? What was your monthly basic salary?',

        options: language === 'zh' ? [

          { label: '我是侍應，月薪 $15,000', value: '我是侍應，月薪 $15,000' },

          { label: '我是廚師，日薪計', value: '我是廚師，日薪計' }

        ] : [

          { label: 'I was a waiter, monthly salary $15,000', value: 'I was a waiter, monthly salary $15,000' },

          { label: 'I was a cook, paid daily', value: 'I was a cook, paid daily' }

        ],

        ts: Date.now()

      };

    }

  };

  

  // Initialize with welcome message (no options array, just inline text)

  // Note: Appointment option removed - it will only appear at the end of the workflow

  // Note: When scenario is present, initialMessages will be overridden by the scenario-specific message

  const initialMessages: ChatMessage[] = scenario ? [getScenarioInitialMessage(scenario)] : [getScenarioInitialMessage(null)];

  

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const [value, setValue] = useState('');

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);



  // Reset session every time user enters chat page

  useEffect(() => {

    regenerateSessionId();

  }, []);



  // Handle initial message from URL params or scenario

  useEffect(() => {

    if (!scenario && role === 'defendant') {

      setCurrentScenario('defendant_intake');

      setCurrentStep(0);

    }

    if (scenario) {

      // Load scenario-specific initial message

      setCurrentScenario(scenario);

      setCurrentStep(0);

      const scenarioMessage = getScenarioInitialMessage(scenario);

      setMessages([scenarioMessage]);

    } else if (initial && initial.length > 0) {
      const uid = makeId('u');
      setMessages([{ id: uid, from: 'user', text: initial, ts: Date.now() }]);
      
      // NEW INTERCEPT: Route to Chan Tai Man Scenario
      if (initial.includes('拖欠薪金') || initial.toLowerCase().includes('unpaid wages')) {
        setCurrentScenario('unpaid_wages');
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            id: makeId('b'),
            from: 'bot',
            text: language === 'zh' 
              ? '你好，我是勞資審裁處的智能助理。為協助你草擬申索表格，請告訴我：\n\n你最後受僱的職位是什麼？每月的底薪是多少？'
              : 'Hello, I am the Labour Tribunal smart assistant. To help draft your claim form, please tell me:\n\nWhat was your last job title? What was your monthly basic salary?',
            options: language === 'zh' ? [
              { label: '我是侍應，月薪 $15,000', value: '我是侍應，月薪 $15,000' },
              { label: '我是廚師，日薪計', value: '我是廚師，日薪計' }
            ] : [
              { label: 'I was a waiter, monthly salary $15,000', value: 'I was a waiter, monthly salary $15,000' },
              { label: 'I was a cook, paid daily', value: 'I was a cook, paid daily' }
            ],
            ts: Date.now()
          }]);
        }, 1500);
      } else {
        startStreaming(initial, [], language);
      }
    }

  }, [initial, scenario, role]);

  const [isStreaming, setIsStreaming] = useState(false);

  const [lastError, setLastError] = useState<string | null>(null);

  const [lastSentForRetry, setLastSentForRetry] = useState<{ text: string; attachments?: AttachmentMeta[] } | null>(null);

  const [showAppointmentBooking, setShowAppointmentBooking] = useState(false);

  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  const [showEvidencePopout, setShowEvidencePopout] = useState(false);

  // Persist uploaded files across component renders

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const [uploadAttemptCount, setUploadAttemptCount] = useState(0);

  // Track uploaded file names and case reference for confirmation message

  const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([]);

  const [caseReferenceNumber, setCaseReferenceNumber] = useState<string>('');

  const [isRecording, setIsRecording] = useState(false);

  const [recordingTime, setRecordingTime] = useState(0);

  

  // Conversation flow state for multi-step scenarios

  const [currentScenario, setCurrentScenario] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState<number>(0);

  const [consumedOptionMessageIds, setConsumedOptionMessageIds] = useState<string[]>([]);

  const claimantEvidenceSummary = language === 'zh'
    ? [
        {
          title: '申索書（表格一）',
          detail: '列明申索項目、涉案僱傭關係及被告人資料。',
          status: '已存檔'
        },
        {
          title: '申索金額計算摘要',
          detail: '顯示申索人目前主張的欠薪／補償計算基礎。',
          status: '供會面時核對'
        },
        {
          title: '申索人初步僱傭文件',
          detail: '包括已提交的僱傭文件或其他支持材料。',
          status: '可於會面時要求核對正本'
        }
      ]
    : [
        {
          title: 'Claim Form (Form 1)',
          detail: 'Sets out the pleaded claim items, employment relationship and defendant details.',
          status: 'On file'
        },
        {
          title: 'Claim Amount Summary',
          detail: 'Shows the claimant\'s current unpaid wages / compensation calculation basis.',
          status: 'For interview cross-check'
        },
        {
          title: 'Claimant\'s Initial Employment Records',
          detail: 'Includes employment records or other supporting materials already submitted.',
          status: 'Originals may be checked at interview'
        }
      ];

  const defendantEvidenceSummary = uploadedFileNames.length > 0
    ? uploadedFileNames.map((name) => ({
        title: name,
        detail: language === 'zh' ? '已由系統接收，將供調查主任在會面前參考。' : 'Received by the system and will be available for the Investigating Officer to review before the interview.',
        status: language === 'zh' ? '已接收' : 'Received'
      }))
    : [
        {
          title: language === 'zh' ? '抗辯書或書面回應' : 'Defence statement or written response',
          detail: language === 'zh' ? '尚未上傳，可在會面前或之後補交。' : 'Not uploaded yet. It may be submitted before or after the interview.',
          status: language === 'zh' ? '待提交' : 'Pending'
        },
        {
          title: language === 'zh' ? '僱傭合約、糧單及出勤紀錄' : 'Employment contract, payslips and attendance records',
          detail: language === 'zh' ? '建議先經網上上傳，並於會面時帶同正本，供調查主任核對。' : 'These should preferably be uploaded online in advance, and the originals should also be brought to the interview for verification by the Investigating Officer.',
          status: language === 'zh' ? '建議先上傳並帶備正本' : 'Upload first, bring originals'
        }
      ];

  const evidenceWorkflowSummary = language === 'zh'
    ? [
        { label: '案件編號', value: caseReferenceNumber || 'LBTC 1234/2026' },
        { label: '目前程序', value: '被告人口供會面已預約，等候與調查主任會面。' },
        { label: '文件狀態', value: uploadedFileNames.length > 0 ? `已上傳 ${uploadedFileNames.length} 份文件` : '尚未經網上提交文件' },
      ]
    : [
        { label: 'Case Reference', value: caseReferenceNumber || 'LBTC 1234/2026' },
        { label: 'Current Stage', value: 'Defendant interview appointment has been booked and is awaiting the Investigating Officer meeting.' },
        { label: 'Document Status', value: uploadedFileNames.length > 0 ? `${uploadedFileNames.length} document(s) uploaded` : 'No documents uploaded online yet' },
      ];

  const interviewFocusItems = language === 'zh'
    ? [
        '核對申索書內容與被告人基本資料是否正確。',
        '確認你方是否承認、爭議或部分爭議各項申索。',
        '整理需要補交的文件正本、證人資料及後續時限。'
      ]
    : [
        'Check that the claim form contents and defendant particulars are accurate.',
        'Confirm whether each claim item is admitted, disputed or only partly disputed.',
        'Identify any outstanding originals, witness details and follow-up deadlines.'
      ];



  const listRef = useRef<HTMLDivElement | null>(null);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const streamControllerRef = useRef<AbortController | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);



  // Voice recording timer

  useEffect(() => {

    if (isRecording) {

      recordingIntervalRef.current = setInterval(() => {

        setRecordingTime(prev => prev + 1);

      }, 1000);

    } else {

      if (recordingIntervalRef.current) {

        clearInterval(recordingIntervalRef.current);

      }

      setRecordingTime(0);

    }

    return () => {

      if (recordingIntervalRef.current) {

        clearInterval(recordingIntervalRef.current);

      }

    };

  }, [isRecording]);



  const handleStartRecording = async () => {

    try {

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.start();

      setIsRecording(true);

    } catch (err) {

      console.error('Failed to start recording:', err);

      alert(language === 'zh' ? '無法啟動錄音，請檢查麥克風權限' : 'Failed to start recording, please check microphone permissions');

    }

  };



  const handleStopRecording = () => {

    if (mediaRecorderRef.current && isRecording) {

      mediaRecorderRef.current.stop();

      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

      setIsRecording(false);

      // TODO: Send audio for V2T processing

      // For now, simulate transcription

      const simulatedTranscript = language === 'zh' ? '這是模擬的語音轉文字結果' : 'This is a simulated voice-to-text result';

      setValue(simulatedTranscript);

    }

  };



  // persist messages - disabled to ensure fresh start

  // useEffect(() => {

  //   try {

  //     localStorage.setItem('sc_messages_v1', JSON.stringify(messages));

  //   } catch {}

  // }, [messages]);



  // keep view scrolled to bottom

  useEffect(() => {

    const el = listRef.current;

    if (el) el.scrollTop = el.scrollHeight;

  }, [messages, isStreaming]);



  useEffect(() => {

    const el = inputRef.current;

    if (el) {

      el.focus();

      try {

        const len = el.value.length;

        el.setSelectionRange(len, len);

      } catch {}

    }

  }, []);



  const startStreaming = useCallback(

    async (text: string, attachments?: AttachmentMeta[], langParam: string = 'zh') => {

      setIsStreaming(true);

      setLastError(null);

      setLastSentForRetry({ text, attachments });



      const controller = new AbortController();

      streamControllerRef.current = controller;



      // Show typing indicator first

      setIsTyping(true);



      // Artificial delay before showing response (1.5-2.5 seconds)

      const delay = 1500 + Math.random() * 1000;

      await new Promise(resolve => setTimeout(resolve, delay));



      // Hide typing indicator

      setIsTyping(false);



      // Create first bot message

      const firstBotId = makeId('b');

      setMessages((prev) => [...prev, { id: firstBotId, from: 'bot', text: '', attachments: [], ts: Date.now() }]);



      let accumulated = '';

      let currentMessageId = firstBotId;

      const messageIds: string[] = [firstBotId];



      try {



        const onChunk = (chunk: string) => {

          accumulated += chunk;



          // Check if we hit a message break

          if (accumulated.includes('[MESSAGE_BREAK]')) {

            // Split by message break

            const parts = accumulated.split('[MESSAGE_BREAK]');

            const completedPart = parts[0].trim();

            const remaining = parts.slice(1).join('[MESSAGE_BREAK]');



            // Update current message with completed part (removing the break)

            setMessages((prev) => prev.map((m) => (m.id === currentMessageId ? { ...m, text: completedPart } : m)));



            // Create new message for remaining content

            const newBotId = makeId('b');

            messageIds.push(newBotId);

            currentMessageId = newBotId;

            setMessages((prev) => [...prev, { id: newBotId, from: 'bot', text: remaining, attachments: [], ts: Date.now() }]);



            accumulated = remaining;

          } else {

            // Normal streaming - append to current message

            setMessages((prev) => prev.map((m) => (m.id === currentMessageId ? { ...m, text: accumulated } : m)));

          }

        };



        const final = await streamChat(text, { onChunk, attachments, signal: controller.signal, lang: langParam });



        // Handle any remaining breaks in final text

        let finalText = final || accumulated || '';

        const parts = finalText.split('[MESSAGE_BREAK]').map(p => p.trim()).filter(Boolean);




        // Helper to extract step metadata from message

        const extractStepMetadata = (text: string): { step?: number; text: string } => {

          const match = text.match(/^\[STEP:(\d+)\/8\]/);

          if (match) {

            const step = parseInt(match[1]);

            const cleanedText = text.replace(/^\[STEP:\d+\/8\]/, '');

            return { step, text: cleanedText };

          }

          return { text };

        };



        if (parts.length > 1) {

          // Multiple messages - update existing ones and create new ones

          setMessages((prev) => {

            let newMessages = [...prev];




            // Update existing bot messages with split parts

            const botMessageIds = newMessages.filter(m => m.from === 'bot' && messageIds.includes(m.id)).map(m => m.id);




            parts.forEach((part, index) => {

              const { step, text: partWithoutStep } = extractStepMetadata(part);

              const { steps, cleaned: cleanedSteps } = extractNextSteps(partWithoutStep);

              const { options, cleaned } = extractOptions(cleanedSteps || partWithoutStep);

              const isLastPart = index === parts.length - 1;




              if (index < botMessageIds.length) {

                // Update existing message - attach options to all parts with them

                newMessages = newMessages.map((m) =>

                  m.id === botMessageIds[index]

                    ? { ...m, text: cleaned || partWithoutStep, step, nextSteps: isLastPart && Array.isArray(steps) ? steps : undefined, options: m.options && m.options.length > 0 ? m.options : ((options && options.length > 0) ? options : undefined) }

                    : m

                );

              } else if (!botMessageIds.includes(currentMessageId)) {

                // Need to add new message if not already added

                newMessages.push({

                  id: makeId('b'),

                  from: 'bot',

                  text: cleaned || partWithoutStep,

                  step,

                  ts: Date.now(),

                  nextSteps: isLastPart && Array.isArray(steps) ? steps : undefined,

                  options: (options && options.length > 0) ? options : undefined

                });

              }

            });




            return newMessages;

          });

        } else {

          // Single message - normal flow

          const { step, text: textWithoutStep } = extractStepMetadata(finalText);

          const { steps, cleaned: cleanedSteps } = extractNextSteps(textWithoutStep);

          const { options, cleaned } = extractOptions(cleanedSteps || textWithoutStep);

          setMessages((prev) =>

            prev.map((m) =>

              m.id === currentMessageId

                ? { 

                    ...m, 

                    text: cleaned || textWithoutStep, 

                    step, 

                    nextSteps: Array.isArray(steps) ? steps : undefined, 

                    // Only update options if they don't already exist to prevent duplicates

                    options: m.options && m.options.length > 0 ? m.options : (options || undefined)

                  }

                : m

            )

          );

        }




        sendAnalytics({ type: 'chat:reply', length: (final || '').length, ts: new Date().toISOString() });

      } catch (err: any) {

        const messageText = String(err?.message || err || 'Network error');

        setMessages((prev) => prev.map((m) => (m.id === currentMessageId ? { ...m, error: messageText } : m)));

        setLastError(messageText);

      } finally {

        setIsStreaming(false);

        streamControllerRef.current = null;

      }

    },

    [streamChat, sendAnalytics, makeId, extractNextSteps, extractOptions]

  );



  const submitMessage = async (e?: FormEvent) => {

    e?.preventDefault();

    const text = value.trim();

    const attachmentsMeta: AttachmentMeta[] = pendingFiles.map((f) => ({ name: f.name, size: f.size, type: f.type }));

    if (!text && attachmentsMeta.length === 0) return;



    const uid = makeId('u');

    setMessages((prev) => [...prev, { id: uid, from: 'user', text, attachments: attachmentsMeta, ts: Date.now() }]);

    setValue('');

    setPendingFiles([]);



    // analytics

    sendAnalytics({ type: 'chat:sent', length: text.length, attachments: attachmentsMeta.length, ts: new Date().toISOString() });



    // Intercept free-text for upload scenario case reference input

    if (currentScenario === 'upload' && currentStep === 0) {

      setCaseReferenceNumber(text);

      setCurrentStep(1);

      setIsTyping(true);

      setTimeout(() => {

        setIsTyping(false);

        const botId = makeId('b');

        setMessages((prev) => [...prev, {

          id: botId,

          from: 'bot',

          text: language === 'zh'

            ? `已找到案件編號 ${text}。以下為尚待補交的文件：\n\n• 銀行紀錄 / 糧單\n• 僱傭合約\n• 結業相片 / 通知`

            : `Found case reference ${text}. The following documents are pending:\n\n• Bank Records / Payslips\n• Employment Contract\n• Evidence of Shop Closure`,

          options: language === 'zh' ? [

            { label: '上傳銀行紀錄 / 糧單', value: '上傳銀行紀錄 / 糧單' },

            { label: '上傳僱傭合約', value: '上傳僱傭合約' },

            { label: '上傳結業相片 / 通知', value: '上傳結業相片 / 通知' },

            { label: '一次過上傳全部', value: '一次過上傳全部' },

            { label: '我已經上傳了部分文件', value: '我已經上傳了部分文件' },

            { label: '我缺少其中一項文件', value: '我缺少其中一項文件' }

          ] : [

            { label: 'Upload Bank Records / Payslips', value: 'Upload Bank Records / Payslips' },

            { label: 'Upload Employment Contract', value: 'Upload Employment Contract' },

            { label: 'Upload Evidence of Shop Closure', value: 'Upload Evidence of Shop Closure' },

            { label: 'Upload all pending documents', value: 'Upload all pending documents' },

            { label: 'Already uploaded some documents', value: 'Already uploaded some documents' },

            { label: 'Do not have one of the required documents', value: 'Do not have one of the required documents' }

          ],

          ts: Date.now()

        }]);

      }, 1500);

      return;

    }

    if (currentScenario === 'defendant_intake' && currentStep === 1) {

      setCaseReferenceNumber(text);

      setCurrentStep(2);

      setIsTyping(true);

      setTimeout(() => {

        setIsTyping(false);

        setMessages((prev) => [...prev, {

          id: makeId('b'),

          from: 'bot',

          text: language === 'zh'

            ? '為保障私隱，請輸入商業登記號碼（BR）首 4 位數字（如屬公司）或被告人身分證首 4 位（如屬個人），以核實身分。'

            : 'For security, please enter the first 4 digits of your Business Registration (BR) number (for companies) or HKID (for individuals) to verify your identity.',

          ts: Date.now()

        }]);

      }, 900);

      return;

    }

    if (currentScenario === 'defendant_intake' && currentStep === 2) {

      setCurrentStep(3);

      setIsTyping(true);

      setTimeout(() => {

        setIsTyping(false);

        setMessages((prev) => [...prev, {

          id: makeId('b'),

          from: 'bot',

          text: language === 'zh'

            ? '✅ 身分已核實。系統顯示你尚未與調查主任（Investigating Officer）會面。請先選擇一個合適的日期和時間，以便調查主任錄取你的抗辯口供及收集證據。'

            : '✅ Identity verified. System records show you haven\'t met the Investigating Officer yet. Please select a date and time for the officer to take your defence statement and collect evidence.',

          ts: Date.now()

        }]);

        setShowAppointmentBooking(true);

      }, 900);

      return;

    }



    const scenarioHandled = await handleScenarioFlow(text, true);
    if (scenarioHandled) return;

    // start streaming bot reply (preserve user's language selection)

    startStreaming(text, attachmentsMeta, language);

  };



  // Helper function to add bot message with options and typing delay

  const addBotMessageWithOptions = async (text: string, options?: Option[], delay: number = 1500) => {

    // Show typing indicator

    setIsTyping(true);

    

    // Wait for the specified delay

    await new Promise(resolve => setTimeout(resolve, delay));

    

    // Hide typing indicator and add message

    setIsTyping(false);

    

    // Prevent duplicate messages - check if the last message is the same

    setMessages((prev) => {

      const lastMessage = prev[prev.length - 1];

      if (lastMessage && lastMessage.from === 'bot' && lastMessage.text === text && 

          JSON.stringify(lastMessage.options) === JSON.stringify(options)) {

        return prev; // Don't add duplicate

      }

      const botId = makeId('b');

      return [...prev, { id: botId, from: 'bot', text, options, ts: Date.now() }];

    });

  };





  // Helper function to add bot message with typing indicator and delay

  const addBotMessageWithTyping = async (text: string, options?: Option[], customAction?: string, delay: number = 2000) => {

    // Show typing indicator

    setIsTyping(true);

    

    // Wait for the specified delay

    await new Promise(resolve => setTimeout(resolve, delay));

    

    // Hide typing indicator and add message

    setIsTyping(false);

    const botId = makeId('b');

    setMessages((prev) => [...prev, { 

      id: botId, 

      from: 'bot', 

      text, 

      options, 

      ts: Date.now(),

      customAction: customAction as any

    }]);

  };



  // ============ Scenario Handler Functions ============

  const handleInsolvencyScreening = (stepText: string): boolean => {
    if (currentScenario === 'unpaid_wages') {
      if (stepText.includes('僱主已清盤') || stepText.includes('僱主結業') ||
          stepText.includes('Insolvent') || stepText.toLowerCase().includes('closed down') ||
          stepText.toLowerCase().includes('bankrupt') || stepText.toLowerCase().includes('wound up')) {
        const botId = makeId('b');
        setMessages((prev) => [...prev, {
          id: botId,
          from: 'bot',
          text: language === 'zh'
            ? '由於你的僱主已經清盤或結業，勞資審裁處無法處理此申索。請盡快向勞工處申請「破產欠薪保障基金」（破欠基金）。'
            : 'As your employer is insolvent or has closed down, the Labour Tribunal cannot process this claim. Please apply to the Protection of Wages on Insolvency Fund (PWIF) via the Labour Department immediately.',
          options: [{ label: language === 'zh' ? '返回主選單' : 'Return to main menu', value: 'Return to main menu' }],
          ts: Date.now()
        }]);
        setCurrentStep(0);
        setCurrentScenario(null);
        return true;
      }
    }
    return false;
  };

  const handleMediationCheck = (stepText: string): boolean => {
    if (currentScenario === 'unpaid_wages' && (stepText.includes('預約') || stepText.includes('appointment') || stepText.toLowerCase().includes('book'))) {
      const mediationAnswered = messages.some(m =>
        m.from === 'user' &&
        (m.text.includes('是，已有調解證明書') || m.text.includes('否，我希望直接入稟法庭') ||
         m.text.includes('Yes, I have conciliation certificate') || m.text.includes('No, I want to proceed directly to court'))
      );

      if (!mediationAnswered) {
        // Add the user message first
        const uid = makeId('u');
        const botId = makeId('b');
        setMessages((prev) => [
          ...prev,
          { id: uid, from: 'user', text: stepText, ts: Date.now() },
          {
            id: botId,
            from: 'bot',
            text: language === 'zh'
              ? '在預約到審裁處提交申索之前，請問你是否已經嘗試在勞工處進行調解？'
              : 'Before booking an appointment to submit your claim, have you attempted conciliation at the Labour Department?',
            options: language === 'zh' ? [
              { label: '是，已有調解證明書', value: '是，已有調解證明書' },
              { label: '否，我希望直接入稟法庭', value: '否，我希望直接入稟法庭' }
            ] : [
              { label: 'Yes, I have conciliation certificate', value: 'Yes, I have conciliation certificate' },
              { label: 'No, I want to proceed directly to court', value: 'No, I want to proceed directly to court' }
            ],
            ts: Date.now()
          }
        ]);
        return true;
      }

      setShowAppointmentBooking(true);
      return true;
    }
    return false;
  };

  const handleMediationAnswer = (stepText: string): boolean => {
    if (
      stepText.includes('是，已有調解證明書') || 
      stepText.includes('否，我希望直接入稟法庭') ||
      stepText.includes('Yes, I have conciliation certificate') ||
      stepText.includes('No, I want to proceed directly to court')
    ) {
      const uid = makeId('u');
      setMessages((prev) => [
        ...prev,
        { id: uid, from: 'user', text: stepText, ts: Date.now() }
      ]);
      
      setTimeout(() => {
        setShowAppointmentBooking(true);
      }, 800);
      
      return true;
    }
    return false;
  };

  const handleAppointmentBooking = (stepText: string): boolean => {
    if (stepText.includes('預約') || stepText.includes('appointment') || stepText.toLowerCase().includes('book')) {
      setShowAppointmentBooking(true);
      return true;
    }
    return false;
  };

  const handleLabourDepartmentReferral = (stepText: string): boolean => {
    if (stepText.includes('LD 1234/2026 (模擬輸入有編號)') ||
        stepText.includes('A123 (模擬輸入沒有編號)') ||
        stepText.includes('LD 1234/2026 (Simulated input)') ||
        stepText.includes('A123 (Simulated no referral)')) {
      const uid = makeId('u');
      setMessages(prev => [...prev, { id: uid, from: 'user', text: stepText, ts: Date.now() }]);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        startStreaming(stepText, [], language);
      }, 1000);
      return true;
    }
    return false;
  };

  const handleReturnToMainMenu = (stepText: string): boolean => {
    if (stepText.includes('返回主目錄') || stepText.includes('Return to main menu') || stepText.includes('返回主選單')) {
      window.location.href = '/';
      return true;
    }
    return false;
  };

  const handleReUpload = (stepText: string): boolean => {
    if (stepText.includes('重新上傳') || stepText.includes('Re-upload')) {
      setShowDocumentUpload(true);
      return true;
    }
    return false;
  };

  const handleProceedWithoutClearerVersion = (stepText: string): boolean => {
    if (stepText.includes('暫時沒有更清晰的版本') || stepText.includes('繼續下一步') || stepText.includes('Proceed without')) {
      setMessages((prev) => [...prev, {
        id: makeId('b'),
        from: 'bot',
        text: language === 'zh'
          ? '我們已收集足夠的初步資料。請選擇下一步行動：'
          : 'We have collected sufficient preliminary information. Please select your next step:',
        options: [
          { label: language === 'zh' ? '🗓️ 預約到審裁處提交申索' : '🗓️ Book Appointment at Tribunal', value: language === 'zh' ? '預約到審裁處提交申索' : 'Book Appointment at Tribunal' }
        ],
        ts: Date.now()
      }]);
      return true;
    }
    return false;
  };

  const handleDocumentUploadTrigger = (stepText: string): boolean => {
    const lowerStepText = stepText.toLowerCase();
    if (stepText.includes('上傳證明文件') || stepText.includes('upload document') || stepText.includes('upload file') ||
        stepText.includes('上傳僱傭合約') || stepText.includes('上傳工資單') || stepText.includes('上傳銀行記錄') ||
        stepText.includes('上傳結業相片 / 通知') || stepText.includes('Upload Evidence of Shop Closure') ||
        stepText.includes('一次過上傳全部') || stepText.includes('Upload all pending documents') ||
        stepText.includes('上傳更多文件') || stepText.includes('我想上傳文件進行系統分析') ||
        lowerStepText.includes('upload employment contract') || lowerStepText.includes('upload payslips') ||
        lowerStepText.includes('upload bank records') || lowerStepText.includes('upload evidence of shop closure') ||
        lowerStepText.includes('upload all pending documents') || lowerStepText.includes('upload more documents')) {
      setShowDocumentUpload(true);
      return true;
    }
    return false;
  };

  const handleUploadCompletion = (stepText: string): boolean => {
    if (stepText.includes('[已上傳')) {
      const uid = makeId('u');
      setMessages((prev) => [...prev, { id: uid, from: 'user', text: stepText, ts: Date.now() }]);

      if (currentScenario === 'upload') {
        setTimeout(() => {
          const botId = makeId('b');
          setMessages((prev) => [...prev, {
            id: botId,
            from: 'bot',
            text: language === 'zh'
              ? '✅ 系統已成功接收並歸檔你的新文件：糧單及解僱信.pdf。已自動附加至案件編號 LBTC 1234/2026 卷宗內。調查主任將會在處理你的案件時參考此文件。'
              : '✅ System has successfully received and archived your new file: 糧單及解僱信.pdf. It has been automatically attached to case reference LBTC 1234/2026. The investigating officer will refer to this file when processing your case.',
            options: language === 'zh' ? [
              { label: '返回主選單', value: '返回主選單' },
              { label: '上傳更多文件', value: '上傳更多文件' }
            ] : [
              { label: 'Return to main menu', value: 'Return to main menu' },
              { label: 'Upload more documents', value: 'Upload more documents' }
            ],
            ts: Date.now()
          }]);
          setCurrentStep(0);
          setCurrentScenario(null);
        }, 2000);
      }
      return true;
    }
    return false;
  };

  const handleAlreadyUploadedOrDontHave = (stepText: string): boolean => {
    if (stepText.includes('已上傳') || stepText.includes('沒有') ||
        stepText.toLowerCase().includes('already uploaded') || stepText.toLowerCase().includes("don't have") ||
        stepText.toLowerCase().includes('do not have one of the required documents')) {
      const uid = makeId('u');
      setMessages((prev) => [...prev, { id: uid, from: 'user', text: stepText, ts: Date.now() }]);
      startStreaming(stepText, [], language);
      return true;
    }
    return false;
  };

  // ============ Main Handler Router ============

  const handleUseStep = async (stepText: string) => {
    // Try each handler in order
    if (handleInsolvencyScreening(stepText)) return;
    if (handleMediationCheck(stepText)) return;
    if (handleMediationAnswer(stepText)) return;
    if (handleAppointmentBooking(stepText)) return;
    if (handleLabourDepartmentReferral(stepText)) return;
    if (handleReturnToMainMenu(stepText)) return;
    if (handleReUpload(stepText)) return;
    if (handleProceedWithoutClearerVersion(stepText)) return;
    if (handleDocumentUploadTrigger(stepText)) return;
    if (handleUploadCompletion(stepText)) return;
    if (handleAlreadyUploadedOrDontHave(stepText)) return;

    // Handle scenario-specific conversation flows
    const scenarioHandled = await handleScenarioFlow(stepText, false);
    if (scenarioHandled) return;

    // Default: send as regular message
    const text = (stepText || '').trim();
    if (!text) return;

    const uid = makeId('u');
    setMessages((prev) => [...prev, { id: uid, from: 'user', text, attachments: [], ts: Date.now() }]);
    setValue('');
    sendAnalytics({ type: 'chat:sent', length: text.length, attachments: 0, ts: new Date().toISOString() });
    startStreaming(text, [], language);
  };

  // ============ Scenario Flow Handler ============

  const handleScenarioFlow = async (stepText: string, userMessageAlreadyAdded: boolean = false): Promise<boolean> => {

    // 為選項選擇添加用戶訊息（step 0 除外，由 submitMessage 處理自由文本輸入）

    if (!userMessageAlreadyAdded) {

      const uid = makeId('u');

      setMessages((prev) => [...prev, { id: uid, from: 'user', text: stepText, ts: Date.now() }]);

    }

    if (currentScenario === 'unpaid_wages') {
      if (stepText.includes('侍應') || stepText.includes('15,000') || stepText.toLowerCase().includes('waiter')) {
        setCurrentStep(1);
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [...prev, {
            id: makeId('b'),
            from: 'bot',
            text: language === 'zh'
              ? '明白，職位是侍應，月薪 $15,000。\n\n請問僱主拖欠了你哪段時間的薪金？（例如：2026年3月1日至3月31日）'
              : 'Understood. Which period of wages is owed to you? (e.g., 1 March 2026 to 31 March 2026)',
            options: language === 'zh' 
              ? [{ label: '2026年3月1日至3月31日', value: '2026年3月1日至3月31日' }] 
              : [{ label: '1 March 2026 to 31 March 2026', value: '1 March 2026 to 31 March 2026' }],
            ts: Date.now()
          }]);
        }, 1500);
        return true;
      }

      if (stepText.includes('3月1日至3月31日') || stepText.includes('March 2026')) {
        setCurrentStep(2);
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [...prev, {
            id: makeId('b'),
            from: 'bot',
            text: language === 'zh'
              ? '謝謝提供資料。根據描述，申索項目為「1個月的拖欠薪金」，金額為 $15,000。\n\n為了核實案件，請上傳相關的證明文件。我們需要：\n1. 銀行紀錄 / 糧單\n2. 僱傭合約\n3. 強積金紀錄 (選填)'
              : 'Thank you. The claim is for "1 month of unpaid wages", amount $15,000.\n\nTo verify your case, please upload the relevant documents.',
            options: language === 'zh' 
              ? [
                  { label: '📂 開啟上傳面板', value: '開啟上傳面板' },
                  { label: '✅ 模擬上傳完成', value: '模擬上傳完成' }
                ] 
              : [
                  { label: '📂 Open Upload Panel', value: 'Open Upload Panel' },
                  { label: '✅ Simulate Upload Complete', value: 'Simulate Upload Complete' }
                ],
            ts: Date.now()
          }]);
        }, 1500);
        return true;
      }

      if (stepText.includes('開啟上傳面板') || stepText.includes('Open Upload Panel')) {
        setCurrentStep(3);
        setShowDocumentUpload(true);
        return true;
      }

      // Post-Upload Readiness Check
      if (stepText.includes('模擬上傳完成') || stepText.includes('Simulate Upload Complete')) {
        setCurrentStep(4);
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [...prev, {
            id: makeId('b'),
            from: 'bot',
            text: language === 'zh'
              ? '✅ 文件已成功上傳並分析完成。\n\n**文件準備度檢查 (Readiness Check):**\n- 僱傭合約：**已核實** (提取資料: 月薪 $15,000)\n- 銀行紀錄 / 糧單：**已核實** (顯示最後發薪日為2026年2月)\n- 強積金紀錄：**待處理** (建議補交，但不阻礙初步建檔)\n\n系統已為你生成結構化案件摘要，並草擬了《表格1》。你現在可以預約會見調查主任。'
              : '✅ Documents successfully uploaded and analyzed.\n\n**Readiness Check:**\n- Employment Contract: **Verified**\n- Bank Records / Payslip: **Verified**\n- MPF Records: **Pending**\n\nThe system has generated a structured case summary. You can now book an appointment.',
            options: language === 'zh' 
              ? [{ label: '確認及預約會面', value: '預約會面' }] 
              : [{ label: 'Book Appointment', value: 'Book Appointment' }],
            ts: Date.now()
          }]);
        }, 1500);
        return true;
      }
    }

    if (currentScenario === 'defendant_intake') {
      if (currentStep === 0) {
        if (
          stepText.includes('收到申索書') ||
          stepText.includes('收到申索文件') ||
          stepText.includes('已有案件編號') ||
          stepText.includes('有案件編號') ||
          stepText.toLowerCase().includes('received the claim form') ||
          stepText.toLowerCase().includes('received the claim documents') ||
          stepText.toLowerCase().includes('have the case number') ||
          stepText.toLowerCase().includes('have a case number')
        ) {
          setCurrentStep(1);
          await addBotMessageWithOptions(
            language === 'zh'
              ? '請輸入申索書上的案件編號（例如：LBTC 1234/2026）。'
              : 'Please enter the case reference number shown on the claim form.',
            undefined,
            800,
          );
          return true;
        }

        if (
          stepText.includes('準備抗辯') ||
          stepText.includes('抗辯文件') ||
          stepText.includes('程序資料') ||
          stepText.includes('想先了解要準備什麼') ||
          stepText.toLowerCase().includes('defence documents') ||
          stepText.toLowerCase().includes('what do i need to prepare') ||
          stepText.toLowerCase().includes('prepare my response') ||
          stepText.toLowerCase().includes('procedural information')
        ) {
          setCurrentStep(1);
          await addBotMessageWithOptions(
            language === 'zh'
              ? '作為被告人，你通常需要準備：\n1. 僱傭合約及相關修訂\n2. 糧單、強積金供款及出勤紀錄\n3. 解僱信或辭職信\n\n準備好後，請輸入你的案件編號以開始。'
              : 'As a defendant, you typically need:\n1. Employment contracts\n2. Payslips, MPF records\n3. Dismissal letters\n\nWhen ready, enter your case reference number.',
            undefined,
            800,
          );
          return true;
        }

        if (
          stepText.includes('未收到') ||
          stepText.includes('沒有收到') ||
          stepText.includes('尚未收到') ||
          stepText.toLowerCase().includes('have not received') ||
          stepText.toLowerCase().includes("haven't received any documents")
        ) {
          setCurrentStep(99);
          await addBotMessageWithOptions(
            language === 'zh'
              ? '如果你尚未收到法庭的正式申索文件，請留意掛號郵件或聯絡登記處。獲取案件編號後，你可以隨時回到這裡。'
              : 'If you haven\'t received official claim documents, please watch for registered mail or contact the Registry. Return here anytime.',
            [{
              label: language === 'zh' ? '返回主選單' : 'Return to main menu',
              value: language === 'zh' ? '返回主選單' : 'Return to main menu',
            }],
            800,
          );
          return true;
        }
      }

      if (currentStep === 4) {
        if (
          stepText.includes('現在上傳') ||
          stepText.includes('即時上傳') ||
          stepText.toLowerCase().includes('upload now')
        ) {
          setCurrentStep(5);
          await addBotMessageWithOptions(
            language === 'zh'
              ? '請在右側上傳你的抗辯書、相關證明文件或證人陳述。完成後，我會為你整理目前的證據摘要。'
              : 'Please upload your defence, supporting documents or witness statements in the panel on the right. Once completed, I will prepare the evidence summary for you.',
            undefined,
            500,
          );
          setShowDocumentUpload(true);
          return true;
        }

        if (
          stepText.includes('稍後上傳') ||
          stepText.includes('稍後補交') ||
          stepText.toLowerCase().includes('upload later')
        ) {
          setCurrentStep(5);
          await addBotMessageWithTyping(
            language === 'zh'
              ? '✅ 明白。我們已為你整理了目前的證據清單。請檢視申索人提交的證據以及你方提供的文件。'
              : '✅ Understood. We have prepared an evidence summary. Please review the claimant\'s evidence versus your documents.',
            [{
              label: language === 'zh' ? '檢視雙方證據' : 'Review Evidence Summary',
              value: language === 'zh' ? '檢視雙方證據' : 'Review Evidence Summary',
            }],
            'show_evidence_popout',
            500,
          );
          return true;
        }
      }

      if (currentStep === 5) {
        if (
          stepText.includes('檢視雙方證據') ||
          stepText.toLowerCase().includes('review evidence summary')
        ) {
          setShowEvidencePopout(true);
          return true;
        }
      }

      return true;
    }

    // Scenario: Unpaid Wages Initial Intake
    if (stepText.includes('侍應') || stepText.includes('15,000') || stepText.toLowerCase().includes('waiter')) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, {
          id: makeId('b'),
          from: 'bot',
          text: language === 'zh'
            ? '明白，職位是侍應，月薪 $15,000。\n\n請問僱主拖欠了你哪段時間的薪金？（例如：2026年3月1日至3月31日）'
            : 'Understood, position is waiter, monthly salary $15,000.\n\nWhich period of wages is owed to you? (e.g., 1 March 2026 to 31 March 2026)',
          options: language === 'zh' 
            ? [{ label: '2026年3月1日至3月31日', value: '2026年3月1日至3月31日' }] 
            : [{ label: '1 March 2026 to 31 March 2026', value: '1 March 2026 to 31 March 2026' }],
          ts: Date.now()
        }]);
      }, 1500);
      return true;
    }

    if (stepText.includes('3月1日至3月31日') || stepText.includes('March 2026')) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, {
          id: makeId('b'),
          from: 'bot',
          text: language === 'zh'
            ? '謝謝提供資料。根據你的描述，申索項目為「1個月的拖欠薪金」，金額為 $15,000。\n\n為了核實案件，請上傳相關的證明文件。我們需要：\n1. 銀行紀錄 / 糧單\n2. 僱傭合約\n3. 結業相片 / 通知（如適用）\n\n你可以現在上傳，系統會自動提取關鍵資料。'
            : 'Thank you. The claim is for "1 month of unpaid wages", amount $15,000.\n\nTo verify your case, please upload the relevant supporting documents:\n1. Bank Records / Payslips\n2. Employment Contract\n3. Evidence of Shop Closure (if applicable)',
          options: language === 'zh' 
            ? [{ label: '開始上傳文件', value: '開始上傳文件' }] 
            : [{ label: 'Start uploading documents', value: 'Start uploading documents' }],
          ts: Date.now()
        }]);
      }, 1500);
      return true;
    }

    if (stepText.includes('開始上傳文件') || stepText.toLowerCase().includes('start uploading')) {
      setShowDocumentUpload(true);
      return true;
    }

    

    // Scenario A: Supplementary Evidence Upload

    if (currentScenario === 'upload') {

      if (currentStep === 0) {

        // Step 0: Ask for Case Number (handled by free-text input in submitMessage)

        return true;

      } else if (currentStep === 1) {

        // Step 1: User inputs Case Number -> Ask for HKID first 4 digits

        setCurrentStep(2);

        setIsTyping(true);

        setTimeout(() => {

          setIsTyping(false);

          const botId = makeId('b');

          setMessages((prev) => [...prev, {

            id: botId,

            from: 'bot',

            text: language === 'zh'

              ? '為核實身份，請輸入你的香港身份證號碼首 4 位數字（例如：A123）。'

              : 'To verify your identity, please enter the first 4 digits of your Hong Kong Identity Card number (e.g., A123).',

            options: language === 'zh'

              ? [{ label: 'A123 (模擬)', value: 'A123 (模擬)' }]

              : [{ label: 'A123 (Simulated)', value: 'A123 (Simulated)' }],

            ts: Date.now()

          }]);

        }, 1500);

      } else if (currentStep === 2) {

        // Step 2: User inputs HKID -> Verify success, show pending documents list, ask what they are submitting

        setCurrentStep(3);

        setIsTyping(true);

        setTimeout(() => {

          setIsTyping(false);

          const botId = makeId('b');

          setMessages((prev) => [...prev, {

            id: botId,

            from: 'bot',

            text: language === 'zh'

              ? '✅ 身分已核實。以下為尚待補交的文件：\n\n• 銀行紀錄 / 糧單\n• 僱傭合約\n• 結業相片 / 通知\n\n請問你現在要提交哪項文件？'

              : '✅ Identity verified. The following documents are pending:\n\n• Bank Records / Payslips\n• Employment Contract\n• Evidence of Shop Closure\n\nWhich document would you like to submit now?',

            options: language === 'zh'

              ? [

                  { label: '銀行紀錄 / 糧單', value: '銀行紀錄 / 糧單' },

                  { label: '僱傭合約', value: '僱傭合約' },

                  { label: '結業相片 / 通知', value: '結業相片 / 通知' },

                  { label: '一次過上傳全部', value: '一次過上傳全部' }

                ]

              : [

                  { label: 'Bank Records / Payslips', value: 'Bank Records / Payslips' },

                  { label: 'Employment Contract', value: 'Employment Contract' },

                  { label: 'Evidence of Shop Closure', value: 'Evidence of Shop Closure' },

                  { label: 'Upload all at once', value: 'Upload all at once' }

                ],

            ts: Date.now()

          }]);

        }, 1500);

      } else if (currentStep === 3) {

        // Step 3: User selects doc type -> Show upload dropzone

        if (stepText.includes('銀行紀錄 / 糧單') || stepText.includes('Bank Records / Payslips') || stepText.toLowerCase().includes('bank records') || stepText.toLowerCase().includes('payslips')) {

          setIsTyping(true);

          setTimeout(() => {

            setIsTyping(false);

            const botId = makeId('b');

            setMessages((prev) => [...prev, {

              id: botId,

              from: 'bot',

              text: language === 'zh'

                ? '了解，請在下方上傳你的銀行紀錄 / 糧單。請確保圖片清晰，並包含完整頁面。'

                : 'Understood. Please upload your Bank Records / Payslips below. Ensure images are clear and complete.',

              ts: Date.now()

            }]);

            setShowDocumentUpload(true);

          }, 1500);

        } else if (stepText.includes('僱傭合約') || stepText.includes('Employment Contract') || stepText.toLowerCase().includes('employment contract')) {

          setIsTyping(true);

          setTimeout(() => {

            setIsTyping(false);

            const botId = makeId('b');

            setMessages((prev) => [...prev, {

              id: botId,

              from: 'bot',

              text: language === 'zh'

                ? '了解，請在下方上傳你的僱傭合約。請確保圖片清晰，並包含完整頁面。'

                : 'Understood. Please upload your Employment Contract below. Ensure images are clear and complete.',

              ts: Date.now()

            }]);

            setShowDocumentUpload(true);

          }, 1500);

        } else if (stepText.includes('結業相片 / 通知') || stepText.includes('Evidence of Shop Closure') || stepText.toLowerCase().includes('evidence') || stepText.toLowerCase().includes('closure')) {

          setIsTyping(true);

          setTimeout(() => {

            setIsTyping(false);

            const botId = makeId('b');

            setMessages((prev) => [...prev, {

              id: botId,

              from: 'bot',

              text: language === 'zh'

                ? '了解，請在下方上傳你的結業相片 / 通知。請確保圖片清晰，並包含完整頁面。'

                : 'Understood. Please upload your Evidence of Shop Closure below. Ensure images are clear and complete.',

              ts: Date.now()

            }]);

            setShowDocumentUpload(true);

          }, 1500);

        } else if (stepText.includes('一次過') || stepText.toLowerCase().includes('all at once')) {

          setIsTyping(true);

          setTimeout(() => {

            setIsTyping(false);

            const botId = makeId('b');

            setMessages((prev) => [...prev, {

              id: botId,

              from: 'bot',

              text: language === 'zh'

                ? '了解，請在下方一次過上傳所有待補交的文件。請確保圖片清晰，並包含完整頁面。'

                : 'Understood. Please upload all pending documents below. Ensure images are clear and complete.',

              ts: Date.now()

            }]);

            setShowDocumentUpload(true);

          }, 1500);

        }

        // After upload, scenario ends in Phase 3 (Continue next step handler)

      }

      return true;

    }

    

    // Scenario B: Case Status Check

    if (currentScenario === 'status') {

      if (currentStep === 0) {

        // Step 0: Ask for Case Number

        setCurrentStep(1);

        setIsTyping(true);

        setTimeout(() => {

          setIsTyping(false);

          const botId = makeId('b');

          setMessages((prev) => [...prev, {

            id: botId,

            from: 'bot',

            text: language === 'zh'

              ? '為了核實身份並確保資料安全，請輸入你的案件編號（例如 LBTC 1234/2026）。'

              : 'To verify your identity and ensure data security, please enter your case reference number (e.g., LBTC 1234/2026).',

            options: language === 'zh'

              ? [{ label: 'LBTC 1234/2026 (模擬)', value: 'LBTC 1234/2026 (模擬)' }]

              : [{ label: 'LBTC 1234/2026 (Simulated)', value: 'LBTC 1234/2026 (Simulated)' }],

            ts: Date.now()

          }]);

        }, 1500);

      } else if (currentStep === 1) {

        // Step 1: User inputs Case Number -> Ask for HKID first 4 digits

        setCurrentStep(2);

        setIsTyping(true);

        setTimeout(() => {

          setIsTyping(false);

          const botId = makeId('b');

          setMessages((prev) => [...prev, {

            id: botId,

            from: 'bot',

            text: language === 'zh'

              ? '請提供你的香港身份證號碼首 4 位（例如：A123），以完成身份核實。'

              : 'Please provide the first 4 digits of your Hong Kong ID number (e.g., A123) to complete identity verification.',

            options: language === 'zh'

              ? [{ label: 'A123 (模擬)', value: 'A123 (模擬)' }]

              : [{ label: 'A123 (Simulated)', value: 'A123 (Simulated)' }],

            ts: Date.now()

          }]);

        }, 1500);

      } else if (currentStep === 2) {

        // Step 2: User inputs HKID -> Verify success, show hearing date with options

        setCurrentStep(3);

        setIsTyping(true);

        setTimeout(() => {

          setIsTyping(false);

          const botId = makeId('b');

          setMessages((prev) => [...prev, {

            id: botId,

            from: 'bot',

            text: language === 'zh'

              ? '✅ 身分已核實。此案件狀態為：等待首次過堂 (Waiting for First Call Over)。聆訊日期為 2026年5月10日 上午9:30。'

              : '✅ Identity verified. This case status is: Waiting for First Call Over. Hearing date is May 10, 2026 at 9:30 AM.',

            options: language === 'zh'

              ? [

                  { label: '📋 我當日應該準備什麼？', value: '我當日應該準備什麼？' },

                  { label: '❌ 我當日無法出席', value: '我當日無法出席' }

                ]

              : [

                  { label: '📋 What should I prepare?', value: 'What should I prepare?' },

                  { label: '❌ I cannot attend', value: 'I cannot attend' }

                ],

            ts: Date.now()

          }]);

        }, 1500);

      } else if (currentStep === 3) {

        // Step 3A: If "prepare"

        if (stepText.includes('準備') || stepText.includes('prepare')) {

          setCurrentStep(0);

          setCurrentScenario(null);

          setIsTyping(true);

          setTimeout(() => {

            setIsTyping(false);

            const botId = makeId('b');

            setMessages((prev) => [...prev, {

              id: botId,

              from: 'bot',

              text: language === 'zh'

                ? '請提早 15 分鐘到達法庭，並帶同你的香港身份證正本，以及所有證據文件的正本與一式三份的影印本。'

                : 'Please arrive 15 mins early with your original HKID, original evidence, and 3 sets of copies.',

              options: language === 'zh'

                ? [{ label: '返回主選單', value: '返回主選單' }]

                : [{ label: 'Return to main menu', value: 'Return to main menu' }],

              ts: Date.now()

            }]);

          }, 1500);

        } else if (stepText.includes('無法出席') || stepText.includes('cannot attend')) {

          // Step 3B: If "cannot attend"

          setCurrentStep(4);

          setIsTyping(true);

          setTimeout(() => {

            setIsTyping(false);

            const botId = makeId('b');

            setMessages((prev) => [...prev, {

              id: botId,

              from: 'bot',

              text: language === 'zh'

                ? '無故缺席可能導致法庭撤銷你的申索。如因急病缺席，申索被撤銷後，你必須在 7 天內提交「表格18」申請恢復申索。'

                : 'Unexcused absence may result in claim dismissal. If dismissed, you must submit Form 18 within 7 days.',

              options: [

                { label: language === 'zh' ? '下載表格18' : 'Download Form 18', value: 'Download Form 18' },

                { label: language === 'zh' ? '返回主選單' : 'Return to main menu', value: 'Return to main menu' },

              ],

              ts: Date.now()

            }]);

          }, 1500);

        }

      } else if (currentStep === 4) {

        // Step 4: If "Download Form 18"

        if (stepText.includes('下載表格18') || stepText.includes('Download Form 18')) {

          setCurrentStep(0);

          setCurrentScenario(null);

          setIsTyping(true);

          setTimeout(() => {

            setIsTyping(false);

            const botId = makeId('b');

            setMessages((prev) => [...prev, {

              id: botId,

              from: 'bot',

              text: language === 'zh'

                ? '文件已為你準備好。請點擊下方連結下載表格18。請盡快填妥並將其交回審裁處登記處。'

                : 'The document has been prepared for you. Click the link below to download Form 18. Please complete it and return it to the Tribunal Registry as soon as possible.',

              options: language === 'zh'

                ? [{ label: '返回主選單', value: '返回主選單' }]

                : [{ label: 'Return to main menu', value: 'Return to main menu' }],

              customAction: 'downloadform18' as any,

              ts: Date.now()

            }]);

          }, 1500);

        }

      }

      return true;

    }

    

    // Scenario C: Change Appointment

    if (currentScenario === 'reschedule') {

      if (currentStep === 0) {

        setCurrentStep(1);

        // Ask for Appointment Number

        setIsTyping(true);

        setTimeout(() => {

          setIsTyping(false);

          const botId = makeId('b');

          setMessages((prev) => [...prev, {

            id: botId,

            from: 'bot',

            text: language === 'zh'

              ? '為了核實身份並確保資料安全，請輸入你的預約編號（例如 LT-2026-0414-001）。'

              : 'To verify your identity and ensure data security, please enter your appointment reference number (e.g., LT-2026-0414-001).',

            options: language === 'zh'

              ? [{ label: 'LT-2026-0414-001 (模擬)', value: 'LT-2026-0414-001 (模擬)' }]

              : [{ label: 'LT-2026-0414-001 (Simulated)', value: 'LT-2026-0414-001 (Simulated)' }],

            ts: Date.now()

          }]);

        }, 1500);

      } else if (currentStep === 1) {

        setCurrentStep(2);

        // Ask for HKID first 4 digits

        setIsTyping(true);

        setTimeout(() => {

          setIsTyping(false);

          const botId = makeId('b');

          setMessages((prev) => [...prev, {

            id: botId,

            from: 'bot',

            text: language === 'zh'

              ? '請提供你的香港身份證號碼首 4 位（例如：A123），以完成身份核實。'

              : 'Please provide the first 4 digits of your Hong Kong ID number (e.g., A123) to complete identity verification.',

            options: language === 'zh'

              ? [{ label: 'A123 (模擬)', value: 'A123 (模擬)' }]

              : [{ label: 'A123 (Simulated)', value: 'A123 (Simulated)' }],

            ts: Date.now()

          }]);

        }, 1500);

      } else if (currentStep === 2) {

        // Show Date and ask for the reason to reschedule

        setIsTyping(true);

        setTimeout(() => {

          setIsTyping(false);

          const botId = makeId('b');

          setMessages((prev) => [...prev, {

            id: botId,

            from: 'bot',

            text: language === 'zh'

              ? '✅ 身分已核實。你的預約日期為：2026年4月20日。\n\n⚠️ 注意：距離預約少於 3 個工作天。請選擇更改預約的原因：'

              : '✅ Identity verified. Your appointment date is: April 20, 2026.\n\n⚠️ Note: Less than 3 working days before appointment. Please select the reason for rescheduling:',

            options: language === 'zh'

              ? [

                  { label: '🏥 突發疾病/留院', value: '突發疾病/留院' },

                  { label: '✈️ 不在香港/出差', value: '不在香港/出差' },

                  { label: '📅 私人理由/忘記了', value: '私人理由/忘記了' }

                ]

              : [

                  { label: '🏥 Sudden Illness/Hospitalized', value: 'Sudden Illness/Hospitalized' },

                  { label: '✈️ Outside HK/Business Trip', value: 'Outside HK/Business Trip' },

                  { label: '📅 Personal Reasons/Forgot', value: 'Personal Reasons/Forgot' }

                ],

            ts: Date.now()

          }]);

        }, 1500);

      } else if (currentStep === 3) {

        // Branch based on user's choice

        if (stepText.includes('疾病') || stepText.includes('illness') || stepText.includes('hospitalized')) {

          // Step 3A: Illness - Special Adjournment

          setCurrentStep(4);

          setIsTyping(true);

          setTimeout(() => {

            setIsTyping(false);

            const botId = makeId('b');

            setMessages((prev) => [...prev, {

              id: botId,

              from: 'bot',

              text: language === 'zh'

                ? '系統可為你處理「特准押後」。請準備上傳你的病假紙或到診證明。'

                : 'The system can process a "special adjournment" for you. Please prepare to upload your sick leave certificate or attendance certificate.',

              options: language === 'zh'

                ? [{ label: '📸 上傳醫療證明 (模擬)', value: '上傳醫療證明 (模擬)' }]

                : [{ label: '📸 Upload medical proof', value: 'Upload medical proof' }],

              ts: Date.now()

            }]);

          }, 1500);

        } else if (stepText.includes('不在香港') || stepText.includes('outside') || stepText.includes('business')) {

          // Step 3B: Outside HK - Not allowed online

          setCurrentStep(0);

          setCurrentScenario(null);

          setIsTyping(true);

          setTimeout(() => {

            setIsTyping(false);

            const botId = makeId('b');

            setMessages((prev) => [...prev, {

              id: botId,

              from: 'bot',

              text: language === 'zh'

                ? '以離港為由申請改期，不接受網上辦理。你必須親身或郵寄機票/出入境證明至審裁處登記處。'

                : 'Rescheduling due to leaving HK cannot be done online. You must submit flight tickets/proof to the Registry in person or by post.',

              options: language === 'zh'

                ? [{ label: '🏠 返回主目錄', value: '返回主目錄' }]

                : [{ label: '🏠 Return to Main Menu', value: 'Return to main menu' }],

              ts: Date.now()

            }]);

          }, 1500);

        } else if (stepText.includes('私人') || stepText.includes('personal') || stepText.includes('forgot')) {

          // Step 3C: Personal Reasons - Not accepted

          setCurrentStep(0);

          setCurrentScenario(null);

          setIsTyping(true);

          setTimeout(() => {

            setIsTyping(false);

            const botId = makeId('b');

            setMessages((prev) => [...prev, {

              id: botId,

              from: 'bot',

              text: language === 'zh'

                ? '⚠️ 距離預約少於 3 個工作天，一般私人理由的改期申請將不獲批准。請務必如期出席，或授權代表出席。'

                : '⚠️ With less than 3 working days, rescheduling for general personal reasons is not accepted. You must attend or authorize a representative.',

              options: language === 'zh'

                ? [{ label: '🏠 返回主目錄', value: '返回主目錄' }]

                : [{ label: '🏠 Return to Main Menu', value: 'Return to main menu' }],

              ts: Date.now()

            }]);

          }, 1500);

        }

      } else if (currentStep === 4) {

        // Special Adjournment success message

        setCurrentStep(0);

        setCurrentScenario(null);

        setIsTyping(true);

        setTimeout(() => {

          setIsTyping(false);

          const botId = makeId('b');

          setMessages((prev) => [...prev, {

            id: botId,

            from: 'bot',

            text: language === 'zh'

              ? '醫療證明已接收。系統已暫時為你保留申索檔案，並通知了負責的調查主任。請你休息康復後，在 14 天內重新登入本系統，選擇新的會面日期。祝你早日康復。'

              : 'Medical proof received. The system has temporarily reserved your claim file and notified the responsible investigating officer. Please recover and log in to this system again within 14 days to select a new meeting date. Wishing you a speedy recovery.',

            options: language === 'zh'

              ? [{ label: '🏠 返回主目錄', value: '返回主目錄' }]

              : [{ label: '🏠 Return to Main Menu', value: 'Return to main menu' }],

            ts: Date.now()

          }]);

        }, 1500);

      }

      return true;

    }

    

    // Check if this is a scenario trigger from initial options

    if (stepText.includes('我想補交') || stepText.includes('我想補交文件') || stepText.includes('I want to upload supplementary documents') || stepText.includes('upload new evidence')) {

      const uid = `u-${Date.now()}`;

      setMessages(prev => [...prev, { id: uid, from: 'user', text: stepText, ts: Date.now() }]);

      setCurrentScenario('upload');

      setCurrentStep(0);

      return true;

    } else if (stepText.includes('查詢案件') || stepText.includes('查詢案件進度') || stepText.includes('Check case status') || stepText.includes('status') || stepText.includes('Call Over date')) {

      const uid = `u-${Date.now()}`;

      setMessages(prev => [...prev, { id: uid, from: 'user', text: stepText, ts: Date.now() }]);

      setCurrentScenario('status');

      setCurrentStep(0);

      return true;

    } else if (stepText.includes('更改預約') || stepText.includes('Change appointment') || stepText.includes('reschedule') || stepText.includes('cancel this claim')) {

      const uid = `u-${Date.now()}`;

      setMessages(prev => [...prev, { id: uid, from: 'user', text: stepText, ts: Date.now() }]);

      setCurrentScenario('reschedule');

      setCurrentStep(0);

      return true;

    }

    

    return false;

  };



  const handleRetry = () => {

    if (!lastSentForRetry) return;

    // remove failed bot messages before retrying

    setMessages((prev) => prev.filter((m) => !(m.from === 'bot' && m.error)));

    startStreaming(lastSentForRetry.text, lastSentForRetry.attachments, language);

  };



  const onFilesChange = (files: FileList | null) => {

    if (!files) return;

    setPendingFiles((prev) => [...prev, ...Array.from(files)]);

  };



  return (

    <>

    <div className="page-shell">

      <AppShellHeader
        brandEyebrow={t.brandEyebrow}
        brandTitle={t.brandTitle}
        language={language}
        onToggleLanguage={() => handleLanguageChange(language === 'zh' ? 'en' : 'zh')}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
            style={{ backdropFilter: 'blur(4px)' }}
          />
          
          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-xl pt-safe" style={{
            animation: 'slideInRight 0.3s ease-out'
          }}>
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderBottomColor: '#E2E8F0' }}>
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Noto Sans TC, sans-serif', color: '#012056' }}>
                {language === 'zh' ? '選單' : 'Menu'}
              </h2>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="touch-target flex items-center justify-center p-2 rounded-lg hover:bg-gray-100"
                aria-label={language === 'zh' ? '關閉' : 'Close'}
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Drawer Content */}
            <div className="p-4 space-y-4">
              {/* Language Toggle */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Noto Sans TC, sans-serif', color: '#64748B' }}>
                  {language === 'zh' ? '語言' : 'Language'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const newLang = language === 'zh' ? 'en' : 'zh';
                    handleLanguageChange(newLang);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors touch-target"
                  style={{ borderColor: '#E2E8F0', fontFamily: 'Noto Sans TC, sans-serif' }}
                >
                  <Globe size={20} />
                  <span className="font-medium">{language === 'zh' ? 'EN' : '中文'}</span>
                </button>
              </div>
              
              {/* Font Size Controls */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Noto Sans TC, sans-serif', color: '#64748B' }}>
                  {language === 'zh' ? '字體大小' : 'Font Size'}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFontControlClick('sm')}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors touch-target"
                    style={{ borderColor: '#E2E8F0', fontFamily: 'Noto Sans TC, sans-serif' }}
                  >
                    <Type size={16} />
                    <span className="text-sm">A</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFontControlClick('md')}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors touch-target"
                    style={{ borderColor: '#012056', backgroundColor: '#F0F5FA', fontFamily: 'Noto Sans TC, sans-serif' }}
                  >
                    <Type size={18} />
                    <span className="text-base font-medium">A</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFontControlClick('lg')}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors touch-target"
                    style={{ borderColor: '#E2E8F0', fontFamily: 'Noto Sans TC, sans-serif' }}
                  >
                    <Type size={20} />
                    <span className="text-lg">A</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="main-content flex flex-col md:flex-row" style={{

        paddingTop: '0.75rem',

        gap: '1rem',

        maxWidth: 1400,

        margin: '0 auto',

        padding: '2rem 1rem',

        background: '#F0F5FA',

        minHeight: 'calc(100dvh - 4.5rem)'

      }}>

        {/* Main Chat Area */}

        <div className="chat-card" style={{

          flex: showDocumentUpload ? '0 0 60%' : '1 1 auto',

          width: showDocumentUpload ? '100%' : 'auto',

          maxWidth: showDocumentUpload || showAppointmentBooking ? 'none' : 1100,

          transition: 'all 0.3s ease',

          background: '#FFFFFF',

          borderRadius: '12px',

          boxShadow: '0 4px 24px rgba(1, 32, 86, 0.08)',

          overflow: 'hidden',

          display: 'flex',

          flexDirection: 'column',

          position: 'relative'

        }}>

          <div ref={listRef} style={{ 

            maxHeight: '60vh', 

            overflowY: 'auto', 

            padding: '1.5rem',

            background: '#ffffff'

          }}>

            {messages.map((m) => (

              <div key={m.id} style={{ display: 'flex', marginBottom: 16, justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>

                <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>

                  {m.from === 'bot' ? (

                    <>

                      {/* Standard text message from the bot */}

                      <div style={{ padding: '0.9rem 1rem', borderRadius: 0, border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--navy-dark)', width: '100%' }}>

                        <div style={{ fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }} aria-live="polite">

                          <div dangerouslySetInnerHTML={parseMarkdownToHTML(m.text)} />

                        </div>

                        <div className="chat-timestamp" style={{ marginTop: '0.5rem' }}>

                          {new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

                        </div>

                      </div>



                      {/* OPTIONS RENDERING - Only render if message has options */}

                      {m.options && m.options.length > 0 && !consumedOptionMessageIds.includes(m.id) && (

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>

                          {m.options.map((opt, i) => (

                            <button

                              key={i}

                              type="button"

                              className="button-secondary"

                              style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: 0, border: '1px solid var(--border)', color: '#FFFFFF' }}

                              onClick={async (e) => {

                                e.stopPropagation();

                                if (consumedOptionMessageIdsRef.current.has(m.id)) {
                                  return;
                                }

                                consumedOptionMessageIdsRef.current.add(m.id);
                                setConsumedOptionMessageIds((prev) => [...prev, m.id]);

                                await handleUseStep(opt.value);

                              }}

                            >

                              {opt.label}

                            </button>

                          ))}

                        </div>

                      )}

                    </>

                  ) : (

                    <>

                      {/* User message */}

                      <div className="chat-user-bubble" style={{ padding: '0.9rem 1rem', borderRadius: 0, border: '1px solid var(--border)', background: 'var(--primary)', color: '#FFFFFF', maxWidth: '60%', marginLeft: 'auto' }}>

                        <div className="chat-user-bubble-content" style={{ fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', color: '#FFFFFF' }}>

                          <div className="chat-user-bubble-markdown" dangerouslySetInnerHTML={parseMarkdownToHTML(m.text)} />

                          {m.error ? (

                            <div style={{ marginTop: '0.5rem', color: '#FF6B6B' }}>

                              <div>{t.responseFailed} {m.error}</div>

                              <div style={{ marginTop: '0.375rem' }}>

                                <button className="button-primary" type="button" onClick={handleRetry} style={{ color: '#FFFFFF' }}>{t.retryLabel}</button>

                              </div>

                            </div>

                          ) : null}

                        </div>

                        <div className="chat-timestamp" style={{ marginTop: '0.5rem', textAlign: 'right', color: '#FFFFFF' }}>

                          {new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

                        </div>



                        {m.attachments && m.attachments.length > 0 ? (

                          <div style={{ marginTop: '0.5rem' }}>

                            {m.attachments.map((a, i) => (

                              <div key={i} style={{ fontSize: '0.85rem', color: '#E2E8F0' }}>{a.name} · {Math.round(a.size/1024)} KB</div>

                            ))}

                          </div>

                        ) : null}

                      </div>



                      {/* User next steps */}

                      {m.nextSteps && m.nextSteps.length > 0 && (

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>

                          {m.nextSteps.map((step, i) => (

                            <button

                              key={i}

                              type="button"

                              className="button-secondary"

                              style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: 0, border: '1px solid var(--border)', color: '#FFFFFF' }}

                              onClick={(e) => {

                                e.stopPropagation();

                                handleUseStep(step.title);

                              }}

                            >

                              {step.title}

                            </button>

                          ))}

                        </div>

                      )}

                    </>

                  )}

                </div>

              </div>

            ))}

          </div>



          {isTyping && (

            <div style={{ padding: '0 1.5rem 0.5rem 1.5rem' }}>

              <TypingIndicator />

            </div>

          )}



          {isStreaming ? (

            <div style={{ padding: '0 1rem 0.5rem 1rem', display: 'flex', alignItems: 'center', gap: 8 }}>

              <Spinner />

              <div style={{ color: 'var(--muted)' }}>{t.loading}</div>

            </div>

          ) : null}



          <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: '#ffffff', position: 'sticky', bottom: 0, zIndex: 10 }}>

            <div style={{ maxWidth: '85%', margin: '0 auto' }}>

              <form onSubmit={(e) => submitMessage(e)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>

                <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={(e) => onFilesChange(e.target.files)} />



                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>

              {pendingFiles.length > 0 ? (

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>

                  {pendingFiles.map((f, i) => (

                    <div key={i} style={{ background: 'var(--card)', padding: '0.25rem 0.5rem', borderRadius: 0, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>

                      <div style={{ fontSize: '0.9rem' }}>{f.name}</div>

                      <button type="button" onClick={() => setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))} aria-label="Remove attachment" style={{ border: 0, background: 'transparent', cursor: 'pointer' }}><X size={12} /></button>

                    </div>

                  ))}

                </div>

              ) : null}



              <textarea

                id="chat-input"

                ref={inputRef}

                value={value}

                onChange={(e) => setValue(e.target.value)}

                onKeyDown={(e) => {

                  if (e.key === 'Enter' && !e.shiftKey) {

                    e.preventDefault();

                    submitMessage();

                  }

                }}

                placeholder={t.placeholder}

                className="input-no-zoom touch-target-vertical"

                style={{

                  minHeight: '5rem',

                  padding: '0.75rem',

                  border: '1px solid var(--border)',

                  borderRadius: 0,

                  fontFamily: 'inherit',

                  fontSize: '1rem',

                  color: 'var(--navy-dark)',

                  caretColor: 'var(--navy-dark)',

                  resize: 'vertical',

                  background: '#ffffff'

                }}

                aria-label="Statement input"

              />

            </div>



            <div style={{ display: 'flex', gap: '0.3125rem' }}>

              <button

                type="button"

                className={`mic-button ${isRecording ? 'mic-recording' : ''}`}

                onClick={() => setIsRecording(!isRecording)}

                aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}

                style={{

                  borderRadius: 0,

                  display: 'flex',

                  alignItems: 'center',

                  justifyContent: 'center',

                  padding: '0.75rem',

                  background: isRecording ? 'var(--navy-primary)' : 'var(--surface-elevated)',

                  border: '1px solid var(--border)',

                  cursor: 'pointer',

                  transition: 'all 0.3s ease'

                }}

              >

                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isRecording ? '#FFFFFF' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>

                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>

                  <line x1="12" y1="19" x2="12" y2="23"/>

                  <line x1="8" y1="23" x2="16" y2="23"/>

                </svg>

              </button>

              <button type="submit" className="button-primary" style={{ borderRadius: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

                  <line x1="22" y1="2" x2="11" y2="13"/>

                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>

                </svg>

                {t.sendLabel}

              </button>

            </div>

          </form>

            </div>

          </div>

        </div>



        {/* Document Upload Side Panel */}

        {showDocumentUpload && (

          <div className="document-upload-panel w-full md:w-[38%]" style={{

            maxHeight: 'calc(100dvh - 200px)',

            overflowY: 'auto'

          }}>

            <DocumentUpload

              language={language as 'zh' | 'en'}

              uploadedFiles={uploadedFiles}

              onFileUpload={(files) => setUploadedFiles(prev => [...prev, ...files])}

              onRemoveFile={(index) => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}

              onClose={() => setShowDocumentUpload(false)}

              onProceedToNextStep={() => {

                if (currentScenario === 'defendant_intake') {

                  setUploadedFileNames(uploadedFiles.map(f => f.name));

                  setShowDocumentUpload(false);

                  setCurrentStep(5);

                  setMessages((prev) => [...prev, {

                    id: makeId('b'),

                    from: 'bot',

                    text: language === 'zh'

                      ? '✅ 明白。我們已為你整理了目前的證據清單。請檢視申索人提交的證據以及你方提供的文件。'

                      : '✅ Understood. We have prepared an evidence summary. Please review the claimant\'s evidence versus your documents.',

                    options: [{

                      label: language === 'zh' ? '檢視雙方證據' : 'Review Evidence Summary',

                      value: language === 'zh' ? '檢視雙方證據' : 'Review Evidence Summary',

                    }],

                    customAction: 'show_evidence_popout',

                    ts: Date.now()

                  }]);

                  return;

                }

                setUploadedFileNames(uploadedFiles.map(f => f.name));

                if (uploadAttemptCount === 0) {

                  setUploadAttemptCount(1);

                  setMessages((prev) => [...prev, {

                    id: makeId('b'),

                    from: 'bot',

                    text: language === 'zh' 

                      ? '⚠️ 系統偵測到你上傳的文件（糧單）過於模糊，且未能辨識到僱主的完整公司名稱。為了加快法庭處理進度，請重新拍攝並上傳清晰的文件正本。' 

                      : '⚠️ The system detected that the uploaded document (Payslip) is too blurry and the full employer company name cannot be recognized. To expedite court processing, please retake the photo and upload a clear copy of the original document.',

                    options: [

                      { label: language === 'zh' ? '📸 重新上傳文件' : '📸 Re-upload Document', value: '重新上傳文件' },

                      { label: language === 'zh' ? '暫時沒有更清晰的版本，繼續下一步' : 'Proceed without clearer version', value: 'Proceed without clearer version' }

                    ],

                    ts: Date.now()

                  }]);

                  setShowDocumentUpload(false);

                } else {

                  setShowDocumentUpload(false);

                  const proceedMsg = language === 'zh' ? '繼續下一步' : 'Continue next step';

                  const uid = makeId('u');

                  const botId = makeId('b');

                  setMessages((prev) => [...prev,

                    { id: uid, from: 'user', text: proceedMsg, ts: Date.now() },

                    {

                      id: botId,

                      from: 'bot',

                      text: language === 'zh'

                        ? '我們已收集足夠的初步資料。請選擇下一步行動：'

                        : 'We have collected sufficient preliminary information. Please select your next step:',

                      options: [

                        {

                          label: language === 'zh' ? '預約到審裁處提交申索' : 'Book Appointment at Tribunal',

                          value: language === 'zh' ? '預約到審裁處提交申索' : 'Book Appointment at Tribunal'

                        }

                      ],

                      ts: Date.now()

                    }

                  ]);

                }

              }}

              uploadAttemptCount={uploadAttemptCount}

              onSetUploadAttemptCount={setUploadAttemptCount}

              onAddMessage={(message) => setMessages(prev => [...prev, message])}

              makeId={makeId}

            />

          </div>

        )}

      </main>

    </div>



    {/* AppointmentBooking Modal - Rendered via Portal to document.body to bypass all parent container constraints */}

    {showAppointmentBooking && ReactDOM.createPortal(

      <div style={{ 

        position: 'fixed',

        left: 0,

        right: 0,

        top: 0,

        bottom: 0,

        zIndex: 9999,      /* Max z-index to ensure it sits on top of everything */

        background: 'rgba(249, 250, 251, 0.95)'

      }}>

        <div style={{ 

          position: 'absolute',

          left: '15%',

          right: '15%',

          top: '5vh',

          bottom: '5vh',

          display: 'flex', 

          flexDirection: 'column', 

          background: '#ffffff', 

          borderRadius: '0.75rem', 

          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 

          overflow: 'hidden'

        }}>

          <AppointmentBooking 

            language={language as 'zh' | 'en'} 

            onClose={() => setShowAppointmentBooking(false)} 

            onComplete={(details) => {

              setShowAppointmentBooking(false);

              if (currentScenario !== 'defendant_intake') {
                window.history.pushState({}, '', `/appointment-success?lang=${language}`);
                window.dispatchEvent(new PopStateEvent('popstate'));
                return;
              }

              setCurrentStep(4);

              setMessages((prev) => [...prev, {

                id: makeId('b'),

                from: 'bot',

                text: language === 'zh'

                  ? '✅ 預約已確認。為節省會面時間及協助我們預先整理抗辯理據，你是否現在上傳相關證明文件（如僱傭合約、出勤紀錄、解僱信等）？'

                  : '✅ Appointment confirmed. Would you like to upload your evidence documents now to save time?',

                options: language === 'zh' ? [

                  { label: '現在上傳文件', value: '現在上傳文件' },

                  { label: '稍後上傳', value: '稍後上傳' }

                ] : [

                  { label: 'Upload documents now', value: 'Upload documents now' },

                  { label: 'Upload later', value: 'Upload later' }

                ],

                ts: Date.now()

              }]);

            }}

          />

        </div>

      </div>,

      document.body

    )}

    {showEvidencePopout && ReactDOM.createPortal(

      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(15, 23, 42, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}>

        <div style={{
          width: 'min(920px, 100%)',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#ffffff',
          borderRadius: '0.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #dbe4ee'
        }}>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1.5rem',
            borderBottom: '1px solid #e2e8f0'
          }}>

            <div>
              <div style={{ fontSize: '0.85rem', color: '#5074ab', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                {language === 'zh' ? '證據摘要' : 'Evidence Summary'}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#012056' }}>
                {language === 'zh' ? '雙方目前提交的文件' : 'Documents currently on file'}
              </h3>
              <p style={{ margin: '0.5rem 0 0', color: '#475569', lineHeight: 1.6 }}>
                {language === 'zh'
                  ? `案件編號：${caseReferenceNumber || 'LBTC 1234/2026'}。以下摘要只供你在會面前核對，不包括內部評語或法律意見。`
                  : `Case reference: ${caseReferenceNumber || 'LBTC 1234/2026'}. This summary is for pre-interview review only and does not include internal comments or legal opinions.`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowEvidencePopout(false)}
              style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '999px', width: '2.25rem', height: '2.25rem', cursor: 'pointer' }}
              aria-label={language === 'zh' ? '關閉證據摘要' : 'Close evidence summary'}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <section style={{ background: 'linear-gradient(135deg, #f8fbff 0%, #f1f5f9 100%)', border: '1px solid #dbe4ee', borderRadius: '0.75rem', padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.85rem', color: '#012056', fontSize: '1rem' }}>
                {language === 'zh' ? '目前案件摘要' : 'Current Case Snapshot'}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {evidenceWorkflowSummary.map((item) => (
                  <div key={item.label} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.85rem 1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.3rem' }}>{item.label}</div>
                    <div style={{ color: '#0f3040', lineHeight: 1.5, fontWeight: 600 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <section style={{ background: '#f8fafc', border: '1px solid #dbe4ee', borderRadius: '0.75rem', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.25rem', color: '#012056', fontSize: '1rem' }}>
                  {language === 'zh' ? '申索人目前依據的材料' : 'Claimant Materials Currently on File'}
                </h4>
                <p style={{ margin: '0 0 0.85rem', color: '#64748b', lineHeight: 1.6, fontSize: '0.9rem' }}>
                  {language === 'zh' ? '這些是目前可供被告人預先核對的申索基礎文件。' : 'These are the materials currently available for the defendant to review before the interview.'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {claimantEvidenceSummary.map((item) => (
                    <div key={item.title} style={{ padding: '0.85rem 1rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                        <FileText size={16} style={{ color: '#5074ab', marginTop: '0.15rem', flexShrink: 0 }} />
                        <div>
                          <div style={{ color: '#0f3040', lineHeight: 1.5, fontWeight: 600 }}>{item.title}</div>
                          <div style={{ color: '#475569', lineHeight: 1.55, marginTop: '0.25rem', fontSize: '0.92rem' }}>{item.detail}</div>
                          <div style={{ color: '#5074ab', marginTop: '0.4rem', fontSize: '0.82rem', fontWeight: 600 }}>{item.status}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section style={{ background: '#f8fafc', border: '1px solid #dbe4ee', borderRadius: '0.75rem', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.25rem', color: '#012056', fontSize: '1rem' }}>
                  {language === 'zh' ? '你方文件及抗辯材料' : 'Your Defence Materials'}
                </h4>
                <p style={{ margin: '0 0 0.85rem', color: '#64748b', lineHeight: 1.6, fontSize: '0.9rem' }}>
                  {language === 'zh' ? '系統會將你已上傳的文件列入卷宗；未上傳的材料可在會面時帶備正本。' : 'Documents uploaded online will be placed on file. Outstanding materials may still be brought in original form to the interview.'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {defendantEvidenceSummary.map((item) => (
                    <div key={item.title} style={{ padding: '0.85rem 1rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                        <CheckCircle size={16} style={{ color: uploadedFileNames.length > 0 ? '#0f766e' : '#94a3b8', marginTop: '0.15rem', flexShrink: 0 }} />
                        <div>
                          <div style={{ color: '#0f3040', lineHeight: 1.5, fontWeight: 600 }}>{item.title}</div>
                          <div style={{ color: '#475569', lineHeight: 1.55, marginTop: '0.25rem', fontSize: '0.92rem' }}>{item.detail}</div>
                          <div style={{ color: uploadedFileNames.length > 0 ? '#0f766e' : '#64748b', marginTop: '0.4rem', fontSize: '0.82rem', fontWeight: 600 }}>{item.status}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section style={{ background: '#fffaf0', border: '1px solid #f5d38a', borderRadius: '0.75rem', padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.75rem', color: '#8a5a00', fontSize: '1rem' }}>
                {language === 'zh' ? '與調查主任會面的重點' : 'What Will Be Covered at the Interview'}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {interviewFocusItems.map((item) => (
                  <div key={item} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '0.45rem', height: '0.45rem', borderRadius: '999px', background: '#c9a227', marginTop: '0.5rem', flexShrink: 0 }} />
                    <div style={{ color: '#7c5a10', lineHeight: 1.55 }}>{item}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="button-primary"
              style={{ borderRadius: 0 }}
              onClick={() => {
                sessionStorage.setItem('appointmentFlowRole', 'defendant');
                setShowEvidencePopout(false);
                window.history.pushState({}, '', `/appointment-success?lang=${language}&role=defendant`);
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
            >
              {language === 'zh' ? '完成並查看預約詳情' : 'Finish & View Appointment'}
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}

  </>

  );

}

