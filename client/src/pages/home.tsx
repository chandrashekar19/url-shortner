import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getLinks } from "@/apis/links";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await getLinks();
      setLinks(data.data);
    })();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-semibold">Welcome, {user?.email}</h1>
        <div className="space-x-2">
          {user?.role === "ADMIN" && (
            <button
              onClick={() => navigate("/admin")}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              Admin
            </button>
          )}
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Log out
          </button>
        </div>
      </div>

      <h2 className="mb-4 font-medium">Recent shortened links</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Original URL</th>
            <th className="p-2">Short link</th>
            <th className="p-2">Views</th>
          </tr>
        </thead>
        <tbody>
          {links.map((link: any) => (
            <tr key={link.id} className="border-t">
              <td className="p-2">{link.target}</td>
              <td className="p-2">{link.shortUrl}</td>
              <td className="p-2">{link.views || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
