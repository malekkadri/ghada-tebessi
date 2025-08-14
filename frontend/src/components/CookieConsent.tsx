import React from "react";

interface CookieConsentProps {
    visible: boolean;
    onAccept: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ visible, onAccept }) => {
    if (!visible) return null;
    return (
        <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white p-4 z-[1000] flex flex-col sm:flex-row items-center justify-between shadow-lg">
            <span className="mb-2 sm:mb-0 text-sm">
                This site uses cookies to measure audience and improve user experience. By continuing, you accept the use of cookies.
            </span>
            <button
                className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-primary-dark transition"
                onClick={onAccept}
            >
                Accept all cookies
            </button>
        </div>
    );
};

export default CookieConsent;