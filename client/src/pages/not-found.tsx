import { Link } from "react-router-dom";

/**
 * 404 Not Found Page
 *
 * Displayed when user navigates to a non-existent route
 */
export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="max-w-md w-full text-center">
                {/* 404 Illustration */}
                <div className="mb-8">
                    <div className="text-9xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        404
                    </div>
                    <div className="w-40 h-1 mx-auto mt-4 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600" />
                </div>

                <h1 className="text-3xl font-bold text-foreground mb-4">
                    Page Not Found
                </h1>

                <p className="text-muted-foreground mb-8 text-lg">
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
                    >
                        Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        Go Back
                    </button>
                </div>

                {/* Optional: Common Links */}
                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-muted-foreground mb-4">
                        Looking for something specific?
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <Link
                            to="/home"
                            className="text-primary hover:underline"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/login"
                            className="text-primary hover:underline"
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className="text-primary hover:underline"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
