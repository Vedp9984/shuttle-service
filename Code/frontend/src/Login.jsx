import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("User");
  const [showPassword, setShowPassword] = useState(false);
  const [keepMeSignedIn, setKeepMeSignedIn] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogin = async () => {
    if (!formData.userId || !formData.password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username: formData.userId, // backend expects "username"
        password: formData.password,
        userType,
      });

      alert(`✅ ${userType} login successful!`);
      console.log("Login response:", res.data);

      // Save token
      if (keepMeSignedIn) {
        localStorage.setItem("token", res.data.token);
      } else {
        sessionStorage.setItem("token", res.data.token);
      }
    } catch (err) {
      alert("❌ Login failed: " + (err.response?.data?.msg || "Server error"));
    }
  };

  const handleCreateAccount = () => {
    navigate("/register");
  };

  const handleForgotPassword = () => {
    alert("Redirecting to forgot password page...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-400 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-b from-yellow-400 to-gray-100 rounded-lg shadow-lg">
        {/* Header */}
        <div className="text-center pt-8 pb-6">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Login</h1>
          <p className="text-black text-sm">Welcome back to the app</p>
        </div>

        {/* User Type Selection */}
        <div className="flex gap-2 px-8 mb-8">
          {["User", "Admin", "Driver"].map((type) => (
            <button
              key={type}
              onClick={() => setUserType(type)}
              className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-colors ${
                userType === type
                  ? "bg-yellow-600 text-black border-2 border-yellow-700"
                  : "bg-yellow-500 text-gray-600 border-2 border-yellow-600"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Form Fields */}
        <div className="px-8 space-y-6">
          {/* User ID */}
          <div>
            <label className="block text-xs text-blue-900 mb-1">User Id</label>
            <input
              type="text"
              value={formData.userId}
              onChange={(e) => handleInputChange("userId", e.target.value)}
              className="w-full bg-black bg-opacity-90 border border-teal-400 border-opacity-30 rounded-xl px-4 py-3 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="rohanK123"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-blue-900">Password</label>
              <button
                onClick={handleForgotPassword}
                className="text-xs text-teal-700 hover:underline focus:outline-none"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full bg-black bg-opacity-90 border border-red-400 border-opacity-30 rounded-xl px-4 py-3 pr-12 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="••••••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Keep me signed in */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="keepSignedIn"
              checked={keepMeSignedIn}
              onChange={(e) => setKeepMeSignedIn(e.target.checked)}
              className="w-4 h-4 text-yellow-600 bg-transparent border-2 border-gray-400 rounded focus:ring-yellow-500 focus:ring-2"
            />
            <label
              htmlFor="keepSignedIn"
              className="text-xs text-blue-900 cursor-pointer"
            >
              Keep me signed in
            </label>
          </div>
        </div>

        {/* Login Button */}
        <div className="px-8 mt-8">
          <button
            onClick={handleLogin}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-3 rounded-full transition-colors"
          >
            Login
          </button>
        </div>

        {/* Create Account Link */}
        <div className="text-center pt-4 pb-8">
          <button
            onClick={handleCreateAccount}
            className="text-sm text-black font-medium hover:underline focus:outline-none"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
