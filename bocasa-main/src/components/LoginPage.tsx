import React, { useState, useEffect } from 'react';

interface LoginPageProps {
  onLoginSuccess: (userData?: { email: string; storeName?: string; isDemo?: boolean; name?: string }) => void;
  isDarkTheme?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, isDarkTheme = false }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  // Sign In State
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [siRemember, setSiRemember] = useState(true);
  const [showSiPassword, setShowSiPassword] = useState(false);
  const [siEmailError, setSiEmailError] = useState(false);
  const [siPasswordError, setSiPasswordError] = useState(false);
  const [siLoading, setSiLoading] = useState(false);
  const [siSuccess, setSiSuccess] = useState(false);
  const [siSuccessTitle, setSiSuccessTitle] = useState('Signed in');
  const [siSuccessBody, setSiSuccessBody] = useState('Taking you to your BOCASA dashboard...');

  // Sign Up State
  const [suStore, setSuStore] = useState('');
  const [suCategory, setSuCategory] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [showSuPassword, setShowSuPassword] = useState(false);
  const [suStoreError, setSuStoreError] = useState(false);
  const [suCategoryError, setSuCategoryError] = useState(false);
  const [suEmailError, setSuEmailError] = useState(false);
  const [suPasswordError, setSuPasswordError] = useState(false);
  const [suLoading, setSuLoading] = useState(false);
  const [suSuccess, setSuSuccess] = useState(false);

  // Trigger load-in animation
  const [jsReady, setJsReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setJsReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  // Handle Sign In Submit
  const handleSigninSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailOk = isEmail(siEmail.trim());
    const passOk = siPassword.trim().length > 0;
    setSiEmailError(!emailOk);
    setSiPasswordError(!passOk);

    if (!emailOk || !passOk) return;

    setSiLoading(true);
    setTimeout(() => {
      setSiLoading(false);
      setSiSuccessTitle('Signed in');
      setSiSuccessBody('Taking you to your BOCASA dashboard...');
      setSiSuccess(true);
      setTimeout(() => {
        onLoginSuccess({ email: siEmail, storeName: 'BOCASA Official Store', isDemo: false });
      }, 1000);
    }, 800);
  };

  // Handle Demo User Click
  const handleDemoLogin = () => {
    setSiLoading(true);
    setTimeout(() => {
      setSiLoading(false);
      setSiSuccessTitle('Demo ready');
      setSiSuccessBody("You're browsing a sample store — redirecting to dashboard...");
      setSiSuccess(true);
      setTimeout(() => {
        onLoginSuccess({ email: 'arjun@bocasa.in', storeName: 'Arjun Retail Brands Pvt Ltd', isDemo: true, name: 'Arjun' });
      }, 900);
    }, 600);
  };

  // Handle Sign Up Submit
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storeOk = suStore.trim().length > 1;
    const catOk = suCategory.trim().length > 0;
    const emailOk = isEmail(suEmail.trim());
    const passOk = suPassword.trim().length >= 8;

    setSuStoreError(!storeOk);
    setSuCategoryError(!catOk);
    setSuEmailError(!emailOk);
    setSuPasswordError(!passOk);

    if (!storeOk || !catOk || !emailOk || !passOk) return;

    setSuLoading(true);
    setTimeout(() => {
      setSuLoading(false);
      setSuSuccess(true);
      setTimeout(() => {
        onLoginSuccess({ email: suEmail, storeName: suStore, isDemo: false });
      }, 1000);
    }, 800);
  };

  return (
    <div className={`login-root min-h-screen w-full flex ${isDarkTheme ? 'dark' : ''} ${jsReady ? 'js-ready' : ''}`}>
      <style>{`
        .login-root {
          --ink-900: #12161F;
          --ink-800: #1B2333;
          --ink-700: #262F42;
          --slate-500: #5B6472;
          --fog-300: #A9AFB8;
          --fog-200: #C7CBD1;
          --paper-0: #FAFAF9;
          --paper-50: #F2F1EE;
          --card-border: #E6E4DF;
          --text-primary: #191D26;
          --text-muted: #6B6F78;
          --amber-500: #B8813F;
          --amber-600: #9C6B31;
          --amber-100: #F3E6D2;
          --danger: #B4453D;
          --focus-ring: rgba(184, 129, 63, 0.35);
          --radius-sm: 8px;
          --radius-md: 12px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--paper-0);
          color: var(--text-primary);
        }

        .login-root.dark {
          --paper-0: #14171D;
          --paper-50: #1A1E25;
          --card-border: #2A2E36;
          --text-primary: #EDEDEC;
          --text-muted: #9A9DA5;
          --amber-100: #2E2418;
        }

        .login-screen {
          display: flex;
          width: 100%;
          min-height: 100vh;
        }

        /* BRAND PANEL */
        .brand-panel {
          position: relative;
          flex: 0 0 42%;
          min-height: 100vh;
          background: linear-gradient(160deg, var(--ink-800) 0%, var(--ink-900) 62%, #0E1119 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 64px 64px;
          overflow: hidden;
        }

        .brand-panel::before {
          content: "";
          position: absolute;
          top: -20%;
          left: -10%;
          width: 70%;
          height: 70%;
          background: radial-gradient(circle, rgba(91,100,114,0.35) 0%, rgba(91,100,114,0) 70%);
          filter: blur(10px);
          animation: drift 22s ease-in-out infinite;
          pointer-events: none;
        }

        .brand-panel::after {
          content: "";
          position: absolute;
          bottom: -25%;
          right: -15%;
          width: 60%;
          height: 60%;
          background: radial-gradient(circle, rgba(184,129,63,0.14) 0%, rgba(184,129,63,0) 70%);
          filter: blur(10px);
          animation: drift 26s ease-in-out infinite reverse;
          pointer-events: none;
        }

        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(6%, 4%) scale(1.08); }
        }

        .brand-content {
          position: relative;
          z-index: 1;
          max-width: 420px;
        }

        .logo-mark {
          height: 48px;
          width: auto;
          display: block;
          opacity: 0;
          transform: translateY(10px) scale(0.97);
        }

        .js-ready .logo-mark {
          animation: logoIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
        }

        @keyframes logoIn {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .tagline {
          margin: 36px 0 0;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: clamp(32px, 3.6vw, 46px);
          line-height: 1.22;
          color: #F4F3F0;
          letter-spacing: -0.01em;
        }

        .tagline .word {
          display: inline-block;
          overflow: hidden;
          vertical-align: top;
        }

        .tagline .word > span {
          display: inline-block;
          transform: translateY(110%);
        }

        .js-ready .tagline .word > span {
          animation: wordUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes wordUp {
          to { transform: translateY(0); }
        }

        .tagline-rule {
          margin-top: 22px;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--amber-500), transparent);
          border-radius: 2px;
        }

        .js-ready .tagline-rule {
          animation: ruleGrow 0.8s cubic-bezier(0.65, 0, 0.35, 1) 1.05s forwards;
        }

        @keyframes ruleGrow {
          to { width: 96px; }
        }

        .brand-sub {
          margin-top: 26px;
          font-size: 15px;
          line-height: 1.6;
          color: var(--fog-300);
          max-width: 340px;
          opacity: 0;
        }

        .js-ready .brand-sub {
          animation: fadeIn 0.7s ease-out 1.35s forwards;
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        .brand-foot {
          position: absolute;
          left: 64px;
          bottom: 40px;
          right: 64px;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 13px;
          color: var(--slate-500);
          opacity: 0;
        }

        .js-ready .brand-foot {
          animation: fadeIn 0.7s ease-out 1.5s forwards;
        }

        .brand-foot strong {
          color: var(--fog-300);
          font-weight: 600;
        }

        /* FORM PANEL */
        .form-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--paper-0);
          min-width: 0;
        }

        .form-topbar {
          display: flex;
          justify-content: flex-end;
          padding: 28px 40px 0;
        }

        .form-topbar a {
          font-size: 14px;
          color: var(--text-muted);
          text-decoration: none;
        }
        .form-topbar a:hover { color: var(--text-primary); }

        .form-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 32px 48px;
        }

        .form-card {
          width: 100%;
          max-width: 380px;
        }

        .switcher {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--paper-50);
          border: 1px solid var(--card-border);
          border-radius: 999px;
          padding: 4px;
          margin-bottom: 36px;
        }

        .switcher-indicator {
          position: absolute;
          top: 4px;
          left: 4px;
          width: calc(50% - 4px);
          height: calc(100% - 8px);
          background: var(--ink-900);
          border-radius: 999px;
          transition: transform 0.35s cubic-bezier(0.65, 0, 0.35, 1);
        }

        .switcher[data-mode="signup"] .switcher-indicator {
          transform: translateX(100%);
        }

        .switcher button {
          position: relative;
          z-index: 1;
          border: none;
          background: transparent;
          padding: 10px 8px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
          border-radius: 999px;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .switcher button.active {
          color: #FAFAF9;
        }

        .panel-heading {
          margin: 0 0 6px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 28px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        .panel-sub {
          margin: 0 0 30px;
          font-size: 14.5px;
          color: var(--text-muted);
        }

        .panel-sub button.link-inline {
          background: none;
          border: none;
          padding: 0;
          font: inherit;
          color: var(--amber-600);
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .field {
          margin-bottom: 18px;
        }

        .field label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 7px;
          color: var(--text-primary);
        }

        .field-control {
          position: relative;
        }

        .field input {
          width: 100%;
          padding: 12px 14px;
          font-size: 14.5px;
          font-family: 'Inter', sans-serif;
          color: var(--text-primary);
          background: var(--paper-0);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-sm);
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .login-root.dark .field input { background: var(--paper-50); }

        .field input::placeholder { color: var(--fog-200); }

        .field select {
          width: 100%;
          padding: 12px 38px 12px 14px;
          font-size: 14.5px;
          font-family: 'Inter', sans-serif;
          color: var(--text-primary);
          background: var(--paper-0);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-sm);
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .login-root.dark .field select { background: var(--paper-50); }

        .field select:focus, .field input:focus {
          border-color: var(--amber-500);
          box-shadow: 0 0 0 4px var(--focus-ring);
        }

        .field select.invalid, .field input.invalid {
          border-color: var(--danger);
        }

        .select-caret {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .field-error {
          display: none;
          margin-top: 6px;
          font-size: 12.5px;
          color: var(--danger);
        }
        .field-error.show { display: block; }

        .toggle-visibility {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 6px;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
        }
        .toggle-visibility:hover { color: var(--text-primary); }

        .row-between {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          font-size: 13.5px;
        }

        .remember {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          cursor: pointer;
        }

        .remember input {
          width: 15px;
          height: 15px;
          accent-color: var(--ink-900);
          cursor: pointer;
        }

        .row-between a {
          color: var(--amber-600);
          text-decoration: none;
          font-weight: 600;
        }
        .row-between a:hover { text-decoration: underline; }

        .hint-line {
          font-size: 12.5px;
          color: var(--text-muted);
          margin: -8px 0 20px;
        }

        .btn-primary {
          width: 100%;
          padding: 13px 16px;
          background: var(--ink-900);
          color: #FAFAF9;
          border: none;
          border-radius: var(--radius-sm);
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .login-root.dark .btn-primary {
          background: #262F42;
          color: #FAFAF9;
        }

        .btn-primary:hover { background: var(--ink-700); }
        .btn-primary:active { transform: scale(0.99); }

        .btn-primary .spinner {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(250,249,249,0.35);
          border-top-color: #FAFAF9;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 26px 0 20px;
          color: var(--text-muted);
          font-size: 12.5px;
        }
        .divider::before, .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--card-border);
        }

        .oauth-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .demo-note {
          margin: 12px 0 0;
          font-size: 12.5px;
          color: var(--text-muted);
          text-align: center;
        }

        .btn-oauth {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 10px 12px;
          border: 1px solid var(--card-border);
          border-radius: var(--radius-sm);
          background: var(--paper-0);
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease, transform 0.15s ease;
        }
        .btn-oauth:hover { border-color: var(--fog-300); background: var(--paper-50); }
        .btn-oauth:active { transform: scale(0.98); }

        /* success state */
        .success-state {
          text-align: center;
          padding: 12px 0 4px;
          animation: stageIn 0.4s cubic-bezier(0.16,1,0.3,1);
        }

        @keyframes stageIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .success-check {
          width: 52px;
          height: 52px;
          margin: 0 auto 18px;
          border-radius: 50%;
          background: var(--amber-100);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .success-state h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 22px;
          margin: 0 0 8px;
        }
        .success-state p {
          color: var(--text-muted);
          font-size: 14px;
          margin: 0 0 24px;
          line-height: 1.55;
        }
        .btn-ghost {
          background: none;
          border: 1px solid var(--card-border);
          padding: 10px 18px;
          border-radius: var(--radius-sm);
          font-family: 'Inter', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
        }
        .btn-ghost:hover { background: var(--paper-50); }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .login-screen { flex-direction: column; }
          .brand-panel {
            flex: none;
            min-height: unset;
            padding: 40px 28px 34px;
          }
          .brand-foot { display: none; }
          .tagline { font-size: 26px; }
          .brand-sub { display: none; }
          .form-topbar { padding: 20px 24px 0; }
          .form-wrap { padding: 20px 24px 48px; }
        }
      `}</style>

      <div className="login-screen">
        {/* LEFT / BRAND PANEL */}
        <aside className="brand-panel">
          <div className="brand-content">
            <img 
              className="logo-mark" 
              src="/bocasa-logo-white.png" 
              alt="BOCASA" 
            />

            <h1 className="tagline" aria-label="Let's sell it, wisely.">
              <span className="word">
                <span style={{ animationDelay: '0.55s' }}>Let&rsquo;s</span>
              </span>{' '}
              <span className="word">
                <span style={{ animationDelay: '0.64s' }}>sell</span>
              </span>{' '}
              <span className="word">
                <span style={{ animationDelay: '0.73s' }}>it,</span>
              </span>
              <br />
              <span className="word">
                <span style={{ animationDelay: '0.82s' }}>wisely.</span>
              </span>
            </h1>

            <div className="tagline-rule" />
            <p className="brand-sub">
              One dashboard to list, price and ship — built for sellers who'd rather build than guess.
            </p>
          </div>

          <div className="brand-foot">
            <span>© 2026 <strong>BOCASA</strong></span>
            <span>bocasa.com</span>
          </div>
        </aside>

        {/* RIGHT / FORM PANEL */}
        <main className="form-panel">
          <div className="form-topbar">
            <a href="https://bocasa.com" target="_blank" rel="noopener noreferrer">Need help?</a>
          </div>

          <div className="form-wrap">
            <div className="form-card">
              {/* Switcher */}
              <div className="switcher" data-mode={mode} role="tablist">
                <div className="switcher-indicator" />
                <button
                  type="button"
                  className={mode === 'signin' ? 'active' : ''}
                  onClick={() => setMode('signin')}
                  role="tab"
                  aria-selected={mode === 'signin'}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className={mode === 'signup' ? 'active' : ''}
                  onClick={() => setMode('signup')}
                  role="tab"
                  aria-selected={mode === 'signup'}
                >
                  Create your store
                </button>
              </div>

              {/* SIGN IN VIEW */}
              {mode === 'signin' && (
                <section>
                  <h2 className="panel-heading">Welcome back</h2>
                  <p className="panel-sub">
                    New to BOCASA?{' '}
                    <button
                      type="button"
                      className="link-inline"
                      onClick={() => setMode('signup')}
                    >
                      Create a store
                    </button>
                  </p>

                  {!siSuccess ? (
                    <form onSubmit={handleSigninSubmit} noValidate>
                      <div className="field">
                        <label htmlFor="siEmail">Email address</label>
                        <div className="field-control">
                          <input
                            type="email"
                            id="siEmail"
                            value={siEmail}
                            onChange={(e) => {
                              setSiEmail(e.target.value);
                              if (siEmailError) setSiEmailError(false);
                            }}
                            placeholder="you@business.com"
                            autoComplete="email"
                            className={siEmailError ? 'invalid' : ''}
                          />
                        </div>
                        <div className={`field-error ${siEmailError ? 'show' : ''}`}>
                          Enter a valid email address.
                        </div>
                      </div>

                      <div className="field">
                        <label htmlFor="siPassword">Password</label>
                        <div className="field-control">
                          <input
                            type={showSiPassword ? 'text' : 'password'}
                            id="siPassword"
                            value={siPassword}
                            onChange={(e) => {
                              setSiPassword(e.target.value);
                              if (siPasswordError) setSiPasswordError(false);
                            }}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            className={siPasswordError ? 'invalid' : ''}
                          />
                          <button
                            type="button"
                            className="toggle-visibility"
                            onClick={() => setShowSiPassword(!showSiPassword)}
                            aria-label={showSiPassword ? 'Hide password' : 'Show password'}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </div>
                        <div className={`field-error ${siPasswordError ? 'show' : ''}`}>
                          Enter your password.
                        </div>
                      </div>

                      <div className="row-between">
                        <label className="remember">
                          <input
                            type="checkbox"
                            checked={siRemember}
                            onChange={(e) => setSiRemember(e.target.checked)}
                          />
                          Remember me
                        </label>
                        <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset email dispatched.'); }}>
                          Forgot password?
                        </a>
                      </div>

                      <button type="submit" className="btn-primary" disabled={siLoading}>
                        {siLoading && <span className="spinner" />}
                        <span className="btn-label">{siLoading ? 'Signing in...' : 'Sign in'}</span>
                      </button>
                    </form>
                  ) : (
                    <div className="success-state">
                      <div className="success-check">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B8813F" strokeWidth="2.4">
                          <path d="M4 12l5 5L20 6" />
                        </svg>
                      </div>
                      <h2>{siSuccessTitle}</h2>
                      <p>{siSuccessBody}</p>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => setSiSuccess(false)}
                      >
                        Back to sign in
                      </button>
                    </div>
                  )}

                  <div className="divider">or continue with</div>

                  <div className="oauth-row">
                    <button
                      type="button"
                      className="btn-oauth"
                      onClick={() => {
                        onLoginSuccess({ email: 'seller@gmail.com', storeName: 'Google Verified Store', isDemo: false });
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.3 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.4-.4-3.5z"/>
                        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.3 5.1 29.4 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"/>
                        <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 36.4 26.8 37 24 37c-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.6 40.6 16.3 45 24 45z"/>
                        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.3 5.3C41.4 35.7 45 30.4 45 24c0-1.4-.1-2.4-.4-3.5z"/>
                      </svg>
                      Google
                    </button>

                    <button
                      type="button"
                      className="btn-oauth font-semibold text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/40 hover:bg-amber-100/70"
                      onClick={handleDemoLogin}
                      id="demoBtn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
                      </svg>
                      Demo user
                    </button>
                  </div>

                  <p className="demo-note">
                    No sign-up needed — explore a sample BOCASA dashboard.
                  </p>
                </section>
              )}

              {/* CREATE STORE VIEW */}
              {mode === 'signup' && (
                <section>
                  <h2 className="panel-heading">Let's build your store</h2>
                  <p className="panel-sub">
                    Already selling with us?{' '}
                    <button
                      type="button"
                      className="link-inline"
                      onClick={() => setMode('signin')}
                    >
                      Sign in
                    </button>
                  </p>

                  {!suSuccess ? (
                    <form onSubmit={handleSignupSubmit} noValidate>
                      <div className="field">
                        <label htmlFor="suStore">Store name</label>
                        <div className="field-control">
                          <input
                            type="text"
                            id="suStore"
                            value={suStore}
                            onChange={(e) => {
                              setSuStore(e.target.value);
                              if (suStoreError) setSuStoreError(false);
                            }}
                            placeholder="e.g. Aster & Co."
                            autoComplete="organization"
                            className={suStoreError ? 'invalid' : ''}
                          />
                        </div>
                        <div className={`field-error ${suStoreError ? 'show' : ''}`}>
                          Give your store a name.
                        </div>
                      </div>

                      <div className="field">
                        <label htmlFor="suCategory">Store category</label>
                        <div className="field-control">
                          <select
                            id="suCategory"
                            value={suCategory}
                            onChange={(e) => {
                              setSuCategory(e.target.value);
                              if (suCategoryError) setSuCategoryError(false);
                            }}
                            className={suCategoryError ? 'invalid' : ''}
                          >
                            <option value="" disabled>Select a category</option>
                            <option value="electronics">Electronics & Audio</option>
                            <option value="clothing">Clothing &amp; Apparel</option>
                            <option value="sports">Sports &amp; Fitness</option>
                            <option value="shoes">Shoes &amp; Footwear</option>
                            <option value="healthcare">Healthcare &amp; Wellness</option>
                            <option value="home-living">Home &amp; Living</option>
                            <option value="beauty">Beauty &amp; Personal Care</option>
                            <option value="grocery">Grocery &amp; Food</option>
                            <option value="toys">Toys &amp; Kids</option>
                            <option value="jewelry">Jewelry &amp; Accessories</option>
                            <option value="other">Other</option>
                          </select>
                          <svg className="select-caret" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </div>
                        <div className={`field-error ${suCategoryError ? 'show' : ''}`}>
                          Choose a category for your store.
                        </div>
                      </div>

                      <div className="field">
                        <label htmlFor="suEmail">Email address</label>
                        <div className="field-control">
                          <input
                            type="email"
                            id="suEmail"
                            value={suEmail}
                            onChange={(e) => {
                              setSuEmail(e.target.value);
                              if (suEmailError) setSuEmailError(false);
                            }}
                            placeholder="you@business.com"
                            autoComplete="email"
                            className={suEmailError ? 'invalid' : ''}
                          />
                        </div>
                        <div className={`field-error ${suEmailError ? 'show' : ''}`}>
                          Enter a valid email address.
                        </div>
                      </div>

                      <div className="field">
                        <label htmlFor="suPassword">Password</label>
                        <div className="field-control">
                          <input
                            type={showSuPassword ? 'text' : 'password'}
                            id="suPassword"
                            value={suPassword}
                            onChange={(e) => {
                              setSuPassword(e.target.value);
                              if (suPasswordError) setSuPasswordError(false);
                            }}
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
                            className={suPasswordError ? 'invalid' : ''}
                          />
                          <button
                            type="button"
                            className="toggle-visibility"
                            onClick={() => setShowSuPassword(!showSuPassword)}
                            aria-label={showSuPassword ? 'Hide password' : 'Show password'}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </div>
                        <div className={`field-error ${suPasswordError ? 'show' : ''}`}>
                          Use at least 8 characters.
                        </div>
                      </div>

                      <p className="hint-line">By creating a store you agree to BOCASA's Seller Terms.</p>

                      <button type="submit" className="btn-primary" disabled={suLoading}>
                        {suLoading && <span className="spinner" />}
                        <span className="btn-label">{suLoading ? 'Creating store...' : 'Create store'}</span>
                      </button>
                    </form>
                  ) : (
                    <div className="success-state">
                      <div className="success-check">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B8813F" strokeWidth="2.4">
                          <path d="M4 12l5 5L20 6" />
                        </svg>
                      </div>
                      <h2>Store created</h2>
                      <p>Setting up your BOCASA dashboard now...</p>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => setSuSuccess(false)}
                      >
                        Back to start
                      </button>
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
