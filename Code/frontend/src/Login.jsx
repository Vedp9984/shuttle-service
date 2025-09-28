import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import "./App.css";

const Login = () => {
    const navigate = useNavigate();
    const [userType, setUserType] = useState("User");
    const [showPassword, setShowPassword] = useState(false);
    const [keepMeSignedIn, setKeepMeSignedIn] = useState(false);
    const [formData, setFormData] = useState({
        userId: "rohanK123",
        password: "••••••••••••••••",
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
            alert("Login failed: " + (err.response?.data?.msg || "Server error"));
        }
    };

    const handleCreateAccount = () => {
        navigate("/register");
    };

    const handleForgotPassword = () => {
        alert("Redirecting to forgot password page...");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-yellow-300 to-yellow-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-4xl font-bold text-blue-900 mb-2">Login</h1>
                    <p className="text-gray-700">Welcome back to the app</p>
                </div>

                {/* User Type Selection */}
                <div className="flex justify-center gap-2 mb-8">
                    {["User", "Admin", "Driver"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setUserType(type)}
                            className={`py-2 px-6 rounded-full text-sm font-semibold transition-colors ${userType === type
                                ? "bg-yellow-500 text-gray-800"
                                : "bg-yellow-400 text-gray-600"
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                    {/* User ID */}
                    <div>
                        <label className="block text-sm text-gray-700 mb-1 ml-4">
                            User Id
                        </label>
                        <input
                            type="text"
                            value={formData.userId}
                            onChange={(e) => handleInputChange("userId", e.target.value)}
                            className="w-full bg-black text-white rounded-full px-5 py-3 border-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex justify-between items-center mb-1 px-4">
                            <label className="text-sm text-gray-700">Password</label>
                            <button
                                onClick={handleForgotPassword}
                                className="text-sm text-gray-700 hover:underline focus:outline-none"
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                                className="w-full bg-black text-white rounded-full px-5 py-3 pr-12 border-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Keep me signed in */}
                    <div className="flex items-center gap-2 pl-4">
                        <input
                            type="checkbox"
                            id="keepSignedIn"
                            checked={keepMeSignedIn}
                            onChange={(e) => setKeepMeSignedIn(e.target.checked)}
                            className="appearance-none w-5 h-5 border-2 border-yellow-800 rounded-md cursor-pointer checked:bg-yellow-800 checked:border-transparent"
                            style={{
                                backgroundImage: keepMeSignedIn
                                    ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e\")"
                                    : "",
                            }}
                        />
                        <label
                            htmlFor="keepSignedIn"
                            className="text-sm text-gray-800 cursor-pointer"
                        >
                            Keep me signed in
                        </label>
                    </div>
                </div>

                {/* Login Button */}
                <div className="mt-8 mb-6">
                    <button
                        onClick={handleLogin}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-full transition-colors"
                    >
                        Login
                    </button>
                </div>

                {/* Create Account Link */}
                <div className="text-center">
                    <button
                        onClick={handleCreateAccount}
                        className="text-black font-semibold hover:underline focus:outline-none"
                    >
                        Create an account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;