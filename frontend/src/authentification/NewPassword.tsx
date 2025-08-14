import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authService } from "../services/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import NexCardLogoFinal from '../atoms/Logo/NexCardLogoFinal';
import Image from "./Image";

const NewPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const validateField = (fieldName: string, value: string) => {
    setErrors(prev => {
      const newErrors = {...prev};
      if (!value) {
        newErrors[fieldName] = `${fieldName} is required`;
      } else if (fieldName === "password" && value.length < 8) {
        newErrors[fieldName] = "Password must be at least 8 characters";
      } else if (fieldName === "confirmPassword" && value !== password) {
        newErrors[fieldName] = "Passwords do not match";
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    validateField("password", password);
    validateField("confirmPassword", confirmPassword);

    if (Object.keys(errors).length > 0 || !password || !confirmPassword) {
      setIsSubmitting(false);
      return;
    }

    try {
      const token = searchParams.get("token");
      if (!token) throw new Error("Invalid or missing token");

      const response = await authService.resetPassword({ 
        token, 
        newPassword: password 
      });

      toast.success(response.data?.message || "Password changed successfully!");
      setTimeout(() => navigate("/sign-in"), 2000);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message || 
        "Failed to reset password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <ToastContainer />
      
      {/* Logo en haut à gauche de la page */}
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
          <h3 className="form-signup">
            Enter your new password
          </h3>
          <p className="text-primary text-md text-center">
            Choose a strong password with at least 8 characters.
          </p>
          
          <form className="form" onSubmit={handleSubmit}>
            <div className="flex-column-signup">
              <label>Password</label>
              <div className="inputForm-signup" style={{ position: 'relative' }}>
                <svg
                  height={20}
                  viewBox="-64 0 512 512"
                  width={20}
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                >
                  <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" />
                  <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-signup"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) validateField("password", e.target.value);
                  }}
                  onBlur={() => validateField("password", password)}
                  required
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {errors.password && (
                <small className="text-danger">{errors.password}</small>
              )}
            </div>

            <div className="flex-column-signup">
              <label>Confirm Password</label>
              <div className="inputForm-signup" style={{ position: 'relative' }}>
                <svg
                  height={20}
                  viewBox="-64 0 512 512"
                  width={20}
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                >
                  <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" />
                  <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" />
                </svg>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="input-signup"
                  placeholder="Confirm your Password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) validateField("confirmPassword", e.target.value);
                  }}
                  onBlur={() => validateField("confirmPassword", confirmPassword)}
                  required
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <small className="text-danger">{errors.confirmPassword}</small>
              )}
            </div>

            <button 
              type="submit" 
              className="button-submit-reset-pwd btn btn-primary bg-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>

      <Image />
    </div>
  );
};

export default NewPassword;