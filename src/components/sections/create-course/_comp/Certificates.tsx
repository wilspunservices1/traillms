// components/CertificatesTemp.tsx

"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import useSweetAlert from "@/hooks/useSweetAlert";
import CertificateCard from "./Certificate/CertificateCard"; // Adjust the import path as needed
import CertificateModal from "./Certificate/CertificateModel"; // Corrected import path
import { useRouter, usePathname } from "next/navigation";

type CertificateMetadata = {
	file_name?: string;
	courseName?: string;
	instructor?: string;
	courseDuration?: string;
};

type CertificatePlaceHolders = {
	id: string;
	certificate_id: string;
	key?: string;
	discount?: number;
	x?: number | string; // X-coordinate for positioning
	y?: number | string; // Y-coordinate for positioning
	font_size?: number | string;
	is_visible?: boolean;
	label?: string;
	color?: string;
	value?: string;
};

type Certificate = {
	id: string;
	owner_id?: string;
	course_id?: string;
	certificate_data_url: string;
	description?: string; // Description of the certificate
	is_published?: boolean; // Publication status
	unique_identifier?: string;
	title?: string; // Course title associated with the certificate
	expiration_date?: string;
	is_revocable?: boolean;
	created_at?: string;
	updated_at?: string;
	metadata?: CertificateMetadata;
	is_enabled?: boolean;
	orientation?: string;
	max_download?: number;
	is_deleted?: boolean;
	placeholders?: CertificatePlaceHolders[];
};

