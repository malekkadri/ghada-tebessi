import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaLock } from 'react-icons/fa';
import { authService, limitService } from './../services/api';

const TwoFactorAuthentication = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [is2FAAvailable, setIs2FAAvailable] = useState(false);

  useEffect(() => {
  const check2FAAccess = async () => {
    try {
      const response = await limitService.get2FAAccess();
      setIs2FAAvailable(response.data.has2FA);
    } catch (error) {
      console.error('Failed to check 2FA access:', error);
    }
  };
  check2FAAccess();
}, []);

  useEffect(() => {
    const fetchTwoFactorStatus = async () => {
      try {
        const response = await authService.getTwoFactorStatus();
        const enabled = response.data?.data?.enabled || response.data?.enabled || false;
        setTwoFactorEnabled(enabled);
      } catch (error) {
        console.error('Failed to fetch 2FA status:', error);
        toast.error('Failed to fetch two-factor authentication status');
      }
    };
    
    fetchTwoFactorStatus();
  }, []);

  const initiateSetupTwoFactor = async () => {
    try {
      const response = await authService.generateTwoFactorSecret();
      
      const qrCodeData = response.data?.data?.qrCode || response.data?.qrCode;
      const secretData = response.data?.data?.secret || response.data?.secret;
      
      if (qrCodeData) {
        setQrCodeUrl(qrCodeData);
      } else {
        toast.error('Missing QR code data from server');
        console.error('Two-factor setup error: Missing QR code data');
        return;
      }
      
      if (secretData) {
        setTwoFactorSecret(secretData);
      } else {
        toast.error('Missing secret key data from server');
        console.error('Two-factor setup error: Missing secret data');
        return;
      }
      
      setShowTwoFactorSetup(true);
    } catch (error) {
      toast.error('Failed to generate two-factor authentication setup');
      console.error('Two-factor setup error:', error);
    }
  };

  const verifyAndEnableTwoFactor = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit verification code');
      return;
    }

    try {
      const response = await authService.verifyAndEnableTwoFactor({ token: verificationCode });
      const codes = response.data?.data?.recoveryCodes || response.data?.recoveryCodes || [];
      setRecoveryCodes(codes);
      setShowRecoveryCodes(true);
      setTwoFactorEnabled(true);
      setShowTwoFactorSetup(false);
      toast.success('Two-factor authentication enabled successfully');
    } catch (error) {
      toast.error('Failed to verify code. Please try again.');
      console.error('Two-factor verification error:', error);
    }
  };

  const disableTwoFactor = async () => {
    try {
      await authService.disableTwoFactor();
      setTwoFactorEnabled(false);
      setShowTwoFactorSetup(false);
      setShowRecoveryCodes(false);
      toast.success('Two-factor authentication disabled');
    } catch (error) {
      toast.error('Failed to disable two-factor authentication');
      console.error('Two-factor disable error:', error);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800 rounded-2xl p-6 shadow-2xl shadow-purple-500/10 dark:shadow-gray-900/50 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800 hover:border-purple-500/30 transition-all">
      <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
          ⚙️
        </div>
        Two-Factor Authentication
      </h4>
      
      {!showTwoFactorSetup && !showRecoveryCodes && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {twoFactorEnabled 
                ? "Two-factor authentication is currently enabled."
                : "Add an extra layer of security to your account."}
            </p>
          </div>
          {twoFactorEnabled ? (
            <button
              onClick={disableTwoFactor}
              className="flex justify-center items-center py-1.5 sm:py-2 px-3 sm:px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Disable 2FA
            </button>
          ) : (
            <button
              onClick={initiateSetupTwoFactor}
              disabled={!is2FAAvailable}
              className={`flex justify-center items-center py-1.5 sm:py-2 px-3 sm:px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white ${
                is2FAAvailable 
                  ? 'bg-primary hover:bg-purple-400' 
                  : 'bg-gray-400 cursor-not-allowed'
              } focus:outline-none focus:ring-2 focus:ring-offset-1 sm:focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
            >
              {is2FAAvailable ? 'Setup 2FA' : '2FA non disponible avec votre plan'}
            </button>
          )}
        </div>
      )}

      {showTwoFactorSetup && !showRecoveryCodes && (
        <div className="mt-3 sm:mt-4 space-y-4 sm:space-y-6">
          <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-1 sm:mb-2">Scan QR Code</h5>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            <div className="flex justify-center mb-3 sm:mb-4">
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code for 2FA" className="w-40 sm:w-48 h-40 sm:h-48" />
              )}
            </div>
            
            <h5 className="font-medium text-gray-800 dark:text-gray-200 mt-3 sm:mt-4 mb-1 sm:mb-2">Manual Setup</h5>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
              If you can't scan the QR code, enter this code manually in your app:
            </p>
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-xs sm:text-sm text-center select-all break-all mb-3 sm:mb-4">
              {twoFactorSecret}
            </div>
            
            <div className="mt-4 sm:mt-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Verification Code
              </label>
              <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800 relative">
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-4 sm:h-5 w-4 sm:w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  className="input-vcard pl-8 sm:pl-10 text-xs sm:text-sm"
                  placeholder="Enter 6-digit code from your app"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                  maxLength={6}
                />
              </div>
            </div>
            
            <div className="flex justify-between mt-4 sm:mt-6">
              <button
                onClick={() => {
                  setShowTwoFactorSetup(false);
                  setVerificationCode('');
                }}
                className="py-1.5 sm:py-2 px-3 sm:px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={verifyAndEnableTwoFactor}
                className="py-1.5 sm:py-2 px-3 sm:px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-primary hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Verify and Enable
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showRecoveryCodes && (
        <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
          <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <h5 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1 sm:mb-2">Recovery Codes</h5>
            <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 mb-3 sm:mb-4">
              Save these recovery codes in a secure place. If you lose access to your authenticator app, you can use these codes to regain access to your account.
            </p>
            
            <div className="p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-md mb-3 sm:mb-4 grid grid-cols-2 gap-1 sm:gap-2">
              {recoveryCodes.map((code, index) => (
                <div key={index} className="font-mono text-xs sm:text-sm select-all">
                  {code}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowRecoveryCodes(false)}
                className="py-1.5 sm:py-2 px-3 sm:px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-primary hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                I've saved these codes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {twoFactorEnabled && !showTwoFactorSetup && !showRecoveryCodes && (
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
          <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
            Make sure to save your recovery codes in a safe place. You'll need them if you lose access to your authenticator app.
          </p>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuthentication;