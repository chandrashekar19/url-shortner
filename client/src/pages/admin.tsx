import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  Link,
  Globe,
  ArrowLeft,
  Search,
  Ban,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getLinksAdmin, banLink, type LinkData } from "@/apis/links";
import { getUsersAdmin, banUser, type UserData } from "@/apis/users";
import { getDomainsAdmin, banDomain, type DomainData } from "@/apis/domain";

type Tab = "links" | "users" | "domains";

/**
 * Admin Dashboard
 *
 * Security features:
 * - Admin role verified server-side
 * - Rate limiting on admin actions
 * - Confirmation dialogs for destructive actions
 */
export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>("links");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [links, setLinks] = useState<LinkData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [domains, setDomains] = useState<DomainData[]>([]);

  // Pagination
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Fetch data based on active tab
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      switch (activeTab) {
        case "links": {
          const response = await getLinksAdmin(limit, page * limit, {
            search: search || undefined,
          });
          setLinks(response.data);
          setTotal(response.total);
          break;
        }
        case "users": {
          const response = await getUsersAdmin(limit, page * limit, {
            search: search || undefined,
          });
          setUsers(response.data);
          setTotal(response.total);
          break;
        }
        case "domains": {
          const response = await getDomainsAdmin(limit, page * limit, {
            search: search || undefined,
          });
          setDomains(response.data);
          setTotal(response.total);
          break;
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load data");
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page when tab or search changes
  useEffect(() => {
    setPage(0);
  }, [activeTab, search]);

  // Handle ban actions
  const handleBanLink = async (id: string) => {
    if (!confirm("Are you sure you want to ban this link?")) return;

    try {
      await banLink(id);
      fetchData();
    } catch {
      setError("Failed to ban link");
    }
  };

  const handleBanUser = async (id: number) => {
    if (!confirm("Are you sure you want to ban this user?")) return;

    try {
      await banUser(id, { links: true });
      fetchData();
    } catch {
      setError("Failed to ban user");
    }
  };

  const handleBanDomain = async (id: number) => {
    if (!confirm("Are you sure you want to ban this domain?")) return;

    try {
      await banDomain(id, { links: true });
      fetchData();
    } catch {
      setError("Failed to ban domain");
    }
  };

  const totalPages = Math.ceil(total / limit);

  const tabs = [
    { id: "links" as Tab, label: "Links", icon: Link, count: null },
    { id: "users" as Tab, label: "Users", icon: Users, count: null },
    { id: "domains" as Tab, label: "Domains", icon: Globe, count: null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/home")}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Shield className="w-6 h-6 text-violet-600" />
              <h1 className="text-xl font-bold text-foreground">
                Admin Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 mb-6">
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === tab.id
                    ? "text-violet-600 border-b-2 border-violet-600"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-destructive">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              {/* Links Tab */}
              {activeTab === "links" && (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {links.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      No links found
                    </div>
                  ) : (
                    links.map((link) => (
                      <div
                        key={link.id}
                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{link.link}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {link.target}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>{link.visit_count} visits</span>
                              <span>
                                {new Date(link.created_at).toLocaleDateString()}
                              </span>
                              {link.banned && (
                                <span className="text-red-500">Banned</span>
                              )}
                            </div>
                          </div>
                          {!link.banned && (
                            <button
                              onClick={() => handleBanLink(link.id)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                              title="Ban link"
                            >
                              <Ban className="w-5 h-5 text-red-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {users.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      No users found
                    </div>
                  ) : (
                    users.map((u) => (
                      <div
                        key={u.id}
                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{u.email}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>{u.links_count || 0} links</span>
                              <span>Role: {u.role}</span>
                              {u.banned && (
                                <span className="text-red-500">Banned</span>
                              )}
                            </div>
                          </div>
                          {!u.banned && u.role !== "ADMIN" && (
                            <button
                              onClick={() => handleBanUser(u.id)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                              title="Ban user"
                            >
                              <Ban className="w-5 h-5 text-red-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Domains Tab */}
              {activeTab === "domains" && (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {domains.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      No domains found
                    </div>
                  ) : (
                    domains.map((domain) => (
                      <div
                        key={domain.id}
                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{domain.address}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>{domain.links_count || 0} links</span>
                              {domain.homepage && (
                                <span>Homepage: {domain.homepage}</span>
                              )}
                              {domain.banned && (
                                <span className="text-red-500">Banned</span>
                              )}
                            </div>
                          </div>
                          {!domain.banned && (
                            <button
                              onClick={() => handleBanDomain(domain.id)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                              title="Ban domain"
                            >
                              <Ban className="w-5 h-5 text-red-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-muted-foreground">
                    Showing {page * limit + 1} -{" "}
                    {Math.min((page + 1) * limit, total)} of {total}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                      disabled={page >= totalPages - 1}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
