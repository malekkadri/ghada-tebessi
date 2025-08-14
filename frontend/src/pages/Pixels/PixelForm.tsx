import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { pixelService, vcardService } from "../../services/api";
import { Breadcrumb } from "react-bootstrap";
import { FiChevronRight } from "react-icons/fi";
import { VCard } from "../../services/vcard";

const PixelForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    vcardId: "",
    is_active: true,
  });

  const [vcards, setVcards] = useState<VCard[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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

        if (!isEditMode && (!vcardsResponse || vcardsResponse.length === 0)) {
          toast.warning('You need to create at least one vCard before creating a pixel.');
          navigate('/admin/vcard/create');
          return;
        }

        if (isEditMode && id) {
            const pixel = await pixelService.getPixelById(id);
            const domain = pixel.data;

            if (!domain) {
            toast.error("Pixel not found");
            navigate("/admin/pixel");
            return;
            }

            setFormData({
            name: domain.name,
            vcardId: domain.vcard?.id?.toString() || '', 
            is_active: domain.is_active
            });
        }
        } catch (error) {
        console.error('Error loading data:', error);
        toast.error(isEditMode ? "Failed to load pixel" : "Failed to load user data");
        navigate("/admin/pixel");
        }
    };

    loadUserAndData();
    }, [id, isEditMode, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }

    if (!formData.vcardId) {
      newErrors.vcardId = "vCard selection is required";
    }

    if (!userId) {
      newErrors.user = "User not authenticated";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        vcardId: Number(formData.vcardId),
        userId: userId!
      };

      let response;
      if (isEditMode && id) {
        response = await pixelService.update(id, payload);
      } else {
        response = await pixelService.create(payload);
      }
      console.log(response);
      if (response) {
        toast.success(`Pixel ${isEditMode ? 'updated' : 'created'} successfully!`);
        setTimeout(() => navigate("/admin/pixel"), 2000);
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      const errorMessage = error.response?.data?.error
        || error.response?.data?.message
        || error.message
        || "Operation failed";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbLinks = [
    { name: "Pixels", path: "/admin/pixel" },
    { name: isEditMode ? "Edit Pixel" : "Create Pixel", path: location.pathname },
  ];

  return (
    <div className="pt-8 pb-8">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="mb-6 w-full max-w-3xl pl-6">
        <Breadcrumb className="mb-6">
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
      </div>

      <div className="w-full flex flex-col bg-gray-50 dark:bg-gray-900 mx-auto">
        <div className="flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8 w-full">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {isEditMode ? "Edit Pixel" : "Create New Pixel"}
              </h3>
              <p className="text-primary">
                {isEditMode
                  ? "Update your pixel tracking settings"
                  : "Configure a new tracking pixel for analytics"}
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pixel Name
                </label>
                <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="input-vcard"
                    placeholder="Enter pixel name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, name: e.target.value }));
                      if (errors.name) {
                        setErrors(prev => ({ ...prev, name: '' }));
                      }
                    }}
                    autoComplete="off"
                    autoSave="off"
                    autoCorrect="off"
                    spellCheck="false"
                    required
                  />
                </div>
                {errors.name && <small className="text-red-500 text-sm">{errors.name}</small>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Associated vCard
                </label>
                <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <select
                    value={formData.vcardId}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        vcardId: e.target.value
                      }));
                      if (errors.vcardId) {
                        setErrors(prev => ({ ...prev, vcardId: '' }));
                      }
                    }}
                    className="input-vcard w-full bg-transparent dark:bg-gray-800 dark:text-gray-300
                              border-gray-300 dark:border-gray-600 rounded-lg focus:border-transparent
                              dark:[color-scheme:dark]"
                    autoComplete="off"
                    required
                  >
                    <option value="" className="dark:bg-gray-800 dark:text-gray-300">Select a vCard</option>
                    {vcards.map(vcard => (
                      <option
                        key={vcard.id}
                        value={vcard.id}
                        className="dark:bg-gray-800 dark:text-gray-300"
                      >
                        {vcard.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.vcardId && <small className="text-red-500 text-sm">{errors.vcardId}</small>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tracking Status
                </label>
                <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          is_active: e.target.checked
                        }))}
                      />
                      <div className={`w-12 h-6 rounded-full shadow-inner transition-colors
                        ${formData.is_active ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform
                          ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </div>
                    </div>
                    <span className="ml-3 text-gray-700 dark:text-gray-300">
                      {formData.is_active ? 'Active Tracking' : 'Paused Tracking'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isEditMode ? "Saving..." : "Creating..."}
                    </span>
                  ) : isEditMode ? "Save Changes" : "Create Pixel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixelForm;
