import React, { useState } from "react";
import {
  Building,
  MapPin,
  DollarSign,
  Clock,
  Tag,
  FileText,
  CheckCircle,
  Plus,
  X,
  ArrowLeft,
  Save,
  Send,
} from "lucide-react";
import { api } from "../libs/apis";
import { useAuth } from "../contexts/AuthContext";

const PostJobPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "FULL_TIME",
    category: "",
    salary: "",
    description: "",
    requirements: [""],
    benefits: [""],
    expiresAt: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]  ,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const { userData } = useAuth();

  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const response = await api.post("/jobs", {
        ...formData,
        company: userData.company.name,
      });
      if (response.success) {
        setIsSuccess(true);
        setFormData({
          title: "",
          company: "",
          location: "",
          type: "FULL_TIME",
          category: "",
          salary: "",
          description: "",
          requirements: [""],
          benefits: [""],
          expiresAt: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        });
        setCurrentStep(1);
      } else {
        throw new Error(response.message || "Failed to post job");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center max-w-md w-full">
          <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Job Posted Successfully!
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Your job posting has been created and is now live for candidates to
            discover.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setIsSuccess(false);
                setCurrentStep(1);
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Post Another Job
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-100 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold text-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    {
      number: 1,
      title: "Basic Info",
      description: "Job title and description",
    },
    {
      number: 2,
      title: "Job Details",
      description: "Location, type, and salary",
    },
    {
      number: 3,
      title: "Requirements",
      description: "Requirements and benefits",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Post a New Job
                </h1>
                <p className="text-gray-600 mt-2">
                  Find the perfect candidate for your team
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <Save className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">Auto-save enabled</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 font-semibold ${
                    currentStep >= step.number
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 border-transparent text-white shadow-lg"
                      : "bg-white border-gray-300 text-gray-500"
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-semibold text-gray-900">
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {step.description}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      currentStep > step.number
                        ? "bg-gradient-to-r from-blue-500 to-purple-600"
                        : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Basic Information
                  </h2>
                  <p className="text-gray-600">
                    Tell us about the Details of the Job
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Building className="inline h-4 w-4 mr-2 text-blue-600" />
                      Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg bg-white shadow-sm hover:shadow-md"
                      placeholder="e.g. Senior Frontend Developer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <FileText className="inline h-4 w-4 mr-2 text-blue-600" />
                      Job Description *
                    </label>
                    <textarea
                      required
                      rows={6}
                      minLength={50}
                      maxLength={2000}
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg bg-white shadow-sm hover:shadow-md resize-none"
                      placeholder="Describe the role, responsibilities, and what makes this opportunity exciting... (Minimum 50 characters)"
                    />
                    {formData.description && formData.description.length < 50 && (
                      <p className="text-red-500 text-sm mt-1">
                        Description must be at least 50 characters long
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!formData.title || !formData.description || formData.description.length < 50}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Job Details */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Job Details
                  </h2>
                  <p className="text-gray-600">
                    Specify location, type, and compensation
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <MapPin className="inline h-4 w-4 mr-2 text-blue-600" />
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg bg-white shadow-sm hover:shadow-md"
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Clock className="inline h-4 w-4 mr-2 text-blue-600" />
                      Job Type *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) =>
                        handleInputChange("type", e.target.value)
                      }
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg bg-white shadow-sm hover:shadow-md"
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="REMOTE">Remote</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Tag className="inline h-4 w-4 mr-2 text-blue-600" />
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg bg-white shadow-sm hover:shadow-md"
                    >
                      <option value="">Select Category</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Product">Product</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Sales">Sales</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <DollarSign className="inline h-4 w-4 mr-2 text-blue-600" />
                      Salary Range *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.salary}
                      onChange={(e) =>
                        handleInputChange("salary", e.target.value)
                      }
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg bg-white shadow-sm hover:shadow-md"
                      placeholder="e.g. $80,000 - $120,000"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={
                      !formData.location ||
                      !formData.category ||
                      !formData.salary
                    }
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Description and Requirements */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Job Requirements
                  </h2>
                  <p className="text-gray-600">
                    Describe the role, requirements, and benefits
                  </p>
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Requirements *
                  </label>
                  <div className="space-y-3">
                    {formData.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={requirement}
                            onChange={(e) =>
                              handleArrayChange(
                                "requirements",
                                index,
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                            placeholder="e.g. 3+ years of React experience"
                          />
                        </div>
                        {formData.requirements.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayItem("requirements", index)
                            }
                            className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem("requirements")}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium py-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Requirement</span>
                    </button>
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Benefits
                  </label>
                  <div className="space-y-3">
                    {formData.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={benefit}
                            onChange={(e) =>
                              handleArrayChange(
                                "benefits",
                                index,
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                            placeholder="e.g. Health insurance"
                          />
                        </div>
                        {formData.benefits.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem("benefits", index)}
                            className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem("benefits")}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium py-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Benefit</span>
                    </button>
                  </div>
                </div>

                {/* Expiration Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => handleInputChange("expiresAt", e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg bg-white shadow-sm hover:shadow-md"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-between pt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                  >
                    Previous
                  </button>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                    >
                      Save as Draft
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !formData.description}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Posting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          <span>Post Job</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJobPage;
