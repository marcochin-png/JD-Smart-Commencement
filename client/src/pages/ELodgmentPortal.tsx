import { useState, useEffect } from 'react';
import { RefreshCw, HelpCircle, CheckCircle, Menu, X, Globe, Type } from 'lucide-react';
import { handleFontControlClick, initializeTextSize } from '../lib/accessibility';
import AppShellHeader from '../components/layout/AppShellHeader';

type Step = 'tnc' | 'form' | 'success';

export default function ELodgmentPortal() {
  const [step, setStep] = useState<Step>('tnc');
  const [language, setLanguage] = useState<'zh' | 'en'>('en');
  const [trn, setTrn] = useState('');
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get language from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang');
    if (lang === 'en' || lang === 'zh') {
      setLanguage(lang);
    }
  }, []);

  // Initialize text size on mount
  useEffect(() => {
    initializeTextSize();
  }, []);

  const handleBackToHome = () => {
    const params = new URLSearchParams(window.location.search);
    window.location.href = `/?${params.toString()}`;
  };

  const handleAcceptTNC = () => {
    setStep('form');
  };

  return (
    <>
      <div className="page-shell">
        <AppShellHeader
          brandEyebrow={language === 'zh' ? '司法機構 勞資審裁處' : 'JUDICIARY LABOUR TRIBUNAL'}
          brandTitle={language === 'zh' ? '電子提交平台' : 'e-Lodgment Platform'}
          language={language}
          onToggleLanguage={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
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
                      setLanguage(language === 'zh' ? 'en' : 'zh');
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

        <main style={{
          background: '#F0F5FA',
          minHeight: 'calc(100vh - 6.25rem)',
          padding: '2rem 1rem'
        }}>
          <div style={{
            maxWidth: '1100px',
            margin: '0 auto'
          }}>
            {step === 'tnc' ? (
              <TermsAndConditions onAccept={handleAcceptTNC} language={language} />
            ) : step === 'form' ? (
              <SubmissionForm language={language} setStep={setStep} setTrn={setTrn} setSubmissionData={setSubmissionData} />
            ) : (
              <SuccessView language={language} trn={trn} submissionData={submissionData} onBackToHome={handleBackToHome} />
            )}
          </div>
        </main>
      </div>
    </>
  );
}

