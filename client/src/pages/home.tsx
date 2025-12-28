import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Link, ExternalLink, Copy, Check, Trash2, BarChart3, Plus, LogOut, Shield } from "lucide-react";
import { getLinks, createLink, deleteLink, type LinkData } from "@/apis/links";
import { useAuth } from "@/hooks/use-auth";
import { isValidURL, sanitizeHTML } from "@/utils/security";

/**
 * Home Page - Dashboard
 *
 * Features:
 * - Create new short links
 * - View all user links
 * - Copy links to clipboard
 * - Delete links
 * - View link statistics
 */
export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [links, setLinks] = useState<LinkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New link form state
  const [targetUrl, setTargetUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch links
  const fetchLinks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getLinks();
      setLinks(response.data);
    } catch (err) {
      setError("Failed to load links. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Create new link
  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!isValidURL(targetUrl) && !targetUrl.startsWith("http")) {
      // Try adding protocol
      const urlWithProtocol = `https://${targetUrl}`;
      if (!isValidURL(urlWithProtocol)) {
        setCreateError("Please enter a valid URL");
        return;
      }
    }

    setIsCreating(true);

    try {
      await createLink({
        target: targetUrl,
        customurl: customAlias || undefined,
        description: description || undefined,
      });

      // Clear form and refresh
      setTargetUrl("");
      setCustomAlias("");
      setDescription("");
      fetchLinks();
    } catch (err) {
      if (err instanceof Error) {
        setCreateError(err.message);
      } else {
        setCreateError("Failed to create link");
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Delete link
  const handleDeleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      await deleteLink(id);
      setLinks((prev) => prev.filter((link) => link.id !== id));
    } catch (err) {
      setError("Failed to delete link");
    }
  };

  // Copy link to clipboard
  const handleCopy = async (link: string, id: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link className="w-8 h-8 text-violet-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Kutt
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user?.email}
              </span>

              {user?.role === "ADMIN" && (
                <button
                  onClick={() => navigate("/admin")}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Link Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-violet-600" />
            Create Short Link
          </h2>

          <form onSubmit={handleCreateLink} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label
                  htmlFor="targetUrl"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Destination URL
                </label>
                <input
                  id="targetUrl"
                  type="text"
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com/your-long-url"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="customAlias"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Custom Alias (optional)
                </label>
                <input
                  id="customAlias"
                  type="text"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  placeholder="my-custom-link"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Description (optional)
                </label>
                <input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A short description"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {createError && (
              <p className="text-destructive text-sm">{createError}</p>
            )}

            <button
              type="submit"
              disabled={isCreating}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? "Creating..." : "Shorten URL"}
            </button>
          </form>
        </div>

        {/* Links List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-600" />
              Your Links
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-muted-foreground">Loading links...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-destructive">{error}</p>
              <button
                onClick={fetchLinks}
                className="mt-4 text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : links.length === 0 ? (
            <div className="p-12 text-center">
              <Link className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-muted-foreground">No links yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first short link above
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Short Link */}
                      <div className="flex items-center gap-2 mb-1">
                        <a
                          href={link.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-600 dark:text-violet-400 font-medium hover:underline truncate"
                        >
                          {link.link}
                        </a>
                        <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>

                      {/* Target URL */}
                      <p className="text-sm text-muted-foreground truncate">
                        {sanitizeHTML(link.target)}
                      </p>

                      {/* Description */}
                      {link.description && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {sanitizeHTML(link.description)}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {link.visit_count || 0} visits
                        </span>
                        <span>
                          Created:{" "}
                          {new Date(link.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleCopy(link.link, link.id)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                        title="Copy link"
                      >
                        {copiedId === link.id ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete link"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
