import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { vcardService, authService, projectService} from "../../services/api";
import { FaCopy, FaCube } from "react-icons/fa";
import LogoUploader from "../../atoms/uploads/LogoUploader";
import FaviconUploader from "../../atoms/uploads/FaviconUploader";
import BackgroundSettings from "../../atoms/settings/BackgroundSettings";
import { FiChevronRight } from "react-icons/fi";
import Checkbox from "../../atoms/checkboxs/Checkbox";
import { Breadcrumb } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaSyncAlt } from "react-icons/fa";
import { VCard } from "../../services/vcard";

interface GoogleFont {
  family: string;
}

const popularFonts = [
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Raleway",
  "Oswald",
  "Source Sans Pro",
  "Nunito",
  "Ubuntu",
  "Fira Sans",
  "PT Sans",
  "Noto Sans",
  "Work Sans",
  "Quicksand",
  "Inter",
  "Manrope",
  "Rubik",
  "Jost",
  "Karla",
  "Merriweather",
  "Playfair Display",
  "Lora",
  "PT Serif",
  "Libre Baskerville",
  "Alegreya",
  "Crimson Text",
  "Vollkorn",
  "Bitter",
  "Arvo",
  "Bebas Neue",
  "Anton",
  "Fredoka One",
  "Luckiest Guy",
  "Righteous",
  "Lobster",
  "Pacifico",
  "Chewy",
  "Sigmar One",
  "Abril Fatface",
  "Roboto Mono",
  "Source Code Pro",
  "Fira Code",
  "Inconsolata",
  "Courier Prime",
  "Space Mono",
  "IBM Plex Mono",
  "JetBrains Mono",
  "Overpass Mono",
  "Anonymous Pro",
  "Dancing Script",
  "Pacifico",
  "Caveat",
  "Great Vibes",
  "Sacramento",
  "Parisienne",
  "Cookie",
  "Kaushan Script",
  "Satisfy",
  "Yellowtail",
];

const EditVCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vcard, setVCard] = useState<VCard>({
    id: "",
    name: "",
    description: "",
    logo: "",
    favicon: "",
    background_type: "color",
    background_value: "",
    font_family: "Arial, sans-serif",
    font_size: 16,
    search_engine_visibility: true,
    opengraph: "",
    url: "",
    remove_branding: false,
    qr_code: "",
    views: 0,
    status: true,
    projectId: 0,
    is_share: true,
    is_downloaded: true,
    is_active: true,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [selectedOption, setSelectedOption] = useState('gradient-preset');
  const [solidColor, setSolidColor] = useState('#ffffff');
  const [gradientStart, setGradientStart] = useState('#000000');
  const [gradientEnd, setGradientEnd] = useState('#ffffff');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedGradient, setSelectedGradient] = useState<string | null>(null);
  const [fonts, setFonts] = useState<GoogleFont[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
 // const [availablePixels, setAvailablePixels] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedPixelId, setSelectedPixelId] = useState<string>("");

  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?key=${import.meta.env.VITE_GOOGLE_API_KEY}`
        );
        const data = await response.json();

        const filteredFonts = data?.items
        ?.filter((font: GoogleFont) => popularFonts.includes(font.family))
        ?.map((font: GoogleFont) => ({ family: font.family })) || [];

          setFonts(filteredFonts);
        } catch (error) {
          console.error("Error loading fonts:", error);
          setFonts([]);
        }
      };

    fetchFonts();
  }, []);

  useEffect(() => {
    const loadUserAndProjects = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user?.data.id) {
          const projectsData = await projectService.getUserProjects(user.data.id);
          const activeProjects = projectsData.filter((project: any) => project.status === 'active');
          setProjects(activeProjects || []);

           /*const pixelsData = await pixelService.getUserPixels(user.data.id);
         const unassociatedPixels = pixelsData.pixels.filter((pixel: any) =>
            !pixel.vcard || pixel.vcard.id === id
          );
          setAvailablePixels(unassociatedPixels || []);*/
        }
      } catch (error) {
        console.error("Error loading user/projects:", error);
        toast.error("Failed to load projects");
      }
    };

    loadUserAndProjects();
  }, [id]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVCard({ ...vcard, [name]: value });
  };

  /*const handlePixelSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPixelId(e.target.value);
  };*/

  useEffect(() => {
    if (!id) {
      toast.error("Invalid vCard ID.");
      return;
    }

    const fetchVCard = async () => {
      try {
        const data = await vcardService.getById(id);
        setVCard({
          ...data
        });

        if (data.pixel?.id) {
          setSelectedPixelId(data.pixel.id);
        }

        if (data.background_type === "gradient-preset") {
          setSelectedGradient(data.background_value);
        } else if (data.background_type === "color") {
          setSolidColor(data.background_value);
        } else if (data.background_type === "gradient") {
          const gradientColors = extractColorsFromGradient(data.background_value);
          if (gradientColors) {
            setGradientStart(gradientColors.start);
            setGradientEnd(gradientColors.end);
          }
        } else {
          setImagePreview(`http://localhost:3000${data.background_value}`);
        }

        if (data.logo) {
          setLogoPreview(`http://localhost:3000${data.logo}`);
        }
        if (data.favicon) {
          setFaviconPreview(`http://localhost:3000${data.favicon}`);
        }
      } catch (error) {
        toast.error("Failed to fetch vCard data.");
        console.error(error);
      }
    };

    fetchVCard();
  }, [id, navigate]);

  const extractColorsFromGradient = (gradient: string) => {
    const regex = /linear-gradient\(.*?,\s*(#[0-9a-fA-F]{6})\s*,\s*(#[0-9a-fA-F]{6})\s*\)/i;
    const matches = gradient.match(regex);

    if (matches && matches.length === 3) {
      return {
        start: matches[1],
        end: matches[2],
      };
    }
    return null;
  };

  const handleFileUploadBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const fileType = file.type.toLowerCase();
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/gif'];

      if (!allowedTypes.includes(fileType)) {
        toast.error("Unsupported file format. Use .jpg, .jpeg, .png, .svg or .gif");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setBackgroundFile(file);
      setVCard({
        ...vcard,
        background_type: 'custom-image',
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const fileType = file.type.toLowerCase();
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/gif'];

      if (!allowedTypes.includes(fileType)) {
        toast.error("Unsupported file format. Use .jpg, .jpeg, .png, .svg or .gif");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setLogoFile(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type.toLowerCase();
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/gif', 'image/x-icon'];

      if (!allowedTypes.includes(fileType)) {
        toast.error("Unsupported file format. Use .jpg, .jpeg, .png, .svg, .gif or .ico");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => setFaviconPreview(reader.result as string);
      reader.readAsDataURL(file);
      setFaviconFile(file);
    }
  };

  const handleGradientPresetSelect = (preset: string) => {
    setSelectedGradient(preset);
    setVCard({
      ...vcard,
      background_type: 'gradient-preset',
      background_value: preset,
    });
  };

  const handleBlocks = () => {
    navigate(`/admin/vcard/edit-vcard/${vcard.id}/blocks`)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setVCard({ ...vcard, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setVCard({ ...vcard, [name]: value });
    }
  };

  const copyToClipboard = async () => {
    try {
      const fullUrl = `${window.location.origin}/vcard/${vcard.url.split('/').pop()}`;
      await navigator.clipboard.writeText(fullUrl);
      toast.success("URL copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy URL");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", vcard.name);
      formData.append("description", vcard.description);
      formData.append("remove_branding", vcard.remove_branding.toString());
      formData.append("search_engine_visibility", vcard.search_engine_visibility.toString());
      formData.append("is_share", vcard.is_share.toString());
      formData.append("is_downloaded", vcard.is_downloaded.toString());
      formData.append("is_active", vcard.is_active.toString());
      formData.append("background_type", vcard.background_type);
      formData.append("background_value", vcard.background_value);
      formData.append("font_family", vcard.font_family);
      formData.append("font_size", (vcard.font_size || 16).toString());
      formData.append("projectId", vcard.projectId?.toString() || "");
      formData.append("pixelId", selectedPixelId || "");

      if (logoFile) {
        formData.append("logoFile", logoFile);
      }

      if (backgroundFile) {
        formData.append("backgroundFile", backgroundFile);
      }

      if (faviconFile) {
        formData.append("faviconFile", faviconFile);
      }

      await vcardService.update(vcard.id, formData);

      toast.success("vCard updated successfully!");
    } catch (error) {
      toast.error("Failed to update vCard.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbLinks = [
    { name: "vCard", path: "/admin/vcard" },
    { name: "Edit vCard", path: `/admin/vcard/edit-vcard/${id}` },
  ];

  return (
    <div className="pt-4 pb-8 px-0 sm:px-4 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="mb-6 w-full max-w-6xl mx-auto px-4 sm:px-6">
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

      <div className="w-full flex flex-col bg-gray-50 dark:bg-gray-900 mx-auto max-w-6xl rounded-lg shadow-sm px-4 py-6 sm:p-6">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full">
            <div className="text-center mb-6 w-full px-2 sm:px-0">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Edit {vcard.name} vCard</h3>
              <div className="flex justify-center items-center gap-2 flex-wrap">
                <a
                  href={`/vcard/${vcard.url.split('/').pop()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-purple-400 text-sm sm:text-base break-all"
                >
                  {`${window.location.origin}/vcard/${vcard.url.split('/').pop()}`}
                </a>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  title="Copy URL"
                >
                  <FaCopy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="w-full px-2 sm:px-0">
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
                      className="input-vcard w-full"
                      placeholder="Enter the Name"
                      name="name"
                      value={vcard.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
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
                      className="input-vcard min-h-[120px] pt-3 w-full"
                      placeholder="Enter the Description"
                      name="description"
                      value={vcard.description}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <LogoUploader logoPreview={logoPreview} handleLogoUpload={handleLogoUpload} />
                  </div>
                  <div>
                    <FaviconUploader
                      faviconPreview={faviconPreview}
                      handleFaviconUpload={handleFaviconUpload}
                    />
                  </div>
                </div>

                <BackgroundSettings
                  selectedOption={selectedOption}
                  setSelectedOption={setSelectedOption}
                  solidColor={solidColor}
                  setSolidColor={setSolidColor}
                  gradientStart={gradientStart}
                  setGradientStart={setGradientStart}
                  gradientEnd={gradientEnd}
                  setGradientEnd={setGradientEnd}
                  imagePreview={imagePreview}
                  handleFileUploadBackground={handleFileUploadBackground}
                  selectedGradient={selectedGradient}
                  handleGradientPresetSelect={handleGradientPresetSelect}
                  setVCard={setVCard}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Associated Project
                  </label>
                  <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9.76c0 .41-.34.75-.75.75H12v1.75c0 .41-.34.75-.75.75s-.75-.34-.75-.75V13.5h-1.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.5v-1.5c0-.41.34-.75.75-.75s.75.34.75.75v1.5h1.25c.41 0 .75.34.75.75zM18 11v6H6v-6h12z"/>
                      </svg>
                    </div>
                    <select
                      name="projectId"
                      className="input-vcard pl-10 pr-8 bg-transparent dark:bg-gray-800 dark:text-white w-full"
                      value={vcard.projectId || ""}
                      onChange={handleSelectChange}
                    >
                      <option value="" className="dark:bg-gray-800 dark:text-white">Select a project</option>
                      {projects.map((project) => (
                        <option
                          key={project.id}
                          value={project.id}
                          className="dark:bg-gray-800 dark:text-white"
                        >
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Don't have a project?{' '}
                    <Link
                      to="/admin/project"
                      className="text-primary hover:text-purple-400 font-medium"
                    >
                      Create one
                    </Link>
                  </p>
                </div>

               {/* <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Associated Pixel
                  </label>
                  <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </svg>
                    </div>
                    <select
                      name="pixelId"
                      className="input-vcard pl-10 pr-8 bg-transparent dark:bg-gray-800 dark:text-white w-full"
                      value={selectedPixelId}
                      onChange={handlePixelSelectChange}
                    >
                      <option value="" className="dark:bg-gray-800 dark:text-white">No pixel selected</option>
                      {availablePixels.map((pixel) => (
                        <option
                          key={pixel.id}
                          value={pixel.id}
                          className="dark:bg-gray-800 dark:text-white"
                        >
                          {pixel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Don't have a pixel?{' '}
                    <Link
                      to="/admin/pixel"
                      className="text-primary hover:text-purple-400 font-medium"
                    >
                      Create one
                    </Link>
                  </p>
                </div>*/}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Font Family</label>
                    <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800">
                      <select
                        name="font_family"
                        value={vcard.font_family}
                        onChange={handleSelectChange}
                        className="input-vcard pl-3 pr-8 bg-transparent dark:bg-gray-800 dark:text-white w-full"
                      >
                        {fonts.map((font) => (
                          <option
                            key={font.family}
                            value={font.family}
                            className="dark:bg-gray-800 dark:text-white"
                          >
                            {font.family}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Font Size</label>
                    <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800">
                      <input
                        type="number"
                        name="font_size"
                        className="input-vcard w-full"
                        value={vcard.font_size}
                        onChange={handleInputChange}
                        min={10}
                        max={50}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Checkbox
                      name="is_share"
                      checked={vcard.is_share}
                      onChange={handleInputChange}
                      label="Display share button"
                    />
                    <Checkbox
                      name="is_downloaded"
                      checked={vcard.is_downloaded}
                      onChange={handleInputChange}
                      label="Display vcard download button"
                    />
                    <Checkbox
                      name="is_active"
                      checked={vcard.is_active}
                      onChange={handleInputChange}
                      label="Vcard is active"
                    />
                  </div>

                  <div className="space-y-2">
                    <Checkbox
                      name="search_engine_visibility"
                      checked={vcard.search_engine_visibility}
                      onChange={handleInputChange}
                      label="Search Engine Visibility"
                    />
                    <Checkbox
                      name="remove_branding"
                      checked={vcard.remove_branding}
                      onChange={handleInputChange}
                      label="Remove Branding"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 w-full">
                  <button
                    type="button"
                    onClick={handleBlocks}
                    className="flex items-center justify-center bg-purple-500 hover:bg-purple-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors w-full"
                  >
                    <FaCube className="mr-2" />
                    Settings Blocks
                  </button>

                  <button
                    type="submit"
                    className="flex justify-center items-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full"
                    disabled={isSubmitting}
                  >
                    <FaSyncAlt className="mr-2" />
                    {isSubmitting ? "Updating..." : "Update VCard"}
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

export default EditVCard;