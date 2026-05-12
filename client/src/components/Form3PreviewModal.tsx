import React, { useEffect } from 'react';
import { Printer, X } from 'lucide-react';
import { homeTypography } from '../const';

interface Form3PreviewModalProps {
  language: 'zh' | 'en';
  onClose: () => void;
}

const T = {
  zh: {
    modalTitle: '表格3草稿預覽',
    printBtn: '列印',
    statuteRef: '[ 條例第 13 條 ]',
    rules: '勞資審裁處條例',
    chapter: '( 第 25 章 )',
    formNo: '表格 3',
    formTitle: '聆訊日期地點通知書',
    subtitle: '[陳大文 訴 XYZ 餐廳有限公司]',
    toDefendant: '致被告人︰',
    line1: '此宗申索是由申索人針對你而提出的，將於 2026 年 6 月',
    line2: '15 日 * 下 午 2 時 30 分，在 九龍加士居道36號勞資審裁處第2聆訊室',
    line3: '勞資審裁處由審裁官 李國良 主持聆訊，特此通知。',
    line4: '又如你不依照上述時間地點出席，審裁處會在你缺席的情況下',
    line5: '聆訊此宗申索，並在你缺席的情況下作出其認為適當的裁斷或命令，',
    line6: '特此通知。',
    dated: '日期︰2026 年 5 月 12 日',
    serviceLine: '(a) 本人已將此通知書及申索書副本於 2026 年 5 月',
    serviceLine2: '20 日，在 九龍尖沙咀彌敦道100號10樓 送達 XYZ 餐廳有限公司 。',
    recipientSig: '(申索書及通知書收件人簽署 )',
    serverSig: '(法律程序文件送達人簽署 )',
    starNote: '* 請將不適用者刪去。',
    note: '註︰ (a) 此等文件的送達須按照《勞資審裁處條例》第 13(2) 條所',
    note2: '規定的方式完成。',
    amendment: '(2014年第 20號第 19條 )',
  },
  en: {
    modalTitle: 'Form 3 Draft Preview',
    printBtn: 'Print',
    statuteRef: '[s. 13]',
    rules: 'Labour Tribunal Ordinance',
    chapter: '(Chapter 25)',
    formNo: 'Form 3',
    formTitle: 'NOTICE OF PLACE AND DAY FIXED FOR HEARING',
    subtitle: '[CHAN Tai Man v. XYZ Restaurant Limited]',
    toDefendant: 'To the Defendant.',
    line1: 'Take Notice that this claim has been made by the claimant against',
    line2: 'you and will be heard at a tribunal to be held at Hearing Room 2, Labour Tribunal,',
    line3: '36 Gascoigne Road, Kowloon before Lee Kwok Leung, Presiding Officer, on the',
    line4: '15th day of June 2026, at 2:30 p.m.',
    line5: 'And Take Notice that if you do not attend at the time and place',
    line6: 'mentioned, the claim will be heard in your absence and such award or',
    line7: 'order may be made in your absence as the tribunal thinks fit.',
    dated: 'Dated this 12th day of May 2026',
    registrar: 'Registrar',
    seal: 'L.S.',
    serviceLine1: '(a) This notice and a copy of the claim was served by me on',
    serviceLine2: 'XYZ Restaurant Limited at 10/F, 100 Nathan Road, Tsim Sha Tsui, Kowloon on the 20th day',
    serviceLine3: 'of May 2026.',
    recipientSig: '(Signature of recipient of claim and notice)',
    serverSig: '(Signature of process server)',
    starNote: '* Delete whichever is not applicable.',
    note: 'Note: (a) Service shall be effected in accordance with section 13(2) of',
    note2: 'the Labour Tribunal Ordinance.',
    amendment: '(L.N. 125 of 1995; 20 of 2014 s. 19)',
  },
};

