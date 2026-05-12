import React, { useEffect } from 'react';
import { Printer, X } from 'lucide-react';
import { homeTypography } from '../const';

interface Form2PreviewModalProps {
  language: 'zh' | 'en';
  onClose: () => void;
}

const T = {
  zh: {
    modalTitle: '表格2草稿預覽',
    printBtn: '列印',
    rules: '《勞資審裁處（表格）規則》',
    schedule: '附表',
    cap: '第25C章',
    ruleRef: '〔第3條〕',
    formNo: '表格2',
    formTitle: '申索陳述書',
    subtitle: '〔採用表格1所載標題〕',
    toDefendant: '致被告人',
    partA: '1. 申索的理由如下：',
    partB: '2. 申索款額計算如下：',
    grounds: '申索人受僱於被告任職侍應生。申索人稱被告未有支付2026年3月份工資港幣12,000元，並欠付固定津貼港幣3,000元。申索人並主張上述固定津貼屬工資一部分，應計入法定權益的計算基礎。',
    calculation: '欠薪........................................港幣 12,000.00\n固定津貼....................................港幣  3,000.00\n總額........................................港幣 15,000.00',
    dateText: '日期：2026年4月18日',
    filedText: '此申索書已於2026年4月18日提交登記。',
    registrar: '登記主任',
    seal: '〔印章〕',
    note: '註：',
    noteText: '本表格須載列申索的理由及申索款額的計算方法。申索人應提供足夠詳情，使被告人知悉須回應的申索內容。',
    draftNote: '（草擬內容，格式依官方樣版整理，仍須經審裁處核實及簽署）',
  },
  en: {
    modalTitle: 'Form 2 Draft Preview',
    printBtn: 'Print',
    rules: 'Labour Tribunal (Forms) Rules',
    schedule: 'Schedule',
    cap: 'Cap. 25C',
    ruleRef: '[rule 3]',
    formNo: 'Form 2',
    formTitle: 'FORM OF CLAIM',
    subtitle: '[title as in Form 1]',
    toDefendant: 'To the Defendant',
    partA: '1. The grounds for the claim are:',
    partB: '2. The amount of claim is calculated as follows:',
    grounds: 'The claimant was employed by the defendant as a waiter. The claimant says that wages for March 2026 in the sum of HK$12,000 remain unpaid and that a fixed monthly allowance of HK$3,000 is also outstanding. The claimant further contends that the allowance forms part of wages for the purposes of statutory entitlements.',
    calculation: 'Unpaid wages.................................HK$ 12,000.00\nFixed allowance...............................HK$  3,000.00\nTotal.........................................HK$ 15,000.00',
    dateText: 'Dated this 18th day of April 2026.',
    filedText: 'Filed in the registry on 18 April 2026.',
    registrar: 'Registrar',
    seal: '[L.S.]',
    note: 'Note:',
    noteText: 'This form should set out the grounds of claim and the manner in which the amount claimed is calculated. Sufficient particulars should be given to inform the defendant of the case to be answered.',
    draftNote: '(Draft adapted to the official template structure and still subject to Tribunal verification and signature.)',
  },
};

export default function Form2PreviewModal({ language, onClose }: Form2PreviewModalProps) {
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
      <div className="bg-white rounded-2xl shadow-2xl w-full flex flex-col" style={{ maxWidth: '1120px', maxHeight: '92vh' }} onMouseDown={e => e.stopPropagation()}>
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
          <div id="form2-print" className="mx-auto bg-white border border-slate-300 shadow-[0_20px_50px_rgba(15,23,42,0.10)]" style={{ width: '100%', maxWidth: '210mm', minHeight: '297mm' }}>
            <div className="px-[18mm] pt-[14mm] pb-[14mm] text-slate-900" style={{ fontFamily: '"Noto Serif TC", "Times New Roman", serif' }}>
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
                <p className="mt-4 text-[20px] font-semibold uppercase">{t.formTitle}</p>
                <p className="mt-4 text-[15px]">{t.subtitle}</p>
              </div>

              <div className="mt-10 text-[15px] leading-[2.05]">
                <p className="font-semibold">{t.toDefendant}</p>

                <div className="mt-6">
                  <p className="font-semibold">(a) {t.partA}</p>
                  <div className="mt-3 min-h-[100px] border border-slate-300 px-4 py-3 whitespace-pre-line">{t.grounds}</div>
                </div>

                <div className="mt-8">
                  <p className="font-semibold">(b) {t.partB}</p>
                  <div className="mt-3 min-h-[92px] border border-slate-300 px-4 py-3 whitespace-pre-line">{t.calculation}</div>
                </div>

                <div className="mt-10 space-y-5 text-[14px]">
                  <p>{t.dateText}</p>
                  <p>{t.filedText}</p>
                  <div className="flex items-end justify-between pt-8">
                    <div className="w-[180px] border-b border-slate-400"></div>
                    <span>{t.registrar}</span>
                  </div>
                  <p className="text-right">{t.seal}</p>
                </div>

                <div className="mt-12 border-t border-slate-400 pt-5 text-[13px] leading-[1.85]">
                  <p><span className="font-semibold mr-2">{t.note}</span>{t.noteText}</p>
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
