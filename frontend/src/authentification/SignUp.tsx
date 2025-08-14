import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "./Image";
import ReCAPTCHA from "react-google-recaptcha";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 
import NexCardLogoFinal from '../atoms/Logo/NexCardLogoFinal'; 

const SignUp: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (fieldName: string, value: string) => {
    if (!value) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [fieldName]: `${fieldName} is required`,
      }));
    } else if (fieldName === "email" && !validateEmail(value)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [fieldName]: "Please enter a valid email address",
      }));
    } else if (fieldName === "password" && value.length < 8) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [fieldName]: "Password must be at least 8 characters long",
      }));
    } else {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const renderToastMessage = (message: string, type: "success" | "error") => {
    toast(message, { type });
  };

  const handleRecaptchaChange = (token: string | null) => {
    if (token) {
      setRecaptchaToken(token);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    validateField("name", name);
    validateField("email", email);
    validateField("password", password);
    validateField("confirmPassword", confirmPassword);

    if (password !== confirmPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: "Passwords do not match",
      }));
      return;
    }

    if (!termsAccepted) {
      renderToastMessage("You must accept the terms and conditions", "error");
      setErrors((prevErrors) => ({
        ...prevErrors,
        terms: "You must accept the terms and conditions",
      }));
      return;
    }

    if (!recaptchaToken) {
      renderToastMessage("Please complete the reCAPTCHA", "error");
      return;
    }

    if (Object.keys(errors).length === 0) {
      try {
        const result = await authService.signUp({name, email, password, recaptchaToken});
        console.log(result);
        localStorage.setItem("name", name);
        renderToastMessage("Account created successfully! Check your email to validate your account.", "success");
        setTimeout(() => {
          navigate("/sign-in");
        }, 2000);
      } catch (err: any) {
        let errorMessage = "Failed to log in. Please try again.";
      
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
    
        renderToastMessage(errorMessage, "error");
      }
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
          <h3 className="form-signup">Create your account</h3>
          <p className="text-primary text-md text-center">
            Welcome! Please enter your details.
          </p>
          <form className="form" onSubmit={handleSubmit}>
            <div className="flex-column-signup">
              <label>Name</label>
              <div className="inputForm-signup">
                <svg
                  height={60}
                  viewBox="0 -8 32 32"
                  width={40}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="Layer_3" data-name="Layer 3">
                    <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1z" />
                  </g>
                </svg>
                <input
                  type="text"
                  className="input-signup"
                  placeholder="Enter your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => validateField("name", name)}
                />
              </div>
              {errors.name && <small className="text-danger">{errors.name}</small>}
            </div>

            <div className="flex-column-signup">
              <label>Email</label>
              <div className="inputForm-signup">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <input
                  type="text"
                  className="input-signup"
                  placeholder="Enter your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => validateField("email", email)}
                />
              </div>
              {errors.email && <small className="text-danger">{errors.email}</small>}
            </div>

            <div className="flex-column-signup">
              <label>Password</label>
              <div className="inputForm-signup">
                <svg
                  height={20}
                  viewBox="-64 0 512 512"
                  width={20}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" />
                  <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"} 
                  className="input-signup"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => validateField("password", password)}
                />
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  role="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />} 
                </span>
              </div>
              {errors.password && <small className="text-danger">{errors.password}</small>}
            </div>

            <div className="flex-column-signup">
              <label>Confirm Password</label>
              <div className="inputForm-signup">
                <svg
                  height={20}
                  viewBox="-64 0 512 512"
                  width={20}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" />
                  <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" />
                </svg>
                <input
                  type={showConfirmPassword ? "text" : "password"} 
                  className="input-signup"
                  placeholder="Confirm your Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => validateField("confirmPassword", confirmPassword)}
                />
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  role="button"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />} 
                </span>
              </div>
              {errors.confirmPassword && (
                <small className="text-danger">{errors.confirmPassword}</small>
              )}
            </div>

            <ReCAPTCHA
              sitekey="6Lchg-8qAAAAABhr4Vauh-8gVyHuvUXuNmtC6MhU"
              onChange={handleRecaptchaChange}
              className="recpatcha"
            />

            <div className="custom-checkbox">
              <input
                type="checkbox"
                id="terms-checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <label htmlFor="terms-checkbox">
                I confirm that I have read and understood the{" "}
                <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>{" "}
                of the site.
              </label>
              {errors.terms && <small className="text-danger">{errors.terms}</small>}
            </div>

            <button type="submit" className="button-submit-signup btn btn-primary">
              Sign Up
            </button>

            <p className="p">
              Already have an account?{" "}
              <Link to="/sign-in" className="span-signup">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>

      <Image />
    </div>
  );
};

export default SignUp;