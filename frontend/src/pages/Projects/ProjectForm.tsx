import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { projectService } from "../../services/api";
import { Breadcrumb } from "react-bootstrap";
import { FiChevronRight } from "react-icons/fi";

const ProjectForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#4f46e5",
    status: "active" as "active" | "archived" | "pending",
    logoFile: null as File | null,
    logoPreview: null as string | null,
    existingLogo: ""
  });

  const [userId, setUserId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserAndProject = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        toast.error("User not authenticated");
        navigate("/login");
        return;
      }

      try {
        const user = JSON.parse(userData);
        setUserId(user.id);

        if (isEditMode && id) {
          const project = await projectService.getProjectById(id);
          setFormData({
            name: project.name,
            description: project.description || "",
            color: project.color || "#4f46e5",
            status: project.status || "active",
            logoFile: null,
            logoPreview: project.logo ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}${project.logo}` : null,
            existingLogo: project.logo || ""
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error(isEditMode ? "Failed to load project" : "Failed to load user data");
        navigate("/admin/project");
      }
    };

    loadUserAndProject();
  }, [id, isEditMode, navigate]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!userId) newErrors.user = "User not authenticated";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error("Unsupported file format. Use .jpg, .jpeg, .png, .svg or .gif");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        logoPreview: reader.result as string,
        logoFile: file,
        existingLogo: ""
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setFormData(prev => ({
      ...prev,
      logoPreview: null,
      logoFile: null,
      existingLogo: ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("description", formData.description);
      formPayload.append("color", formData.color);
      formPayload.append("status", formData.status);
      formPayload.append("userId", userId!.toString());

      if (formData.logoFile) {
        formPayload.append("logoFile", formData.logoFile);
      } else if (isEditMode && !formData.existingLogo) {
        formPayload.append("removeLogo", "true");
      }

      let response;
      if (isEditMode && id) {
        response = await projectService.updateProject(id, formPayload);
      } else {
        response = await projectService.createProject(formPayload);
      }

      if (response?.id) {
        toast.success(`Project ${isEditMode ? 'updated' : 'created'} successfully!`);
        setTimeout(() => navigate("/admin/project"), 1500);
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
    { name: "Projects", path: "/admin/project" },
    { name: isEditMode ? "Edit Project" : "Create Project", path: location.pathname },
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
                {isEditMode ? "Edit Project" : "Create New Project"}
              </h3>
              <p className="text-primary">
                {isEditMode
                  ? "Update your project details"
                  : "Build and organize your development projects"}
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project Name
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
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="input-vcard"
                    placeholder="Enter project name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                {errors.name && <small className="text-red-500 text-sm">{errors.name}</small>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800">
                  <div className="absolute top-3 left-3">
                    <svg
                      className="h-5 w-5 text-gray-500 mt-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <textarea
                    className="input-vcard min-h-[120px] pt-3"
                    placeholder="Project description..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project Logo
                </label>
                <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800 p-4 flex flex-col items-center justify-center border-2 border-dashed rounded-lg relative">
                  <input
                    type="file"
                    id="logo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer text-center"
                  >
                    {formData.logoPreview || formData.existingLogo ? (
                      <>
                        <img
                          src={formData.logoPreview || formData.existingLogo}
                          alt="Logo preview"
                          className="w-32 h-32 rounded-full object-cover mb-4 border-2 border-primary"
                        />
                        {formData.logoPreview && (
                          <button
                            type="button"
                            onClick={removeLogo}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 mb-4 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    <span className="text-primary hover:text-purple-400 transition-colors">
                      {formData.logoPreview || formData.existingLogo ? "Change Logo" : "Upload Logo"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project Color
                </label>
                <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800 flex items-center p-2 rounded-lg">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-12 rounded cursor-pointer border-none"
                  />
                  <span className="ml-4 text-gray-700 dark:text-gray-300">
                    {formData.color.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project Status
                </label>
                <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      status: e.target.value as "active" | "archived" | "pending"
                    }))}
                    className="input-vcard w-full bg-transparent dark:bg-gray-800 dark:text-gray-300 
                              border-gray-300 dark:border-gray-600 rounded-lg focus:border-transparent
                              dark:[color-scheme:dark]"
                  >
                    <option className="dark:bg-gray-800 dark:text-gray-300" value="active">Active</option>
                    <option className="dark:bg-gray-800 dark:text-gray-300" value="archived">Archived</option>
                    <option className="dark:bg-gray-800 dark:text-gray-300" value="pending">Pending</option>
                  </select>
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
                  ) : isEditMode ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;