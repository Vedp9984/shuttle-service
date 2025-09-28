// src/Welcome.jsx
import { useNavigate } from "react-router-dom";
import { Bus } from "lucide-react"; // Using lucide-react for a bus icon

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-between items-center p-8">
            {/* Spacer */}
            <div />

            {/* Main Content */}
            <div className="text-center flex flex-col items-center">
                {/* Logo */}
                <div className="mb-4">
                    <Bus size={64} className="text-yellow-400 mx-auto" />
                    <h1 className="text-5xl font-bold">
                        <span className="text-yellow-400">Sure</span>
                        <span className="text-teal-400">Bus</span>
                    </h1>
                </div>

                {/* Welcome Text */}
                <h2 className="text-3xl font-semibold mt-8 mb-2">Welcome to the app</h2>
                <p className="max-w-xs text-gray-400">
                    An app for convenient bus seat booking, tracking, schedules, payments, and travel updates.
                </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-sm">
                <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-full transition-colors mb-4"
                >
                    Get Started
                </button>
                <button
                    onClick={() => navigate("/register")}
                    className="w-full text-white font-semibold hover:underline focus:outline-none"
                >
                    Create an account
                </button>
            </div>
        </div>
    );
};

export default Welcome;