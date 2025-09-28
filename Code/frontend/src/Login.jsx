import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { login as saveSession } from './auth';

const Login = () => {
    const navigate = useNavigate();
    const [userType, setUserType] = useState("User");
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "", // Changed from userId to email
        password: "",
    });

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleLogin = async () => {
        if (!formData.email || !formData.password) {
            toast.error("Please provide both your Email and password.");
            return;
        }

        try {
            // Send 'email' instead of 'username' to the backend
            const res = await axios.post("http://localhost:5000/api/auth/login", {
                email: formData.email,
                password: formData.password,
                userType,
            });

            saveSession(res.data.user);

            toast.success(`Welcome back! Login successful. Redirecting...`, {
                autoClose: 1500,
            });

            setTimeout(() => {
                const role = res.data.user.role;
                if (role === 'Admin') navigate("/admin");
                else if (role === 'Driver') navigate("/driver");
                else navigate("/homepage");
            }, 1500);

        } catch (err) {
            toast.error("Login failed: " + (err.response?.data?.msg || "Server error, please try again."));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-yellow-300 to-yellow-50 flex items-center justify-center p-4">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            <div className="w-full max-w-md bg-transparent rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
                <div className="text-left">
                    <h1 className="text-4xl sm:text-5xl font-bold text-[#001E39]">Login</h1>
                    <p className="text-[#001E39] mt-2">Welcome back to the app</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    {["User", "Admin", "Driver"].map((type) => (
                        <button key={type} onClick={() => setUserType(type)} className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${userType === type ? "bg-yellow-500 text-gray-800" : "bg-yellow-400 text-gray-700"}`}>
                            {type}
                        </button>
                    ))}
                </div>
                <div className="space-y-4">
                    <div>
                        {/* Label and input updated for Email */}
                        <label className="block text-sm font-medium text-[#001E39] mb-1">Email Id</label>
                        <input type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="w-full bg-black rounded-xl px-4 py-3 text-white placeholder:text-[#BFBFBF] focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="your.email@example.com"/>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-medium text-[#001E39]">Password</label>
                            <button onClick={() => toast.info("Password recovery feature coming soon!")} className="text-sm font-bold text-[#001E39] hover:underline focus:outline-none">Forgot Password?</button>
                        </div>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => handleInputChange("password", e.target.value)} className="w-full bg-black rounded-xl px-4 py-3 pr-10 text-white placeholder:text-[#BFBFBF] focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="••••••••••"/>
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="pt-2">
                    <button onClick={handleLogin} className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-800 font-bold py-3 rounded-xl transition-all">
                        Login
                    </button>
                </div>
                <div className="text-center">
                    <p className="text-sm text-[#001E39]">Don't have an account?{" "}
                        <button onClick={() => navigate("/register")} className="font-bold text-[#001E39] hover:underline focus:outline-none">Create an account</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