const CertificatesTemp: React.FC = () => {
	const pathname = usePathname();
	const segments = pathname.split("/");
	const course_id = segments[2];

	console.log("Extracted course_id from URL:", course_id);

	const [certificates, setCertificates] = useState<Certificate[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true); // Global loading state for initial fetch
	const [error, setError] = useState<Error | null>(null);
	const [convertedImages, setConvertedImages] = useState<{
		[key: string]: string;
	}>({});
	const certificateRefs = useRef<{ [key: string]: HTMLDivElement | null }>(
		{}
	);
	const [selectedCertificateId, setSelectedCertificateId] = useState<
		string | null
	>(null);
	const [isOpen, setIsOpen] = useState<boolean>(false); // Accordion open state
	const [loadingCertificates, setLoadingCertificates] = useState<{
		[key: string]: boolean;
	}>({}); // Per-certificate loading state
	const showAlert = useSweetAlert();
	const router = useRouter();

	// State for Modal
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [selectedCertificate, setSelectedCertificate] =
		useState<Certificate | null>(null);

	// Helper function to check if the certificateData is a valid image URL
	const isValidImageUrl = (url: string): boolean => {
		return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(url);
	};

	// Fetch certificates data from the API
	useEffect(() => {
		const fetchCertificates = async () => {
			try {
				const response = await fetch("/api/certificates/get-saved");
				if (!response.ok) {
					throw new Error(`Error: ${response.statusText}`);
				}
				const data = await response.json();

				// Ensure data.certificates is an array
				if (!Array.isArray(data.certificates)) {
					throw new Error(
						"Invalid data format: certificates should be an array."
					);
				}

				setCertificates(data.certificates);
			} catch (err) {
				// Ensure err is an instance of Error
				if (err instanceof Error) {
					setError(err);
				} else {
					setError(new Error("An unexpected error occurred."));
				}
			} finally {
				setIsLoading(false); // Stop loading regardless of success or failure
			}
		};

		fetchCertificates();
	}, []);

	// Function to handle certificate selection and send the PATCH request
	const handleCertificateSelect = async (certificateId: string) => {
		setSelectedCertificateId(certificateId); // Set the selected certificate's ID
		setLoadingCertificates((prev) => ({ ...prev, [certificateId]: true })); // Start loading for this certificate

		if (!course_id) {
			showAlert(
				"error",
				"Course ID is missing. Please provide a valid course ID."
			);
			setLoadingCertificates((prev) => ({
				...prev,
				[certificateId]: false,
			})); // Stop loading on early return
			return;
		}

		try {
			console.log("Sending Unpublish Request with Payload:", {
				course_id,
			});

			const unpublishResponse = await fetch(
				`/api/certificates/unpublish`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ courseId: course_id }),
				}
			);
			

			if (!unpublishResponse.ok) {
				const errorData = await unpublishResponse.json();
				throw new Error(
					`Failed to unpublish certificates: ${errorData.message}`
				);
			}

			console.log("✅ Unpublish API Success");

			const responsex = await fetch(
				`/api/certificates/${certificateId}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ is_published: true }),
				}
			);

			if (!responsex.ok) {
				const errorData = await responsex.json();
				throw new Error(
					`Failed to publish certificate: ${errorData.message}`
				);
			}

			console.log("✅ Publish API Success");

			const response = await fetch(`/api/courses/${course_id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ certificateId }), // Updating the course
			});

			if (!response.ok) {
				let errorMessage = "Failed to update course certificate";
				try {
					const errorData = await response.json();
					errorMessage = errorData?.message || errorMessage;
				} catch (jsonError) {
					console.error("Error parsing error response:", jsonError);
				}
				throw new Error(errorMessage);
			}

			console.log("✅ Course Update API Success");

			setCertificates((prev) =>
				prev.map((cert) =>
					cert.id === certificateId
						? { ...cert, is_published: true }
						: { ...cert, is_published: false }
				)
			);

			if (!response.ok) {
				let errorMessage = "Failed to update certificate";
				try {
					const errorData = await response.json();
					errorMessage = errorData?.message || errorMessage;
				} catch (jsonError) {
					console.error("Error parsing error response:", jsonError);
				}
				throw new Error(errorMessage);
			}

			showAlert(
				"success",
				"Certificate selected and published successfully!"
			);

			// Automatically preview the certificate after updating it
			handlePreview(certificateId);
		} catch (err: any) {
			console.error("❌ API Error:", err);
			showAlert(
				"error",
				`Error: ${err.message || "An unexpected error occurred."}`
			);
		} finally {
			setLoadingCertificates((prev) => ({
				...prev,
				[certificateId]: false,
			})); // Stop loading
		}
	};

	// Automatically convert HTML content to image
	useEffect(() => {
		if (certificates.length === 0) return;

		// Wait until all refs are populated
		const checkRefsReady = () => {
			return certificates.every(
				(certificate) => certificateRefs.current[certificate.id]
			);
		};

		const convertHtmlToImage = async () => {
			const updatedImages: { [key: string]: string } = {};

			for (const certificate of certificates) {
				const element = certificateRefs.current[certificate.id];
				if (
					!isValidImageUrl(certificate.certificate_data_url) &&
					element
				) {
					try {
						const dataUrl = await toPng(element);
						updatedImages[certificate.id] = dataUrl;
					} catch (err) {
						console.error(
							`Failed to convert HTML to image for ${certificate.id}:`,
							err
						);
					}
				}
			}

			console.log("Updated Converted Images:", updatedImages);
			setConvertedImages(updatedImages);
		};

		// Wait for refs to be ready before running conversion
		const interval = setInterval(() => {
			if (checkRefsReady()) {
				clearInterval(interval);
				convertHtmlToImage();
			}
		}, 500);

		return () => clearInterval(interval);
	}, [certificates]);

	// Function to handle preview (opens modal)
	const handlePreview = (certificateId: string) => {
		const certificate = certificates.find(
			(cert) => cert.id === certificateId
		);
		if (certificate) {
			setSelectedCertificate(certificate);
			setIsModalOpen(true);
		}
	};

	// Function to close modal
	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedCertificate(null);
	};

	// Handler for Create and Download actions
	const handleCreate = (certificateId: string) => {
		// Implement your create certificate logic here
		console.log(`Create certificate with ID: ${certificateId}`);
		showAlert("info", "Create Certificate action triggered.");
		router.push("/courses/certificate/create-certificate");
		// For example, navigate to a create page or open a different modal
	};

	const handleDownload = (certificateId: string) => {
		// Implement your download certificate logic here
		console.log(`Download certificate with ID: ${certificateId}`);
		// Example: Trigger a download of the certificate image
		const certificate = certificates.find(
			(cert) => cert.id === certificateId
		);
		if (
			certificate &&
			certificate.certificate_data_url &&
			isValidImageUrl(certificate.certificate_data_url)
		) {
			window.open(certificate.certificate_data_url, "_blank");
		} else {
			showAlert("error", "Certificate image not available for download.");
		}
	};

	useEffect(() => {
		console.log("Certificates:", certificates);
		console.log("Converted Images:", convertedImages);
	}, [certificates, convertedImages]);

	const setCertificateRef = useCallback(
		(id: string) => (el: HTMLDivElement | null) => {
			if (el) {
				certificateRefs.current[id] = el;
			}
		},
		[]
	);

	return (
		<div className="bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-b-md">
			{/* Controller */}
			<div
				className="cursor-pointer py-5 px-8"
				onClick={() => setIsOpen(!isOpen)}
			>
				<div className="accordion-controller flex justify-between items-center text-lg text-headingColor font-semibold w-full dark:text-headingColor-dark font-hind leading-7 rounded-b-md">
					<div>
						<span>Certificate Template</span>
					</div>
					<svg
						className={`transition-transform duration-500 ${
							isOpen ? "rotate-180" : "rotate-0"
						}`}
						width="20"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="#212529"
					>
						<path
							fillRule="evenodd"
							d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
						></path>
					</svg>
				</div>
			</div>

			{/* Content */}
			<div
				className={`accordion-content transition-max-height duration-500 ease-in-out ${
					isOpen ? "max-h-screen" : "max-h-0"
				} overflow-hidden`}
			>
				<div className="content-wrapper py-4 px-5">
					{isLoading ? (
						// Initial Loading Skeleton Grid
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{Array.from({ length: 3 }).map((_, index) => (
								<div
									key={index}
									className="relative max-w-xs mb-4"
								>
									<div className="w-full h-48 bg-gray-200 animate-shimmer rounded-lg"></div>
									<div className="mt-4 space-y-2">
										<div className="skeleton-text animate-shimmer h-6 w-3/4"></div>
										<div className="skeleton-text animate-shimmer h-4 w-full"></div>
									</div>
								</div>
							))}
						</div>
					) : error ? (
						// Render only error.message to prevent rendering Error objects
						<p className="text-red-500">
							Error loading certificates: {error.message}
						</p>
					) : certificates.length === 0 ? (
						// No Certificates Message
						<p>No certificates available.</p>
					) : (
						// Certificates Grid
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{certificates.map((certificate) => (
								<div
									key={certificate.id}
									className={`relative group ${
										selectedCertificateId === certificate.id
											? "border-2 border-green-500"
											: ""
									}`}
								>
									<CertificateCard
										certificate={certificate}
										convertedImage={
											convertedImages[certificate.id] ??
											certificate.certificate_data_url
										}
										isSelected={
											selectedCertificateId ===
											certificate.id
										}
										onSelect={handleCertificateSelect}
										onPreview={handlePreview}
										onCreate={handleCreate}
										onDownload={handleDownload}
										isLoading={
											certificate.id
												? loadingCertificates[
														certificate.id
												  ] || false
												: false
										} // Pass per-certificate loading state
									/>

									{/* Hidden Ref for HTML to Image Conversion */}
									{certificate.id &&
										!isValidImageUrl(
											certificate.certificate_data_url
										) &&
										!convertedImages[certificate.id] && (
											<div
												ref={setCertificateRef(
													certificate.id
												)}
												className="hidden"
											>
												<div className="bg-white dark:bg-gray-800 text-black dark:text-white p-6 rounded-lg shadow-md">
													<h2 className="text-2xl font-bold mb-2">
														Certificate of
														Achievement
													</h2>
													<p className="text-lg mb-2">
														This is to certify that
													</p>
													<h3 className="text-xl font-semibold mb-2">
														[Recipient Name]
													</h3>
													<p className="text-lg">
														has successfully
														completed the course.
													</p>
												</div>
											</div>
										)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Certificate Modal */}
			{isModalOpen && selectedCertificate && (
				<CertificateModal
					certificate={selectedCertificate}
					onClose={closeModal} // Pass the close function to the modal
				/>
			)}

			{/* Initialize Tooltips */}
			{/* Assuming ReactTooltip is used globally or initialized elsewhere */}
		</div>
	);
};

export default CertificatesTemp;
