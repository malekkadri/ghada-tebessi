import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "./Image";
import { useAuth } from "../context/AuthContext";
import { authService, subscriptionService, planService } from "../services/api";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import NexCardLogoFinal from '../atoms/Logo/NexCardLogoFinal';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const navigate = useNavigate();
  const { isLoading, login } = useAuth();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    const rememberedPassword = localStorage.getItem("rememberedPassword");

    if (rememberedEmail && rememberedPassword) {
      setEmail(rememberedEmail);
      setPassword(rememberedPassword);
      setRememberMe(true);
    }
  }, []);

  const getRedirectPath = (role: string | undefined) => {
    console.log('User role for redirection:', role);
    if (role === 'superAdmin') return '/super-admin/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/';
  };

  const renderToastMessage = (message: string, type: "success" | "error") => {
    toast(message, { type });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await login(email, password, rememberMe);

      if (response?.requires2FA) {
        if (!response.tempToken) {
          throw new Error('Missing temporary token for 2FA');
        }
        setRequires2FA(true);
        setTempToken(response.tempToken);
        return;
      }

      const user = response?.user;

      if (!user?.id) {
        throw new Error('Failed to log in. Please try again.');
      }

      localStorage.setItem("user", JSON.stringify(user));
      try {
        const userId = Number(user.id);
        const subscriptionResponse = await subscriptionService.getCurrentSubscription(userId);

        if (subscriptionResponse) {
          const subscription = subscriptionResponse.data;
          if(subscription){
            const planResponse = await planService.getPlanById(subscription.plan_id);

          if (planResponse.data) {
            const planData = {
              id: planResponse.data.id,
              name: planResponse.data.name,
              price: planResponse.data.price,
              duration_days: planResponse.data.duration_days,
              features: planResponse.data.features || []
            };

            localStorage.setItem("currentPlan", JSON.stringify(planData));
          }
        }
        } else {
          const freePlan = await planService.getFreePlan();
          localStorage.setItem("currentPlan", JSON.stringify(freePlan));
        }
      } catch (error) {
        console.error("Error fetching subscription or plan:", error);
      }

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
      }

      renderToastMessage("Login successful!", "success");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const redirectPath = getRedirectPath(user.role);
      console.log('Redirecting to:', redirectPath);
      
      window.location.href = redirectPath;
    } catch (err: any) {
      let errorMessage = "Failed to log in. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      renderToastMessage(errorMessage, "error");
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode || verificationCode.length !== 6) {
      renderToastMessage("Please enter a valid 6-digit code", "error");
      return;
    }

    try {
      const response = await authService.verify2FALogin({
        token: verificationCode,
        tempToken
      });

      const user = response.data?.user;

      if (!user?.id) {
        throw new Error('Failed to verify 2FA code');
      }

      localStorage.setItem("user", JSON.stringify(user));
      try {
        const userId = Number(user.id);
        const subscriptionResponse = await subscriptionService.getCurrentSubscription(userId);

        if (subscriptionResponse) {
          const subscription = subscriptionResponse.data;
          if(subscription){
            const planResponse = await planService.getPlanById(subscription.plan_id);

          if (planResponse.data) {
            const planData = {
              id: planResponse.data.id,
              name: planResponse.data.name,
              price: planResponse.data.price,
              duration_days: planResponse.data.duration_days,
              features: planResponse.data.features || []
            };

            localStorage.setItem("currentPlan", JSON.stringify(planData));
          }
        }
        } else {
          const freePlan = await planService.getFreePlan();
          localStorage.setItem("currentPlan", JSON.stringify(freePlan));
        }
      } catch (error) {
        console.error("Error fetching subscription or plan:", error);
      }

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
      }

      renderToastMessage("Login successful!", "success");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      const redirectPath = getRedirectPath(user.role);
      console.log('Redirecting to:', redirectPath);
      
      window.location.href = redirectPath;
    } catch (err: any) {
      let errorMessage = "Failed to verify 2FA code. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      renderToastMessage(errorMessage, "error");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authService.authenticateWithGoogle();
    } catch (error) {
      console.error("Error during Google login:", error);
      renderToastMessage("Failed to log in with Google. Please try again.", "error");
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
          {requires2FA ? (
            <>
              <h3 className="form-signup">Two-Factor Authentication</h3>
              <p className="text-primary text-md text-center mb-4">
                Please enter the 6-digit code from your authenticator app
              </p>
              <form className="form" onSubmit={handle2FASubmit}>
                <div className="flex-column-signup mb-4">
                  <label className="mb-2">Verification Code</label>
                  <div className="inputForm-signup">
                    <FaLock className="h-5 w-5 text-gray-500" />
                    <input
                      type="text"
                      className="input-signup"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="button-submit-signup btn btn-primary mb-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </button>

                <div className="text-center mt-4">
                  <span
                    className="text-primary cursor-pointer hover:underline"
                    onClick={() => setRequires2FA(false)}
                  >
                    Back to Login
                  </span>
                </div>
              </form>
            </>
          ) : (
            <>
              <h3 className="form-signup">Log in to your account</h3>
              <p className="text-primary text-md text-center">
                Welcome back! Please enter your details.
              </p>
              <form className="form" onSubmit={handleSubmit}>
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
                      required
                    />
                  </div>
                  {errors.email && <small className="text-danger">{errors.email}</small>}
                </div>

                <div className="flex-column-signup">
                  <label>Password</label>
                  <div className="inputForm-signup" style={{ position: 'relative' }}>
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
                      required
                      style={{ paddingRight: '35px' }}
                    />
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        right: '10px',
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
                  {errors.password && <small className="text-danger">{errors.password}</small>}
                </div>

                <div className="custom-checkbox">
                  <input
                    type="checkbox"
                    id="remember-me-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me-checkbox">Remember me</label>
                  <span
                    className="forgot-password-link"
                    onClick={() => navigate("/forgot-password")}
                    style={{ marginLeft: "auto", cursor: "pointer", color: "#cc006d" }}
                  >
                    Forgot Password?
                  </span>
                </div>

                <button
                  type="submit"
                  className="button-submit-signup btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </button>

                <p className="p">
                  Don't have an account?{" "}
                  <span className="span-signup" onClick={() => navigate("/sign-up")}>
                    Sign Up
                  </span>
                </p>
              </form>

              <div className="flex-row-signup">
                <button className="btn-signup google-signup" onClick={handleGoogleLogin} disabled={isLoading}>
                  <svg
                    version="1.1"
                    width={20}
                    id="Layer_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    viewBox="0 0 512 512"
                    xmlSpace="preserve"
                  >
                    <path
                      style={{ fill: "#FBBB00" }}
                      d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456C103.821,274.792,107.225,292.797,113.47,309.408z"
                    />
                    <path
                      style={{ fill: "#518EF8" }}
                      d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z"
                    />
                    <path
                      style={{ fill: "#28B446" }}
                      d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z"
                    />
                    <path
                      style={{ fill: "#F14336" }}
                      d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0C318.115,0,375.068,22.126,419.404,58.936z"
                    />
                  </svg>
                  {isLoading ? "Redirecting..." : "Continue with Google"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <Image />
    </div>
  );
};

export default SignIn; 