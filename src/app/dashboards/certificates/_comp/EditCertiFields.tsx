"use client";
import React, { useState, useEffect } from "react";
import Select, { SingleValue } from "react-select";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Draggable from "react-draggable";
import html2canvas from "html2canvas";
import { debounce } from "lodash";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";

import { useCallback, useMemo, useRef } from "react";

// Icons, Hooks, and Components
import { SettingsIcon, RefreshIcon, TestIcon } from "@/components/icons";
import useSweetAlert from "@/hooks/useSweetAlert";
import useTab from "@/hooks/useTab";
import TabsButton from "./Tabs"; // (If you need this)
import DesignTab from "./DesignTab"; // Your additional design functionality

// Types from your /types/certificates
import type { CertificateData } from "@/types/certificates";

// Local mock or shared placeholders
import { initialPlaceholders } from "@/assets/mock";

// Utility for cropping (if needed)
import { getCroppedImg } from "@/utils/cropImage";
import DownloadIcon from "@/components/sections/create-course/_comp/Certificate/Icon/DownloadIcon";

interface APICertificate {
	id: string;
	owner_id: string;
	certificate_data_url: string;
	description: string;
	is_published: boolean;
	unique_identifier: string;
	title: string;
	expiration_date: string;
	is_revocable: boolean;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
	is_enabled: boolean;
	orientation: string;
	max_download: number;
	is_deleted: boolean;
	course_id: string;
	file_name: string;
	metadata: {
		courseName?: string;
		instructor?: string;
		courseDuration?: string;
		file_name: string;
	};
	placeholders: APIPlaceholder[];
}

interface APIPlaceholder {
	id: string;
	certificate_id: string;
	key: string;
	discount: number;
	label: string;
	value: string;
	x: number;
	y: number;
	font_size?: number;
	is_visible?: boolean;
	color?: string;
	// Add other fields if they exist...
}

interface UIPlaceholder extends APIPlaceholder {
	font_size: number; // from font_size
	is_visible: boolean; // from is_visible
	color: string; // from color
}

interface CertificateOption {
	value: string; // The certificate's id
	label: string; // title + unique_identifier
}

interface EditCertiFieldsProps {
	setDesignData: (data: any) => void;
}

