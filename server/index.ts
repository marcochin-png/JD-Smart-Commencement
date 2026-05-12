import express from "express";
import { createServer } from "http";
import path from "path";
import { Readable } from "stream";
import { fileURLToPath } from "url";
import dotenv from 'dotenv';

// Global in-memory session store for demo mode
const demoSessions = new Map<string, any>();
const DEMO_SESSION_TTL_MS = Number(process.env.DEMO_SESSION_TTL_MS || 30 * 60 * 1000);
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
const configuredAllowedOrigins = (process.env.CORS_ALLOW_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = configuredAllowedOrigins.length ? configuredAllowedOrigins : DEFAULT_ALLOWED_ORIGINS;
const ENABLE_VERBOSE_LOGS = String(
  process.env.DEBUG_LOGS || (process.env.NODE_ENV !== 'production' ? 'true' : 'false')
).toLowerCase() === 'true';

function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

function debugLog(...args: unknown[]) {
  if (ENABLE_VERBOSE_LOGS) {
    console.log(...args);
  }
}

function cleanupExpiredDemoSessions(now = Date.now()) {
  demoSessions.forEach((session, key) => {
    const lastSeen = Number(session?.lastSeenAt || 0);
    if (!lastSeen || now - lastSeen > DEMO_SESSION_TTL_MS) {
      demoSessions.delete(key);
    }
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root .env (dev convenience)
// .env is already in .gitignore by default.
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public
  const staticPath = path.resolve(__dirname, "..", "dist", "public");

  // allow JSON body parsing for API endpoints
  app.use(express.json({ limit: '1mb' }));

  // CORS support for custom headers
  app.use((req, res, next) => {
    const requestOrigin = req.headers.origin as string | undefined;
    const allowOrigin = isAllowedOrigin(requestOrigin) ? requestOrigin : undefined;
    if (allowOrigin) {
      res.setHeader('Access-Control-Allow-Origin', allowOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    } else if (!requestOrigin) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Credentials', 'false');
    }
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Session-Id');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (req.method === 'OPTIONS') {
      if (requestOrigin && !allowOrigin) {
        res.sendStatus(403);
        return;
      }
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Basic request logger to help debug incoming connections
  app.use((req, res, next) => {
    try {
      const addr = req.ip || (req.socket && req.socket.remoteAddress) || 'unknown';
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${addr}`);
    } catch (e) {}
    next();
  });

  // Development proxy: forward non-/api requests to Vite dev server (http://localhost:3000)
  if (process.env.NODE_ENV !== 'production') {
    const DEV_ORIGIN = process.env.DEV_FRONTEND_ORIGIN || 'http://localhost:3000';
    app.use(async (req, res, next) => {
      try {
        // don't proxy API requests
        if (req.url.startsWith('/api')) return next();

        // build target URL
        const target = `${DEV_ORIGIN}${req.originalUrl}`;

        // ensure fetch is available
        let fetchImpl: any = (globalThis as any).fetch;
        if (!fetchImpl) {
          try {
            const nf = await import('node-fetch');
            fetchImpl = nf.default ?? nf;
          } catch (e) {
            console.error('Fetch not available and node-fetch import failed', e);
            return next();
          }
        }

        // Only proxy GET/HEAD to Vite dev server (static assets, HMR client)
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();

        const headers = { ...(req.headers as Record<string, string>) };
        delete headers.host;

        const upstream = await fetchImpl(target, { method: req.method, headers });
        if (!upstream.ok) {
          // let next() handle failures (fall back to static)
          return next();
        }

        // copy headers
        upstream.headers.forEach((v: string, k: string) => {
          // avoid overriding sensitive headers
          if (k.toLowerCase() === 'connection') return;
          res.setHeader(k, v as string);
        });

        // Stream body through when possible to avoid buffering full payloads in memory.
        res.status(upstream.status);
        const upstreamBody = upstream.body as any;
        if (upstreamBody) {
          if (typeof upstreamBody.pipe === 'function') {
            upstreamBody.pipe(res);
            return;
          }
          if (typeof (Readable as any).fromWeb === 'function') {
            Readable.fromWeb(upstreamBody).pipe(res);
            return;
          }
        }

        // Fallback for runtimes where upstream body isn't stream-compatible.
        const array = await upstream.arrayBuffer();
        res.send(Buffer.from(array));
        return;
      } catch (err) {
        console.error('dev proxy error', err);
        return next();
      }
    });
  }

  /**
   * Chat streaming proxy
   * POST /api/chat/stream
   * body: { message: string, model?: string }
   * Streams plain text chunks to the client. Requires OPENAI_API_KEY in env.
   */
  app.post('/api/chat/stream', async (req, res) => {
    const { message, model, lang } = req.body || {};
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Missing `message` in request body' });
      return;
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const USE_DEMO_MODE = String(
      process.env.USE_DEMO_MODE || (process.env.NODE_ENV !== 'production' ? 'true' : 'false')
    ).toLowerCase() === 'true';

    if (!USE_DEMO_MODE && !OPENAI_API_KEY) {
      res.status(500).json({ error: 'OPENAI_API_KEY is required when USE_DEMO_MODE=false' });
      return;
    }

    if (USE_DEMO_MODE) {
      // Demo mode: sequential Q&A with state tracking
      cleanupExpiredDemoSessions();
      const langPref = (typeof lang === 'string' && lang.toLowerCase().startsWith('en')) ? 'en' : 'zh';
      debugLog(`[DEBUG] Language preference: ${langPref}, lang param: ${lang}, message: ${message.substring(0, 50)}`);

      // In-memory session store for demo (per-user state tracking)
      const rawHeader = req.headers['x-session-id'];
      const sessionId = (rawHeader as string) || 'default';
      debugLog(`[DEBUG] Raw header: ${rawHeader}, Session ID: ${sessionId}`);
      debugLog(`[DEBUG] Message: ${message.substring(0, 50)}...`);

      // DEBUG: Clear all sessions if special message received
      if (message === '__CLEAR_ALL_SESSIONS__' || message === '清除所有會話') {
        demoSessions.clear();
        debugLog(`[DEBUG] *** ALL SESSIONS CLEARED ***`);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.write('[STEP:1/8]所有會話已清除。請重新開始。\n\n```OPTIONS\n[\n  { "label": "開始新對話", "value": "開始" }\n]\n```');
        res.end();
        return;
      }

      // Get or create session
      let session = demoSessions.get(sessionId);
      debugLog(`[DEBUG] Session lookup: ${sessionId}, found=${!!session}`);
      if (!session) {
        session = { scenario: null, questionIndex: 0, answers: [], lastSeenAt: Date.now() };
        demoSessions.set(sessionId, session);
        debugLog(`[DEBUG] Created new session, total sessions: ${demoSessions.size}`);
      } else {
        session.lastSeenAt = Date.now();
        debugLog(`[DEBUG] Existing session: scenario=${session.scenario}, questionIndex=${session.questionIndex}`);
      }
      
      // DEBUG: Log received message
      debugLog(`[DEBUG] Received message: "${message}"`);

      // Detect initial scenario
      const detectScenario = (): string => {
        if (langPref === 'zh') {
          if (message.includes('工資') || message.includes('薪金') || message.includes('人工') || message.includes('出糧') || message.includes('無出糧')) return 'unpaid_wages';
          if (message.includes('上傳') || message.includes('文件') || message.includes('證明')) return 'upload_documents';
          // change_appointment removed - should only be at end of workflow, not as initial option
          if (message.includes('查詢') || message.includes('案件') || message.includes('進度')) return 'check_case';
          if (message.includes('勞工處') || message.includes('轉介') || message.includes('調停')) return 'labour_dept_referral';
          return 'general';
        } else {
          if (message.includes('wage') || message.includes('salary') || message.includes('pay') || message.includes('unpaid')) return 'unpaid_wages';
          if (message.includes('upload') || message.includes('document') || message.includes('file')) return 'upload_documents';
          // change_appointment removed - should only be at end of workflow, not as initial option
          if (message.includes('check') || message.includes('case') || message.includes('status')) return 'check_case';
          if (message.includes('labour department') || message.includes('referral') || message.includes('conciliation')) return 'labour_dept_referral';
          return 'general';
        }
      };

      // Determine if this is an answer or a new topic
      // Check if the message matches any of the known answer patterns
      const isAnswerPattern = (msg: string): boolean => {
        const answerPatterns = [
          // Step 1: Employment form
          '月薪制', '日薪制', '時薪制', '佣金', '提成',
          'monthly salary', 'daily wage', 'hourly rate', 'commission',
          // Step 2: Unpaid period
          '少於1個月', '1至3個月', '3至6個月', '超過6個月', '尚未確定',
          'less than 1 month', '1 to 3 months', '3 to 6 months', 'over 6 months',
          // Step 3: Defendant address
          '公司註冊地址', '不知道地址', '郵政信箱',
          'registered address', 'po box',
          // Step 4: Employment status
          '已被解僱', '自動辭職', '仍在職', '合約已到期',
          'dismissed', 'resigned', 'still employed', 'contract expired',
          // Step 4: Labour dept referral
          'LD 1234/2026 (模擬輸入有編號)', 'A123 (模擬輸入沒有編號)',
          'LD 1234/2026 (Simulated input)', 'A123 (Simulated no referral)',
          // Step 6: Claim amount
          '少於港幣10,000', '港幣10,000至50,000', '港幣50,000至100,000', '港幣100,000至500,000', '超過港幣500,000',
          '申索金額少於10,000', '申索金額10,000至50,000', '申索金額50,000至100,000', '申索金額100,000至500,000', '申索金額超過500,000',
          'claim amount', '10,000', '50,000', '100,000', '500,000',
          // Step 6: Document upload (expanded) - these advance through Step 6
          '我想上傳證明文件', '我想稍後上傳文件',
          '上傳證明文件', '上傳更多文件',
          '上傳僱傭合約', '上傳工資單', '上傳銀行記錄',
          // Already uploaded / Don't have options
          '僱傭合約已上傳', '沒有僱傭合約',
          '工資單已上傳', '沒有工資單',
          '銀行記錄已上傳', '沒有銀行記錄',
          'employment contract already uploaded', "don't have employment contract",
          'payslips already uploaded', "don't have payslips",
          'bank records already uploaded', "don't have bank records",
          '繼續下一步',
          'upload document', 'upload file',
          'upload employment contract', 'upload payslip', 'upload bank record',
          'continue next step',
          // Step 7: Only book appointment advances to Step 8
          // Note: 'view draft', 'upload more', 'modify' options should NOT advance workflow
          '我想預約到審裁處提交申索',
          '完成，謝謝', '我有其他問題',
          'book appointment', 'complete',
          // General patterns
          '收到', '明白', '確認',
          'received', 'understood', 'confirmed'
        ];
        const found = answerPatterns.find(pattern => msg.includes(pattern));
        debugLog(`[DEBUG] Pattern check: msg='${msg.substring(0, 40)}', found=${found}`);
        return !!found;
      };
      
      const isAnswerPatternResult = isAnswerPattern(message);
      debugLog(`[DEBUG] isAnswerPattern result: ${isAnswerPatternResult}`);
      
      // Check for Step 7 options that should NOT advance workflow
      const nonAdvancingOptions = [
        '我想上傳更多文件', '我想修改之前提供的資料',
        'upload more', 'modify'
      ];
      const matchedNonAdvancing = nonAdvancingOptions.find(opt => message.includes(opt));
      const isNonAdvancing = !!matchedNonAdvancing;
      if (isNonAdvancing) {
        debugLog(`[DEBUG] *** NON-ADVANCING OPTION DETECTED: "${matchedNonAdvancing}" ***`);
      }
      
      // Check if this is a new topic (not an answer to previous question)
      // It's a new topic if:
      // 1. No scenario set yet, OR
      // 2. questionIndex is 0 AND message doesn't match any answer pattern (user clicked initial option)
      const isNewTopic = !session.scenario || (session.questionIndex === 0 && !isAnswerPatternResult);
      
      debugLog(`[DEBUG] Before processing: scenario=${session.scenario}, questionIndex=${session.questionIndex}, isNewTopic=${isNewTopic}, isNonAdvancing=${isNonAdvancing}`);
      
      if (isNewTopic) {
        // New conversation topic - detect scenario and reset
        session.scenario = detectScenario();
        session.questionIndex = 0;
        session.answers = [];
        debugLog(`[DEBUG] New conversation, scenario=${session.scenario}, questionIndex reset to 0`);
      } else if (isNonAdvancing) {
        // Step 7 option that doesn't advance workflow - show message but keep same questionIndex
        debugLog(`[DEBUG] Non-advancing option selected at questionIndex=${session.questionIndex}, not incrementing`);
        // Store the answer but don't increment - will show same Step 7 message again
        session.answers.push({ questionIndex: session.questionIndex, answer: message });
      } else {
        // This is an answer to previous question - continue workflow
        session.answers.push({ questionIndex: session.questionIndex, answer: message });
        const oldIndex = session.questionIndex;
        session.questionIndex++;
        debugLog(`[DEBUG] Continuing workflow, stored answer at index ${oldIndex}, incremented to questionIndex=${session.questionIndex}`);
      }
      
      debugLog(`[DEBUG] After processing: scenario=${session.scenario}, questionIndex=${session.questionIndex}`);
      
      debugLog(`[DEBUG] Final state: scenario=${session.scenario}, questionIndex=${session.questionIndex}`);

      const scenario = session.scenario;

      // Multi-part message structure for better conversation flow
      type MessagePart = { text: string; delay: number };

      debugLog(`[DEBUG] Getting scenario responses for: ${scenario}, lang=${langPref}`);
      const getScenarioResponses = (scen: string, language: string): MessagePart[] => {
        if (language === 'zh') {
          switch (scen) {
            case 'unpaid_wages':
              return [
                { text: '您好，感謝您聯絡勞資審裁處網上入門系統。我是您的申索助理，專門協助您處理僱主欠薪事宜。\n\n我了解到您的僱主尚未支付工資。為了準確填寫表格1（申索書標題）及表格2（申索書內容），我需要收集一些基本資料。\n\n**第一步：基本資料收集**\n\n請問您的僱傭形式是：\n\n```OPTIONS\n[\n  { "label": "月薪制（每月固定薪金）", "value": "我的僱傭形式是月薪制" },\n  { "label": "日薪制（按工作天數計算）", "value": "我的僱傭形式是日薪制" },\n  { "label": "時薪制（按工作時數計算）", "value": "我的僱傭形式是時薪制" },\n  { "label": "佣金/提成制（主要收入來自佣金）", "value": "我的收入主要來自佣金或提成" }\n]\n```', delay: 1200 },
                { text: '感謝您的回答。現在我需要確認欠薪的具體情況。\n\n**第二步：欠薪時段確認**\n\n請問僱主欠薪的具體時段是多久？\n\n```OPTIONS\n[\n  { "label": "少於1個月", "value": "僱主欠薪少於1個月" },\n  { "label": "1至3個月", "value": "僱主欠薪1至3個月" },\n  { "label": "3至6個月", "value": "僱主欠薪3至6個月" },\n  { "label": "超過6個月", "value": "僱主欠薪超過6個月" },\n  { "label": "尚未確定", "value": "我尚未確定欠薪的具體時段" }\n]\n```', delay: 1500 },
                { text: '收到。現在我需要了解您目前的僱傭狀況。\n\n**第三步：僱傭狀況確認**\n\n請問您目前的狀況是：\n\n```OPTIONS\n[\n  { "label": "已被解僱", "value": "我已被解僱" },\n  { "label": "自動辭職", "value": "我已自動辭職" },\n  { "label": "仍在職", "value": "我仍在職" },\n  { "label": "合約已到期", "value": "合約已到期" }\n]\n```', delay: 1500 },
                { text: '第四步：勞工處轉介確認\n\n現在我需要確認你是否有勞工處的轉介編號，這有助於加快案件處理。\n\n如果你有轉介編號，請在此輸入（例如：LD 1234/2026）。\n如果你沒有轉介編號，請輸入你的香港身份證首 4 位以作紀錄（例如：A123）。\n\n```OPTIONS\n[\n  { "label": "LD 1234/2026 (模擬輸入有編號)", "value": "LD 1234/2026 (模擬輸入有編號)" },\n  { "label": "A123 (模擬輸入沒有編號)", "value": "A123 (模擬輸入沒有編號)" }\n]\n```', delay: 1500 },
                { text: '收到。現在我需要確認您希望申索的金額範圍，以便準備表格2（申索書內容）。\n\n**第五步：申索金額確認**\n\n請問您預計申索的金額範圍是：\n\n```OPTIONS\n[\n  { "label": "少於港幣10,000元", "value": "申索金額少於10,000元" },\n  { "label": "港幣10,000至50,000元", "value": "申索金額10,000至50,000元" },\n  { "label": "港幣50,000至100,000元", "value": "申索金額50,000至100,000元" },\n  { "label": "港幣100,000至500,000元", "value": "申索金額100,000至500,000元" },\n  { "label": "超過港幣500,000元", "value": "申索金額超過500,000元" }\n]\n```', delay: 1800 },
                { text: '收到。現在我需要您上傳證明文件以進行處理和金額計算。\n\n**第六步：證明文件上傳與處理**\n\n請按以下順序上傳文件（支援格式：PDF、JPG、PNG）：\n\n**第一項：僱傭合約**\n請上傳您的僱傭合約（包括任何續約或修訂文件）。\n\n```OPTIONS\n[\n  { "label": "📄 上傳僱傭合約", "value": "上傳僱傭合約" },\n  { "label": "✓ 已上傳", "value": "僱傭合約已上傳" },\n  { "label": "✗ 沒有", "value": "沒有僱傭合約" }\n]\n```', delay: 1500 },
                { text: '✅ 已成功接收文件：僱傭合約。系統已將文件安全存檔。\n\n請繼續上傳下一項文件。\n\n**第二項：工資單或薪金證明**\n請上傳最近3個月的工資單。\n\n```OPTIONS\n[\n  { "label": "📄 上傳工資單", "value": "上傳工資單" },\n  { "label": "✓ 已上傳", "value": "工資單已上傳" },\n  { "label": "✗ 沒有", "value": "沒有工資單" }\n]\n```', delay: 2000 },
                { text: '✅ 已成功接收文件：工資單。系統已將文件安全存檔。\n\n請繼續上傳下一項文件。\n\n**第三項：銀行入帳記錄**\n請上傳顯示薪金入帳的銀行月結單。\n\n```OPTIONS\n[\n  { "label": "📄 上傳銀行記錄", "value": "上傳銀行記錄" },\n  { "label": "✓ 已上傳", "value": "銀行記錄已上傳" },\n  { "label": "✗ 沒有", "value": "沒有銀行記錄" }\n]\n```', delay: 2000 },
                { text: '✅ 已成功接收文件：銀行月結單。系統已將文件安全存檔。\n\n✅ 所有必備文件已收集完成！\n\n```OPTIONS\n[\n  { "label": "📤 上傳更多文件", "value": "我想上傳更多文件" },\n  { "label": "⏭️ 繼續下一步", "value": "繼續下一步" }\n]\n```', delay: 3000 },
                { text: '收到。現在我已收集足夠資料，為您總結申索內容並安排下一步。\n\n**第七步：申索總結與預約安排**\n\n根據您提供的資料，我已準備好以下內容：\n\n📋 **表格1（申索書標題）**：\n• 申索人資料（待確認姓名及聯絡）\n• 被告人資料（僱主/公司名稱及地址）\n\n📄 **表格2（申索書內容）**：\n• 申索理由：欠薪\n• 申索項目：工資\n• 申索金額範圍：已記錄\n\n⚠️ **重要提醒**：\n根據《僱傭條例》，工資申索必須在工資到期支付日後24個月內提出。請確認您的申索未超過時限。\n\n準備好提交申索了嗎？\n\n```OPTIONS\n[\n  { "label": "📅 預約到審裁處提交申索", "value": "我想預約到審裁處提交申索" },\n  { "label": "📤 上傳更多文件", "value": "我想上傳更多文件" },\n  { "label": "✏️ 修改之前提供的資料", "value": "我想修改之前提供的資料" }\n]\n```', delay: 3000 },
                { text: '明白。現為您安排預約到勞資審裁處。\n\n**第八步：預約安排**\n\n📍 **地址**：九龍油麻地加士居道38號勞資審裁處登記處\n📞 **預約電話**：2625 0056（24小時電話預約系統）\n\n📅 **預約當日所需帶備**：\n✓ 香港身份證\n✓ 勞工處轉介編號（如有）\n✓ 所有證明文件正本及副本\n✓ 被告人準確地址資料\n\n⏰ **辦公時間**：星期一至五 上午8時45分至下午1時，下午2時至5時30分\n\n調查主任會在預約當日與您會面，協助您擬定表格1及表格2。簽署後，系統會為您安排聆訊日期。\n\n請問您是否需要其他協助？\n\n```OPTIONS\n[\n  { "label": "✓ 完成，謝謝", "value": "完成，謝謝" },\n  { "label": "❓ 其他問題", "value": "我有其他問題" }\n]\n```', delay: 2500 },
                { text: '感謝您的使用。如需進一步協助，請致電勞資審裁處登記處：2625 0020。\n\n祝您申索順利！', delay: 1200 }
              ];

            case 'upload_documents':
              return [
                { text: "您好，感謝您聯絡勞資審裁處。文件上傳是申索程序中至關重要的一環，妥善的文件準備能大大提升您的申索成功率。", delay: 800 },
                { text: "\n\n【文件上傳須知】\n\n勞資審裁處接受以下方式提交文件：\n\n1. **親身提交**：攜帶文件正本及副本，親臨九龍油麻地加士居道38號勞資審裁處登記處\n2. **郵寄提交**：將文件副本郵寄至上述地址（建議使用掛號郵件）\n3. **聆訊當日提交**：於首次或後續聆訊時帶同文件正本出庭\n\n*注意：現階段本系統暫不支援直接電子文件上傳，請使用上述方式提交。*", delay: 1500 },
                { text: "\n\n【必備文件清單】\n\n根據您的申索類型，請準備相應文件：\n\n**所有申索類型通用**：\n✓ 僱傭合約（包括任何續約或修訂文件）\n✓ 身份證明文件副本\n✓ 最近12個月糧單或薪金證明\n✓ 銀行入帳記錄\n✓ 強積金供款記錄\n\n**欠薪申索額外需要**：\n✓ 解僱信/辭職信（如有）\n✓ 最後工作日證明\n✓ 與僱主關於薪酬的通訊記錄\n\n**終止僱傭申索額外需要**：\n✓ 終止合約通知書\n✓ 未休年假記錄\n✓ 代通知金或遣散費計算依據", delay: 1800 },
                { text: "\n\n【文件整理建議】\n\n為確保您的申索順利進行，建議按以下方式整理文件：\n\n1. **編製文件索引**：製作一份清單，列明每份文件名稱、日期及頁數\n2. **按時間排序**：將文件按事件發生時間順序排列\n3. **正副本分開**：正本文件聆訊時帶同出庭，副本用於提交法庭及送達對方\n4. **電子備份**：為所有文件掃描或拍照，保存電子副本以備不時之需\n5. **翻譯準備**：如文件為中文或英文以外語言，需安排認可翻譯", delay: 1800 },
                { text: "\n\n【文件提交時間表】\n\n• **提交申索時**：連同申索表（表格1）提交文件副本\n• **送達對方後**：確保僱主收到申索副本，以便對方準備答辯\n• **聆訊前**：整理所有正本文件，製作文件冊方便法庭查閱\n• **聆訊時**：按審裁官指示出示文件正本作為證據", delay: 1500 },
                { text: "\n\n請問您希望了解哪類文件的具體要求，或需要關於文件格式的更多指引？", delay: 1000 }
              ];

            // change_appointment case removed - appointment should only be at end of workflow, not standalone

            case 'check_case':
              return [
                { text: "您好，感謝您聯絡勞資審裁處。我可以協助您查詢案件進度。", delay: 800 },
                { text: "\n\n【案件查詢方式】\n\n**方法一：網上查詢**\n透過「綜合法院案件管理系統」(iCMS) 查詢：\n• 網址：https://e-services.judiciary.hk/icms/\n• 需登記帳戶並登入\n• 可查閱案件進度、聆訊日期及法庭命令\n\n**方法二：電話查詢**\n致電勞資審裁處登記處：2625 0020\n辦公時間：星期一至五 上午8時45分至下午5時30分\n\n**方法三：親身查詢**\n前往九龍油麻地加士居道38號勞資審裁處登記處\n\n*注意：查詢時須提供案件編號或申索人身份證明文件。*", delay: 1800 },
                { text: "\n\n【查詢所需資料】\n\n為順利查詢您的案件，請準備以下資料：\n\n• **案件編號**：提交申索時獲發（格式如：LDTS-2024-XXXXX）\n• **申索人姓名**：與申索表一致的完整姓名\n• **身份證號碼**：香港身份證或護照號碼\n• **申索日期**：提交申索的大約日期\n\n如遺失案件編號，可透過上述聯絡方式，提供身份證明文件查詢。", delay: 1500 },
                { text: "\n\n【案件進度階段說明】\n\n您的案件可能處於以下階段：\n\n1. **已提交**：申索表已接收，正待編排聆訊日期\n2. **已編期**：已獲編排首次聆訊日期\n3. **等待送達**：正待將申索副本送達對方\n4. **已送達**：對方已收到申索副本\n5. **聆訊中**：已進行首次或多次聆訊\n6. **已裁決**：審裁官已作出裁決\n7. **上訴期**：對裁決不服可提出上訴的期限\n8. **執行階段**：正進行判決的執行程序", delay: 1800 },
                { text: "\n\n【下一步建議】\n\n請問您：\n1. 是否已有案件編號？\n2. 希望查詢的具體資訊是什麼（如：聆訊日期、案件狀態、對方是否已答辯等）？\n\n提供這些資料後，我可以指引您最快捷的查詢方式。", delay: 1200 }
              ];

            case 'labour_dept_referral':
              return [
                { text: '您好，感謝您聯絡勞資審裁處智能入門系統。我了解到您是由勞工處轉介，這表示您的個案可能已完成或正在進行勞工處的調停程序。\n\n**第一步：確認調停狀態**\n\n請問您是否已經取得「調停不成功證明書」？\n\n```OPTIONS\n[\n  { "label": "已取得證明書", "value": "我已取得調停不成功證明書" },\n  { "label": "尚未取得證明書", "value": "我尚未取得調停不成功證明書" },\n  { "label": "不確定", "value": "我不確定" }\n]\n```', delay: 1200 },
                { text: '明白。為了準備申索文件，我需要收集一些基本資料。\n\n**第二步：基本資料收集**\n\n請問您的申索類型是：\n\n```OPTIONS\n[\n  { "label": "僱主欠薪", "value": "我的申索是僱主欠薪" },\n  { "label": "終止合約權益", "value": "我的申索是終止合約權益" },\n  { "label": "其他勞資糾紛", "value": "我的申索是其他勞資糾紛" }\n]\n```', delay: 1500 },
                { text: '收到。現在我需要確認申索時限。\n\n**第三步：申索時限確認**\n\n請問您取得「調停不成功證明書」的日期是？\n\n```OPTIONS\n[\n  { "label": "少於1個月前", "value": "少於1個月前取得證明書" },\n  { "label": "1至3個月前", "value": "1至3個月前取得證明書" },\n  { "label": "3至6個月前", "value": "3至6個月前取得證明書" },\n  { "label": "超過6個月", "value": "超過6個月前取得證明書" }\n]\n```', delay: 1800 },
                { text: '收到。請提供勞工處轉介編號（格式如：LD/2024/12345），這有助於核實您的調停紀錄。\n\n如沒有編號，請直接告訴我「沒有」。', delay: 2000 },
                { text: '收到。現在我需要確認您是否已準備好相關文件。\n\n**第四步：文件準備確認**\n\n轉介個案除一般申索文件外，請額外準備：\n✓ 勞工處「調停不成功證明書」\n✓ 勞工處調停紀錄（如有）\n✓ 調停過程中提交的文件副本\n\n請問您是否已準備好這些文件？\n\n```OPTIONS\n[\n  { "label": "已準備好", "value": "我已準備好轉介文件" },\n  { "label": "準備了部分", "value": "我準備了部分轉介文件" },\n  { "label": "尚未準備", "value": "我尚未準備轉介文件" }\n]\n```', delay: 2000 },
                { text: '收到。現為您總結申索程序並安排下一步。\n\n**第五步：申索總結與預約安排**\n\n根據勞工處轉介，您的申索有以下特點：\n\n📋 **申索費用**：\n調停不成功的個案，申索費可能獲得減免或豁免。請於提交申索時向登記處職員查詢。\n\n📄 **聆訊安排**：\n• 轉介個案可能獲優先處理\n• 審裁官會參考勞工處的調停紀錄\n• 如僱主曾缺席調停，法庭可能作出相應推論\n\n⚠️ **重要時限提醒**：\n取得調停證明書後，須在6個月內向審裁處提出申索。請確認您的申索未超過時限。\n\n請問您希望如何進行？\n\n```OPTIONS\n[\n  { "label": "📅 預約到審裁處提交申索", "value": "我想預約到審裁處提交申索" },\n  { "label": "📝 了解申索費用詳情", "value": "我想了解申索費用詳情" },\n  { "label": "🔄 修改之前提供的資料", "value": "我想修改之前提供的資料" }\n]\n```', delay: 3000 },
                { text: '明白。現為您安排預約到勞資審裁處。\n\n**預約安排**\n\n📍 **地址**：九龍油麻地加士居道38號勞資審裁處登記處\n📞 **預約電話**：2625 0056（24小時電話預約系統）\n\n📅 **預約當日所需帶備**：\n✓ 香港身份證\n✓ 勞工處轉介編號\n✓ 「調停不成功證明書」\n✓ 所有證明文件正本及副本\n✓ 調停紀錄（如有）\n\n⏰ **辦公時間**：星期一至五 上午8時45分至下午1時，下午2時至5時30分\n\n調查主任會在預約當日與您會面，協助您擬定表格1及表格2。簽署後，系統會為您安排聆訊日期。\n\n請問您是否需要其他協助？\n\n```OPTIONS\n[\n  { "label": "✓ 完成，謝謝", "value": "完成，謝謝" },\n  { "label": "❓ 其他問題", "value": "我有其他問題" }\n]\n```', delay: 2500 },
                { text: '感謝您的使用。如需進一步協助，請致電勞資審裁處登記處：2625 0020。\n\n祝您申索順利！', delay: 1200 }
              ];

            default:
              return [
                { text: "您好，歡迎使用勞資審裁處網上入門系統。我是您的程序指引助理，專門協助您了解勞資審裁處的申索程序。", delay: 800 },
                { text: "\n\n【系統簡介】\n\n本系統旨在協助市民：\n• 了解勞資審裁處的申索資格及程序\n• 準備申索所需的文件及資料\n• 掌握重要的法定時限\n• 獲取案件進度的相關資訊\n\n請注意：本系統僅提供程序指引，不構成法律意見。如需針對個案的法律建議，請諮詢合資格的法律專業人士。", delay: 1500 },
                { text: "\n\n【勞資審裁處簡介】\n\n勞資審裁處是司法機構轄下的專門法庭，處理僱主與僱員之間的申索，包括：\n• 工資、薪金、佣金及花紅\n• 終止合約通知金及代通知金\n• 遣散費及長期服務金\n• 年假薪酬、疾病津貼等法定福利\n• 不合理或不合法解僱的補償\n\n地址：九龍油麻地加士居道38號\n電話：2625 0020", delay: 1500 },
                { text: "\n\n【常見查詢類別】\n\n請問您希望了解以下哪方面的資訊？\n\n1. 僱主欠薪如何申索\n2. 申索程序及文件準備\n3. 查詢案件進度\n4. 勞工處轉介程序\n\n請直接輸入您的問題或選擇上述類別，我將為您提供詳細指引。\n\n（注意：預約安排將在申索流程的最後一步進行）", delay: 1200 }
              ];
          }
        } else {
          // English responses
          switch (scen) {
            case 'unpaid_wages':
              return [
        { text: 'Hello, thank you for contacting the Labour Tribunal Online Commencement system. I am your Claim Assistant, specializing in helping you with unpaid wage claims.\n\nI understand that your employer has not paid your wages. To accurately prepare Form 1 (Claim Form Title) and Form 2 (Claim Form Content), I need to collect some basic information.\n\n**Step 1: Basic Information Collection**\n\nWhat is your employment arrangement?\n\n```OPTIONS\n[\n  { "label": "Monthly salary (fixed monthly wage)", "value": "My employment is monthly salary" },\n  { "label": "Daily wage (paid by working days)", "value": "My employment is daily wage" },\n  { "label": "Hourly rate (paid by working hours)", "value": "My employment is hourly rate" },\n  { "label": "Commission/commission-based (main income from commission)", "value": "My income is mainly from commission" }\n]\n```', delay: 1200 },
                { text: 'Thank you for your answer. Now I need to confirm the specific details of your unpaid wages.\n\n**Step 2: Unpaid Wage Period Confirmation**\n\nHow long has your employer not paid your wages?\n\n```OPTIONS\n[\n  { "label": "Less than 1 month", "value": "Unpaid wages less than 1 month" },\n  { "label": "1 to 3 months", "value": "Unpaid wages 1 to 3 months" },\n  { "label": "3 to 6 months", "value": "Unpaid wages 3 to 6 months" },\n  { "label": "Over 6 months", "value": "Unpaid wages over 6 months" },\n  { "label": "Not sure yet", "value": "I am not sure about the unpaid wage period" }\n]\n```', delay: 1500 },
                { text: 'Received. Now I need to understand your current employment status.\n\n**Step 3: Employment Status Confirmation**\n\nWhat is your current status?\n\n```OPTIONS\n[\n  { "label": "Dismissed", "value": "I have been dismissed" },\n  { "label": "Resigned voluntarily", "value": "I have resigned voluntarily" },\n  { "label": "Still employed", "value": "I am still employed" },\n  { "label": "Contract expired", "value": "My contract has expired" }\n]\n```', delay: 1500 },
                { text: 'Step 4: Labour Department Referral\n\nI need to confirm if you have a Labour Department referral number to expedite the process.\n\nIf you have one, please enter it (e.g., LD 1234/2026). If you do not have one, please enter the first 4 digits of your HKID (e.g., A123).\n\n```OPTIONS\n[\n  { "label": "LD 1234/2026 (Simulated input)", "value": "LD 1234/2026 (Simulated input)" },\n  { "label": "A123 (Simulated no referral)", "value": "A123 (Simulated no referral)" }\n]\n```', delay: 1500 },
                { text: 'Received. Now I need to confirm the amount range you wish to claim, to prepare Form 2 (Claim Form Content).\n\n**Step 5: Claim Amount Confirmation**\n\nWhat is your estimated claim amount range?\n\n```OPTIONS\n[\n  { "label": "Less than HK$10,000", "value": "Claim amount less than 10,000" },\n  { "label": "HK$10,000 to HK$50,000", "value": "Claim amount 10,000 to 50,000" },\n  { "label": "HK$50,000 to HK$100,000", "value": "Claim amount 50,000 to 100,000" },\n  { "label": "HK$100,000 to HK$500,000", "value": "Claim amount 100,000 to 500,000" },\n  { "label": "Over HK$500,000", "value": "Claim amount over 500,000" }\n]\n```', delay: 1800 },
                { text: 'Received. Now I need you to upload supporting documents for processing and amount calculation.\n\n**Step 6: Document Upload and Processing**\n\nPlease upload the following documents in order (Supported formats: PDF, JPG, PNG):\n\n**First Item: Employment Contract**\nPlease upload your employment contract (including any renewals or amendments).\n\n```OPTIONS\n[\n  { "label": "📄 Upload Employment Contract", "value": "Upload employment contract" },\n  { "label": "✓ Already uploaded", "value": "Employment contract already uploaded" },\n  { "label": "✗ Don\'t have", "value": "Don\'t have employment contract" }\n]\n```', delay: 1500 },
                { text: '✅ Document successfully received: Employment Contract. The document has been securely archived.\n\nPlease continue uploading the next document.\n\n**Second Item: Payslips or Salary Certificates**\nPlease upload your payslips for the last 3 months.\n\n```OPTIONS\n[\n  { "label": "📄 Upload Payslips", "value": "Upload payslips" },\n  { "label": "✓ Already uploaded", "value": "Payslips already uploaded" },\n  { "label": "✗ Don\'t have", "value": "Don\'t have payslips" }\n]\n```', delay: 2000 },
                { text: '✅ Document successfully received: Payslips. The document has been securely archived.\n\nPlease continue uploading the next document.\n\n**Third Item: Bank Deposit Records**\nPlease upload bank statements showing salary deposits.\n\n```OPTIONS\n[\n  { "label": "📄 Upload Bank Records", "value": "Upload bank records" },\n  { "label": "✓ Already uploaded", "value": "Bank records already uploaded" },\n  { "label": "✗ Don\'t have", "value": "Don\'t have bank records" }\n]\n```', delay: 2000 },
                { text: '✅ Document successfully received: Bank Statement. The document has been securely archived.\n\n✅ All required documents have been collected!\n\n```OPTIONS\n[\n  { "label": "📤 Upload More Documents", "value": "I want to upload more documents" },\n  { "label": "⏭️ Continue to Next Step", "value": "Continue next step" }\n]\n```', delay: 3000 },
                { text: 'Received. I have now collected sufficient information. Let me summarize your claim and arrange the next steps.\n\n**Step 7: Claim Summary and Appointment Arrangement**\n\nBased on the information you provided, I have prepared the following:\n\n📋 **Form 1 (Claim Form Title)**:\n• Claimant information (name and contact details to be confirmed)\n• Defendant information (employer/company name and address)\n\n📄 **Form 2 (Claim Form Content)**:\n• Claim reason: Unpaid wages\n• Claim items: Wages\n• Claim amount range: Recorded\n\n⚠️ **Important Reminder**:\nAccording to the Employment Ordinance, wage claims must be filed within 24 months from the date when wages became due. Please ensure your claim is not time-barred.\n\nReady to submit your claim?\n\n```OPTIONS\n[\n  { "label": "📅 Book appointment at Tribunal to submit claim", "value": "I want to book appointment at Tribunal to submit claim" },\n  { "label": "📤 Upload more documents", "value": "I want to upload more documents" },\n  { "label": "✏️ Modify previously provided information", "value": "I want to modify previously provided information" }\n]\n```', delay: 3000 },
                { text: 'Understood. Now I will arrange an appointment at the Labour Tribunal for you.\n\n**Step 8: Appointment Arrangement**\n\n📍 **Address**: Labour Tribunal Registry, 38 Gascoigne Road, Yau Ma Tei, Kowloon\n📞 **Appointment Phone**: 2625 0056 (24-hour telephone booking system)\n\n📅 **Items to bring on appointment day**:\n✓ Hong Kong Identity Card\n✓ Labour Department referral number (if applicable)\n✓ All supporting documents (originals and copies)\n✓ Defendant accurate address information\n\n⏰ **Office Hours**: Monday to Friday 8:45am to 1:00pm, 2:00pm to 5:30pm\n\nAn investigating officer will meet with you on the appointment day to assist you in drafting Form 1 and Form 2. After signing, the system will arrange a hearing date for you.\n\nDo you need any other assistance?\n\n```OPTIONS\n[\n  { "label": "✓ Complete, thank you", "value": "Complete, thank you" },\n  { "label": "❓ Other questions", "value": "I have other questions" }\n]\n```', delay: 2500 },
                { text: 'Thank you for using our service. If you need further assistance, please call the Labour Tribunal Registry: 2625 0020.\n\nWe wish you a successful claim!', delay: 1200 }
              ];

            case 'upload_documents':
              return [
                { text: "Hello, thank you for contacting the Labour Tribunal. Document preparation is a crucial part of the claims process, and proper document organization can significantly improve your chances of success.", delay: 800 },
                { text: "\n\n**Document Submission Guidelines**\n\nThe Labour Tribunal accepts documents through the following methods:\n\n1. **In-person submission**: Bring original documents and copies to the Labour Tribunal Registry at 38 Gascoigne Road, Yau Ma Tei, Kowloon\n2. **Postal submission**: Mail document copies to the above address (registered mail recommended)\n3. **Submission at hearing**: Bring original documents to court on the hearing date\n\n*Note: This system currently does not support direct electronic document upload. Please use the methods above.*", delay: 1500 },
                { text: "\n\n**Required Document Checklist**\n\nPlease prepare the corresponding documents according to your claim type:\n\n**Required for All Claim Types**:\n• Employment contract (including any renewals or amendments)\n• Copy of identification document\n• Payslips or salary certificates for the last 12 months\n• Bank deposit records\n• MPF contribution records\n\n**Additional Requirements for Unpaid Wage Claims**:\n• Dismissal/resignation letter (if applicable)\n• Proof of last working day\n• Communication records with employer regarding salary\n\n**Additional Requirements for Termination Claims**:\n• Contract termination notice\n• Untaken annual leave records\n• Basis for calculating payment in lieu of notice or severance payment", delay: 1800 },
                { text: "\n\n**Document Organization Recommendations**\n\nTo ensure your claim proceeds smoothly, we recommend organizing documents as follows:\n\n1. **Create a document index**: Prepare a list showing each document's name, date, and page count\n2. **Chronological order**: Arrange documents by the date of events\n3. **Separate originals and copies**: Bring originals to the hearing; submit copies to the court and serve on the other party\n4. **Electronic backup**: Scan or photograph all documents and keep electronic copies\n5. **Translation preparation**: If documents are not in Chinese or English, arrange certified translation", delay: 1800 },
                { text: "\n\n**Document Submission Timeline**\n\n• **When submitting claim**: Submit document copies together with Claim Form (Form 1)\n• **After serving the other party**: Ensure the employer receives a copy of the claim so they can prepare their defence\n• **Before hearing**: Organize all original documents and prepare document folders for court reference\n• **At hearing**: Present original documents as evidence as directed by the Presiding Officer", delay: 1500 },
                { text: "\n\nWhich type of document would you like to know more about, or do you need more guidance on document format requirements?", delay: 1000 }
              ];

            // change_appointment case removed - appointment should only be at end of workflow, not standalone

            case 'check_case':
              return [
                { text: "Hello, thank you for contacting the Labour Tribunal. I can assist you with checking your case progress.", delay: 800 },
                { text: "\n\n**Case Enquiry Methods**\n\n**Method 1: Online enquiry**\nThrough the Integrated Case Management System (iCMS):\n• Website: https://e-services.judiciary.hk/icms/\n• Account registration and login required\n• Can check case progress, hearing dates, and court orders\n\n**Method 2: Telephone enquiry**\nCall the Labour Tribunal Registry: 2625 0020\nOffice hours: Monday to Friday 8:45am to 5:30pm\n\n**Method 3: In-person enquiry**\nAttend at the Labour Tribunal Registry, 38 Gascoigne Road, Yau Ma Tei, Kowloon\n\n*Note: Case number or claimant identification document is required for enquiry.*", delay: 1800 },
                { text: "\n\n**Information Required for Enquiry**\n\nTo successfully check your case, please prepare the following information:\n\n• **Case number**: Issued when submitting claim (format: LDTS-2024-XXXXX)\n• **Claimant name**: Full name as stated on the claim form\n• **ID number**: Hong Kong Identity Card or passport number\n• **Date of claim**: Approximate date when claim was submitted\n\nIf you have lost your case number, you can provide your identification document to check through the contact methods above.", delay: 1500 },
                { text: "\n\n**Case Progress Stage Explanation**\n\nYour case may be at the following stages:\n\n1. **Submitted**: Claim form received, awaiting hearing date scheduling\n2. **Scheduled**: First hearing date has been assigned\n3. **Awaiting service**: Waiting to serve copy of claim on the other party\n4. **Served**: Other party has received copy of claim\n5. **Hearing in progress**: First or multiple hearings have been held\n6. **Determined**: Presiding Officer has made a decision\n7. **Appeal period**: Time limit for appealing against the decision\n8. **Enforcement stage**: Proceedings to enforce the judgment are underway", delay: 1800 },
                { text: "\n\n**Next Steps Recommendation**\n\nMay I ask:\n1. Do you have your case number?\n2. What specific information do you wish to check (e.g., hearing date, case status, whether the other party has filed a defence)?\n\nWith this information, I can guide you to the quickest enquiry method.", delay: 1200 }
              ];

            case 'labour_dept_referral':
              return [
                { text: 'Hello, thank you for contacting the Labour Tribunal Online Commencement system. I understand you were referred by the Labour Department, which indicates that your case may have completed or be undergoing conciliation procedures at the Labour Department.\n\n**Step 1: Confirm Conciliation Status**\n\nHave you already obtained a "Certificate of Unsuccessful Conciliation"?\n\n```OPTIONS\n[\n  { "label": "Yes, I have the certificate", "value": "I have obtained the certificate of unsuccessful conciliation" },\n  { "label": "Not yet obtained", "value": "I have not obtained the certificate of unsuccessful conciliation" },\n  { "label": "Not sure", "value": "I am not sure" }\n]\n```', delay: 1200 },
                { text: 'Understood. To prepare your claim documents, I need to collect some basic information.\n\n**Step 2: Basic Information Collection**\n\nWhat is your claim type?\n\n```OPTIONS\n[\n  { "label": "Unpaid wages", "value": "My claim is unpaid wages" },\n  { "label": "Termination benefits", "value": "My claim is termination benefits" },\n  { "label": "Other labour dispute", "value": "My claim is other labour dispute" }\n]\n```', delay: 1500 },
                { text: 'Received. Now I need to confirm the claim time limit.\n\n**Step 3: Claim Time Limit Confirmation**\n\nWhen did you obtain the "Certificate of Unsuccessful Conciliation"?\n\n```OPTIONS\n[\n  { "label": "Less than 1 month ago", "value": "Less than 1 month ago" },\n  { "label": "1 to 3 months ago", "value": "1 to 3 months ago" },\n  { "label": "3 to 6 months ago", "value": "3 to 6 months ago" },\n  { "label": "Over 6 months ago", "value": "Over 6 months ago" }\n]\n```', delay: 1800 },
                { text: 'Received. Please provide the Labour Department referral number (format: LD/2024/12345). This helps verify your conciliation record.\n\nIf you don\'t have a number, please simply tell me "none".', delay: 2000 },
                { text: 'Received. Now I need to confirm if you have prepared the relevant documents.\n\n**Step 4: Document Preparation Confirmation**\n\nFor referred cases, in addition to standard claim documents, please also prepare:\n✓ Labour Department "Certificate of Unsuccessful Conciliation"\n✓ Labour Department conciliation records (if available)\n✓ Copies of documents submitted during conciliation\n\nHave you prepared these documents?\n\n```OPTIONS\n[\n  { "label": "All prepared", "value": "I have prepared all referral documents" },\n  { "label": "Some prepared", "value": "I have prepared some referral documents" },\n  { "label": "Not yet prepared", "value": "I have not prepared referral documents yet" }\n]\n```', delay: 2000 },
                { text: 'Received. Let me summarize the claim process and arrange the next steps.\n\n**Step 5: Claim Summary and Appointment Arrangement**\n\nBased on the Labour Department referral, your claim has the following characteristics:\n\n📋 **Claim Fees**:\nCases with unsuccessful conciliation may qualify for reduced or waived claim fees. Please enquire with Registry staff when submitting your claim.\n\n📄 **Hearing Arrangements**:\n• Referred cases may receive priority handling\n• The Presiding Officer will refer to Labour Department conciliation records\n• If the employer was absent from conciliation, the court may draw appropriate inferences\n\n⚠️ **Important Time Limit Reminder**:\nAfter obtaining the conciliation certificate, you must file a claim with the Tribunal within 6 months. Please ensure your claim is not time-barred.\n\nHow would you like to proceed?\n\n```OPTIONS\n[\n  { "label": "📅 Book appointment at Tribunal to submit claim", "value": "I want to book appointment at Tribunal to submit claim" },\n  { "label": "📝 Learn more about claim fees", "value": "I want to learn more about claim fees" },\n  { "label": "🔄 Modify previously provided information", "value": "I want to modify previously provided information" }\n]\n```', delay: 3000 },
                { text: 'Understood. Now I will arrange an appointment at the Labour Tribunal for you.\n\n**Appointment Arrangement**\n\n📍 **Address**: Labour Tribunal Registry, 38 Gascoigne Road, Yau Ma Tei, Kowloon\n📞 **Appointment Phone**: 2625 0056 (24-hour telephone booking system)\n\n📅 **Items to bring on appointment day**:\n✓ Hong Kong Identity Card\n✓ Labour Department referral number\n✓ "Certificate of Unsuccessful Conciliation"\n✓ All supporting documents (originals and copies)\n✓ Conciliation records (if available)\n\n⏰ **Office Hours**: Monday to Friday 8:45am to 1:00pm, 2:00pm to 5:30pm\n\nAn investigating officer will meet with you on the appointment day to assist you in drafting Form 1 and Form 2. After signing, the system will arrange a hearing date for you.\n\nDo you need any other assistance?\n\n```OPTIONS\n[\n  { "label": "✓ Complete, thank you", "value": "Complete, thank you" },\n  { "label": "❓ Other questions", "value": "I have other questions" }\n]\n```', delay: 2500 },
                { text: 'Thank you for using our service. If you need further assistance, please call the Labour Tribunal Registry: 2625 0020.\n\nWe wish you a successful claim!', delay: 1200 }
              ];

            default:
              return [
                { text: "Hello, welcome to the Labour Tribunal Online Commencement system. I am your procedural guidance assistant, specializing in helping you understand the Labour Tribunal claims process.", delay: 800 },
                { text: "\n\n**System Introduction**\n\nThis system is designed to assist the public with:\n• Understanding Labour Tribunal claim eligibility and procedures\n• Preparing documents and information required for claims\n• Grasping important statutory time limits\n• Obtaining information about case progress\n\nPlease note: This system provides procedural guidance only and does not constitute legal advice. For legal advice specific to your case, please consult a qualified legal professional.", delay: 1500 },
                { text: "\n\n**Labour Tribunal Introduction**\n\nThe Labour Tribunal is a specialized court under the Judiciary that handles claims between employers and employees, including:\n• Wages, salary, commission, and bonuses\n• Termination notice payments and payment in lieu of notice\n• Severance payments and long service payments\n• Annual leave pay, sickness allowance, and other statutory benefits\n• Compensation for unreasonable or unlawful dismissal\n\nAddress: 38 Gascoigne Road, Yau Ma Tei, Kowloon\nTelephone: 2625 0020", delay: 1500 },
                { text: "\n\n**Common Enquiry Categories**\n\nWhich of the following areas would you like to know more about?\n\n1. How to claim unpaid wages from employer\n2. Claims procedures and document preparation\n3. Checking case progress\n4. Labour Department referral procedures\n\nPlease enter your question directly or select one of the above categories, and I will provide you with detailed guidance.\n\n(Note: Appointment arrangement will be at the final step of the claims process)", delay: 1200 }
              ];
          }
        }
      };

      // Get all possible messages for this scenario
      const allMessages = getScenarioResponses(scenario, langPref);
      debugLog(`[DEBUG] Total messages in workflow: ${allMessages.length}`);

      // Reset questionIndex if it exceeds available messages (stale session)
      if (session.questionIndex >= allMessages.length) {
        debugLog(`[DEBUG] Resetting questionIndex from ${session.questionIndex} to 0 (exceeded ${allMessages.length} messages)`);
        session.questionIndex = 0;
        session.answers = [];
      }

      // Determine which message to send based on questionIndex
      // questionIndex 0 = greeting + first question (message 0)
      // questionIndex 1 = after first answer (message 1)
      // ...
      // questionIndex 11 = after 11th answer (message 11)
      // questionIndex 12+ = all done, keep showing final message (message 11)
      let responseIndex = 0;
      if (session.questionIndex === 0) {
        // First interaction - send greeting (index 0)
        responseIndex = 0;
      } else if (session.questionIndex < allMessages.length) {
        // Send next question (index matches questionIndex)
        responseIndex = session.questionIndex;
      } else {
        // All questions answered - send final summary (last message)
        responseIndex = allMessages.length - 1;
      }

      debugLog(`[DEBUG] Sending message at index ${responseIndex} (questionIndex=${session.questionIndex})`);
      const messageToSend = allMessages[responseIndex] || allMessages[allMessages.length - 1];
      
      // Specific debug for Step 7 (index 8)
      if (responseIndex === 8) {
        debugLog(`[DEBUG] *** SENDING STEP 7: 證明文件上傳 ***`);
      }
      
      // Map response index to logical step number for progress indicator
      // Index: 0=Step1, 1=Step2, 2=Step3, 3=Step4, 4=Step5, 5-8=Step6, 9=Step7, 10=Step8, 11=Final
      const indexToStep = [1, 2, 3, 4, 5, 6, 6, 6, 6, 7, 8, 8];
      const logicalStep = indexToStep[responseIndex] || 1;
      
      debugLog(`[DEBUG] Sending message at index ${responseIndex} = Step ${logicalStep}`);
      
      // Append step number metadata to message for client progress tracking
      const messageWithStep = `[STEP:${logicalStep}/8]${messageToSend.text}`;
      
      debugLog('[SERVER] Message contains OPTIONS:', messageToSend.text.includes('OPTIONS'));
      debugLog('[SERVER] Message length:', messageToSend.text.length);

      // Stream single message - send entire message as one chunk to preserve OPTIONS
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      try { res.flushHeaders(); } catch {}

      // Send entire message as one chunk to avoid splitting OPTIONS blocks
      // Include step metadata at beginning for client progress tracking
      res.write(messageWithStep);
      try { res.end(); } catch {}
      return;
    }

    const OPENAI_BASE = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions';
    const MODEL = model || process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

    // Prepare request body for OpenAI ChatCompletion streaming
    // Add a system instruction to focus responses on Hong Kong Labour Tribunal intake
    const langPref = (typeof lang === 'string' && lang.toLowerCase().startsWith('en')) ? 'en' : 'zh';
    const systemPrompt = `You are an expert procedural assistant for Hong Kong Labour Tribunal intake and case commencement. Follow these rules strictly:

  1) Language & tone: Respond in ${langPref === 'en' ? 'English' : 'Traditional Chinese'}, using a formal, neutral, and clear government-style tone appropriate for tribunal intake guidance.
  2) Purpose: Provide procedural steps the user must take to commence or progress a Labour Tribunal claim. Include statutory time limits, typical forms, and commonly required supporting documents (for example: payslips, employment contract, correspondence).
  3) Clarifying questions: If crucial details are missing, ask up to two concise clarifying questions (for example: exact termination date, wage amounts, employer name).
  4) No legal advice: Do NOT give legal opinions. State facts and procedural instructions only. When citing official sources, prefer exact page or document titles from the Judiciary or Labour Department and mark them as references.
  5) Structured next steps: At the end of the response include a fenced JSON code block labelled NEXT_STEPS containing an array of step objects. Each step object should include: {"title":"...","description":"...","urgency":"low|medium|high","documents":["..."]}. Example:
  \`\`\`NEXT_STEPS
  [ { "title": "Begin claim intake", "description": "Fill in form X and submit basic case facts.", "urgency": "high", "documents": ["payslips","contract"] } ]
  \`\`\` 
  If for any reason you cannot produce valid JSON, include a clearly labeled numbered list under the heading "Suggested next steps:".

  End of instructions.`;

    const payload = {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      stream: true,
    };

    try {
      // ensure a fetch implementation is available (Node 18+). If not, try dynamic import of node-fetch.
      let fetchImpl: any = (globalThis as any).fetch;
      if (!fetchImpl) {
        try {
          const nf = await import('node-fetch');
          fetchImpl = nf.default ?? nf;
        } catch (e) {
          console.error('Fetch not available and node-fetch import failed', e);
          res.status(500).json({ error: 'Server fetch not available. Use Node 18+ or install node-fetch' });
          return;
        }
      }

      const upstream = await fetchImpl(OPENAI_BASE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!upstream.ok || !upstream.body) {
        // try non-stream fallback (JSON) if available
        const txt = await upstream.text().catch(() => null);
        res.status(upstream.status).json({ error: txt || 'Upstream error' });
        return;
      }

      // Stream plain text chunks to client (no SSE wrapper) so client can append directly
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      // flush headers if supported
      try { res.flushHeaders(); } catch {}

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // OpenAI streaming uses SSE-style `data: ...\n\n` events — extract full events
        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
          const part = buffer.slice(0, boundary).trim();
          buffer = buffer.slice(boundary + 2);

          // lines may contain multiple data: entries; process each
          const lines = part.split(/\r?\n/);
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (trimmed === 'data: [DONE]' || trimmed === 'data:[DONE]') {
              // signal complete and end stream
              try { res.end(); } catch {}
              return;
            }

            // expect `data: {...}`
            const m = trimmed.match(/^data:\s*(.*)$/);
            if (!m) continue;
            const payloadStr = m[1];
            try {
              const payloadObj = JSON.parse(payloadStr);
              const delta = payloadObj.choices && payloadObj.choices[0] && payloadObj.choices[0].delta;
              const text = delta && delta.content ? delta.content : null;
              if (text) {
                // write plain text chunk to client
                res.write(text);
              }
            } catch (e) {
              // if parse fails, just attempt to forward raw part
              try { res.write(payloadStr); } catch {}
            }
          }

          boundary = buffer.indexOf('\n\n');
        }
      }

      // stream ended
      try { res.end(); } catch {}
      return;
    } catch (err: any) {
      console.error('chat proxy error', err?.message || err);
      res.status(500).json({ error: String(err?.message || err) });
      return;
    }
  });

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 4000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