export default function Form3PreviewModal({ language, onClose }: Form3PreviewModalProps) {
  const t = T[language];
  const zhText = T.zh;
  const enText = T.en;

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
          <div id="form3-print" className="mx-auto bg-white border border-slate-300 shadow-[0_20px_50px_rgba(15,23,42,0.10)]" style={{ width: '100%', maxWidth: '210mm', minHeight: '297mm' }}>
            <div className="px-[18mm] pt-[14mm] pb-[14mm] text-slate-900" style={{ fontFamily: '"Noto Serif TC", "Times New Roman", serif' }}>
              {language === 'zh' ? (
                <div className="text-[15px] leading-[2.1] text-slate-950">
                  <div className="text-center leading-8">
                    <p className="text-[20px] font-semibold">{zhText.formNo}</p>
                    <p className="text-[14px]">{zhText.statuteRef}</p>
                    <p className="mt-3 text-[18px]">{zhText.rules}</p>
                    <p className="text-[16px]">{zhText.chapter}</p>
                    <p className="mt-5 text-[22px] font-semibold">{zhText.formTitle}</p>
                    <p className="mt-3 text-[15px] font-semibold">{zhText.subtitle}</p>
                  </div>

                  <div className="mt-10">
                    <p className="font-semibold">{zhText.toDefendant}</p>
                    <div className="mt-5 space-y-1">
                      <p>
                        此宗申索是由申索人針對你而提出的，將於 <span className="font-semibold">2026 年 6 月</span>
                      </p>
                      <p>
                        <span className="font-semibold">15 日 * 下 午 2 時 30 分，在 九龍加士居道36號勞資審裁處第2聆訊室</span>
                      </p>
                      <p>
                        勞資審裁處由審裁官 <span className="font-semibold">李國良</span> 主持聆訊，特此通知。
                      </p>
                      <p className="mt-4">{zhText.line4}</p>
                      <p>{zhText.line5}</p>
                      <p>{zhText.line6}</p>
                    </div>

                    <p className="mt-8">
                      日期︰<span className="font-semibold">2026 年 5 月 12 日</span>
                    </p>

                    <div className="mt-12 space-y-1 text-[14px]">
                      <p>{zhText.serviceLine}</p>
                      <p>
                        <span className="font-semibold">20 日，在 九龍尖沙咀彌敦道100號10樓 送達 XYZ 餐廳有限公司</span> 。
                      </p>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-10 text-center text-[14px]">
                      <div>
                        <div className="mx-auto w-full border-b border-slate-500"></div>
                        <p className="mt-2">{zhText.recipientSig}</p>
                      </div>
                      <div>
                        <div className="mx-auto w-full border-b border-slate-500"></div>
                        <p className="mt-2">{zhText.serverSig}</p>
                      </div>
                    </div>

                    <div className="mt-8 text-[13px] leading-[1.95]">
                      <p>{zhText.starNote}</p>
                      <p className="mt-3">{zhText.note}</p>
                      <p>{zhText.note2}</p>
                      <p className="mt-4 text-center">{zhText.amendment}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-[15px] leading-[2.05] text-slate-950">
                  <div className="text-center leading-8">
                    <p className="text-[20px] font-semibold">{enText.formNo}</p>
                    <p className="text-[14px]">{enText.statuteRef}</p>
                    <p className="mt-3 text-[18px]">{enText.rules}</p>
                    <p className="text-[16px]">{enText.chapter}</p>
                    <p className="mt-5 text-[22px] font-semibold">{enText.formTitle}</p>
                    <p className="mt-3 text-[15px] font-semibold">{enText.subtitle}</p>
                  </div>

                  <div className="mt-10">
                    <p className="font-semibold">{enText.toDefendant}</p>
                    <div className="mt-5 space-y-1">
                      <p>{enText.line1}</p>
                      <p>
                        you and will be heard at a tribunal to be held at <span className="font-semibold">Hearing Room 2, Labour Tribunal,</span>
                      </p>
                      <p>
                        <span className="font-semibold">36 Gascoigne Road, Kowloon</span> before <span className="font-semibold">Lee Kwok Leung</span>, Presiding Officer, on the
                      </p>
                      <p>
                        <span className="font-semibold">15th day of June 2026, at 2:30 p.m.</span>
                      </p>
                      <p className="mt-4">{enText.line5}</p>
                      <p>{enText.line6}</p>
                      <p>{enText.line7}</p>
                    </div>

                    <p className="mt-8">
                      Dated this <span className="font-semibold">12th day of May 2026</span>
                    </p>

                    <div className="mt-6 text-[14px]">
                      <p>{enText.registrar}</p>
                      <p>{enText.seal}</p>
                    </div>

                    <div className="mt-12 space-y-1 text-[14px]">
                      <p>{enText.serviceLine1}</p>
                      <p>
                        <span className="font-semibold">XYZ Restaurant Limited at 10/F, 100 Nathan Road, Tsim Sha Tsui, Kowloon on the 20th day</span>
                      </p>
                      <p>
                        <span className="font-semibold">of May 2026.</span>
                      </p>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-10 text-center text-[14px]">
                      <div>
                        <div className="mx-auto w-full border-b border-slate-500"></div>
                        <p className="mt-2">{enText.recipientSig}</p>
                      </div>
                      <div>
                        <div className="mx-auto w-full border-b border-slate-500"></div>
                        <p className="mt-2">{enText.serverSig}</p>
                      </div>
                    </div>

                    <div className="mt-8 text-[13px] leading-[1.95]">
                      <p>{enText.starNote}</p>
                      <p className="mt-3">{enText.note}</p>
                      <p>{enText.note2}</p>
                      <p className="mt-4 text-center">{enText.amendment}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
