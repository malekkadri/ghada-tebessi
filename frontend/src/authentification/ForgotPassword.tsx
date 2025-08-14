import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authService } from "../services/api";
import NexCardLogoFinal from '../atoms/Logo/NexCardLogoFinal';
import Image from "./Image";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (fieldName: string, value: string) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (!value) {
        newErrors[fieldName] = `${fieldName} is required`;
      } else if (fieldName === "email" && !validateEmail(value)) {
        newErrors[fieldName] = "Please enter a valid email address";
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });
  };

  const renderToastMessage = (message: string, type: "success" | "error") => {
    toast(message, { type });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    validateField("email", email);
  
    if (Object.keys(errors).length > 0 || !email) {
      return;
    }
  
    try {
      const response = await authService.forgotPassword(email);
      
      if (response.data && !response.data.success) {
        renderToastMessage(
          response.data.message || "Failed to send reset email", 
          "error"
        );
        return;
      }
  
      renderToastMessage(
        "If an account exists with this email, you'll receive a password reset link",
        "success"
      );
      
      setTimeout(() => {
        navigate("/check-email");
      }, 2000);
  
    } catch (error: any) {
      console.error("Password reset error:", error);
      
      if (error.response?.data?.message === "Email not found") {
        setErrors({ email: "We don't recognize that email address" });
      } else {
        renderToastMessage(
          error.response?.data?.message || 
          "An error occurred. Please try again later.",
          "error"
        );
      }
    }
  };
  return (
    <div className="signup-container">
      <ToastContainer />
      
      <div className="logo-top-left" style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: '1000',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}>
        <NexCardLogoFinal size="md" showText={true} />
      </div>

      <div className="form-container-signup">
        <div className="form-wrapper-signup">
          <h3 className="form-signup">Forgot Password</h3>
          <p className="text-primary text-md text-center">
            Please enter your email to reset your password.
          </p>
          <form className="form" onSubmit={handleSubmit}>
            <div className="flex-column-signup">
              <label>Email</label>
              <div className="inputForm-signup">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <input
                  type="email"
                  className="input-signup"
                  placeholder="Enter your Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateField("email", e.target.value);
                  }}
                  onBlur={() => validateField("email", email)}
                  required
                />
              </div>
              {errors.email && <small className="text-danger">{errors.email}</small>}
            </div>

            <button type="submit" className="button-submit-reset-pwd btn btn-primary bg-primary">
              Reset Password
            </button>

            <p className="p">
              Remember your password? <a href="/sign-in" className="span-signup">Login</a>
            </p>
          </form>
        </div>
      </div>

      <Image />
    </div>
  );
};

export default ForgotPassword;