
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-transparent">
      <h1 className="text-lg font-bold text-red-500 cursor-pointer" onClick={() => navigate("/home")}>
        Kutt
      </h1>
      <div className="space-x-3">
        {user?.role === "ADMIN" && (
          <button onClick={() => navigate("/admin")} className="bg-purple-600 text-white px-4 py-2 rounded">
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
    </header>
  );
}
