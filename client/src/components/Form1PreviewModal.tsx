import React, { useEffect } from 'react';
import { Printer, X } from 'lucide-react';
import { homeTypography } from '../const';

interface Form1PreviewModalProps {
  language: 'zh' | 'en';
  onClose: () => void;
}

const T = {
  zh: {
    modalTitle: '表格1草稿預覽',
    printBtn: '列印',
    rules: '《勞資審裁處（表格）規則》',
    schedule: '附表',
    cap: '第25C章',
    ruleRef: '〔第2條〕',
    formNo: '表格1',
    ordinance: '勞資審裁處條例（第25章）',
    title: '申索書標題：通用表格',
    claimNo: '申索書編號：',
    claimant: '申索人',
    defendant: '被告人',
    and: '及',
    note: '註：',
    noteA: '填上每一申索人的全名及地址；如屬代表申索，則須填上每名被代表人的姓名及地址。',
    noteB: '填上每一被告人的全名及地址。',
    amendedRef: '（2014年第20號第19條）',
    claimantLine: '陳大文，九龍土瓜灣馬頭圍道88號12樓A室',
    defendantLine: 'XYZ 餐廳有限公司，九龍尖沙咀廣東道218號地下及閣樓',
    draftNote: '（草擬內容，格式依官方樣版整理，仍須經審裁處核實及簽署）',
  },
  en: {
    modalTitle: 'Form 1 Draft Preview',
    printBtn: 'Print',
    rules: 'Labour Tribunal (Forms) Rules',
    schedule: 'Schedule',
    cap: 'Cap. 25C',
    ruleRef: '[rule 2]',
    formNo: 'Form 1',
    ordinance: 'Labour Tribunal Ordinance (Chapter 25)',
    title: 'TITLE TO CLAIM: GENERAL FORM',
    claimNo: 'Claim No.',
    claimant: 'Claimant(s)',
    defendant: 'Defendant(s)',
    and: 'and',
    note: 'Note:',
    noteA: 'Insert full name and address of each claimant and, in the case of a representative claim, the name and address of each person represented.',
    noteB: 'Insert full name and address of each defendant.',
    amendedRef: '(L.N. 125 of 1995; 20 of 2014 s. 19)',
    claimantLine: 'CHAN Tai Man, Flat A, 12/F, 88 Ma Tau Wai Road, Kowloon',
    defendantLine: 'XYZ Restaurant Limited, G/F and Cockloft, 218 Canton Road, Tsim Sha Tsui, Kowloon',
    draftNote: '(Draft adapted to the official template structure and still subject to Tribunal verification and signature.)',
  },
};

export default function Form1PreviewModal({ language, onClose }: Form1PreviewModalProps) {
  const t = T[language];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full flex flex-col"
        style={{ maxWidth: '1120px', maxHeight: '92vh' }}
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0 rounded-t-2xl" style={{ background: '#f8fafc' }}>
          <h3 className={homeTypography.sectionHeading}>{t.modalTitle}</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className={`flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors ${homeTypography.button}`}>
              <Printer className="w-5 h-5" />
              {t.printBtn}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="bg-[#eef1f5] p-6 md:p-8 overflow-y-auto">
          <div id="form1-print" className="mx-auto bg-white border border-slate-300 shadow-[0_20px_50px_rgba(15,23,42,0.10)]" style={{ width: '100%', maxWidth: '210mm', minHeight: '297mm' }}>
            <div className="px-[18mm] pt-[14mm] pb-[12mm] text-slate-900" style={{ fontFamily: '"Noto Serif TC", "Times New Roman", serif' }}>
              <div className="grid grid-cols-[1fr_auto_1fr] items-end text-[12px] leading-5">
                <div>
                  <p>{t.rules}</p>
                  <div className="mt-1 border-b border-slate-900"></div>
                </div>
                <div className="px-8 text-center">{t.schedule}</div>
                <div>
                  <p className="text-right">{t.cap}</p>
                  <div className="mt-1 border-b border-slate-900"></div>
                </div>
              </div>

              <div className="mt-8 text-center leading-8">
                <p className="text-[22px] font-semibold">{t.schedule}</p>
                <p className="text-[14px]">{t.ruleRef}</p>
                <p className="mt-4 text-[18px]">{t.formNo}</p>
                <p className="mt-2 text-[18px]">{t.ordinance}</p>
                <p className="mt-5 text-[20px] font-semibold">{t.title}</p>
              </div>

              <div className="mt-10 text-[15px] leading-[2.1]">
                <div className="flex items-end justify-center gap-3">
                  <span>{t.claimNo}</span>
                  <span className="inline-block min-w-[230px] border-b border-dotted border-slate-500 text-center">LBTC 0148 / 2026</span>
                </div>

                <div className="mt-8 grid grid-cols-[38px_1fr_auto] items-end gap-3">
                  <span className="font-semibold">(a)</span>
                  <span className="border-b border-dotted border-slate-500 px-2 pb-1">{t.claimantLine}</span>
                  <span>{t.claimant}</span>
                </div>

                <div className="my-3 text-center">{t.and}</div>

                <div className="grid grid-cols-[38px_1fr_auto] items-end gap-3">
                  <span className="font-semibold">(b)</span>
                  <span className="border-b border-dotted border-slate-500 px-2 pb-1">{t.defendantLine}</span>
                  <span>{t.defendant}</span>
                </div>

                <div className="mt-8 text-[13px] leading-[1.85]">
                  <p><span className="font-semibold mr-2">{t.note}</span>(a) {t.noteA}</p>
                  <p className="ml-8 mt-1">(b) {t.noteB}</p>
                  <p className="mt-3 text-right italic">{t.amendedRef}</p>
                </div>

                <div className="mt-10 text-center text-[13px] italic text-slate-500">{t.draftNote}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
