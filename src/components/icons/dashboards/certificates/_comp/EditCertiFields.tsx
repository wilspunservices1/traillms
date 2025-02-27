"use client";
import React, { useState, useCallback, useEffect } from "react";
import Select, { MultiValue, SingleValue, ActionMeta } from "react-select";
import Image from "next/image";
import Draggable from "react-draggable";
import { usePathname } from "next/navigation";
import html2canvas from "html2canvas";
import useSweetAlert from "@/hooks/useSweetAlert";
import { v4 as uuidv4 } from "uuid";

import useTab from "@/hooks/useTab";
import DesignTab from "./DesignTab";
import { debounce } from "lodash";
import type { CertificateData, CertificatePlaceHolders } from "@/types/certificates";

// import TabsButton from "./Tabs";
// import { fetchcertificateDetails } from "@/actions/certification";
import { initialPlaceholders } from "@/assets/mock";
import { SettingsIcon, RefreshIcon, TestIcon } from "@/components/icons";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
// import { getCroppedImg } from "@/utils/cropImage";
import DownloadIcon from "@/components/sections/create-course/_comp/Certificate/Icon/DownloadIcon";

interface metadata {
  file_name?: string;
  courseName?: string;
  instructor?: string;
  courseDuration?: string;
}

interface certificate {
  id: string;
  certificate_data_url: string;
  title?: string;
  description: string;
  unique_identifier: string;
  metadata?: metadata;
  placeholders?: CertificatePlaceHolders[];
}

interface ImageOption {
  value: string;
  label: string;
}

interface EditCertiFieldsProps {
  setDesignData: (data: any) => void;
}

// Utility function to convert label to key format
const convertLabelToKey = (label: string) => {
  return label
    .replace(/\s+/g, " ") // Remove extra spaces
    .trim() // Trim whitespace
    .replace(/^[0-9]+/, "") // Remove numbers at the start
    .replace(/[^a-zA-Z ]/g, "") // Remove special characters
    .split(" ")
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join("");
};