function TermsAndConditions({ onAccept, language }: { onAccept: () => void; language: 'zh' | 'en' }) {
  return (
    <>
      {/* Introductory Notes Section */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        marginBottom: '1.5rem',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#5074ab',
          color: '#ffffff',
          padding: '0.75rem 1rem',
          fontSize: '1rem',
          fontWeight: 600,
          fontFamily: 'Noto Sans TC, sans-serif'
        }}>
          {language === 'zh' ? '使用須知簡介' : 'Introductory Notes'}
        </div>
        <div style={{ padding: '1.5rem' }}>
          <ol style={{
            margin: 0,
            paddingLeft: '1.5rem',
            fontSize: '0.875rem',
            lineHeight: '1.7',
            color: '#1A202C',
            fontFamily: 'Noto Sans TC, sans-serif'
          }}>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '因應公共衞生考慮，法庭聆訊一般是延期的。為便利在延期期間及延期結束後向法院提交文件，司法機構設立「電子提交平台」（下稱「平台」），使案件訴訟方如有法庭的指示，可透過電子方式向高等法院（包括上訴法庭及原訟法庭）、區域法院、家事法庭和土地審裁處提交下述文件及文件冊：' : 'In view of public health considerations, there is a general adjournment of Court proceedings. To facilitate submission of documents to the Court during and after the adjourned period, the Judiciary sets up an "E-Lodgement Platform" ("Platform"), which enables case parties to submit the following documents and bundles to the High Court (including the Court of Appeal and the Court of First Instance), the District Court, the Family Court and the Lands Tribunal through electronic means, if so directed by the Court:'}
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>{language === 'zh' ? '陳詞（包括論點綱要、開案陳詞和結案陳詞）；' : 'submissions (including skeleton arguments, opening submissions and closing submissions);'}</li>
                <li>{language === 'zh' ? '案例典據列表（須夾附所引述的案例典據）；' : 'list of authorities (annexed with authorities cited);'}</li>
                <li>{language === 'zh' ? '所有種類的聆訊文件冊；以及' : 'all types of hearing bundles; and'}</li>
                <li>{language === 'zh' ? '法庭指示的所有其他文件。' : 'any other documents as directed by the Court.'}</li>
              </ul>
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '上述法院各自平台的超連結如下：' : 'The hyperlink for the Platform of the respective levels of Court is as follows.'}
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>{language === 'zh' ? '高等法院: ' : 'High Court: '}https://e-services.judiciary.hk/elodgehc/</li>
                <li>{language === 'zh' ? '區域法院: ' : 'District Court: '}https://e-services.judiciary.hk/elodgedc/</li>
                <li>{language === 'zh' ? '家事法庭: ' : 'Family Court: '}https://e-services.judiciary.hk/elodgefc/</li>
                <li>{language === 'zh' ? '土地審裁處: ' : 'Lands Tribunal: '}https://e-services.judiciary.hk/elodgelt/</li>
                <li>{language === 'zh' ? '使用平台無需預先登記。提交文件方鍵入超連結即可進入平台。網頁內有指引，為提交文件方提供協助。' : 'No pre-registration is required for using the Platform. Submitting parties can key in the hyperlink and go to the Platform. On-line guidance will be provided to assist submitting parties.'}</li>
              </ul>
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '格式為「WORD」或「pdf」的文件及文件冊法庭都可以接受。「pdf」影像檔案的解像度最低限度須為300 dpi及黑白色或8-bit的色彩深度，以優化影像質素及檔案大小。如法庭指明提交文件的格式，請遵循有關的指示。' : 'Documents and bundles in the form of "WORD" or "pdf" format are both acceptable to the Court. Resolution of "pdf" image file shall be 300 dpi and in black and white or in 8-bit colour depth at a minimum to optimize image quality and file size. In the case that the Court specifies the format of submission, please act as directed.'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '平台可處理的文件檔案大小，每次上限為50MB（如「pdf」文件的解像度為300dpi及黑白色，即約1,000頁）。如文件檔案的大小超逾50MB，必須分批提交。網頁上有指引說明分批提交文件的步驟。' : 'The Platform can process an electronic submission at a size of up to 50MB (around 1,000 pages if the resolution of the "pdf" document is 300 dpi and in black and white). For submission at a size larger than 50MB, submitter would have to split the submission into batches. On-line guide is provided to illustrate the steps for batch submission.'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '有關的文件不得載有任何例如電腦病毒／惡意軟件；及巨集指令、簡短程式、連結和字段（視乎執行指令的環境，而電腦在執行這些指令、簡短程式、連結或字段時會令文件本身出現改變）的電腦指令。' : 'The documents should not contain any computer instructions such as computer viruses/malware; and macros, scripts, links and fields that depend on the execution environment and the execution of which will cause changes to the document itself.'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '除非法院主動或應申請而作出特定命令／指示，否則通過此平台提交上文第1段所述的文件及文件冊，不應被理解為已符合在適用的法例條文及／或相關實務指示下將之提交的規定。' : 'Submission of the documents and bundles (as mentioned in paragraph 1 above) via this Platform should not be construed as having satisfied the requirement(s) for lodging the same under applicable legislative provision(s) and/or relevant Practice Direction(s) ("PDs") save and except with specific order/direction of the Court either on its own motion or upon application.'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '在某些情況下，雖然可提交文件的複本供法庭考慮，但仍須按照法例規定，於法院登記處妥為存檔及繳付訂明費用（如有此規定）。' : 'In some instances, while copy of documents may be submitted for the consideration of the Court, it does not dispense with the legislative requirement for their proper filing at the Court Registry; and payment of prescribed fee if so required.'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '如情況需要，提交文件方須向法庭提供列印文本。實物文件／文件冊與電子文件／文件冊的內容應完全相同。如實物文件／文件冊與電子文件／文件冊中所包含的資料有任何不一致之處，以實物文件／文件冊的資料為準，除非法庭應申請而作出任何命令。' : 'When circumstances require, submitting parties are required to provide the Court with the hardcopies. Contents of both the physical documents/bundle(s) and the electronic documents/bundle(s) should be identical. In the case of any inconsistency between information contained in the physical documents/bundle(s) and that in the electronic documents/bundle(s), information in the physical documents/bundle(s) should prevail unless any order is made by the Court upon application.'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '若法院指示對PDF檔案使用光學字元識別（OCR），請為文件冊的各頁應用適當語言的OCR，使文本可供檢索及註釋。如文字中涉及中文及英文，請選擇「中文」。需要時請創建書籤。' : 'Should there be directions from the Court on the use of Optical Character Recognition ("OCR") for PDF files, please apply OCR with appropriate language for bundle pages to make the text searchable and annotatable. Select "Chinese" if both English and Chinese characters are involved. Please create bookmarks as when required.'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '若實物文件／文件冊需要作出修正或更換，電子文件／文件冊亦須作出相應的更改。提交經修訂的電子文件／文件冊時，應一併呈交附函說明有關的變動。' : 'If amendment(s) or replacement is/are to be made on the physical documents/bundle(s), corresponding changes to the electronic documents/bundle(s) would be required. For submission of amended electronic documents/bundle(s), a covering letter specifying the changes should be submitted together with the electronic documents/bundle(s).'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '提交文件方應在合適情況下或在法庭指示下遵從適用的法例條文及／或實務指示（包括提交文件的時間表）。' : 'Submitting parties should observe the applicable legislative provisions and/or PDs (including the timeline for submission) where appropriate, or as directed by the Court.'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '法庭在下午5時30分後收取的文件，一般會在下一個工作天處理。' : 'Documents received by the Court after 5:30 pm will normally be processed on the next working day.'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '文件及文件冊通過平台成功提交後，平台即時會發出事項參考編號（TRN）。提交文件方應保留此編號以作參考／查詢之用。此事項參考編號在文件提交後三個月內有效，可作查詢之用。' : 'A Transaction Reference Number ("TRN") will be provided right after successful submission of documents and bundles via the Platform. The submitting parties are advised to keep record of this number for reference/or enquiry. The TRN will hold valid for making enquiries within three months after the submission.'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '由於系統維護關係，平台的服務每天凌晨零時至四時暫停，系統暫停期間，不接受提交文件。' : 'For system maintenance, service of the Platform will be suspended daily between 00:00 a.m. and 06:00 a.m. No submission can be performed during the system suspension period.'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '如有任何查詢，請聯絡相關法官／司法常務官／聆案官的書記及／或法庭登記處，以尋求協助。如需技術支援，請以電郵方式聯絡司法機構的 網站管理員，電郵地址為webmaster@judiciary.hk。' : 'Should you have any enquiries, please contact respective clerk to Judge/Registrar/Master and/or Court Registry for assistance. For technical support, please contact Judiciary\'s Website Master through email (i.e. webmaster@judiciary.hk).'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '使用須知簡介的英文版本及中譯本如有差異，概以英文版本為準。' : 'In case of any discrepancies between the English version and the Chinese translation of this Introductory Notes, the English version shall prevail.'}
            </li>
            <li style={{ marginBottom: '0' }}>
              {language === 'zh' ? '由此平台收取文件的安排，在法庭程序恢復後會再作檢討，並將維持至另行通知為止。' : 'The arrangement for receiving documents via this Platform is subject to review upon resumption of Court proceedings and will remain in force until further notice.'}
            </li>
          </ol>
        </div>
      </div>

      {/* Disclaimer Section */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        marginBottom: '1.5rem',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#c0392b',
          color: '#ffffff',
          padding: '0.75rem 1rem',
          fontSize: '1rem',
          fontWeight: 600,
          fontFamily: 'Noto Sans TC, sans-serif'
        }}>
          {language === 'zh' ? '免責聲明' : 'Disclaimer'}
        </div>
        <div style={{ padding: '1.5rem' }}>
          <ol style={{
            margin: 0,
            paddingLeft: '1.5rem',
            fontSize: '0.875rem',
            lineHeight: '1.7',
            color: '#1A202C',
            fontFamily: 'Noto Sans TC, sans-serif'
          }}>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '司法機構設立「電子提交平台」（下稱「平台」），讓案件訴訟方可在法庭指示下，通過此平台以電子方式向高等法院（包括上訴法庭及原訟法庭）、區域法院、家事法庭及土地審裁處提交下述文件及文件冊：' : 'The Judiciary operates this "E-Lodgement Platform" ("Platform"), which provides a platform for case parties to submit the following documents and bundles to the High Court (including the Court of Appeal and the Court of First Instance), the District Court, the Family Court and the Lands Tribunal through electronic means, if so directed by the Court:'}
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>{language === 'zh' ? '陳詞（包括論點綱要、開案陳詞和結案陳詞）；' : 'submissions (including skeleton arguments, opening submissions and closing submissions);'}</li>
                <li>{language === 'zh' ? '案例典據列表（須夾附所引述的案例典據）；' : 'list of authorities (annexed with authorities cited);'}</li>
                <li>{language === 'zh' ? '所有種類的聆訊文件冊；以及' : 'all types of hearing bundles; and'}</li>
                <li>{language === 'zh' ? '法庭指示的所有其他文件。' : 'any other documents as directed by the Court.'}</li>
              </ul>
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '除非法院主動或應申請而作出特定命令／指示，否則通過此平台提交上文第1段所述的文件及文件冊，不應被理解為已符合在適用的法例條文及／或相關實務指示下將之提交的規定。' : 'The submission of the documents and bundles (as mentioned in paragraph 1 above) via this Platform should not be construed as having satisfied the requirement(s) for lodging the same under applicable legislative provision(s) and/or relevant Practice Direction(s) save and except with specific order/direction of the Court either on its own motion or upon application.'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '在某些情況下，雖然可提交文件的複本供法庭考慮，但仍須按照法例規定，於法院登記處妥為存檔及繳付訂明費用（如有此規定）。' : 'In some instances, while copy of documents may be submitted for the consideration of the Court, it does not dispense with the legislative requirement for their proper filing at the Court Registry; and payment of prescribed fee if so required.'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '如情況需要，提交文件方須向法庭提供列印文本。實物文件／文件冊與電子文件／文件冊的內容應完全相同。如實物文件／文件冊與電子文件／文件冊中所包含的資料有任何不一致之處，以實物文件／文件冊的資料為準，除非法庭應申請而作出任何命令。' : 'When circumstances require, submitting parties are required to provide the Court with the hardcopies. Contents of both the physical documents/bundle(s) and the electronic documents/bundle(s) should be identical. In the case of any inconsistency between information contained in the physical documents/bundle(s) and that in the electronic documents/bundle(s), information in the physical documents/bundle(s) should prevail unless any order is made by the Court upon application.'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '若實物文件／文件冊需要作出修正或更換，電子文件／文件冊亦須作出相應的更改。提交經修訂的電子文件／文件冊時，應一併呈交附函說明有關的變動。' : 'If amendment(s) or replacement is/are to be made on the physical documents/bundle(s), corresponding changes to the electronic documents/bundle(s) would be required. For submission of amended electronic documents/bundle(s), a covering letter specifying the changes should be submitted together with the electronic documents/bundle(s).'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '使用本平台必須自行承擔當中一切風險。任何源於或關乎使用、誤用，或不能使用平台提供的服務而產生的直接、間接、附帶、專項或相應而生的損失或損毀，司法機構一概不會承擔法律責任或責任（不論是侵權法或其他方面的法律責任或責任），其中包括（但不限於）任何延誤、故障、傳遞不完整、傳遞錯誤、傳遞失敗或傳輸內容難以辨識、平台的提供、誤差、缺陷、偏差、遺漏、干擾、刪減、電腦病毒或通訊線路故障。' : 'Your use of the Platform is at your sole risk. Under no circumstances will the Judiciary accept any liability or responsibility, whether in tort or otherwise, for any direct, indirect, incidental, special or consequential loss or damage arising out of or in connection with the use or misuse or inability to use the services available on the Platform, including but not limited to, any delays, failures, incomplete delivery, mis-delivery, non delivery or illegibility of the transmissions, provision of the Platform, errors, defects, inaccuracies, omissions, interruptions, deletions, computer viruses or communication line failures.'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '平台以「現狀」基礎運作。司法機構不會作出任何種類的明示或隱含保證，包括（但不限於）不會保證平台在任何時間均不受干擾、服務適時、安全、可靠、無誤差或能切合你的需要。' : 'The Platform is operated on an "AS IS" basis and the Judiciary gives no express or implied warranty that the Platform will be uninterrupted, timely, secure, reliable, error free or able to meet your needs at any time.'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '司法機構亦保留權利，可基於任何原因及在任何時間，對本平台或其任何部分的內容、性質及可訪問性，作出更改、增加、修改、刪減、移除，或者暫時或永久中止，而無須預先給予通知。' : 'The Judiciary also reserves the right to amend, add, modify, delete, remove or discontinue, temporarily or permanently, the content of, nature of, and accessibility to the Platform or any part thereof for any reason at any time without prior notice.'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '當你造訪及／或使用本平台，即表示你無條件同意本免責聲明的條款，而司法機構可在無須預先給予通知的情況下，不時對本聲明的條款作出修改及／或增補。' : 'By accessing to and/or using this Platform, you unconditionally agree to the terms of this Disclaimer as may be modified and/or supplemented from time to time by the Judiciary without prior notice.'}
            </li>
            <li style={{ marginBottom: '1rem' }}>
              {language === 'zh' ? '司法機構進一步保留權利，處理任何經本平台收到的文件，並可在無須給予進一步通知的情況下，採取合適的措施，以防止或阻止任何濫用本平台的行為，或對已造成的濫用作出補救。' : 'The Judiciary further reserves the rights to deal with any documents received via the Platform, and to take proper measures, without further notice, to prevent, stop or remedy any abusive use of the Platform.'}
            </li>
            <li style={{ marginBottom: '0' }}>
              {language === 'zh' ? '免責聲明的英文版及中譯本如有差異，概以英文版本為準。' : 'In case of any discrepancies between the English version and the Chinese translation of this Disclaimer, the English version shall prevail.'}
            </li>
          </ol>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        fontSize: '0.8125rem',
        color: '#4A5568',
        marginTop: '1.5rem',
        fontFamily: 'Noto Sans TC, sans-serif'
      }}>
        {language === 'zh' ? '司法機構政務處\n2020年4月' : 'Judiciary Administration\nApril 2020'}
      </div>

      {/* Accept & Proceed Button */}
      <div style={{
        position: 'sticky',
        bottom: '2rem',
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '2rem'
      }}>
        <button
          onClick={onAccept}
          style={{
            background: '#c9a227',
            color: '#ffffff',
            fontWeight: 600,
            padding: '0.625rem 1.5rem',
            borderRadius: '4px',
            fontSize: '0.9375rem',
            cursor: 'pointer',
            border: 'none',
            fontFamily: 'Noto Sans TC, sans-serif',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#b8911f'}
          onMouseOut={(e) => e.currentTarget.style.background = '#c9a227'}
        >
          {language === 'zh' ? '接納及繼續' : 'Accept & Proceed'}
        </button>
      </div>
    </>
  );
}

