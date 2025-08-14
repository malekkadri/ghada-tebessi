import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { vcardService } from "./../../services/api"; 
import { Breadcrumb } from "react-bootstrap";
import { FiChevronRight } from "react-icons/fi";

const CreateVCard: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserId(user.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
        toast.error("Failed to load user data");
      }
    }
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name) newErrors.name = "Name is required";
    if (!userId) newErrors.user = "User not authenticated";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await vcardService.create({ 
        name, 
        description, 
        userId: userId as number 
      });
      console.log(response);
      if (response.vcard && response.vcard.id) {
        toast.success(response.message || "VCard created successfully!");
        navigate(`/admin/vcard/edit-vcard/${response.vcard.id}`);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Creation error:", error);
      let errorMessage = "Failed to create VCard";
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        if (error.response.status === 400 && error.response.data.errors) {
          const apiErrors = error.response.data.errors.reduce((acc: any, err: any) => {
            acc[err.field] = err.message;
            return acc;
          }, {});
          setErrors(apiErrors);
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbLinks = [
    { name: "vCard", path: "/admin/vcard" },
    { name: "Create vCard", path: `/admin/vcard/create-vcard` },
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Create a New VCard</h3>
              <p className="text-primary">
                Please fill in the details below to create a new VCard.
              </p>
            </div>
            
            <div className="w-full">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="input-vcard"
                      placeholder="Enter the Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => validateForm()}
                      required
                    />
                  </div>
                  {errors.name && <small className="text-red-500 text-sm">{errors.name}</small>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800">
                    <div className="absolute top-3 left-3">
                      <svg className="h-5 w-5 text-gray-500 mt-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h10v2H7zm0 4h7v2H7z" />
                      </svg>
                    </div>
                    <textarea
                      className="input-vcard min-h-[120px] pt-3"
                      placeholder="Enter the Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    disabled={!name || !userId || isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create VCard"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVCard;