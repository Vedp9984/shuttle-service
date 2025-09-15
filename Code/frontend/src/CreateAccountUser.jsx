import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

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
  });
 
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSignInRedirect = () => {
        navigate("/");
    };

  const handleSignUp = async () => {
    if (!agreeToTerms) {
      alert("Please agree to the terms of service");
      return;
    }

    const requiredFields = ["firstName", "lastName", "email", "contactNo", "password"];
    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      alert(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        username: formData.email.split("@")[0], // generate username from email
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.contactNo,
        userType,
      });

      alert(`✅ ${userType} account created successfully!`);
      console.log("Register response:", res.data);

      localStorage.setItem("token", res.data.token);
      window.location.href = "/"; // redirect to login
    } catch (err) {
      alert("❌ Registration failed: " + (err.response?.data?.msg || "Server error"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-500 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-b from-teal-500 to-gray-100 rounded-lg shadow-lg">
        {/* Header */}
        <div className="text-center pt-8 pb-6">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Create an account</h1>
          <p className="text-gray-700 text-sm">Join our app today</p>
        </div>

        {/* User Type Selection */}
        <div className="flex gap-4 px-8 mb-8">
          {["User", "Driver"].map((type) => (
            <button
              key={type}
              onClick={() => setUserType(type)}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors border-2 ${
                userType === type
                  ? "bg-teal-600 text-white border-teal-700"
                  : "bg-transparent text-gray-700 border-gray-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Form Fields */}
        <div className="px-8 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-blue-900 mb-1">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full bg-black bg-opacity-90 border border-teal-400 rounded-xl px-3 py-2 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Rohan"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-blue-900 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full bg-black bg-opacity-90 border border-teal-400 rounded-xl px-3 py-2 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Kumar"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs text-blue-900 mb-1">Email Id</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full bg-black bg-opacity-90 border border-teal-400 rounded-xl px-3 py-2 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="rohankumar992p@gmail.com"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-xs text-blue-900 mb-1">Contact No.</label>
            <input
              type="tel"
              value={formData.contactNo}
              onChange={(e) => handleInputChange("contactNo", e.target.value)}
              className="w-full bg-black bg-opacity-90 border border-teal-400 rounded-xl px-3 py-2 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="7569384975"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs text-blue-900 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full bg-black bg-opacity-90 border border-teal-400 rounded-xl px-3 py-2 pr-10 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="px-8 mt-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-teal-600 bg-transparent border-2 border-gray-400 rounded focus:ring-teal-500 focus:ring-2"
            />
            <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer">
              By continuing, you agree to our{" "}
              <span className="text-black font-medium">terms of service.</span>
            </label>
          </div>
        </div>

        {/* Sign Up Button */}
        <div className="px-8 mt-6">
          <button
            onClick={handleSignUp}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-3 rounded-full transition-colors"
          >
            Sign Up
          </button>
        </div>

                {/* Sign In Link */}
        <div className="text-center p-8">
            <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
                onClick={handleSignInRedirect}
                className="text-teal-800 font-medium hover:underline focus:outline-none"
            >
                Sign in here
            </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountUser;
