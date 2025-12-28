import { useState, FormEvent, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupApi } from "@/apis/auth";
import { useAuth } from "@/hooks/use-auth";
import {
    isValidEmail,
    validatePassword,
    RateLimiter,
} from "@/utils/security";

// Client-side rate limiter for signup attempts
const signupRateLimiter = new RateLimiter(3, 60000);

/**
 * Signup Page
 *
 * Security features:
 * - Client-side rate limiting
 * - Strong password validation with requirements displayed
 * - Input validation before submission
 * - Secure error messages
 */
export default function Signup() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<string[]>([]);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            navigate("/home", { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Validate password strength on change
    useEffect(() => {
        if (password) {
            const { errors } = validatePassword(password);
            setPasswordStrength(errors);
        } else {
            setPasswordStrength([]);
        }
    }, [password]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Client-side rate limiting
        if (!signupRateLimiter.isAllowed("signup")) {
            const remaining = Math.ceil(
                signupRateLimiter.getRemainingTime("signup") / 1000
            );
            setError(`Too many signup attempts. Please wait ${remaining} seconds.`);
            return;
        }

        // Validate email format
        if (!isValidEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        // Validate password strength
        const { isValid, errors } = validatePassword(password);
        if (!isValid) {
            setError(errors[0]);
            return;
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await signupApi(email, password);
            setSuccess(
                response.message ||
                "Account created successfully! Please check your email to verify your account."
            );

            // Clear form
            setEmail("");
            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getStrengthColor = () => {
        if (password.length === 0) return "bg-slate-200 dark:bg-slate-700";
        if (passwordStrength.length > 2) return "bg-red-500";
        if (passwordStrength.length > 0) return "bg-amber-500";
        return "bg-green-500";
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
            {/* Logo / Branding */}
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Kutt
                </h1>
                <p className="text-muted-foreground mt-2">Create your account</p>
            </div>

            {/* Signup Card */}
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
                    <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
                        Get Started
                    </h2>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                            <p className="text-green-700 dark:text-green-400 text-sm text-center">
                                {success}
                            </p>
                            <div className="mt-3 text-center">
                                <Link
                                    to="/login"
                                    className="text-green-700 dark:text-green-400 font-medium hover:underline"
                                >
                                    Go to Login
                                </Link>
                            </div>
                        </div>
                    )}

                    {!success && (
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
                                        autoComplete="new-password"
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
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {password && (
                                    <div className="mt-2">
                                        <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${getStrengthColor()}`}
                                                style={{
                                                    width:
                                                        passwordStrength.length > 2
                                                            ? "33%"
                                                            : passwordStrength.length > 0
                                                                ? "66%"
                                                                : "100%",
                                                }}
                                            />
                                        </div>
                                        {passwordStrength.length > 0 && (
                                            <ul className="mt-2 text-xs text-muted-foreground space-y-1">
                                                {passwordStrength.map((err, i) => (
                                                    <li key={i} className="flex items-center gap-1">
                                                        <svg
                                                            className="w-3 h-3 text-amber-500"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                            />
                                                        </svg>
                                                        {err}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-foreground mb-2"
                                >
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
                                    placeholder="••••••••"
                                />
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="mt-2 text-xs text-destructive">
                                        Passwords do not match
                                    </p>
                                )}
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
                                disabled={isLoading || passwordStrength.length > 0}
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
                                        Creating account...
                                    </span>
                                ) : (
                                    "Create Account"
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Login Link */}
                <p className="mt-6 text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
