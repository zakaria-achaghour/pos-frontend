import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuthRedux';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, getRoleBasedRedirect, user, isLoading, loginError } = useAuth();
  const navigate = useNavigate();

  // Check if user is already authenticated when component mounts
  useEffect(() => {

    if (!isLoading && user) {
      const redirectPath = getRoleBasedRedirect();
      navigate(redirectPath, { replace: true });
    }
  }, [user, isLoading, navigate, getRoleBasedRedirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success && result.redirectPath) {
        navigate(result.redirectPath);
      } else if (result.success) {
        // Fallback to getRoleBasedRedirect if no redirectPath provided
        const redirectPath = getRoleBasedRedirect();
        navigate(redirectPath);
      }
      // If login fails, the error will be handled by Redux and displayed via loginError
    } catch (err) {
      console.error('💥 Login exception:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('password123');
  };

  // Show loading state while checking existing authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="max-w-md w-full space-y-8 p-8 bg-surface rounded-2xl shadow-sm border border-line">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-fg-muted">{t('auth.checking')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <section className="login-story">
        <div className="flex items-center gap-3 text-lg font-semibold"><span className="brand-mark" aria-hidden="true">S<span>·</span></span>{t('ux.brand')}</div>
        <div className="login-story-copy">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t('ux.eyebrow')}</p>
          <h1>{t('ux.headline')}</h1>
          <p className="max-w-md text-base leading-7 text-fg-muted">{t('ux.intro')}</p>
          <div className="service-map" aria-hidden="true">
            <div className="service-map-line"/>
            {[t('nav.tables'), t('nav.orders'), t('nav.kitchen')].map((label, index) => (
              <div className="service-map-item" key={label}><span>0{index + 1}</span><strong>{label}</strong><div className="service-map-bars"><i/><i/><i/></div></div>
            ))}
          </div>
        </div>
        <p className="text-xs tracking-wide text-fg-muted">{t('ux.service')}</p>
      </section>
      <section className="login-form-side">
        <div className="absolute end-5 top-5"><LanguageSwitcher/></div>
        <div className="login-form-container">
          <div className="mb-10"><span className="brand-mark mb-6 lg:hidden" aria-hidden="true">S<span>·</span></span><p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{t('ux.workspace')}</p><h2 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">{t('ux.welcome')}</h2><p className="mt-3 text-sm leading-6 text-fg-muted">{t('ux.loginHelp')}</p></div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {loginError && <div role="alert" className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">{loginError}</div>}
            <div><label htmlFor="login-email" className="mb-2 block text-sm font-medium text-fg">{t('auth.email')}</label><input id="login-email" name="email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className="login-input" placeholder="you@restaurant.com" required/></div>
            <div><label htmlFor="login-password" className="mb-2 block text-sm font-medium text-fg">{t('auth.password')}</label><div className="relative"><input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="login-input pe-14" required/><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? t('ux.hidePassword') : t('ux.showPassword')} aria-pressed={showPassword} className="absolute end-1 top-1 flex h-11 w-11 items-center justify-center rounded-lg text-fg-muted"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>{showPassword && <path d="m3 3 18 18"/>}</svg></button></div></div>
            <button type="submit" disabled={loading} aria-busy={loading} className="flex min-h-13 w-full items-center justify-center gap-3 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:opacity-60">{loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"/>}{loading ? t('auth.signingIn') : t('auth.signIn')}<span aria-hidden="true" className="rtl:rotate-180">→</span></button>
          </form>
          <details className="demo-accounts mt-8 border-t border-line pt-6"><summary className="cursor-pointer text-sm font-medium text-fg-muted">{t('ux.demo')}</summary><div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => quickLogin('superadmin@pos.com')}>{t('roles.superadmin')}</button>
            <button type="button" onClick={() => quickLogin('owner@restaurant.com')}>{t('roles.owner')}</button>
            <button type="button" onClick={() => quickLogin('manager@restaurant.com')}>{t('roles.manager')}</button>
            <button type="button" onClick={() => quickLogin('cashier@restaurant.com')}>{t('roles.cashier')}</button>
            <button type="button" onClick={() => quickLogin('waiter@restaurant.com')}>{t('roles.waiter')}</button>
            <button type="button" onClick={() => quickLogin('kitchen@restaurant.com')}>{t('roles.kitchen')}</button>
          </div><p className="mt-3 text-xs text-fg-muted">{t('auth.demoPassword', { password: 'password123' })}</p></details>
        </div>
      </section>
    </div>
  );
};

export default Login;
