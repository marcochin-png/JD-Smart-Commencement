import type { ReactNode } from 'react';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { handleFontControlClick } from '../../lib/accessibility';

type AppShellHeaderProps = {
  brandEyebrow: string;
  brandTitle: string;
  language: 'zh' | 'en';
  onToggleLanguage: () => void;
  pageTitle?: string;
  pageSubtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  mobileMenuLabel?: string;
  desktopActions?: ReactNode;
  containerWidthClassName?: string;
  zIndexClassName?: string;
};

export default function AppShellHeader({
  brandEyebrow,
  brandTitle,
  language,
  onToggleLanguage,
  pageTitle,
  pageSubtitle,
  onBack,
  backLabel,
  mobileMenuOpen,
  onToggleMobileMenu,
  mobileMenuLabel,
  desktopActions,
  containerWidthClassName = 'max-w-[1880px]',
  zIndexClassName = 'z-40',
}: AppShellHeaderProps) {
  return (
    <header
      className={`sticky top-0 ${zIndexClassName} border-b-0 text-white shadow-sm backdrop-blur`}
      style={{
        background: 'rgba(1, 32, 86, 0.95)',
        borderBottom: '3px solid #5074ab',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div className={`mx-auto flex w-full ${containerWidthClassName} items-center justify-between gap-4 px-4 py-0 md:px-8`}>
        <div className="flex items-center gap-3 md:gap-5">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:border-white/35 hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </button>
          ) : null}

          <a href="/" className="flex items-center gap-2 text-inherit no-underline md:gap-0">
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
                {brandEyebrow}
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
                {brandTitle}
              </h1>
              <div className="mt-1 hidden items-center gap-2 md:flex">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="text-[13px] font-normal text-white">{language === 'zh' ? '安全加密連線' : 'Secure Connection'}</span>
              </div>
              {pageTitle ? <div className="mt-0.5 text-base font-semibold text-white">{pageTitle}</div> : null}
              {pageSubtitle ? <div className="mt-1 text-sm text-white">{pageSubtitle}</div> : null}
            </div>
          </a>
        </div>

        {onToggleMobileMenu ? (
          <button
            type="button"
            className="flex items-center justify-center p-2 text-white md:hidden"
            onClick={onToggleMobileMenu}
            aria-label={mobileMenuLabel ?? (language === 'zh' ? '選單' : 'Menu')}
            aria-expanded={mobileMenuOpen}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        ) : null}

        <div className="hidden items-center gap-3 md:flex">
          <button type="button" className="border-none bg-transparent px-2 text-sm text-white" onClick={() => handleFontControlClick('sm')}>A</button>
          <button type="button" className="border-none bg-transparent px-2 text-base text-white underline" onClick={() => handleFontControlClick('md')}>A</button>
          <button type="button" className="border-none bg-transparent px-2 text-lg text-white" onClick={() => handleFontControlClick('lg')}>A</button>
          <button
            type="button"
            onClick={onToggleLanguage}
            className="rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:border-white/35 hover:bg-white/15"
            aria-label={language === 'zh' ? 'Switch to English' : '切換至中文'}
          >
            {language === 'zh' ? 'EN' : '中文'}
          </button>
          {desktopActions}
        </div>
      </div>
    </header>
  );
}