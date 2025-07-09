import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building,
  Briefcase,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../libs/apis";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "USER",
    companyName: "",
    companySize: "",
    industry: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoadings, setIsLoadings] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);

  const { setUserData, setTokens, userData, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoadings(true);
    setError("");

    if (formData.password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoadings(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoadings(false);
      return;
    }

    try {
      const response = await api.post("/auth/register", formData);
      if (response.success) {
        setIsOtpSent(true);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoadings(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoadings(true);
    setError("");
    try {
      const response = await api.post("/auth/verify-email", {
        email: formData.email,
        otp: otp,
      });
      if (response.success) {
        setUserData(response.data.user);
        setTokens(response.data.accessToken);
        navigate("/");
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoadings(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  useEffect(() => {
    if (isLoading) return;
    if (userData) {
      navigate("/");
    }
  }, [userData, navigate, isLoading]);

  const companySizes = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1000+",
  ];

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Consulting",
    "Media & Entertainment",
    "Real Estate",
    "Other",
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-blue-100 px-2 md:px-10">
      {/* Left Side: Branding & Features */}
      <div className="hidden md:flex flex-col justify-start items-start w-full md:w-1/2 px-8 ml-6 mt-6 md:px-8 py-8 md:pt-16">
        <div className="flex items-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-md mr-4">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <span className="text-3xl font-bold text-gray-900">JobFlow</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Hire Top Talent <br /> with{" "}
          <span className="text-blue-600">JobFlow</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-xl">
          Post jobs, manage applicants, and grow your team with ease. Connect
          with thousands of candidates and top companies on JobFlow.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl">
          <div className="flex-1 bg-white rounded-2xl shadow p-6 flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="font-bold text-lg text-gray-900">
                10,000+ Candidates
              </div>
              <div className="text-gray-500 text-sm">Active job seekers</div>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-2xl shadow p-6 flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="font-bold text-lg text-gray-900">
                500+ Companies
              </div>
              <div className="text-gray-500 text-sm">Top employers</div>
            </div>
          </div>
        </div>
      </div>
      {/* Right Side: Signup Form */}
      <div className="flex flex-1 items-center justify-center py-12 px-4 sm:px-8 bg-transparent">
        <div className="w-full max-w-xl">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Create Your Account
            </h2>
            <p className="mb-6 text-sm text-gray-600 text-center">
              Sign up to start hiring or finding jobs
            </p>
            <form onSubmit={isOtpSent ? handleOtpSubmit : handleSubmit} className="space-y-8">
              {/* Role Selection */}
              <div>
                <div className="mb-2 text-sm font-semibold text-gray-700">
                  Sign up as
                </div>
                <div className="flex space-x-4 justify-center">
                  <button
                    type="button"
                    onClick={() => handleInputChange("role", "USER")}
                    className={`flex flex-col items-center px-6 py-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      formData.role === "USER"
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <User className="h-6 w-6 mb-1" />
                    <span className="font-medium">Job Seeker</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("role", "COMPANY")}
                    className={`flex flex-col items-center px-6 py-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      formData.role === "company"
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Building className="h-6 w-6 mb-1" />
                    <span className="font-medium">Employer</span>
                  </button>
                </div>
              </div>
              {/* Personal Info */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-gray-50"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-gray-50"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-gray-50"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              {/* Company Info */}
              {formData.role === "COMPANY" && (
                <div>
                  <div className="mb-6">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) =>
                        handleInputChange("companyName", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-gray-50"
                      placeholder="Enter your company name"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Company Size
                      </label>
                      <select
                        value={formData.companySize}
                        onChange={(e) =>
                          handleInputChange("companySize", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-gray-50"
                      >
                        <option value="">Select company size</option>
                        {companySizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Industry
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) =>
                          handleInputChange("industry", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-gray-50"
                      >
                        <option value="">Select industry</option>
                        {industries.map((industry) => (
                          <option key={industry} value={industry}>
                            {industry}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
              {/* Security */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-gray-50"
                        placeholder="Create password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-gray-50"
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {isOtpSent && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    OTP
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-gray-50 tracking-widest"
                      placeholder="Enter OTP"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </div>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={isLoadings || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-md"
              >
                {isLoadings
                  ? "Creating account..."
                  : isOtpSent
                  ? "Verify OTP"
                  : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
