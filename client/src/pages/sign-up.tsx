import { signupApi } from "@/apis/auth";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      const data = await signupApi(email, password);
      login({ ...data, role: data.email.includes("admin") ? "ADMIN" : "USER" });
      navigate("/home");
    } catch (error: any) {
      alert(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#f8f4f4]">
      <form onSubmit={handleSignup} className="bg-white p-6 rounded-2xl shadow-md w-96">
        <h2 className="text-center text-2xl mb-4 font-semibold">Create your Kutt account</h2>

        <label className="block mb-2 font-medium">Email:</label>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />

        <label className="block mb-2 font-medium">Password:</label>
        <input
          type="password"
          required
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />

        <label className="block mb-2 font-medium">Confirm Password:</label>
        <input
          type="password"
          required
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border p-2 w-full rounded mb-4"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-600 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