const EditCertiFields: React.FC<EditCertiFieldsProps> = ({ setDesignData }) => {

  const showAlert = useSweetAlert();
  const pathname = usePathname();
  const owner_id = pathname?.split("/").pop() || "";

  const { currentIdx, handleTabClick } = useTab();

  const [certificates, setCertificates] = useState<certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<certificate | null>(null);
  const [placeholders, setPlaceholders] = useState<CertificatePlaceHolders[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await fetch("@/src/app/api/certificates/get-saved");
      if (!response.ok) throw new Error("Failed to fetch certificates");
      const data = await response.json();
      setCertificates(data.certificates);
    } catch (error) {
      showAlert("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCertificate = (selectedOption) => {
    const cert = certificates.find((c) => c.id === selectedOption.value);
    if (cert) {
      setSelectedCertificate(cert);
      setPlaceholders(cert.placeholders || []);
    }
  };


  
  const certificate_id = "";

  const [certificateOptions, setCertificateOptions] = useState<ImageOption[]>([]);


  // States
  const [selectedImages, setSelectedImages] = useState<ImageOption[]>([]);
  const [options, setOptions] = useState<ImageOption[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [future, setFuture] = useState<any[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instructorName, setInstructorName] = useState("");

  const [certificate_data_url, setcertificate_data_url] = useState<CertificateData | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });
  const [zoom, setZoom] = useState(1);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Create a debounced save function for placeholder positions
  const savePlaceholderPosition = useCallback(
    debounce(async (placeholderId, x, y) => {
      try {
        const response = await fetch(
          `/api/managecertificates/${certificate_id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: placeholderId, x, y }),
          }
        );

        if (!response.ok)
          throw new Error("Failed to update placeholder position.");
      } catch (error) {
        console.error("Error saving placeholder position:", error);
      }
    }, 500), // ✅ Debounce for 500ms
    [certificate_id]
  );

  // Utility function to strip HTML tags
  const stripHtmlTags = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };
 

 // Handle selection changes
  
  const handleChange = (
    newValue: SingleValue<certificateOptions>,
    actionMeta: ActionMeta<certificateOptions>
  ) => {
    if (newValue) {
      setSelectedImages([newValue]);
      setcertificate_data_url({
        id: certificate_id,
        certificate_id: certificate_id,
        certificate_data_url: newValue.value,
        owner_id: owner_id,
        is_published: false,
        unique_identifier: "",
        title: newValue.label,
        is_revocable: false,
        metadata: {
          courseName: "",
          instructor: "",
          courseDuration: "",
        },
        created_at: "",
        updated_at: "",
      });
    } else {
      setSelectedImages([]);
      setcertificate_data_url(null);
    }
  };

  // Fetch saved certificates images
  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/certificates/get-saved");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.certificates || !Array.isArray(data.certificates)) {
        console.error("Invalid data format received from API:", data);
        throw new Error("Invalid data format received from API.");
      }

      const fetchedImages: ImageOption[] = data.certificates.map(
        (cert: certificate) => ({
          value: cert.certificate_data_url,
          label: `${stripHtmlTags(
            cert.description || `certificate ${cert.unique_identifier}`
          )} - ${cert.metadata?.courseName || "No Course Name"}`,
        })
      );


      setOptions(fetchedImages);
      setPlaceholders(data.certificates.placeholders);
    } catch (error: any) {
      console.error("Error fetching existing images:", error);
      setError(
        error.message || "Failed to load certificates. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Your existing handlers
  const handleSavecertificate = async () => {
    // ... your save logic ...
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setFuture((prev) => [certificate_data_url, ...prev]);
      setDesignData(previousState);
      setHistory((prev) => prev.slice(0, prev.length - 1));
    }
  };

  const handleRedo = () => {
    if (future.length > 0) {
      const nextState = future[0];
      setHistory((prev) => [...prev, certificate_data_url]);
      setDesignData(nextState);
      setFuture((prev) => prev.slice(1));
    }
  };

  // Simple and working download handler
  const handleDownload = useCallback(async () => {
    const certificateElement = document.querySelector(".certificate-container");
    if (!certificateElement) return;

    try {
      const canvas = await html2canvas(certificateElement as HTMLElement, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `certificate-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      // Show success alert
      showAlert("success", "certificate downloaded successfully");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      showAlert("error", "Failed to download certificate");
    }
  }, [showAlert]);

  // Add this function to handle crop completion
  const handleCropComplete = useCallback(
    (croppedImage: string) => {
      const newImages = [...selectedImages];
      newImages[0] = {
        ...newImages[0],
        value: croppedImage,
      };
      setSelectedImages(newImages);
      setShowCropper(false);
    },
    [selectedImages]
  );

  // Add this function to handle crop
  const handleCrop = useCallback(() => {
    const image = document.querySelector(
      "img[data-crop-source]"
    ) as HTMLImageElement;
    if (!image || !crop.width || !crop.height) {
      showAlert("error", "Please select an area to crop");
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width;
      canvas.height = crop.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      // Create a new image with crossOrigin set
      const img = new HTMLImageElement();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(
          img,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height
        );

        try {
          const croppedImageData = canvas.toDataURL("image/png");
          handleCropComplete(croppedImageData);
          showAlert("success", "Image cropped successfully");
        } catch (error) {
          console.error("Error converting to data URL:", error);
          showAlert("error", "Failed to process cropped image");
        }
      };

      img.onerror = () => {
        showAlert("error", "Failed to load image for cropping");
      };

      img.src = image.src;
    } catch (error) {
      console.error("Error cropping image:", error);
      showAlert("error", "Failed to crop image");
    }
  }, [crop, handleCropComplete, showAlert]);

  // Add this function to handle saving the certificate
  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      if (!certificate_data_url) {
        throw new Error("certificate data is missing");
      }

      if (!certificate_data_url.id || certificate_data_url.id.trim() === "") {
        throw new Error("certificate ID is missing or empty");
      }

      console.log("certificate data before saving:", certificate_data_url);

      const isValidUUID = (uuid: string) => {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
      };

      if (!isValidUUID(Certificate.id)) {
        console.error("Invalid certificate ID:", Certificate.id);
        throw new Error(`Invalid certificate ID: ${Certificate.id}`);
      }

      // ✅ Ensure placeholders retain their original IDs // ! warning i added this line
      const updatedPlaceholders = placeholders.map((p) => ({
        id: isValidUUID(p.id) ? p.id : uuidv4(), // Keep existing UUIDs
        certificate_id: p.certificate_id,
        key: p.key ? p.key : convertLabelToKey(p.label), // Keep consistent keys
        discount: p.discount,
        x: p.x, // Ensure X position is stored
        y: p.y, // Ensure Y position is stored
        font_size: p.font_size,
        is_visible: p.is_visible,
        label: p.label,
        color: p.color,
        value: p.value,
      }));

      const payload = {
        id: certificate_data_url.id,
        image: selectedImages[0]?.value, // Include the certificate image
        placeholders: updatedPlaceholders,
      };

      console.log("Payload for saving certificate:", payload);

      const response = await fetch(
        `/api/managecertificates/${certificate_data_url.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update certificate");
      }

      const result = await response.json();
      console.log("certificate updated successfully:", result);

      // Update local state or perform any other necessary actions
      setDesignData(result.data);
      showAlert("success", "certificate updated successfully");
    } catch (error) {
      console.error("Error in handleSaveChanges:", error);
      showAlert(
        "error",
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* certificate Selection */}
      <div className="mb-4">
        <Select
          options={certificates.map((cert) => ({ value: cert.id, label: cert.unique_identifier }))}
          value={selectedImages[0] || null}
          onChange={handleSelectCertificate}
          isLoading={loading}
          placeholder="Select a certificate..."
          className="react-select-container"
          classNamePrefix="react-select"
          noOptionsMessage={() =>
        loading ? "Loading certificates..." : "No certificates available"
          }
          isSearchable
        />
        {selectedCertificate && (
        <div className="relative mt-4">
          <Image
            src={selectedCertificate.certificate_data_url}
            alt="Certificate"
            width={800}
            height={600}
          />
          {placeholders.map((ph) => (
            <Draggable
              key={ph.id}
              defaultPosition={{ x: ph.x, y: ph.y }}
              onStop={(e, data) => handlePlaceholderChange(ph.id, data.x, data.y)}
            >
              <div className="absolute cursor-move bg-white p-1 border">
                {ph.label}
              </div>
            </Draggable>
          ))}
        </div>
      )}

      {selectedCertificate && (
        <button onClick={handleSaveChanges} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Save Changes
        </button>
      )}
      </div>

      {selectedImages.length > 0 && (
        <div className="mb-6">
          {/* Control Buttons */}
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="flex items-center space-x-2 bg-blue text-white px-4 py-2 rounded-lg"
            >
              <SettingsIcon size={24} color="white" />
              <span>Options</span>
            </button>
            <button
              onClick={() => setPlaceholders(initialPlaceholders)}
              className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              <RefreshIcon size={24} color="white" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleSaveChanges}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              <TestIcon size={24} color="white" />
              <span>Save Changes</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 bg-yellow text-white px-4 py-2 rounded-lg"
            >
              <DownloadIcon width={24} color="white" />
              <span>Download</span>
            </button>
          </div>

          {/* Add this options panel right after the buttons */}
          {showOptions && (
            <div className="mb-4 p-4 border rounded bg-gray-100">
              <h3 className="text-lg font-bold mb-4">Placeholder Settings</h3>
              {Array.isArray(placeholders) && placeholders.length > 0 ? (
                <>
                  <Select
                    isMulti
                    options={placeholders.map((p) => ({
                      value: p.id,
                      label: p.label,
                    }))}
                    value={placeholders
                      .filter((p) => p.isVisible)
                      .map((p) => ({ value: p.id, label: p.label }))}
                    onChange={(selected) => {
                      const selectedIds =
                        selected?.map((option) => option.value) || [];
                      setPlaceholders((prev) =>
                        prev.map((p) => ({
                          ...p,
                          isVisible: selectedIds.includes(p.id),
                        }))
                      );
                    }}
                    className="mb-4"
                  />
                  {placeholders.map((placeholder) => (
                    <div
                      key={placeholder.id}
                      className="mb-2 flex items-center justify-between"
                    >
                      <span>{placeholder.label}</span>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm">Font Size:</label>
                        <input
                          type="number"
                          value={placeholder.fontSize || 16}
                          onChange={(e) => {
                            const size = Math.max(
                              8,
                              Math.min(72, parseInt(e.target.value) || 16)
                            );
                            setPlaceholders((prev) =>
                              prev.map((p) =>
                                p.id === placeholder.id
                                  ? { ...p, fontSize: size }
                                  : p
                              )
                            );
                          }}
                          className="w-16 px-2 py-1 border rounded"
                          min="8"
                          max="72"
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p>No placeholders available</p>
              )}
            </div>
          )}

          {/* Add crop button */}
          <button
            onClick={() => setShowCropper(true)}
            className="mb-4 px-4 py-2 bg-blue-500 text-green-500 rounded hover:bg-blue-600"
          >
            Crop certificate
          </button>

          {showCropper ? (
            <div className="fixed inset-0 z-50 bg-white p-4">
              <div className="max-w-4xl mx-auto">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  aspect={842 / 595}
                >
                  <img
                    data-crop-source
                    src={selectedImages[0].value}
                    alt="certificate to crop"
                    className="max-w-full"
                    crossOrigin="anonymous"
                  />
                </ReactCrop>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setShowCropper(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCrop}
                    className="px-4 py-2 bg-blue text-white rounded"
                  >
                    Apply Crop
                  </button>
                </div>
              </div>
            </div>
          ) : (
              <img
              <Image
                src={selectedImages[0].value}
                alt={selectedImages[0].label}
                layout="fill"
                objectFit="contain"
                crossOrigin="anonymous"
              />
              {/* Editable Placeholders */}
              <div className="absolute inset-0 p-8">
                {Array.isArray(placeholders) &&
                  placeholders.map(
                    (placeholder, index) =>
                      placeholder &&
                      placeholder.isVisible && (
                        <Draggable
                          key={placeholder.id}
                          defaultPosition={{
                            x: placeholder.x ?? 0,
                            y: placeholder.y ?? 0,
                          }}
                          bounds="parent"
                          onStop={(e, data) => {
                            setPlaceholders((prev) =>
                              prev.map((p) =>
                                p.id === placeholder.id
                                  ? { ...p, x: data.x, y: data.y }
                                  : p
                              )
                            );
                            savePlaceholderPosition(
                              placeholder.id,
                              data.x,
                              data.y
                            ); // ✅ Debounced API call
                          }}

                          //! warning edited above
                        >
                          <div className="absolute cursor-move group">
                            <input
                              type="text"
                              value={placeholder.value || ""}
                              onChange={(e) => {
                                const newPlaceholders = [...placeholders];
                                newPlaceholders[index] = {
                                  ...placeholder,
                                  value: e.target.value,
                                };
                                setPlaceholders(newPlaceholders);
                              }}
                              className="bg-transparent hover:bg-white/50 focus:bg-white/50 
                     border border-transparent hover:border-gray-300 
                     focus:border-blue-500 rounded px-2 py-1 outline-none transition-all"
                              style={{
                                fontSize: `${placeholder.fontSize || 16}px`,
                                minWidth: "100px",
                              }}
                              placeholder={placeholder.label || ""}
                            />
                          </div>
                        </Draggable>
                      )
                  )}
              </div>
            </div>
          )}

          {/* Save Changes Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleSaveChanges}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* DesignTab remains for other functionality */}
      <div className="mt-4">
        {currentIdx === 0 && (
          <DesignTab
            certificate_data_url={
              certificate_data_url || {
                id: certificate_id,
                certificate_id: certificate_id,
                imageUrl: "",
                ownerId: "",
                certificate_data_url: "",
                is_published: false,
                unique_identifier: "",
                title: "",
                is_revocable: false,
                metadata: {
                  courseName: "",
                  instructor: "",
                  courseDuration: "",
                },
                created_at: "",
                updated_at: "",
              }
            }
            isEditing={isEditing}
            instructorName={instructorName}
            setDesignData={setDesignData}
            placeholders={placeholders}
            setPlaceholders={setPlaceholders}
          />
        )}
      </div>
    </div>
  );
};

export default EditCertiFields;
