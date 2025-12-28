import { useState, FormEvent, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { loginApi } from "@/apis/auth";
import { useAuth } from "@/hooks/use-auth";
import {
    isValidEmail,
    validatePassword,
    RateLimiter,
} from "@/utils/security";

// Client-side rate limiter for login attempts
const loginRateLimiter = new RateLimiter(5, 60000);

/**
 * Login Page
 *
 * Security features:
 * - Client-side rate limiting
 * - Input validation before submission
 * - No role determination from email (server verified)
 * - Secure error messages that don't leak information
 * - Redirect parameter validation
 */
export default function Login() {
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Get redirect URL from query params (with validation)
    const redirectUrl = searchParams.get("redirect");
    const sessionExpired = searchParams.get("session") === "expired";

    // Validate redirect URL to prevent open redirect attacks
    const getValidRedirectUrl = (): string => {
        if (!redirectUrl) return "/home";
        // Only allow relative URLs starting with /
        if (redirectUrl.startsWith("/") && !redirectUrl.startsWith("//")) {
            return redirectUrl;
        }
        return "/home";
    };

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            navigate(getValidRedirectUrl(), { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        // Client-side rate limiting
        if (!loginRateLimiter.isAllowed("login")) {
            const remaining = Math.ceil(
                loginRateLimiter.getRemainingTime("login") / 1000
            );
            setError(`Too many login attempts. Please wait ${remaining} seconds.`);
            return;
        }

        // Validate email format
        if (!isValidEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        // Validate password length
        const passwordValidation = validatePassword(password);
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await loginApi(email, password);

            // Pass the response to login - role will be verified server-side
            await login(response);

            navigate(getValidRedirectUrl(), { replace: true });
        } catch (err) {
            // Generic error message to prevent user enumeration
            setError("Invalid email or password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
            {/* Logo / Branding */}
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Kutt
                </h1>
                <p className="text-muted-foreground mt-2">
                    Modern URL Shortener
                </p>
            </div>

            {/* Session expired notification */}
            {sessionExpired && (
                <div className="w-full max-w-md mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <p className="text-amber-700 dark:text-amber-400 text-sm text-center">
                        Your session has expired. Please log in again.
                    </p>
                </div>
            )}

            {/* Login Card */}
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
                    <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
                        Welcome Back
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-foreground mb-2"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-foreground mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                                <p className="text-destructive text-sm text-center">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Forgot Password Link */}
                    <div className="mt-4 text-center">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                </div>

                {/* Sign Up Link */}
                <p className="mt-6 text-center text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                        to="/signup"
                        className="font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}
