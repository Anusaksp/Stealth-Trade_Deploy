import { Head, Link, useForm } from '@inertiajs/react';
import '../../../css/login.css'; // Import the new custom CSS

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="login-page">
            <Head title="Log in - Stealth Trade" />

            <div className="login-card">
                <div className="login-card__body">
                    {/* Brand / Logo */}
                    <div className="login-brand">
                        <h1 className="login-brand__title">STEALTH TRADE</h1>
                        <p className="login-brand__sub">Sign in to continue your secure journey.</p>
                    </div>

                    {status && (
                        <div className="login-status">
                            {status}
                        </div>
                    )}

                    {/* Google Login Button */}
                    <a href="/auth/google" className="login-google-btn">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Sign in with Google
                    </a>

                    <div className="login-divider">OR CONTINUE WITH EMAIL</div>

                    {/* Login Form */}
                    <form onSubmit={submit}>
                        
                        <div className="login-field">
                            <label htmlFor="email" className="login-field__label">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="login-field__input"
                                placeholder="name@example.com"
                                autoComplete="username"
                                required
                            />
                            {errors.email && <div className="login-field__error">{errors.email}</div>}
                        </div>

                        <div className="login-field">
                            <label htmlFor="password" className="login-field__label">Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="login-field__input"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />
                            {errors.password && <div className="login-field__error">{errors.password}</div>}
                        </div>

                        <div className="login-row">
                            <label className="login-remember">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                Remember me
                            </label>

                            {canResetPassword && (
                                <Link href={route('password.request')} className="login-forgot">
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <button type="submit" className="login-submit-btn" disabled={processing}>
                            Log in
                        </button>
                    </form>

                    <div className="login-register">
                        Don't have an account? <Link href={route('register')}>Sign up here</Link>
                    </div>

                </div>
            </div>
        </div>
    );
}