function SubmissionForm({ language, setStep, setTrn, setSubmissionData }: { language: 'zh' | 'en'; setStep: (step: Step) => void; setTrn: (trn: string) => void; setSubmissionData: (data: any) => void }) {
  const [formData, setFormData] = useState({
    caseNumber: '',
    hearingDate: '',
    hearingDateOption: 'date',
    hearingJudgeOption: 'registrar',
    hearingJudgeName: '',
    registrarName: '',
    partyRepresent: 'Plaintiff',
    partyNumber: '',
    documentType: 'submission',
    otherDocumentType: '',
    solicitorFirm: '',
    referenceNumber: '',
    contactPerson: '',
    contactPhone: '',
    contactFax: '',
    captcha: ''
  });

  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const [authoritiesFiles, setAuthoritiesFiles] = useState<File[]>([]);
  const [bundleFiles, setBundleFiles] = useState<File[]>([]);
  const [otherFiles, setOtherFiles] = useState<File[]>([]);
  const [showBatchTooltip, setShowBatchTooltip] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, setFiles: (files: File[]) => void, currentFiles: File[]) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setFiles([...currentFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number, setFiles: (files: File[]) => void, currentFiles: File[]) => {
    const newFiles = currentFiles.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const handleSend = () => {
    const generatedTrn = 'TRN-' + Date.now();
    setTrn(generatedTrn);
    const totalFiles = submissionFiles.length + authoritiesFiles.length + bundleFiles.length + otherFiles.length;
    setSubmissionData({
      ...formData,
      totalFiles: totalFiles
    });
    setStep('success');
  };

  const handleClear = () => {
    setFormData({
      caseNumber: '',
      hearingDate: '',
      hearingDateOption: 'date',
      hearingJudgeOption: 'registrar',
      hearingJudgeName: '',
      registrarName: '',
      partyRepresent: 'Plaintiff',
      partyNumber: '',
      documentType: 'submission',
      otherDocumentType: '',
      solicitorFirm: '',
      referenceNumber: '',
      contactPerson: '',
      contactPhone: '',
      contactFax: '',
      captcha: ''
    });
    setSubmissionFiles([]);
    setAuthoritiesFiles([]);
    setBundleFiles([]);
    setOtherFiles([]);
  };

  return (
    <>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#5074ab',
          color: '#ffffff',
          padding: '0.5rem 1rem',
          fontSize: '0.875rem md:text-base',
          fontWeight: 600,
          fontFamily: 'Noto Sans TC, sans-serif'
        }}>
          {language === 'zh' ? '電子呈交' : 'e-Lodgement'}
        </div>

        {/* Mobile Stacked Card Layout */}
        <div className="md:hidden space-y-4">
          {/* Card 1: Case Number */}
          <div className="bg-white rounded-lg border-2" style={{ borderColor: '#b8cce4' }}>
            <div className="p-4" style={{ background: '#dce6f1', borderBottom: '1px solid #b8cce4' }}>
              <label className="font-medium" style={{ color: '#0f3040', fontSize: '0.875rem', fontFamily: 'Noto Sans TC, sans-serif' }}>
                {language === 'zh' ? '案件編號' : 'Case Number'}
              </label>
            </div>
            <div className="p-4">
              <input
                type="text"
                placeholder={language === 'zh' ? '(例如 HCA99999/2000)' : '(e.g. HCA99999/2000)'}
                maxLength={14}
                value={formData.caseNumber}
                onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                className="w-full p-3 border-2 rounded-lg input-no-zoom touch-target-vertical"
                style={{ borderColor: '#e2e8f0', fontFamily: 'Noto Sans TC, sans-serif' }}
              />
              <div className="mt-2" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {language === 'zh' ? '(最多14個字元)' : '(Maximum 14 characters)'}
              </div>
            </div>
          </div>

          {/* Card 2: Hearing Date */}
          <div className="bg-white rounded-lg border-2" style={{ borderColor: '#b8cce4' }}>
            <div className="p-4" style={{ background: '#dce6f1', borderBottom: '1px solid #b8cce4' }}>
              <label className="font-medium" style={{ color: '#0f3040', fontSize: '0.875rem', fontFamily: 'Noto Sans TC, sans-serif' }}>
                {language === 'zh' ? '聆訊日期' : 'Hearing Date'}
              </label>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="hearingDateOption-mobile"
                  checked={formData.hearingDateOption === 'date'}
                  onChange={() => setFormData({ ...formData, hearingDateOption: 'date' })}
                  className="w-5 h-5 touch-target"
                />
                <input
                  type="date"
                  value={formData.hearingDate}
                  onChange={(e) => setFormData({ ...formData, hearingDate: e.target.value })}
                  className="flex-1 p-3 border-2 rounded-lg input-no-zoom touch-target-vertical"
                  style={{ borderColor: '#e2e8f0', fontFamily: 'Noto Sans TC, sans-serif' }}
                />
              </div>
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="hearingDateOption-mobile"
                  checked={formData.hearingDateOption === 'noDate'}
                  onChange={() => setFormData({ ...formData, hearingDateOption: 'noDate' })}
                  className="w-5 h-5 touch-target mt-1"
                />
                <span className="text-sm" style={{ fontFamily: 'Noto Sans TC, sans-serif' }}>
                  {language === 'zh' ? '沒有聆訊日期，按照法官／司法常務官／聆案官的指示提交文件' : 'No hearing date, submission with the direction of Judge/Registrar/Master'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Hearing Judge / Registrar / Master */}
          <div className="bg-white rounded-lg border-2" style={{ borderColor: '#b8cce4' }}>
            <div className="p-4" style={{ background: '#dce6f1', borderBottom: '1px solid #b8cce4' }}>
              <label className="font-medium" style={{ color: '#0f3040', fontSize: '0.875rem', fontFamily: 'Noto Sans TC, sans-serif' }}>
                {language === 'zh' ? '主審法官／司法常務官／聆案官' : 'Hearing Judge / Registrar / Master'}
              </label>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="hearingJudgeOption-mobile"
                    checked={formData.hearingJudgeOption === 'judge'}
                    onChange={() => setFormData({ ...formData, hearingJudgeOption: 'judge' })}
                    className="w-5 h-5 touch-target"
                  />
                  <span className="text-sm" style={{ fontFamily: 'Noto Sans TC, sans-serif' }}>{language === 'zh' ? '法官' : 'Judge'}</span>
                </div>
                <input
                  type="text"
                  placeholder={language === 'zh' ? '(最多100個英文／中文字元)' : '(Maximum 100 English/Chinese characters)'}
                  maxLength={100}
                  value={formData.hearingJudgeName}
                  onChange={(e) => setFormData({ ...formData, hearingJudgeName: e.target.value })}
                  className="w-full p-3 border-2 rounded-lg input-no-zoom touch-target-vertical ml-8"
                  style={{ borderColor: '#e2e8f0', fontFamily: 'Noto Sans TC, sans-serif' }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="hearingJudgeOption-mobile"
                    checked={formData.hearingJudgeOption === 'registrar'}
                    onChange={() => setFormData({ ...formData, hearingJudgeOption: 'registrar' })}
                    className="w-5 h-5 touch-target"
                  />
                  <span className="text-sm" style={{ fontFamily: 'Noto Sans TC, sans-serif' }}>{language === 'zh' ? '司法常務官／聆案官' : 'Registrar / Master'}</span>
                </div>
                <input
                  type="text"
                  placeholder={language === 'zh' ? '(最多100個英文／中文字元)' : '(Maximum 100 English/Chinese characters)'}
                  maxLength={100}
                  value={formData.registrarName}
                  onChange={(e) => setFormData({ ...formData, registrarName: e.target.value })}
                  className="w-full p-3 border-2 rounded-lg input-no-zoom touch-target-vertical ml-8"
                  style={{ borderColor: '#e2e8f0', fontFamily: 'Noto Sans TC, sans-serif' }}
                />
              </div>
            </div>
          </div>

          {/* Card 4: Party you represent / Self-Represented */}
          <div className="bg-white rounded-lg border-2" style={{ borderColor: '#b8cce4' }}>
            <div className="p-4" style={{ background: '#dce6f1', borderBottom: '1px solid #b8cce4' }}>
              <label className="font-medium" style={{ color: '#0f3040', fontSize: '0.875rem', fontFamily: 'Noto Sans TC, sans-serif' }}>
                {language === 'zh' ? '你所代表的訴訟方／沒有律師代表' : 'Party you represent / Self-Represented'}
              </label>
            </div>
            <div className="p-4 space-y-3">
              <select
                value={formData.partyRepresent}
                onChange={(e) => setFormData({ ...formData, partyRepresent: e.target.value })}
                className="w-full p-3 border-2 rounded-lg input-no-zoom touch-target-vertical"
                style={{ borderColor: '#e2e8f0', fontFamily: 'Noto Sans TC, sans-serif' }}
              >
                <option value="Plaintiff">{language === 'zh' ? '原告人' : 'Plaintiff'}</option>
                <option value="Prosecution">{language === 'zh' ? '控方' : 'Prosecution'}</option>
                <option value="Defendant">{language === 'zh' ? '被告人' : 'Defendant'}</option>
                <option value="Applicant">{language === 'zh' ? '申請人' : 'Applicant'}</option>
                <option value="Respondent">{language === 'zh' ? '答辯人' : 'Respondent'}</option>
                <option value="Petitioner">{language === 'zh' ? '呈請人' : 'Petitioner'}</option>
                <option value="Self-Represented">{language === 'zh' ? '沒有律師代表' : 'Self-Represented'}</option>
                <option value="Others">{language === 'zh' ? '其他' : 'Others'}</option>
              </select>
              <input
                type="text"
                placeholder={language === 'zh' ? '(最多30個數字連同「,」或「-」)' : '(Maximum 30 numbers with \' ,\' or \'-\')'}
                maxLength={30}
                value={formData.partyNumber}
                onChange={(e) => setFormData({ ...formData, partyNumber: e.target.value })}
                className="w-full p-3 border-2 rounded-lg input-no-zoom touch-target-vertical"
                style={{ borderColor: '#e2e8f0', fontFamily: 'Noto Sans TC, sans-serif' }}
              />
            </div>
          </div>

          {/* Card 5: Document Type */}
          <div className="bg-white rounded-lg border-2" style={{ borderColor: '#b8cce4' }}>
            <div className="p-4" style={{ background: '#dce6f1', borderBottom: '1px solid #b8cce4' }}>
              <label className="font-medium" style={{ color: '#0f3040', fontSize: '0.875rem', fontFamily: 'Noto Sans TC, sans-serif' }}>
                {language === 'zh' ? '文件類別' : 'Document Type'}
              </label>
            </div>
            <div className="p-4 space-y-3">
              {[
                { value: 'submission', label: language === 'zh' ? '陳詞（包括論點綱要、開案陳詞及結案陳詞）' : 'Submission(s) (Including Skeleton Arguments, Opening Submissions and Closing Submissions)' },
                { value: 'authorities', label: language === 'zh' ? '案例典據列表（須夾附所引述的案例典據）' : 'List of Authorities (annexed with authorities cited)' },
                { value: 'both', label: language === 'zh' ? '陳詞和案例典據列表' : 'Submission(s) and List of Authorities' },
                { value: 'bundle', label: language === 'zh' ? '文件册' : 'Bundle(s)' },
                { value: 'others', label: language === 'zh' ? '其他' : 'Others' }
              ].map((option) => (
                <div key={option.value} className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="documentType-mobile"
                    checked={formData.documentType === option.value}
                    onChange={() => setFormData({ ...formData, documentType: option.value })}
                    className="w-5 h-5 touch-target mt-1"
                  />
                  <div className="flex-1">
                    <span className="text-sm block" style={{ fontFamily: 'Noto Sans TC, sans-serif' }}>{option.label}</span>
                    {option.value === 'others' && formData.documentType === 'others' && (
                      <input
                        type="text"
                        placeholder={language === 'zh' ? '(最多300個英文／中文字元)' : '(Maximum 300 English/Chinese characters)'}
                        maxLength={300}
                        value={formData.otherDocumentType}
                        onChange={(e) => setFormData({ ...formData, otherDocumentType: e.target.value })}
                        className="w-full p-3 border-2 rounded-lg input-no-zoom touch-target-vertical mt-2"
                        style={{ borderColor: '#e2e8f0', fontFamily: 'Noto Sans TC, sans-serif' }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 6: File Upload - Submissions */}
          {(formData.documentType === 'submission' || formData.documentType === 'both') && (
            <div className="bg-white rounded-lg border-2" style={{ borderColor: '#b8cce4' }}>
              <div className="p-4" style={{ background: '#dce6f1', borderBottom: '1px solid #b8cce4' }}>
                <label className="font-medium" style={{ color: '#0f3040', fontSize: '0.875rem', fontFamily: 'Noto Sans TC, sans-serif' }}>
                  {language === 'zh' ? '陳詞（包括論點綱要、開案陳詞及結案陳詞）' : 'Submission(s) (including Skeleton Arguments, Opening Submissions and Closing Submissions)'}
                </label>
              </div>
              <div className="p-4 space-y-3">
                <input
                  type="file"
                  multiple
                  id="file-upload-submissions-mobile"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e, setSubmissionFiles, submissionFiles)}
                />
                <button
                  onClick={() => document.getElementById('file-upload-submissions-mobile')?.click()}
                  className="w-full p-3 rounded-lg text-white font-medium touch-target-vertical"
                  style={{ background: '#5074ab', fontFamily: 'Noto Sans TC, sans-serif' }}
                >
                  {language === 'zh' ? '+ 加入檔案' : '+ Add File'}
                </button>
                {submissionFiles.length > 0 && (
                  <div className="space-y-2">
                    {submissionFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border-2" style={{ borderColor: '#e2e8f0' }}>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate" style={{ fontFamily: 'Noto Sans TC, sans-serif' }}>{file.name}</div>
                          <div className="text-xs text-gray-500">
                            {file.name.split('.').pop()?.toUpperCase() || 'PDF'} • {file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${(file.size / 1024).toFixed(2)} KB`}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index, setSubmissionFiles, submissionFiles)}
                          className="text-red-600 text-sm font-medium touch-target px-2 py-1"
                          style={{ fontFamily: 'Noto Sans TC, sans-serif' }}
                        >
                          {language === 'zh' ? '移除' : 'Remove'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card 7: File Upload - List of Authorities */}
          {(formData.documentType === 'authorities' || formData.documentType === 'both') && (
            <div className="bg-white rounded-lg border-2" style={{ borderColor: '#b8cce4' }}>
              <div className="p-4" style={{ background: '#dce6f1', borderBottom: '1px solid #b8cce4' }}>
                <label className="font-medium" style={{ color: '#0f3040', fontSize: '0.875rem', fontFamily: 'Noto Sans TC, sans-serif' }}>
                  {language === 'zh' ? '案例典據列表（須夾附所引述的案例典據）' : 'List of Authorities (annexed with authorities cited)'}
                </label>
              </div>
              <div className="p-4 space-y-3">
                <input
                  type="file"
                  multiple
                  id="file-upload-authorities-mobile"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e, setAuthoritiesFiles, authoritiesFiles)}
                />
                <button
                  onClick={() => document.getElementById('file-upload-authorities-mobile')?.click()}
                  className="w-full p-3 rounded-lg text-white font-medium touch-target-vertical"
                  style={{ background: '#5074ab', fontFamily: 'Noto Sans TC, sans-serif' }}
                >
                  {language === 'zh' ? '+ 加入檔案' : '+ Add File'}
                </button>
                {authoritiesFiles.length > 0 && (
                  <div className="space-y-2">
                    {authoritiesFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border-2" style={{ borderColor: '#e2e8f0' }}>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate" style={{ fontFamily: 'Noto Sans TC, sans-serif' }}>{file.name}</div>
                          <div className="text-xs text-gray-500">
                            {file.name.split('.').pop()?.toUpperCase() || 'PDF'} • {file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${(file.size / 1024).toFixed(2)} KB`}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index, setAuthoritiesFiles, authoritiesFiles)}
                          className="text-red-600 text-sm font-medium touch-target px-2 py-1"
                          style={{ fontFamily: 'Noto Sans TC, sans-serif' }}
                        >
                          {language === 'zh' ? '移除' : 'Remove'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card 8: File Upload - Bundle(s) */}
          {formData.documentType === 'bundle' && (
            <div className="bg-white rounded-lg border-2" style={{ borderColor: '#b8cce4' }}>
              <div className="p-4" style={{ background: '#dce6f1', borderBottom: '1px solid #b8cce4' }}>
                <label className="font-medium" style={{ color: '#0f3040', fontSize: '0.875rem', fontFamily: 'Noto Sans TC, sans-serif' }}>
                  {language === 'zh' ? '文件册' : 'Bundle(s)'}
                </label>
              </div>
              <div className="p-4 space-y-3">
                <input
                  type="file"
                  multiple
                  id="file-upload-bundles-mobile"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e, setBundleFiles, bundleFiles)}
                />
                <button
                  onClick={() => document.getElementById('file-upload-bundles-mobile')?.click()}
                  className="w-full p-3 rounded-lg text-white font-medium touch-target-vertical"
                  style={{ background: '#5074ab', fontFamily: 'Noto Sans TC, sans-serif' }}
                >
                  {language === 'zh' ? '+ 加入檔案' : '+ Add File'}
                </button>
                {bundleFiles.length > 0 && (
                  <div className="space-y-2">
                    {bundleFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border-2" style={{ borderColor: '#e2e8f0' }}>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate" style={{ fontFamily: 'Noto Sans TC, sans-serif' }}>{file.name}</div>
                          <div className="text-xs text-gray-500">
                            {file.name.split('.').pop()?.toUpperCase() || 'PDF'} • {file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${(file.size / 1024).toFixed(2)} KB`}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index, setBundleFiles, bundleFiles)}
                          className="text-red-600 text-sm font-medium touch-target px-2 py-1"
                          style={{ fontFamily: 'Noto Sans TC, sans-serif' }}
                        >
                          {language === 'zh' ? '移除' : 'Remove'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
          <table style={{
            width: '100%',
            minWidth: '600px',
            borderCollapse: 'collapse',
            border: '1px solid #b8cce4',
            fontFamily: 'Noto Sans TC, sans-serif'
          }}>
          <tbody>
            {/* Row 1: Case Number */}
            <tr style={{ borderBottom: '1px solid #b8cce4' }}>
              <td style={{
                background: '#dce6f1',
                padding: '1rem',
                width: '35%',
                fontWeight: 500,
                color: '#0f3040',
                fontSize: '0.875rem'
              }}>
                {language === 'zh' ? '案件編號' : 'Case Number'}
              </td>
              <td style={{
                background: '#FFFFFF',
                padding: '1rem',
                width: '65%'
              }}>
                <input
                  type="text"
                  placeholder={language === 'zh' ? '(例如 HCA99999/2000)' : '(e.g. HCA99999/2000)'}
                  maxLength={14}
                  value={formData.caseNumber}
                  onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontFamily: 'Noto Sans TC, sans-serif'
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {language === 'zh' ? '(最多14個字元)' : '(Maximum 14 characters)'}
                </div>
              </td>
            </tr>

            {/* Row 2: Hearing Date */}
            <tr style={{ borderBottom: '1px solid #b8cce4' }}>
              <td style={{
                background: '#dce6f1',
                padding: '0.75rem 1rem',
                fontWeight: 500,
                color: '#0f3040',
                fontSize: '0.875rem'
              }}>
                {language === 'zh' ? '聆訊日期' : 'Hearing Date'}
              </td>
              <td style={{ background: '#FFFFFF', padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="hearingDateOption"
                      checked={formData.hearingDateOption === 'date'}
                      onChange={() => setFormData({ ...formData, hearingDateOption: 'date' })}
                    />
                    <input
                      type="date"
                      value={formData.hearingDate}
                      onChange={(e) => setFormData({ ...formData, hearingDate: e.target.value })}
                      style={{
                        padding: '0.5rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontFamily: 'Noto Sans TC, sans-serif'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="hearingDateOption"
                      checked={formData.hearingDateOption === 'noDate'}
                      onChange={() => setFormData({ ...formData, hearingDateOption: 'noDate' })}
                    />
                    <span style={{ fontSize: '0.875rem' }}>{language === 'zh' ? '沒有聆訊日期，按照法官／司法常務官／聆案官的指示提交文件' : 'No hearing date, submission with the direction of Judge/Registrar/Master'}</span>
                  </div>
                </div>
              </td>
            </tr>

            {/* Row 3: Hearing Judge / Registrar / Master */}
            <tr style={{ borderBottom: '1px solid #b8cce4' }}>
              <td style={{
                background: '#dce6f1',
                padding: '0.75rem 1rem',
                fontWeight: 500,
                color: '#0f3040',
                fontSize: '0.875rem'
              }}>
                {language === 'zh' ? '主審法官／司法常務官／聆案官' : 'Hearing Judge / Registrar / Master'}
              </td>
              <td style={{ background: '#FFFFFF', padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="hearingJudgeOption"
                      checked={formData.hearingJudgeOption === 'judge'}
                      onChange={() => setFormData({ ...formData, hearingJudgeOption: 'judge' })}
                    />
                    <span style={{ fontSize: '0.875rem' }}>{language === 'zh' ? '法官' : 'Judge'}</span>
                    <input
                      type="text"
                      placeholder={language === 'zh' ? '(最多100個英文／中文字元)' : '(Maximum 100 English/Chinese characters)'}
                      maxLength={100}
                      value={formData.hearingJudgeName}
                      onChange={(e) => setFormData({ ...formData, hearingJudgeName: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontFamily: 'Noto Sans TC, sans-serif'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="hearingJudgeOption"
                      checked={formData.hearingJudgeOption === 'registrar'}
                      onChange={() => setFormData({ ...formData, hearingJudgeOption: 'registrar' })}
                    />
                    <span style={{ fontSize: '0.875rem' }}>{language === 'zh' ? '司法常務官／聆案官' : 'Registrar / Master'}</span>
                    <input
                      type="text"
                      placeholder={language === 'zh' ? '(最多100個英文／中文字元)' : '(Maximum 100 English/Chinese characters)'}
                      maxLength={100}
                      value={formData.registrarName}
                      onChange={(e) => setFormData({ ...formData, registrarName: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontFamily: 'Noto Sans TC, sans-serif'
                      }}
                    />
                  </div>
                </div>
              </td>
            </tr>

            {/* Row 4: Party you represent / Self-Represented */}
            <tr style={{ borderBottom: '1px solid #b8cce4' }}>
              <td style={{
                background: '#dce6f1',
                padding: '0.75rem 1rem',
                fontWeight: 500,
                color: '#0f3040',
                fontSize: '0.875rem'
              }}>
                {language === 'zh' ? '你所代表的訴訟方／沒有律師代表' : 'Party you represent / Self-Represented'}
              </td>
              <td style={{ background: '#FFFFFF', padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <select
                    value={formData.partyRepresent}
                    onChange={(e) => setFormData({ ...formData, partyRepresent: e.target.value })}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontFamily: 'Noto Sans TC, sans-serif'
                    }}
                  >
                    <option value="Plaintiff">{language === 'zh' ? '原告人' : 'Plaintiff'}</option>
                    <option value="Prosecution">{language === 'zh' ? '控方' : 'Prosecution'}</option>
                    <option value="Defendant">{language === 'zh' ? '被告人' : 'Defendant'}</option>
                    <option value="Applicant">{language === 'zh' ? '申請人' : 'Applicant'}</option>
                    <option value="Respondent">{language === 'zh' ? '答辯人' : 'Respondent'}</option>
                    <option value="Petitioner">{language === 'zh' ? '呈請人' : 'Petitioner'}</option>
                    <option value="Self-Represented">{language === 'zh' ? '沒有律師代表' : 'Self-Represented'}</option>
                    <option value="Others">{language === 'zh' ? '其他' : 'Others'}</option>
                  </select>
                  <input
                    type="text"
                    placeholder={language === 'zh' ? '(最多30個數字連同「,」或「-」)' : '(Maximum 30 numbers with \' ,\' or \'-\')'}
                    maxLength={30}
                    value={formData.partyNumber}
                    onChange={(e) => setFormData({ ...formData, partyNumber: e.target.value })}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontFamily: 'Noto Sans TC, sans-serif'
                    }}
                  />
                </div>
              </td>
            </tr>

            {/* Row 5: Document Type */}
            <tr style={{ borderBottom: '1px solid #b8cce4' }}>
              <td style={{
                background: '#dce6f1',
                padding: '0.75rem 1rem',
                fontWeight: 500,
                color: '#0f3040',
                fontSize: '0.875rem'
              }}>
                {language === 'zh' ? '文件類別' : 'Document Type'}
              </td>
              <td style={{ background: '#FFFFFF', padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { value: 'submission', label: language === 'zh' ? '陳詞（包括論點綱要、開案陳詞及結案陳詞）' : 'Submission(s) (Including Skeleton Arguments, Opening Submissions and Closing Submissions)' },
                    { value: 'authorities', label: language === 'zh' ? '案例典據列表（須夾附所引述的案例典據）' : 'List of Authorities (annexed with authorities cited)' },
                    { value: 'both', label: language === 'zh' ? '陳詞和案例典據列表' : 'Submission(s) and List of Authorities' },
                    { value: 'bundle', label: language === 'zh' ? '文件册' : 'Bundle(s)' },
                    { value: 'others', label: language === 'zh' ? '其他' : 'Others' }
                  ].map((option) => (
                    <div key={option.value} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <input
                        type="radio"
                        name="documentType"
                        checked={formData.documentType === option.value}
                        onChange={() => setFormData({ ...formData, documentType: option.value })}
                        style={{ marginTop: '0.25rem' }}
                      />
                      <span style={{ fontSize: '0.875rem' }}>{option.label}</span>
                      {option.value === 'others' && formData.documentType === 'others' && (
                        <input
                          type="text"
                          placeholder={language === 'zh' ? '(最多300個英文／中文字元)' : '(Maximum 300 English/Chinese characters)'}
                          maxLength={300}
                          value={formData.otherDocumentType}
                          onChange={(e) => setFormData({ ...formData, otherDocumentType: e.target.value })}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            fontFamily: 'Noto Sans TC, sans-serif'
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </td>
            </tr>

            {/* Row 6: File Upload - Submissions */}
            {(formData.documentType === 'submission' || formData.documentType === 'both') && (
              <tr style={{ borderBottom: '1px solid #b8cce4' }}>
                <td style={{
                  background: '#dce6f1',
                  padding: '0.75rem 1rem',
                  fontWeight: 500,
                  color: '#0f3040',
                  fontSize: '0.875rem'
                }}>
                  {language === 'zh' ? '陳詞（包括論點綱要、開案陳詞及結案陳詞）' : 'Submission(s) (including Skeleton Arguments, Opening Submissions and Closing Submissions)'}
                </td>
                <td style={{ background: '#FFFFFF', padding: '0.75rem 1rem' }}>
                  <input
                    type="file"
                    multiple
                    id="file-upload-submissions"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, setSubmissionFiles, submissionFiles)}
                  />
                  <button
                    onClick={() => document.getElementById('file-upload-submissions')?.click()}
                    style={{
                      background: '#5074ab',
                      color: '#ffffff',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      border: 'none',
                      fontFamily: 'Noto Sans TC, sans-serif',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {language === 'zh' ? '+ 加入檔案' : '+ Add File'}
                  </button>
                  <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                    <table style={{ width: '100%', minWidth: '400px', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                      <thead>
                        <tr style={{ background: '#b8cce4' }}>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #5074ab' }}>{language === 'zh' ? '檔案名稱' : 'File Name'}</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #5074ab' }}>{language === 'zh' ? '檔案格式' : 'File Format'}</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #5074ab' }}>{language === 'zh' ? '檔案大小' : 'File Size'}</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #5074ab' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissionFiles.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ padding: '0.5rem', textAlign: 'center', color: '#64748b' }}>
                              {language === 'zh' ? '沒有上載的檔案' : 'No Document Uploaded.'}
                            </td>
                          </tr>
                        ) : (
                          submissionFiles.map((file, index) => (
                            <tr key={index}>
                              <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>{file.name}</td>
                              <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>{file.name.split('.').pop()?.toUpperCase() || 'PDF'}</td>
                              <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>{file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${(file.size / 1024).toFixed(2)} KB`}</td>
                              <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>
                                <button
                                  onClick={() => handleRemoveFile(index, setSubmissionFiles, submissionFiles)}
                                  style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem' }}
                                >
                                  {language === 'zh' ? '移除' : 'Remove'}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            )}

            {/* Row 7: File Upload - List of Authorities */}
            {(formData.documentType === 'authorities' || formData.documentType === 'both') && (
              <tr style={{ borderBottom: '1px solid #b8cce4' }}>
                <td style={{
                  background: '#dce6f1',
                  padding: '0.75rem 1rem',
                  fontWeight: 500,
                  color: '#0f3040',
                  fontSize: '0.875rem'
                }}>
                  {language === 'zh' ? '案例典據列表（須夾附所引述的案例典據）' : 'List of Authorities (annexed with authorities cited)'}
                </td>
                <td style={{ background: '#FFFFFF', padding: '0.75rem 1rem' }}>
                  <input
                    type="file"
                    multiple
                    id="file-upload-authorities"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, setAuthoritiesFiles, authoritiesFiles)}
                  />
                  <button
                    onClick={() => document.getElementById('file-upload-authorities')?.click()}
                    style={{
                      background: '#5074ab',
                      color: '#ffffff',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      border: 'none',
                      fontFamily: 'Noto Sans TC, sans-serif',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {language === 'zh' ? '+ 加入檔案' : '+ Add File'}
                  </button>
                  <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                    <table style={{ width: '100%', minWidth: '400px', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                      <thead>
                        <tr style={{ background: '#b8cce4' }}>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #5074ab' }}>{language === 'zh' ? '檔案名稱' : 'File Name'}</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #5074ab' }}>{language === 'zh' ? '檔案格式' : 'File Format'}</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #5074ab' }}>{language === 'zh' ? '檔案大小' : 'File Size'}</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #5074ab' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {authoritiesFiles.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ padding: '0.5rem', textAlign: 'center', color: '#64748b' }}>
                              {language === 'zh' ? '沒有上載的檔案' : 'No Document Uploaded.'}
                            </td>
                          </tr>
                        ) : (
                          authoritiesFiles.map((file, index) => (
                            <tr key={index}>
                              <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>{file.name}</td>
                              <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>{file.name.split('.').pop()?.toUpperCase() || 'PDF'}</td>
                              <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>{file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${(file.size / 1024).toFixed(2)} KB`}</td>
                              <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>
                                <button
                                  onClick={() => handleRemoveFile(index, setAuthoritiesFiles, authoritiesFiles)}
                                  style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem' }}
                                >
                                  {language === 'zh' ? '移除' : 'Remove'}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            )}

            {/* Row 8: File Upload - Bundle(s) */}
            {formData.documentType === 'bundle' && (
              <tr style={{ borderBottom: '1px solid #b8cce4' }}>
                <td style={{
                  background: '#dce6f1',
                  padding: '0.75rem 1rem',
                  fontWeight: 500,
                  color: '#0f3040',
                  fontSize: '0.875rem'
                }}>
                  {language === 'zh' ? '文件册' : 'Bundle(s)'}
                </td>
                <td style={{ background: '#FFFFFF', padding: '0.75rem 1rem' }}>
                  <input
                    type="file"
                    multiple
                    id="file-upload-bundles"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, setBundleFiles, bundleFiles)}
                  />
                  <button
                    onClick={() => document.getElementById('file-upload-bundles')?.click()}
                    style={{
                      background: '#5074ab',
                      color: '#ffffff',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      border: 'none',
                      fontFamily: 'Noto Sans TC, sans-serif',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {language === 'zh' ? '+ 加入檔案' : '+ Add File'}
                  </button>
                  <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                    <table style={{ width: '100%', minWidth: '400px', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                      <thead>
                        <tr style={{ background: '#b8cce4' }}>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #5074ab' }}>{language === 'zh' ? '檔案名稱' : 'File Name'}</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #5074ab' }}>{language === 'zh' ? '檔案格式' : 'File Format'}</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #5074ab' }}>{language === 'zh' ? '檔案大小' : 'File Size'}</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #5074ab' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {bundleFiles.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ padding: '0.5rem', textAlign: 'center', color: '#64748b' }}>
                              {language === 'zh' ? '沒有上載的檔案' : 'No Document Uploaded.'}
                            </td>
                          </tr>
                        ) : (
                          bundleFiles.map((file, index) => (
                            <tr key={index}>
                              <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>{file.name}</td>
                              <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>{file.name.split('.').pop()?.toUpperCase() || 'PDF'}</td>
                              <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>{file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${(file.size / 1024).toFixed(2)} KB`}</td>
                              <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>
                                <button
                                  onClick={() => handleRemoveFile(index, setBundleFiles, bundleFiles)}
                                  style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem' }}
                                >
                                  {language === 'zh' ? '移除' : 'Remove'}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            )}

            {/* Row 9: File Upload - Others */}
            {formData.documentType === 'others' && (
              <tr style={{ borderBottom: '1px solid #b8cce4' }}>
                <td style={{
                  background: '#dce6f1',
                  padding: '0.75rem 1rem',
                  fontWeight: 500,
                  color: '#0f3040',
                  fontSize: '0.875rem'
                }}>
                  {language === 'zh' ? '其他' : 'Others'}
                </td>
                <td style={{ background: '#FFFFFF', padding: '0.75rem 1rem' }}>
                  <input
                    type="file"
                    multiple
                    id="file-upload-others"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, setOtherFiles, otherFiles)}
                  />
                  <button
                    onClick={() => document.getElementById('file-upload-others')?.click()}
                    style={{
                      background: '#5074ab',
                      color: '#ffffff',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      border: 'none',
                      fontFamily: 'Noto Sans TC, sans-serif',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {language === 'zh' ? '+ 加入檔案' : '+ Add File'}
                  </button>
                  <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                    <table style={{ width: '100%', minWidth: '400px', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                      <thead>
                        <tr style={{ background: '#b8cce4' }}>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #5074ab' }}>{language === 'zh' ? '檔案名稱' : 'File Name'}</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #5074ab' }}>{language === 'zh' ? '檔案格式' : 'File Format'}</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #5074ab' }}>{language === 'zh' ? '檔案大小' : 'File Size'}</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #5074ab' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {otherFiles.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ padding: '0.5rem', textAlign: 'center', color: '#64748b' }}>
                              {language === 'zh' ? '沒有上載的檔案' : 'No Document Uploaded.'}
                            </td>
                          </tr>
                        ) : (
                          otherFiles.map((file, index) => (
                            <tr key={index}>
                              <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>{file.name}</td>
                              <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>{file.name.split('.').pop()?.toUpperCase() || 'PDF'}</td>
                              <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>{file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${(file.size / 1024).toFixed(2)} KB`}</td>
                              <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>
                                <button
                                  onClick={() => handleRemoveFile(index, setOtherFiles, otherFiles)}
                                  style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem' }}
                                >
                                  {language === 'zh' ? '移除' : 'Remove'}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            )}

            {/* Row 10: Batch */}
            <tr style={{ borderBottom: '1px solid #b8cce4' }}>
              <td style={{
                background: '#dce6f1',
                padding: '0.75rem 1rem',
                fontWeight: 500,
                color: '#0f3040',
                fontSize: '0.875rem'
              }}>
                {language === 'zh' ? '批' : 'Batch'}
              </td>
              <td style={{ background: '#FFFFFF', padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                  <input type="number" value={1} min={1} style={{ width: '60px', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '1rem' }} />
                  <span>of</span>
                  <input type="number" value={1} min={1} style={{ width: '60px', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '1rem' }} />
                  <div style={{ position: 'relative' }}>
                    <HelpCircle
                      size={16}
                      style={{ color: '#64748b', cursor: 'pointer' }}
                      onMouseEnter={() => setShowBatchTooltip(true)}
                      onMouseLeave={() => setShowBatchTooltip(false)}
                    />
                    {showBatchTooltip && (
                      <div style={{
                        position: 'absolute',
                        left: '20px',
                        top: '-10px',
                        background: '#fff9c4',
                        border: '1px solid #eab308',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        padding: '0.75rem',
                        borderRadius: '4px',
                        zIndex: 1000,
                        minWidth: '300px',
                        fontSize: '0.8125rem',
                        color: '#1A202C',
                        fontFamily: 'Noto Sans TC, sans-serif'
                      }}>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.6' }}>
                          <li style={{ marginBottom: '0.25rem' }}>a. {language === 'zh' ? '如欲分批提交文件，請輸入批次編號及總批數，例如﹕第1批，共4批；第2批，共4批。' : 'If you submit document by batches, please enter Batch Number and Batch Total, e.g. 1 of 4, 2 of 4, ...'}</li>
                          <li style={{ marginBottom: '0.25rem' }}>b. {language === 'zh' ? '輸入欄可輸入的最大批數為200。' : 'The maximum number of batches can be entered at the input field is 200.'}</li>
                          <li style={{ marginBottom: '0' }}>c. {language === 'zh' ? '文件册和其他文件類別必需分批提交。' : 'Bundle and other document types should be submitted by batches.'}</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>

            {/* Row 9: Name of Solicitors' firm / Counsel / Government Department / Litigant-in-person */}
            <tr style={{ borderBottom: '1px solid #b8cce4' }}>
              <td style={{
                background: '#dce6f1',
                padding: '0.75rem 1rem',
                fontWeight: 500,
                color: '#0f3040',
                fontSize: '0.875rem'
              }}>
                {language === 'zh' ? '律師事務所名稱／律師姓名／政府部門名稱／無律師代表的訴訟人' : 'Name of Solicitors\' firm / Counsel / Government Department / Litigant-in-person'}
              </td>
              <td style={{ background: '#FFFFFF', padding: '0.75rem 1rem' }}>
                <input
                  type="text"
                  placeholder={language === 'zh' ? '(最多100個英文／中文字元)' : '(Maximum 100 English/Chinese characters)'}
                  maxLength={100}
                  value={formData.solicitorFirm}
                  onChange={(e) => setFormData({ ...formData, solicitorFirm: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontFamily: 'Noto Sans TC, sans-serif'
                  }}
                />
              </td>
            </tr>

            {/* Row 10: Your Reference Number */}
            <tr style={{ borderBottom: '1px solid #b8cce4' }}>
              <td style={{
                background: '#dce6f1',
                padding: '0.75rem 1rem',
                fontWeight: 500,
                color: '#0f3040',
                fontSize: '0.875rem'
              }}>
                {language === 'zh' ? '你的參考編號' : 'Your Reference Number'}
              </td>
              <td style={{ background: '#FFFFFF', padding: '0.75rem 1rem' }}>
                <input
                  type="text"
                  placeholder={language === 'zh' ? '(最多50個英文／中文字元)' : '(Maximum 50 English/Chinese characters)'}
                  maxLength={50}
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontFamily: 'Noto Sans TC, sans-serif'
                  }}
                />
              </td>
            </tr>

            {/* Row 11: Name of Contact Person */}
            <tr style={{ borderBottom: '1px solid #b8cce4' }}>
              <td style={{
                background: '#dce6f1',
                padding: '0.75rem 1rem',
                fontWeight: 500,
                color: '#0f3040',
                fontSize: '0.875rem'
              }}>
                {language === 'zh' ? '聯絡人姓名' : 'Name of Contact Person'}
              </td>
              <td style={{ background: '#FFFFFF', padding: '0.75rem 1rem' }}>
                <input
                  type="text"
                  placeholder={language === 'zh' ? '(最多100個英文／中文字元)' : '(Maximum 100 English/Chinese characters)'}
                  maxLength={100}
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontFamily: 'Noto Sans TC, sans-serif'
                  }}
                />
              </td>
            </tr>

            {/* Row 12: Your Contact Telephone Number */}
            <tr style={{ borderBottom: '1px solid #b8cce4' }}>
              <td style={{
                background: '#dce6f1',
                padding: '0.75rem 1rem',
                fontWeight: 500,
                color: '#0f3040',
                fontSize: '0.875rem'
              }}>
                {language === 'zh' ? '你的聯絡電話號碼' : 'Your Contact Telephone Number'}
              </td>
              <td style={{ background: '#FFFFFF', padding: '0.75rem 1rem' }}>
                <input
                  type="text"
                  maxLength={8}
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontFamily: 'Noto Sans TC, sans-serif'
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {language === 'zh' ? '(8個數字)' : '(8 numbers)'}
                </div>
              </td>
            </tr>

            {/* Row 13: Your Fax Number */}
            <tr style={{ borderBottom: '1px solid #b8cce4' }}>
              <td style={{
                background: '#dce6f1',
                padding: '0.75rem 1rem',
                fontWeight: 500,
                color: '#0f3040',
                fontSize: '0.875rem'
              }}>
                {language === 'zh' ? '你的傳真號碼' : 'Your Fax Number'}
              </td>
              <td style={{ background: '#FFFFFF', padding: '0.75rem 1rem' }}>
                <input
                  type="text"
                  maxLength={8}
                  value={formData.contactFax}
                  onChange={(e) => setFormData({ ...formData, contactFax: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontFamily: 'Noto Sans TC, sans-serif'
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {language === 'zh' ? '(8個數字)' : '(8 numbers)'}
                </div>
              </td>
            </tr>

            {/* Row 14: Verification */}
            <tr>
              <td style={{
                background: '#dce6f1',
                padding: '0.75rem 1rem',
                fontWeight: 500,
                color: '#0f3040',
                fontSize: '0.875rem'
              }}>
                {language === 'zh' ? '驗證' : 'Verification'}
              </td>
              <td style={{ background: '#FFFFFF', padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{
                    background: '#e2e8f0',
                    width: '120px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    color: '#0f3040',
                    letterSpacing: '2px'
                  }}>
                    4A55284
                  </div>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#5074ab'
                    }}
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.captcha}
                  onChange={(e) => setFormData({ ...formData, captcha: e.target.value })}
                  placeholder={language === 'zh' ? '輸入代碼' : 'Enter the code'}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontFamily: 'Noto Sans TC, sans-serif'
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex flex-col md:flex-row justify-end gap-4 mt-6">
        <button
          onClick={handleSend}
          className="w-full md:w-auto min-h-[44px]"
          style={{
            background: '#c9a227',
            color: '#ffffff',
            fontWeight: 'bold',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            border: 'none',
            fontFamily: 'Noto Sans TC, sans-serif',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#b8911f'}
          onMouseOut={(e) => e.currentTarget.style.background = '#c9a227'}
        >
          {language === 'zh' ? '發送' : 'Send'}
        </button>
        <button
          onClick={handleClear}
          className="w-full md:w-auto min-h-[44px]"
          style={{
            background: '#dc2626',
            color: '#ffffff',
            fontWeight: 'bold',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            border: 'none',
            fontFamily: 'Noto Sans TC, sans-serif',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
          onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
        >
          {language === 'zh' ? '清除' : 'Clear'}
        </button>
      </div>
    </>
  );
}

function SuccessView({ language, trn, submissionData, onBackToHome }: { language: 'zh' | 'en'; trn: string; submissionData: any; onBackToHome: () => void }) {
  const getDocumentTypeLabel = (type: string) => {
    if (language === 'zh') {
      const labels: Record<string, string> = {
        submission: '陳詞',
        authorities: '案例典據列表',
        both: '陳詞和案例典據列表',
        bundle: '文件册',
        others: '其他'
      };
      return labels[type] || type;
    }
    const labels: Record<string, string> = {
      submission: 'Submission(s)',
      authorities: 'List of Authorities',
      both: 'Submission(s) and List of Authorities',
      bundle: 'Bundle(s)',
      others: 'Others'
    };
    return labels[type] || type;
  };

  const getPartyLabel = (party: string) => {
    if (language === 'zh') {
      const labels: Record<string, string> = {
        Plaintiff: '原告人',
        Prosecution: '控方',
        Defendant: '被告人',
        Applicant: '申請人',
        Respondent: '答辯人',
        Petitioner: '呈請人',
        'Self-Represented': '沒有律師代表',
        Others: '其他'
      };
      return labels[party] || party;
    }
    const labels: Record<string, string> = {
      Plaintiff: 'Plaintiff',
      Prosecution: 'Prosecution',
      Defendant: 'Defendant',
      Applicant: 'Applicant',
      Respondent: 'Respondent',
      Petitioner: 'Petitioner',
      'Self-Represented': 'Self-Represented',
      Others: 'Others'
    };
    return labels[party] || party;
  };

  const getHearingDateDisplay = () => {
    if (submissionData?.hearingDateOption === 'noDate') {
      return language === 'zh' ? '沒有聆訊日期' : 'No hearing date';
    }
    return submissionData?.hearingDate || '-';
  };

  const getHearingJudgeDisplay = () => {
    if (submissionData?.hearingJudgeOption === 'judge') {
      return `${language === 'zh' ? '法官: ' : 'Judge: '}${submissionData.hearingJudgeName || '-'}`;
    } else if (submissionData?.hearingJudgeOption === 'registrar') {
      return `${language === 'zh' ? '司法常務官／聆案官: ' : 'Registrar / Master: '}${submissionData.registrarName || '-'}`;
    }
    return '-';
  };

  const getBatchDisplay = () => {
    const batchNumber = submissionData?.batchNumber || 1;
    const batchTotal = submissionData?.batchTotal || 1;
    if (language === 'zh') {
      return `第 ${batchNumber} 批，共 ${batchTotal} 批`;
    }
    return `${batchNumber} of ${batchTotal}`;
  };

  return (
    <>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        padding: '3rem',
        textAlign: 'center',
        fontFamily: 'Noto Sans TC, sans-serif'
      }}>
        {/* Success Icon */}
        <div style={{ marginBottom: '1.5rem' }}>
          <CheckCircle color="#10b981" size={64} />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 600,
          color: '#012056',
          marginBottom: '2rem'
        }}>
          {language === 'zh' ? '提交成功' : 'Submission Successful'}
        </h1>

        {/* TRN Display */}
        <div style={{
          background: '#f3f4f6',
          border: '2px solid #012056',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            fontSize: '1.125rem',
            fontWeight: 500,
            color: '#4a5568',
            marginBottom: '0.5rem'
          }}>
            {language === 'zh' ? '事項參考編號 (TRN)' : 'Transaction Reference Number (TRN)'}
          </div>
          <div style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#012056',
            letterSpacing: '0.05em'
          }}>
            {trn}
          </div>
        </div>

        {/* Submission Summary */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          textAlign: 'left',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#012056',
            marginBottom: '1rem'
          }}>
            {language === 'zh' ? '提交詳情' : 'Submission Details'}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '0.75rem',
            fontSize: '0.9375rem'
          }}>
            <div style={{ color: '#64748b', fontWeight: 500 }}>
              {language === 'zh' ? '案件編號' : 'Case Number'}
            </div>
            <div style={{ color: '#1a202c', fontWeight: 400 }}>
              {submissionData?.caseNumber || '-'}
            </div>

            <div style={{ color: '#64748b', fontWeight: 500 }}>
              {language === 'zh' ? '聆訊日期' : 'Hearing Date'}
            </div>
            <div style={{ color: '#1a202c', fontWeight: 400 }}>
              {getHearingDateDisplay()}
            </div>

            <div style={{ color: '#64748b', fontWeight: 500 }}>
              {language === 'zh' ? '主審法官／司法常務官／聆案官' : 'Hearing Judge/Registrar/Master'}
            </div>
            <div style={{ color: '#1a202c', fontWeight: 400 }}>
              {getHearingJudgeDisplay()}
            </div>

            <div style={{ color: '#64748b', fontWeight: 500 }}>
              {language === 'zh' ? '你所代表的訴訟方' : 'Party Represented'}
            </div>
            <div style={{ color: '#1a202c', fontWeight: 400 }}>
              {getPartyLabel(submissionData?.partyRepresent)}{submissionData?.partyNumber ? ` ${submissionData.partyNumber}` : ''}
            </div>

            <div style={{ color: '#64748b', fontWeight: 500 }}>
              {language === 'zh' ? '文件類別' : 'Document Type'}
            </div>
            <div style={{ color: '#1a202c', fontWeight: 400 }}>
              {getDocumentTypeLabel(submissionData?.documentType)}{submissionData?.documentType === 'others' && submissionData?.otherDocumentType ? ` - ${submissionData.otherDocumentType}` : ''}
            </div>

            <div style={{ color: '#64748b', fontWeight: 500 }}>
              {language === 'zh' ? '批' : 'Batch'}
            </div>
            <div style={{ color: '#1a202c', fontWeight: 400 }}>
              {getBatchDisplay()}
            </div>

            <div style={{ color: '#64748b', fontWeight: 500 }}>
              {language === 'zh' ? '律師事務所名稱／律師姓名／政府部門名稱／無律師代表的訴訟人' : 'Name of Solicitors\' firm / Counsel / Government Department / Litigant-in-person'}
            </div>
            <div style={{ color: '#1a202c', fontWeight: 400 }}>
              {submissionData?.solicitorFirm || '-'}
            </div>

            <div style={{ color: '#64748b', fontWeight: 500 }}>
              {language === 'zh' ? '你的參考編號' : 'Your Reference Number'}
            </div>
            <div style={{ color: '#1a202c', fontWeight: 400 }}>
              {submissionData?.referenceNumber || '-'}
            </div>

            <div style={{ color: '#64748b', fontWeight: 500 }}>
              {language === 'zh' ? '聯絡人姓名' : 'Name of Contact Person'}
            </div>
            <div style={{ color: '#1a202c', fontWeight: 400 }}>
              {submissionData?.contactPerson || '-'}
            </div>

            <div style={{ color: '#64748b', fontWeight: 500 }}>
              {language === 'zh' ? '你的聯絡電話號碼' : 'Your Contact Telephone Number'}
            </div>
            <div style={{ color: '#1a202c', fontWeight: 400 }}>
              {submissionData?.contactPhone || '-'}
            </div>

            <div style={{ color: '#64748b', fontWeight: 500 }}>
              {language === 'zh' ? '你的傳真號碼' : 'Your Fax Number'}
            </div>
            <div style={{ color: '#1a202c', fontWeight: 400 }}>
              {submissionData?.contactFax || '-'}
            </div>

            <div style={{ color: '#64748b', fontWeight: 500 }}>
              {language === 'zh' ? '上載檔案總數' : 'Total Files Uploaded'}
            </div>
            <div style={{ color: '#1a202c', fontWeight: 400 }}>
              {submissionData?.totalFiles || 0}
            </div>
          </div>
        </div>

        {/* Return to Home Button */}
        <button
          onClick={onBackToHome}
          style={{
            background: '#5074ab',
            color: '#ffffff',
            fontWeight: 600,
            padding: '0.75rem 2rem',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            border: 'none',
            fontFamily: 'Noto Sans TC, sans-serif',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#3d5a80'}
          onMouseOut={(e) => e.currentTarget.style.background = '#5074ab'}
        >
          {language === 'zh' ? '返回主頁' : 'Return to Home'}
        </button>
      </div>
    </>
  );
}