const EditCertiFields: React.FC<EditCertiFieldsProps> = ({ setDesignData }) => {
	// Custom hook to get the current tab index
	const { currentIdx } = useTab();
	const showAlert = useSweetAlert();

	const [allCertificates, setAllCertificates] = useState<APICertificate[]>(
		[]
	);
	const [selectedCertificate, setSelectedCertificate] =
		useState<APICertificate | null>(null);

	// This holds the placeholders for the currently selected certificate
	const [selectedPlaceholders, setSelectedPlaceholders] = useState<
		UIPlaceholder[]
	>([]);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showOptions, setShowOptions] = useState(false);

	// Crop states
	const [crop, setCrop] = useState<Crop>({
		unit: "%",
		x: 25,
		y: 25,
		width: 50,
		height: 50,
	});
	const [showCropper, setShowCropper] = useState(false);

	// Additional states from your existing code
	const [isEditing, setIsEditing] = useState(false);
	const [instructorName, setInstructorName] = useState("");

	const fetchUserCertificates = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/certificates/get-saved");
			if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
			const data = await response.json();

			if (!data || !Array.isArray(data.certificates)) {
				throw new Error("Invalid data format from API.");
			}

			setAllCertificates(data.certificates);
		} catch (err: any) {
			setError(err.message || "Failed to fetch certificates");
			console.error("Error fetching certificates:", err);
		} finally {
			setLoading(false);
		}
	}, []);

	// On mount, fetch certificates
	useEffect(() => {
		fetchUserCertificates();
	}, [fetchUserCertificates]);

	const handleSelectCertificate = (
		newValue: SingleValue<CertificateOption>
	) => {
		if (!newValue) {
			setSelectedCertificate(null);
			setSelectedPlaceholders([]);
			return;
		}

		// Find the certificate in state
		const found = allCertificates.find(
			(cert) => cert.id === newValue.value
		);
		if (!found) {
			console.warn(
				"Selected certificate not found in state:",
				newValue.value
			);
			return;
		}

		// Store the selected certificate
		setSelectedCertificate(found);

		// Convert placeholders to our UIPlaceholder structure
		const placeholdersForCert: UIPlaceholder[] = found.placeholders.map(
			(ph) => ({
				...ph,
				font_size: ph.font_size ?? 16,
				is_visible: ph.is_visible !== false, // default true
				color: ph.color ?? "#000000",
			})
		);
		setSelectedPlaceholders(placeholdersForCert);
	};

	const handleCrop = useCallback(() => {
		if (!selectedCertificate) {
			showAlert("error", "No certificate to crop");
			return;
		}

		const imageEl = document.querySelector(
			"img[data-crop-source]"
		) as HTMLImageElement;
		if (!imageEl || !crop.width || !crop.height) {
			showAlert("error", "Please select an area to crop");
			return;
		}

		try {
			const canvas = document.createElement("canvas");
			const scaleX = imageEl.naturalWidth / imageEl.width;
			const scaleY = imageEl.naturalHeight / imageEl.height;

			canvas.width = crop.width;
			canvas.height = crop.height;
			const ctx = canvas.getContext("2d");
			if (!ctx) throw new Error("Failed to get 2D context");

			ctx.drawImage(
				imageEl,
				crop.x * scaleX,
				crop.y * scaleY,
				crop.width * scaleX,
				crop.height * scaleY,
				0,
				0,
				crop.width,
				crop.height
			);

			const croppedDataUrl = canvas.toDataURL("image/png");

			// Update local certificate with new image
			setSelectedCertificate((prev) => {
				if (!prev) return null;
				return {
					...prev,
					certificate_data_url: croppedDataUrl,
				};
			});

			setShowCropper(false);
			showAlert("success", "Image cropped successfully");
		} catch (error) {
			console.error("Error cropping image:", error);
			showAlert("error", "Failed to crop image");
		}
	}, [selectedCertificate, crop, showAlert]);

	const handleDownload = useCallback(async () => {
		const container = document.querySelector(".certificate-container");
		if (!container) return;

		try {
			const canvas = await html2canvas(container as HTMLElement, {
				useCORS: true,
				allowTaint: true,
				backgroundColor: "#fff",
				scale: 2,
			});

			const dataUrl = canvas.toDataURL("image/png");
			const link = document.createElement("a");
			link.href = dataUrl;
			link.download = `certificate-${Date.now()}.png`;
			link.click();

			showAlert("success", "Certificate downloaded successfully");
		} catch (error) {
			console.error("Download error:", error);
			showAlert("error", "Failed to download certificate");
		}
	}, [showAlert]);

	const certificateIdx = selectedCertificate?.id;

	// Debounced Update for Coordinates
	const updatePlaceholderCoordinates = useCallback(
		async (placeholderId: string, x: number, y: number) => {
			try {
				// If no certificate is selected, do nothing
				if (!certificateIdx) return;
				const response = await fetch(
					`/api/manageCertificates/${certificateIdx}`,
					{
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ placeholderId, x, y }),
					}
				);
				if (!response.ok) {
					console.error(
						"Failed to update placeholder in DB, status:",
						response.status
					);
				}
			} catch (err) {
				console.error("Error updating placeholder in DB:", err);
			}
		},
		[certificateIdx] // The function depends on the current certificate ID
	);

	/**
	 * 2) A debounced version of that callback, memoized with `useMemo`.
	 */
	const debouncedUpdatePlaceholderCoordinates = useMemo(
		() => debounce(updatePlaceholderCoordinates, 500),
		[updatePlaceholderCoordinates] // Rebuild the debounced fn if `updatePlaceholderCoordinates` changes
	);

	// This function is triggered after dragging stops
	const savePlaceholderPosition = (
		placeholderId: string,
		x: number,
		y: number
	) => {
		debouncedUpdatePlaceholderCoordinates(placeholderId, x, y);
	};

	useEffect(() => {
		return () => {
			debouncedUpdatePlaceholderCoordinates.cancel();
		};
	}, [debouncedUpdatePlaceholderCoordinates]);

	const handleSaveChanges = async () => {
		try {
			if (!selectedCertificate) {
				showAlert("error", "No certificate selected");
				return;
			}
			// Example: we can do a PUT/PATCH to your backend with updated placeholders
			console.log(
				"Saving changes => certificate:",
				selectedCertificate.id
			);
			console.log("Placeholders =>", selectedPlaceholders);

			showAlert("success", "Certificate changes saved successfully");
		} catch (err) {
			console.error("Error saving changes:", err);
			showAlert("error", "Failed to save changes");
		}
	};

	const togglePlaceholderVisibility = async (placeholderId, isVisible) => {
		try {
			const response = await fetch(`/api/placeholders/${placeholderId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ is_visible: isVisible }),
			});

			if (!response.ok) {
				throw new Error("Failed to update visibility");
			}

			console.log(
				`Placeholder ${placeholderId} visibility updated to ${isVisible}`
			);
		} catch (error) {
			console.error("Error updating placeholder visibility:", error);
		}
	};

	return (
		<div className="p-4">
			{/* Certificate Selection Dropdown */}
			<div className="mb-4">
				<Select
					options={allCertificates.map((cert) => ({
						value: cert.id,
						label: `${cert.title} - ${cert.unique_identifier}`, // Title + unique_identifier
					}))}
					onChange={handleSelectCertificate}
					isLoading={loading}
					placeholder="Select a certificate..."
					className="react-select-container"
					classNamePrefix="react-select"
					isSearchable
				/>
			</div>

			{selectedCertificate && (
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
							onClick={() =>
								setSelectedPlaceholders(
									initialPlaceholders.map((ph: any) => ({
										// Convert your initial placeholders to the same shape
										...ph,
										font_size: ph.font_size || 16,
										is_visible: true,
										id: ph.id || uuidv4(), // generate if missing
									}))
								)
							}
							className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg"
						>
							<RefreshIcon size={24} color="white" />
							<span>Reset</span>
						</button>

						{/* <button
							onClick={handleSaveChanges}
							className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg"
						>
							<TestIcon size={24} color="white" />
							<span>Save Changes</span>
						</button> */}

						<button
							onClick={handleDownload}
							className="flex items-center space-x-2 bg-yellow text-white px-4 py-2 rounded-lg"
						>
							<DownloadIcon width={24} color="white" />
							<span>Download</span>
						</button>
					</div>

					{/* Options Panel (Placeholder Settings) */}
					{showOptions && (
						<div className="mb-4 p-4 border rounded bg-gray-100">
							<h3 className="text-lg font-bold mb-4">
								Placeholder Settings
							</h3>
							<Select
								isMulti
								options={selectedPlaceholders.map((p) => ({
									value: p.id,
									label: p.label,
								}))}
								value={selectedPlaceholders
									.filter((p) => p.is_visible)
									.map((p) => ({
										value: p.id,
										label: p.label,
									}))}
								onChange={(selected) => {
									const selectedIds =
										selected?.map((opt) => opt.value) || [];
									setSelectedPlaceholders((prev) =>
										prev.map((ph) => {
											const newVisibility =
												selectedIds.includes(ph.id);
											if (
												ph.is_visible !== newVisibility
											) {
												togglePlaceholderVisibility(
													ph.id,
													newVisibility
												); // API call
											}
											return {
												...ph,
												is_visible: newVisibility,
											};
										})
									);
								}}
								className="mb-4"
							/>
							<button
								onClick={() => {
									setSelectedPlaceholders((prev) =>
										prev.map((ph) => {
											if (!ph.is_visible) {
												togglePlaceholderVisibility(
													ph.id,
													true
												); // Restore in DB
												return {
													...ph,
													is_visible: true,
												};
											}
											return ph;
										})
									);
								}}
								className="mt-4 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-300"
							>
								Show Hidden Placeholders
							</button>

							{selectedPlaceholders.map((ph) => (
								<div
									key={ph.id}
									className="mb-2 flex items-center justify-between"
								>
									<span>{ph.label}</span>
									<div className="flex items-center space-x-2">
										<label className="text-sm">
											Font Size:
										</label>
										<input
											type="number"
											value={ph.font_size}
											onChange={(e) => {
												const size = Math.max(
													8,
													Math.min(
														72,
														parseInt(
															e.target.value
														) || 16
													)
												);
												setSelectedPlaceholders(
													(prev) =>
														prev.map((item) =>
															item.id === ph.id
																? {
																		...item,
																		font_size:
																			size,
																  }
																: item
														)
												);
											}}
											className="w-16 px-2 py-1 border rounded"
											min={8}
											max={72}
										/>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Crop Button */}
					<button
						onClick={() => setShowCropper(true)}
						className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Crop Certificate
					</button>

					{/* Cropper */}
					{showCropper ? (
						<div className="fixed inset-0 z-50 bg-white p-4">
							<div className="max-w-4xl mx-auto">
								<ReactCrop
									crop={crop}
									onChange={(c) => setCrop(c)}
									aspect={842 / 595} // e.g., A4 ratio
								>
									<Image
										data-crop-source
										src={
											selectedCertificate.certificate_data_url
										}
										alt="Certificate to crop"
										className="max-w-full"
										crossOrigin="anonymous"
										width={1280}
										height={904}
										style={{
											width: "100%",
											height: "auto",
										}}
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
						// Certificate Display + Draggable Placeholders
						<div className="certificate-container relative w-[842px] h-[595px] mx-auto bg-white">
							<Image
								src={selectedCertificate.certificate_data_url}
								alt={`${selectedCertificate.title} - ${selectedCertificate.unique_identifier}`}
								className="w-full h-full object-contain"
								crossOrigin="anonymous"
								width={1280}
								height={904}
								style={{ width: "100%", height: "auto" }}
							/>
							<div className="absolute inset-0 p-8">
								{selectedPlaceholders
									.filter((ph) => ph.is_visible)
									.map((placeholder, index) => (
										<Draggable
											key={placeholder.id}
											defaultPosition={{
												x: placeholder.x || 0,
												y: placeholder.y || 0,
												font_size: placeholder.font_size,
												color: placeholder.color,
											}}
											bounds="parent"
											onStop={(e, data) => {
												// Update local placeholders with new position
												setSelectedPlaceholders(
													(prev) =>
														prev.map((item) =>
															item.id ===
															placeholder.id
																? {
																		...item,
																		x: data.x,
																		y: data.y,
																  }
																: item
														)
												);
												// Debounced position save
												savePlaceholderPosition(
													placeholder.id,
													data.x,
													data.y
												);
											}}
										>
											<div className="absolute cursor-move group">
												<input
													type="text"
													value={placeholder.value}
													onChange={(e) => {
														const updatedVal =
															e.target.value;
														setSelectedPlaceholders(
															(prev) =>
																prev.map(
																	(item) =>
																		item.id ===
																		placeholder.id
																			? {
																					...item,
																					value: updatedVal,
																			  }
																			: item
																)
														);
													}}
													className="bg-transparent hover:bg-white/50 focus:bg-white/50 
                            border border-transparent hover:border-gray-300 
                            focus:border-blue-500 rounded px-2 py-1 outline-none transition-all"
													style={{
														fontSize: `${placeholder.font_size}px`,
														minWidth: "100px",
													}}
													placeholder={
														placeholder.label || ""
													}
												/>
											</div>
										</Draggable>
									))}
							</div>
						</div>
					)}

					{/* Final Save Changes Button */}
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
						certificateData={
							selectedCertificate
								? {
										// Use only the fields that exist in CertificateData
										id: selectedCertificate.id,
										owner_id: selectedCertificate.owner_id,
										certificate_data_url:
											selectedCertificate.certificate_data_url,
										description:
											selectedCertificate.description,
										is_published:
											selectedCertificate.is_published,
										unique_identifier:
											selectedCertificate.unique_identifier,
										title: selectedCertificate.title,
										is_revocable:
											selectedCertificate.is_revocable,
										metadata: selectedCertificate.metadata,
										created_at:
											selectedCertificate.created_at,
										updated_at:
											selectedCertificate.updated_at,
										// ...any other properties that actually exist in CertificateData
								  }
								: {
										// Fallback object: also must match CertificateData
										id: "",
										owner_id: "",
										certificate_data_url: "",
										description: "",
										is_published: false,
										unique_identifier: "",
										title: "",
										is_revocable: false,
										metadata: {
											courseName: "",
											instructor: "",
											courseDuration: "",
											file_name: "",
										},
										created_at: "",
										updated_at: "",
										// ...any other properties that actually exist in CertificateData
								  }
						}
						// These props are okay to leave as is
						isEditing={isEditing}
						instructorName={instructorName}
						setDesignData={setDesignData}
						placeholders={selectedPlaceholders}
						setPlaceholders={setSelectedPlaceholders}
					/>
				)}
			</div>
		</div>
	);
};

export default EditCertiFields;
