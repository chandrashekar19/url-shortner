import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "@/apis/auth";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await loginApi(email, password);
      login({ ...data, role: data.email.includes("admin") ? "ADMIN" : "USER" });
      navigate("/home");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#f8f4f4]">
      <h2 className="text-2xl mb-6 font-semibold">Kutt — Log in</h2>

      <form onSubmit={handleSubmit} className="w-96 bg-white p-6 rounded-2xl shadow">
        <label className="block mb-2 font-medium">Email address:</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded-lg mb-4"
        />

        <label className="block mb-2 font-medium">Password:</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full rounded-lg mb-4"
        />

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
          >
            Log In
          </button>

          {/* ✅ Navigate to Signup Page */}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="flex-1 bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
          >
            Sign Up
          </button>
        </div>

        {/* Optional small link under form */}
        <p className="text-center text-sm mt-4 text-gray-600">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-purple-600 cursor-pointer hover:underline"
          >
            Sign up here
          </span>
        </p>
      </form>
    </div>
  );
}
