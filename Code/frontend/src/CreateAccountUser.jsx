import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const CreateAccountUser = () => {
    const navigate = useNavigate();
    const [userType, setUserType] = useState("User");
    const [showPassword, setShowPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        contactNo: "",
        password: "",
        licenseNumber: ""
    });

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSignUp = async () => {
        if (!agreeToTerms) {
            toast.warn("Please agree to the terms of service");
            return;
        }

        const { firstName, lastName, email, contactNo, password, licenseNumber } = formData;
        if (!firstName || !lastName || !email || !contactNo || !password) {
            toast.error("Please fill in all required fields.");
            return;
        }
        if (userType === 'Driver' && !licenseNumber) {
            toast.error("Please provide your license number.");
            return;
        }

        try {
            // 'username' is no longer sent to the backend
            await axios.post("http://localhost:5000/api/auth/register", {
                email,
                password,
                firstName,
                lastName,
                phoneNumber: contactNo,
                userType,
                licenseNumber: userType === 'Driver' ? licenseNumber : undefined,
            });

            toast.success(`${userType} account created! Redirecting to login...`, {
                onClose: () => navigate("/login"),
                autoClose: 2000,
            });

        } catch (err) {
            toast.error("Registration failed: " + (err.response?.data?.msg || "Server error"));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#25a3a3] to-[#78d2d2] flex items-center justify-center p-4">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            <div className="w-full max-w-md bg-transparent rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
                <div className="text-left">
                    <h1 className="text-4xl sm:text-5xl font-bold text-[#001E39]">Create an account</h1>
                    <p className="text-[#001E39] mt-2">Join our app today</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    {["User", "Admin", "Driver"].map((type) => (
                        <button key={type} onClick={() => setUserType(type)} className={`flex-1 py-2 px-4 rounded-lg text-white font-semibold transition-colors ${userType === type ? "bg-[#006767]" : "bg-[#00A3A3]"}`}>
                            {type}
                        </button>
                    ))}
                </div>
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-[#001E39] mb-1">First Name</label>
                            <input type="text" value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} className="w-full bg-black rounded-xl px-4 py-3 text-white placeholder:text-[#BFBFBF] focus:outline-none focus:ring-2 focus:ring-[#006767]" placeholder="Rohan"/>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-[#001E39] mb-1">Last Name</label>
                            <input type="text" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} className="w-full bg-black rounded-xl px-4 py-3 text-white placeholder:text-[#BFBFBF] focus:outline-none focus:ring-2 focus:ring-[#006767]" placeholder="Kumar"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#001E39] mb-1">Email Id</label>
                        <input type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="w-full bg-black rounded-xl px-4 py-3 text-white placeholder:text-[#BFBFBF] focus:outline-none focus:ring-2 focus:ring-[#006767]" placeholder="rohan.kumar@example.com"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#001E39] mb-1">Contact No.</label>
                        <input type="tel" value={formData.contactNo} onChange={(e) => handleInputChange("contactNo", e.target.value)} className="w-full bg-black rounded-xl px-4 py-3 text-white placeholder:text-[#BFBFBF] focus:outline-none focus:ring-2 focus:ring-[#006767]" placeholder="7569384975"/>
                    </div>
                    
                    {userType === 'Driver' && (
                         <div>
                            <label className="block text-sm font-medium text-[#001E39] mb-1">License Number</label>
                            <input type="text" value={formData.licenseNumber} onChange={(e) => handleInputChange("licenseNumber", e.target.value)} className="w-full bg-black rounded-xl px-4 py-3 text-white placeholder:text-[#BFBFBF] focus:outline-none focus:ring-2 focus:ring-[#006767]" placeholder="e.g., DL12345XYZ"/>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-[#001E39] mb-1">Password</label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => handleInputChange("password", e.target.value)} className="w-full bg-black rounded-xl px-4 py-3 pr-10 text-white placeholder:text-[#BFBFBF] focus:outline-none focus:ring-2 focus:ring-[#006767]" placeholder="••••••••••"/>
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                    <input type="checkbox" id="terms" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-[#001E39]"/>
                    <label htmlFor="terms" className="text-sm text-[#001E39] cursor-pointer">By continuing, you agree to our <span className="font-bold">terms of service.</span></label>
                </div>
                <div className="pt-2">
                    <button onClick={handleSignUp} className="w-full bg-[#006767] hover:bg-opacity-90 text-white font-bold py-3 rounded-xl transition-all">Sign Up</button>
                </div>
                <div className="text-center">
                    <p className="text-sm text-[#001E39]">Already have an account?{" "}
                        <button onClick={() => navigate("/login")} className="font-bold text-[#001E39] hover:underline focus:outline-none">Sign in here</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CreateAccountUser;
