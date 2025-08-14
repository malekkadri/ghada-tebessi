import Footer from "../template front/Footer";
import Header from "../template front/Header";

const PrivatePolicy = () => {
    return (
    <div style={{ width: "100vw", overflowX: "hidden",minWidth: "100vw", }}>
        
        <Header />
        <img className="w-100" src="src/assets/styleTemplate/img/privacy-policy.png" alt="Privacy-policy" />
        <div className="terms-container">
            
            <main className="terms-content">
                <section>
                    <p>&emsp;&emsp;Welcome to our web site! we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you visit and use our website (www.draxite.com) and the services provided through it.</p>
                    <p>By using our website, you consent to the data practices described in this policy. If you do not agree with this policy, please do not use our website or services.</p>

                    <h3>1. Information We Collect</h3>
                    <p>We may collect the following types of information:</p>
                    <ul>
                        <li>
                            <strong>Personal Information:</strong> <p>When you sign up for Draxite’s services or contact us, we may collect personal details such as your name, email address, phone number, and company name.</p>
                        </li>
                        <li>
                            <strong>Usage Data:</strong><p>We automatically collect certain information about how you access and use our website, including IP addresses, browser types, device types, and pages viewed. This data helps us improve our website and services.</p>
                        </li>
                        <li>
                            <strong>Cookies and Tracking Technologies:</strong> <p> We use cookies and similar technologies to track activity on our website and improve user experience. These may include cookies for login sessions, preferences, and analytics.</p>
                        </li>
                        <li>
                            <strong>Payment Information:</strong> <p>If you make a purchase, we may collect billing details such as payment method and credit card information, which is processed securely by our third-party payment processors.</p>
                        </li>
                    </ul>

                    <h3>2. How We Use Your Information</h3>
                    <p>We use the information we collect for the following purposes:</p>
                    <ul>
                        <li>
                            <strong>To Provide and Improve Our Services:</strong> <p>We use your information to create and manage your account, provide customer support, and improve our services.</p>
                        </li>
                        <li>
                            <strong>To Communicate with You:</strong><p>We may use your contact details to send you important information regarding your account, updates about our services, or promotional content (with your consent).</p>
                        </li>
                        <li>
                            <strong>For Analytics and Marketing:</strong> <p>We may use usage data and tracking technologies to analyze website performance and user behavior, helping us optimize marketing campaigns and content.</p>
                        </li>
                        <li>
                            <strong>To Process Payments:</strong> <p>If applicable, we will use your payment information to process subscription fees and purchases.</p>
                        </li>
                    </ul>
                    <h3>3. Data Sharing and Disclosure</h3>
                    <p>We do not sell or rent your personal information to third parties. However, we may share your information in the following cases:</p>
                    <ul>
                        <li>
                            <strong>With Service Providers:</strong> <p>We may share your personal information with third-party service providers who help us operate and improve our website and services (e.g., payment processors, analytics providers). These providers are obligated to protect your data.</p>
                        </li>
                        <li>
                            <strong>Legal Compliance:</strong><p>We may disclose your information if required by law or if we believe such action is necessary to comply with a legal obligation, protect our rights, or ensure the safety of our users.</p>
                        </li>
                        <li>
                            <strong>Business Transfers:</strong> <p>In the event of a merger, acquisition, or sale of assets, your personal data may be transferred as part of that transaction.</p>
                        </li>
                    </ul>
                    <h3>4. Data Security</h3>
                    <p>We take reasonable steps to protect your personal information from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet or method of electronic storage is completely secure, and we cannot guarantee the absolute security of your data.</p>

                    <h3>5. our Rights and Choices</h3>
                    <ul>
                        <li>
                            <strong>Access and Update:</strong> <p>You may access and update your personal information by logging into your account or contacting us directly.</p>
                        </li>
                        <li>
                            <strong>Opt-Out:</strong><p>You can opt-out of receiving marketing communications from us at any time by clicking the “unsubscribe” link in the email or contacting us directly.</p>
                        </li>
                        <li>
                            <strong>Data Deletion:</strong><p>You may request that we delete your account and personal information by contacting us. Please note that we may retain certain data for legal or operational reasons.</p>
                        </li>
                    </ul>
                    <h3>6. International Transfers</h3>
                    <p>If you are accessing our website from outside Saudi Arabia, please be aware that your personal information may be transferred to and stored in a country that does not have the same level of data protection laws. By using our services, you consent to the transfer and processing of your information.</p>

                    <h3>7. Children’s Privacy</h3>
                    <p>Our services are not intended for individuals under the age of 18, and we do not knowingly collect personal information from children. If you are a parent or guardian and believe we have inadvertently collected such data, please contact us immediately, and we will take steps to remove it.</p>
                    
                    <h3>8. Changes to This Privacy Policy</h3>
                    <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated “Last Updated” date. We encourage you to review this policy periodically to stay informed about how we are protecting your information.</p>                 

                </section>
            </main>
            
        </div>
        < Footer/>
        </div>
    );
};

export default PrivatePolicy;
    ;