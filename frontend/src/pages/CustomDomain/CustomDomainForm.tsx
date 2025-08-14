import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { customDomainService, vcardService } from "../../services/api";
import { Breadcrumb } from "react-bootstrap";
import { FiChevronRight } from "react-icons/fi";
import { VCard } from "../../services/vcard";
import { CustomDomain } from "../../services/CustomDomain";

const CustomDomainForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    domain: "",
    custom_index_url: "",
    custom_not_found_url: "",
    vcardId: "",
    status: "pending" as "pending" | "active" | "failed" | "blocked",
  });

  const [vcards, setVcards] = useState<VCard[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domainDetails, setDomainDetails] = useState<CustomDomain | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserAndData = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        toast.error("User not authenticated");
        navigate("/login");
        return;
      }

      try {
        const user = JSON.parse(userData);
        setUserId(user.id);

        const vcardsResponse = await vcardService.getAll(user.id.toString());
        setVcards(vcardsResponse);

        if (isEditMode && id) {
          const response = await customDomainService.getDomainById(parseInt(id));
          
          const domain = response.data;

          if (!domain) {
            toast.error("Domain not found");
            navigate("/admin/custom-domains");
            return;
          }

          setDomainDetails(domain);
          setFormData({
            domain: domain.domain,
            custom_index_url: domain.custom_index_url || "",
            custom_not_found_url: domain.custom_not_found_url || "",
            vcardId: domain.vcardId?.toString() || "",
            status: domain.status
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error(isEditMode ? "Failed to load domain" : "Failed to load user data");
        navigate("/admin/custom-domains");
      }
    };

    loadUserAndData();
  }, [id, isEditMode, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const urlRegex = /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/;
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

    if (!formData.domain.trim()) {
      newErrors.domain = "Domain is required";
    } else if (formData.domain.trim().length < 4) {
      newErrors.domain = "Domain must be at least 4 characters long";
    } else if (formData.domain.includes('http://') || formData.domain.includes('https://')) {
      newErrors.domain = "Domain should not include http:// or https://";
    } else if (!domainRegex.test(formData.domain.trim())) {
      newErrors.domain = "Please enter a valid domain name (e.g., example.com)";
    }

    if (formData.custom_index_url && formData.custom_index_url.trim()) {
      if (!urlRegex.test(formData.custom_index_url.trim())) {
        newErrors.custom_index_url = "Please enter a valid URL starting with http:// or https://";
      }
    }

    if (formData.custom_not_found_url && formData.custom_not_found_url.trim()) {
      if (!urlRegex.test(formData.custom_not_found_url.trim())) {
        newErrors.custom_not_found_url = "Please enter a valid URL starting with http:// or https://";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        domain: formData.domain.trim(),
        custom_index_url: formData.custom_index_url.trim() || undefined,
        custom_not_found_url: formData.custom_not_found_url.trim() || undefined,
        vcardId: formData.vcardId ? parseInt(formData.vcardId) : null,
        userId: userId!
      };

      if (isEditMode && id) {
        await customDomainService.update(parseInt(id), payload); 
        toast.success("Domain updated successfully!");
      } else {
        await customDomainService.create(payload);
        toast.success("Domain created successfully!");
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => navigate("/admin/custom-domains"), 2000);
    } catch (error: any) {
      console.error("Submission error:", error);
      const errorMessage = error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Operation failed";
      toast.error(`Error: ${errorMessage}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbLinks = [
    { name: "Custom Domains", path: "/admin/custom-domains" },
    { name: isEditMode ? "Edit Domain" : "Add Domain", path: location.pathname },
  ];

  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-800 dark:text-yellow-300",
        label: "Pending Verification"
      },
      active: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-300",
        label: "Active"
      },
      failed: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-300",
        label: "Verification Failed"
      },
      disabled: {
        bg: "bg-gray-100 dark:bg-gray-700/50",
        text: "text-gray-800 dark:text-gray-300",
        label: "Disabled"
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:px-8 xl:px-28 w-full max-w-[90rem] mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Breadcrumb className="mb-4 sm:mb-6">
        {breadcrumbLinks.map((link, index) => (
          <Breadcrumb.Item
            key={index}
            linkAs={Link}
            linkProps={{ to: link.path }}
            active={index === breadcrumbLinks.length - 1}
            className={`text-sm font-medium ${index === breadcrumbLinks.length - 1 ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
          >
            {index < breadcrumbLinks.length - 1 ? (
              <div className="flex items-center">
                {link.name}
                <FiChevronRight className="mx-2 text-gray-400" size={14} />
              </div>
            ) : (
              link.name
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>

      <div className="w-full flex flex-col bg-gray-50 dark:bg-gray-900 mx-auto">
        <div className="flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8 w-full">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {isEditMode ? "Edit Custom Domain" : "Add New Domain"}
              </h3>
              <p className="text-primary">
                {isEditMode
                  ? "Update your custom domain settings"
                  : "Configure a new custom domain for your vCards"}
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
              <div className="space-y-2">
                <label
                  htmlFor="domain"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Domain Name <span className="text-red-500">*</span>
                </label>
                <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                      />
                    </svg>
                  </div>
                  <input
                    id="domain"
                    type="text"
                    className={`input-vcard ${errors.domain ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="example.com"
                    value={formData.domain}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase().replace(/\s/g, '');
                      setFormData(prev => ({ ...prev, domain: value }));
                      if (errors.domain) {
                        setErrors(prev => ({ ...prev, domain: '' }));
                      }
                    }}
                    autoComplete="off"
                    autoSave="off"
                    autoCorrect="off"
                    spellCheck="false"
                    required
                    disabled={isEditMode}
                    aria-describedby={errors.domain ? "domain-error" : "domain-help"}
                    aria-invalid={!!errors.domain}
                  />
                </div>
                {errors.domain && (
                  <small id="domain-error" className="text-red-500 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.domain}
                  </small>
                )}
                <p id="domain-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter your domain name without http:// or https:// (e.g., example.com)
                </p>
              </div>

              {isEditMode && domainDetails && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Domain Status
                  </label>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {renderStatusBadge(domainDetails.status)}
                      </div>
                      {domainDetails.status === "pending" && (
                        <button
                          type="button"
                          className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                          onClick={() => navigate(`/admin/custom-domains/${id}/verify`)}
                        >
                          Verify Now
                        </button>
                      )}
                    </div>
                    {domainDetails.status === "pending" && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Please configure DNS records to verify your domain
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="custom_index_url"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Landing Page URL
                  <span className="text-gray-500 text-xs ml-1">(optional)</span>
                </label>
                <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  </div>
                  <input
                    id="custom_index_url"
                    type="url"
                    className={`input-vcard ${errors.custom_index_url ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="https://yourdomain.com/home"
                    value={formData.custom_index_url}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, custom_index_url: e.target.value }));
                      if (errors.custom_index_url) {
                        setErrors(prev => ({ ...prev, custom_index_url: '' }));
                      }
                    }}
                    autoComplete="url"
                    aria-describedby={errors.custom_index_url ? "index-url-error" : "index-url-help"}
                    aria-invalid={!!errors.custom_index_url}
                  />
                </div>
                {errors.custom_index_url && (
                  <small id="index-url-error" className="text-red-500 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.custom_index_url}
                  </small>
                )}
                <p id="index-url-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  URL to redirect when users visit your domain root
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="custom_not_found_url"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Custom 404 Page URL
                  <span className="text-gray-500 text-xs ml-1">(optional)</span>
                </label>
                <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <input
                    id="custom_not_found_url"
                    type="url"
                    className={`input-vcard ${errors.custom_not_found_url ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="https://yourdomain.com/404"
                    value={formData.custom_not_found_url}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, custom_not_found_url: e.target.value }));
                      if (errors.custom_not_found_url) {
                        setErrors(prev => ({ ...prev, custom_not_found_url: '' }));
                      }
                    }}
                    autoComplete="url"
                    aria-describedby={errors.custom_not_found_url ? "not-found-url-error" : "not-found-url-help"}
                    aria-invalid={!!errors.custom_not_found_url}
                  />
                </div>
                {errors.custom_not_found_url && (
                  <small id="not-found-url-error" className="text-red-500 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.custom_not_found_url}
                  </small>
                )}
                <p id="not-found-url-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Custom URL to redirect when page is not found
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="vcardId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Associated vCard
                  <span className="text-gray-500 text-xs ml-1">(optional)</span>
                </label>
                <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <select
                    id="vcardId"
                    value={formData.vcardId}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        vcardId: e.target.value
                      }));
                    }}
                    className="input-vcard w-full bg-transparent dark:bg-gray-800 dark:text-gray-300
                              border-gray-300 dark:border-gray-600 rounded-lg focus:border-transparent
                              dark:[color-scheme:dark] focus:ring-2 focus:ring-purple-500"
                    autoComplete="off"
                    aria-describedby="vcard-help"
                  >
                    <option value="" className="dark:bg-gray-800 dark:text-gray-300">Select a vCard</option>
                    {vcards.map(vcard => (
                      <option
                        key={vcard.id}
                        value={vcard.id.toString()}
                        className="dark:bg-gray-800 dark:text-gray-300"
                      >
                        {vcard.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p id="vcard-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Link this domain to a specific vCard for automatic redirection
                </p>
              </div>

              {/* DNS Instructions (Create mode) */}
              {!isEditMode && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    DNS Configuration Required
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                    After creating your domain, you'll need to configure DNS records to verify ownership.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/custom-domains")}
                    className="w-full sm:w-auto flex justify-center py-3 px-6 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting || !formData.domain.trim()}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isEditMode ? "Saving..." : "Creating..."}
                      </span>
                    ) : (
                      isEditMode ? "Save Changes" : "Add Domain"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDomainForm;