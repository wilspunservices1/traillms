// "use client";

// import { useState, useEffect } from "react";
// import { useSession } from "next-auth/react";
// import { FaTrash, FaTrashRestore, FaTrashAlt } from "react-icons/fa";
// import EditCertificateModal from "./EditCertificateModal";
// import useSweetAlert from "@/hooks/useSweetAlert";
// import router from "next/router";

// interface Certificate {
// 	id: string;
// 	course_id: string;
// 	title: string;
// 	name?: string;
// 	description: string | null;
// 	courseTitle?: string | null;
// 	filePath?: string;
// 	previewUrl?: string;
// 	createdAt: string;
// 	updatedAt?: string;
// 	isPublished: boolean;
// }

// interface DeletedCertificate extends Certificate {
// 	deletedAt: string;
// }

// const ITEMS_PER_PAGE = 10;

// const ManageCertificateTable = () => {
// 	const [certificates, setCertificates] = useState<Certificate[]>([]);
// 	const [deletedCertificates, setDeletedCertificates] = useState<
// 		DeletedCertificate[]
// 	>([]);
// 	const [isLoading, setIsLoading] = useState(true);
// 	const [error, setError] = useState<string | null>(null);
// 	const [currentPage, setCurrentPage] = useState(1);
// 	const [showTrash, setShowTrash] = useState(false);
// 	const [editingCertificate, setEditingCertificate] =
// 		useState<Certificate | null>(null);
// 	const { data: session } = useSession();
// 	const showAlert = useSweetAlert();

// 	// Calculate pagination values
// 	const totalPages = Math.ceil(certificates.length / ITEMS_PER_PAGE);
// 	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
// 	const endIndex = startIndex + ITEMS_PER_PAGE;
// 	const currentCertificates = certificates.slice(startIndex, endIndex);

// 	useEffect(() => {
// 		if (session) {
// 			fetchCertificates();
// 		}
// 	}, [session]);

// 	const fetchCertificates = async () => {
// 		try {
// 			setIsLoading(true);
// 			setError(null);

// 			const response = await fetch("/api/manageCertificates", {
// 				method: "GET",
// 				headers: {
// 					"Content-Type": "application/json",
// 				},
// 				credentials: "include",
// 			});

// 			if (!response.ok) {
// 				const errorData = await response.json();
// 				throw new Error(
// 					errorData.error || "Failed to fetch certificates"
// 				);
// 			}

// 			const data = await response.json();
// 			console.log("Fetched certificates:", data);
// 			setCertificates(data);
// 		} catch (error) {
// 			console.error("Error fetching certificates:", error);
// 			setError(
// 				error instanceof Error
// 					? error.message
// 					: "Failed to load certificates"
// 			);
// 		} finally {
// 			setIsLoading(false);
// 		}
// 	};

// 	const handleEdit = (certificate: Certificate) => {
// 		if (!certificate || !certificate.course_id) {
// 			console.error("Invalid certificate data:", certificate);
// 			showAlert("error", "Invalid certificate data! Cannot edit.");
// 			return;
// 		}

// 		console.log(
// 			`Navigating to: /dashboards/certificates/edit/${certificate.course_id}`
// 		);

// 		router.push(`/dashboards/certificates/edit/${certificate.course_id}`);
// 	};

// 	const handleDelete = async (certificateId: string) => {
// 		if (!confirm("Are you sure you want to delete this certificate?"))
// 			return;

// 		try {
// 			const response = await fetch(
// 				`/api/manageCertificates/${certificateId}`,
// 				{
// 					method: "DELETE",
// 					credentials: "include",
// 				}
// 			);

// 			if (!response.ok) throw new Error("Failed to delete certificate");

// 			const certificateToDelete = certificates.find(
// 				(c) => c.id === certificateId
// 			);
// 			if (certificateToDelete) {
// 				const deletedCertificate: DeletedCertificate = {
// 					...certificateToDelete,
// 					deletedAt: new Date().toISOString(),
// 				};
// 				setDeletedCertificates((prev) => [...prev, deletedCertificate]);
// 				setCertificates((prev) =>
// 					prev.filter((c) => c.id !== certificateId)
// 				);
// 			}
// 		} catch (error) {
// 			console.error("Error deleting certificate:", error);
// 			alert("Failed to delete certificate");
// 		}
// 	};

// 	const handleRestore = async (certificateId: string) => {
// 		try {
// 			const response = await fetch(
// 				`/api/manageCertificates/${certificateId}/restore`,
// 				{
// 					method: "POST",
// 					credentials: "include",
// 				}
// 			);

// 			if (!response.ok) throw new Error("Failed to restore certificate");

// 			const certificateToRestore = deletedCertificates.find(
// 				(c) => c.id === certificateId
// 			);
// 			if (certificateToRestore) {
// 				const { deletedAt, ...restoredCertificate } =
// 					certificateToRestore;
// 				setCertificates((prev) => [...prev, restoredCertificate]);
// 				setDeletedCertificates((prev) =>
// 					prev.filter((c) => c.id !== certificateId)
// 				);
// 			}
// 		} catch (error) {
// 			console.error("Error restoring certificate:", error);
// 			alert("Failed to restore certificate");
// 		}
// 	};

// 	const handleSaveEdit = async (
// 		updatedCertificate: Certificate
// 	): Promise<void> => {
// 		try {
// 			console.log("Updating certificate:", updatedCertificate);

// 			const response = await fetch(
// 				`/api/manageCertificates/${updatedCertificate.id}`,
// 				{
// 					method: "PUT",
// 					headers: {
// 						"Content-Type": "application/json",
// 					},
// 					credentials: "include",
// 					body: JSON.stringify({
// 						id: updatedCertificate.id,
// 						title: updatedCertificate.title,
// 						description: updatedCertificate.description,
// 						isPublished: updatedCertificate.isPublished,
// 					}),
// 				}
// 			);

// 			if (!response.ok) {
// 				const errorData = await response.json();
// 				throw new Error(
// 					errorData.message || "Failed to update certificate"
// 				);
// 			}

// 			const updatedData = await response.json();
// 			console.log("Update successful:", updatedData);

// 			setCertificates((prev) =>
// 				prev.map((cert) =>
// 					cert.id === updatedCertificate.id
// 						? { ...cert, ...updatedData }
// 						: cert
// 				)
// 			);

// 			await fetchCertificates();
// 		} catch (error) {
// 			console.error("Error updating certificate:", error);
// 			throw error;
// 		}
// 	};

// 	const handlePermanentDelete = async (certificateId: string) => {
// 		if (
// 			!confirm(
// 				"Are you sure you want to permanently delete this certificate? This action cannot be undone."
// 			)
// 		) {
// 			return;
// 		}

// 		try {
// 			const response = await fetch(
// 				`/api/manageCertificates/${certificateId}/permanent`,
// 				{
// 					method: "DELETE",
// 					headers: {
// 						"Content-Type": "application/json",
// 					},
// 					credentials: "include",
// 				}
// 			);

// 			const data = await response.json();

// 			if (!response.ok) {
// 				throw new Error(
// 					data.message || "Failed to delete certificate permanently"
// 				);
// 			}

// 			setDeletedCertificates((prev) =>
// 				prev.filter((cert) => cert.id !== certificateId)
// 			);
// 			showAlert("success", "Certificate permanently deleted");
// 		} catch (error) {
// 			console.error("Error deleting certificate:", error);
// 			showAlert("error", "Failed to delete certificate permanently");
// 		}
// 	};

// 	const handlePageChange = (page: number) => {
// 		setCurrentPage(page);
// 	};

// 	// Add this helper function to strip HTML tags
// 	const stripHtmlTags = (html: string) => {
// 		const tmp = document.createElement("div");
// 		tmp.innerHTML = html;
// 		return tmp.textContent || tmp.innerText || "";
// 	};

// 	if (isLoading) return <div>Loading...</div>;
// 	if (error) return <div>Error: {error}</div>;

// 	return (
// 		<div className="p-6">
// 			<div className="flex justify-between items-center mb-6">
// 				<h1 className="text-2xl font-bold">Manage Certificates</h1>
// 				<button
// 					onClick={() => setShowTrash(!showTrash)}
// 					className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
// 				>
// 					<FaTrash />
// 					{showTrash ? "Show Active" : "Show Deleted"}
// 				</button>
// 			</div>

// 			{showTrash ? (
// 				<table className="wa-full border-collapse">
// 					<thead>
// 						<tr className="bg-gray-50">
// 							<th className="text-left p-4 border">Title</th>
// 							<th className="text-left p-4 border">Deleted At</th>
// 							<th className="text-left p-4 border">Actions</th>
// 						</tr>
// 					</thead>
// 					<tbody>
// 						{deletedCertificates.map((cert) => (
// 							<tr key={cert.id} className="border">
// 								<td className="p-4">{cert.title}</td>
// 								<td className="p-4">
// 									{new Date(
// 										cert.deletedAt
// 									).toLocaleDateString()}
// 								</td>
// 								<td className="p-4 flex gap-4">
// 									<button
// 										onClick={() => handleRestore(cert.id)}
// 										className="text-green-500 hover:text-green-600"
// 										title="Restore Certificate"
// 									>
// 										<FaTrashRestore className="text-xl" />
// 									</button>
// 									<button
// 										onClick={() =>
// 											handlePermanentDelete(cert.id)
// 										}
// 										className="text-red-500 hover:text-red-600"
// 										title="Delete Permanently"
// 									>
// 										<FaTrashAlt className="text-xl" />
// 									</button>
// 								</td>
// 							</tr>
// 						))}
// 					</tbody>
// 				</table>
// 			) : (
// 				<>
// 					<table className="w-full border-collapse">
// 						<thead>
// 							<tr className="bg-gray-50">
// 								<th className="text-left p-4 border">Title</th>
// 								<th className="text-left p-4 border">
// 									Description
// 								</th>
// 								<th className="text-left p-4 border">Course</th>
// 								<th className="text-left p-4 border">
// 									Created At
// 								</th>
// 								<th className="text-left p-4 border">Status</th>
// 								<th className="text-left p-4 border">
// 									Actions
// 								</th>
// 							</tr>
// 						</thead>
// 						<tbody>
// 							{currentCertificates.map((cert) => (
// 								<tr key={cert.id} className="border">
// 									<td className="p-4">
// 										{stripHtmlTags(cert.title)}
// 									</td>
// 									<td className="p-4">
// 										{cert.description
// 											? stripHtmlTags(cert.description)
// 											: "N/A"}
// 									</td>
// 									<td className="p-4">
// 										{cert.course_id || "N/A"}
// 									</td>
// 									<td className="p-4">
// 										{cert.createdAt
// 											? new Date(
// 													cert.createdAt
// 											  ).toLocaleDateString()
// 											: "N/A"}
// 									</td>
// 									<td className="p-4">
// 										<span
// 											className={`px-2 py-1 rounded-full text-sm ${
// 												cert.isPublished
// 													? "bg-green-100 text-green-800"
// 													: "bg-yellow-100 text-yellow-800"
// 											}`}
// 										>
// 											{cert.isPublished
// 												? "Active"
// 												: "Draft"}
// 										</span>
// 									</td>
// 									<td className="p-4">
// 										<button
// 											onClick={() => handleEdit(cert)}
// 											className="text-blue-500 mr-4 hover:text-blue-600 
//                                                      transition-all duration-300 hover:scale-110 
//                                                      relative group inline-flex items-center"
// 										>
// 											Edit
// 											<span
// 												className="absolute bottom-0 left-0 w-0 h-0.5 
//                                                            bg-blue-500 group-hover:w-full 
//                                                            transition-all duration-300"
// 											></span>
// 										</button>
// 										<button
// 											onClick={() =>
// 												handleDelete(cert.id)
// 											}
// 											className="text-red-500 hover:text-red-600 
//                                                      transition-all duration-300 hover:scale-110 
//                                                      relative group inline-flex items-center"
// 										>
// 											Delete
// 											<span
// 												className="absolute bottom-0 left-0 w-0 h-0.5 
//                                                            bg-red-500 group-hover:w-full 
//                                                            transition-all duration-300"
// 											></span>
// 										</button>
// 									</td>
// 								</tr>
// 							))}
// 						</tbody>
// 					</table>

// 					{/* Pagination */}
// 					<div className="flex justify-center items-center mt-4 gap-2">
// 						<button
// 							onClick={() => handlePageChange(currentPage - 1)}
// 							disabled={currentPage === 1}
// 							className={`px-3 py-1 rounded ${
// 								currentPage === 1
// 									? "bg-gray-200 text-gray-500 cursor-not-allowed"
// 									: "bg-blue-500 text-white hover:bg-blue-600"
// 							}`}
// 						>
// 							Previous
// 						</button>

// 						{[...Array(totalPages)].map((_, index) => (
// 							<button
// 								key={index + 1}
// 								onClick={() => handlePageChange(index + 1)}
// 								className={`px-3 py-1 rounded ${
// 									currentPage === index + 1
// 										? "bg-blue-500 text-white"
// 										: "bg-gray-200 hover:bg-gray-300"
// 								}`}
// 							>
// 								{index + 1}
// 							</button>
// 						))}

// 						<button
// 							onClick={() => handlePageChange(currentPage + 1)}
// 							disabled={currentPage === totalPages}
// 							className={`px-3 py-1 rounded ${
// 								currentPage === totalPages
// 									? "bg-gray-200 text-gray-500 cursor-not-allowed"
// 									: "bg-blue-500 text-white hover:bg-blue-600"
// 							}`}
// 						>
// 							Next
// 						</button>
// 					</div>
// 				</>
// 			)}

// 			{/* {editingCertificate && (
//                 <EditCertificateModal
//                     certificate={editingCertificate}
//                     isOpen={!!editingCertificate}
//                     onClose={() => setEditingCertificate(null)}
//                     onSave={handleSaveEdit}
//                 />
//             )} */}
// 		</div>
// 	);
// };

// export default ManageCertificateTable;

// // "use client";

// // import { useState, useEffect } from 'react';
// // import { useSession } from 'next-auth/react';
// // import { FaTrash, FaTrashRestore, FaTrashAlt } from 'react-icons/fa';
// // import EditCertificateModal from './EditCertificateModal';
// // import useSweetAlert from "@/hooks/useSweetAlert";
// // import { CertificateCanvas } from '@/components/certifications';

// // interface Certificate {
// //     id: string;
// //     title: string;
// //     name?: string;
// //     description: string | null;
// //     courseTitle?: string | null;
// //     filePath?: string;
// //     previewUrl?: string;
// //     createdAt: string;
// //     updatedAt?: string;
// //     isPublished: boolean;
// // }

// // interface DeletedCertificate extends Certificate {
// //     deletedAt: string;
// // }

// // const ITEMS_PER_PAGE = 10;

// // const ManageCertificateTable = () => {
// //     const [certificates, setCertificates] = useState<Certificate[]>([]);
// //     const [deletedCertificates, setDeletedCertificates] = useState<DeletedCertificate[]>([]);
// //     const [isLoading, setIsLoading] = useState(true);
// //     const [error, setError] = useState<string | null>(null);
// //     const [currentPage, setCurrentPage] = useState(1);
// //     const [showTrash, setShowTrash] = useState(false);
// //     const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
// //     const { data: session } = useSession();
// //     const showAlert = useSweetAlert();

// //     // Calculate pagination values
// //     const totalPages = Math.ceil(certificates.length / ITEMS_PER_PAGE);
// //     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
// //     const endIndex = startIndex + ITEMS_PER_PAGE;
// //     const currentCertificates = certificates.slice(startIndex, endIndex);

// //     useEffect(() => {
// //         if (session) {
// //             fetchCertificates();
// //         }
// //     }, [session]);

// //     const fetchCertificates = async () => {
// //         try {
// //             setIsLoading(true);
// //             setError(null);

// //             const response = await fetch('/api/manageCertificates', {
// //                 method: 'GET',
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                 },
// //                 credentials: 'include',
// //             });

// //             if (!response.ok) {
// //                 const errorData = await response.json();
// //                 throw new Error(errorData.error || 'Failed to fetch certificates');
// //             }

// //             const data = await response.json();
// //             console.log('Fetched certificates:', data);
// //             setCertificates(data);
// //         } catch (error) {
// //             console.error('Error fetching certificates:', error);
// //             setError(error instanceof Error ? error.message : 'Failed to load certificates');
// //         } finally {
// //             setIsLoading(false);
// //         }
// //     };

// //     const handleEdit = (certificate: Certificate) => {
// //         setEditingCertificate(certificate);
// //     };

// //     const handleDelete = async (certificateId: string) => {
// //         if (!confirm('Are you sure you want to delete this certificate?')) return;

// //         try {
// //             const response = await fetch(`/api/manageCertificates/${certificateId}`, {
// //                 method: 'DELETE',
// //                 credentials: 'include',
// //             });

// //             if (!response.ok) throw new Error('Failed to delete certificate');

// //             const certificateToDelete = certificates.find(c => c.id === certificateId);
// //             if (certificateToDelete) {
// //                 const deletedCertificate: DeletedCertificate = {
// //                     ...certificateToDelete,
// //                     deletedAt: new Date().toISOString()
// //                 };
// //                 setDeletedCertificates(prev => [...prev, deletedCertificate]);
// //                 setCertificates(prev => prev.filter(c => c.id !== certificateId));
// //             }
// //         } catch (error) {
// //             console.error('Error deleting certificate:', error);
// //             alert('Failed to delete certificate');
// //         }
// //     };

// //     const handleRestore = async (certificateId: string) => {
// //         try {
// //             const response = await fetch(`/api/manageCertificates/${certificateId}/restore`, {
// //                 method: 'POST',
// //                 credentials: 'include',
// //             });

// //             if (!response.ok) throw new Error('Failed to restore certificate');

// //             const certificateToRestore = deletedCertificates.find(c => c.id === certificateId);
// //             if (certificateToRestore) {
// //                 const { deletedAt, ...restoredCertificate } = certificateToRestore;
// //                 setCertificates(prev => [...prev, restoredCertificate]);
// //                 setDeletedCertificates(prev => prev.filter(c => c.id !== certificateId));
// //             }
// //         } catch (error) {
// //             console.error('Error restoring certificate:', error);
// //             alert('Failed to restore certificate');
// //         }
// //     };

// //     const handleSaveEdit = async (updatedCertificate: Certificate): Promise<void> => {
// //         try {
// //             console.log('Updating certificate:', updatedCertificate);

// //             const response = await fetch(`/api/manageCertificates/${updatedCertificate.id}`, {
// //                 method: 'PUT',
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                 },
// //                 credentials: 'include',
// //                 body: JSON.stringify({
// //                     id: updatedCertificate.id,
// //                     title: updatedCertificate.title,
// //                     description: updatedCertificate.description,
// //                     isPublished: updatedCertificate.isPublished,
// //                 }),
// //             });

// //             if (!response.ok) {
// //                 const errorData = await response.json();
// //                 throw new Error(errorData.message || 'Failed to update certificate');
// //             }

// //             const updatedData = await response.json();
// //             console.log('Update successful:', updatedData);

// //             setCertificates(prev =>
// //                 prev.map(cert =>
// //                     cert.id === updatedCertificate.id ? { ...cert, ...updatedData } : cert
// //                 )
// //             );

// //             await fetchCertificates();
// //         } catch (error) {
// //             console.error('Error updating certificate:', error);
// //             throw error;
// //         }
// //     };

// //     const handlePermanentDelete = async (certificateId: string) => {
// //         if (!confirm('Are you sure you want to permanently delete this certificate? This action cannot be undone.')) {
// //             return;
// //         }

// //         try {
// //             const response = await fetch(`/api/manageCertificates/${certificateId}/permanent`, {
// //                 method: 'DELETE',
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                 },
// //                 credentials: 'include',
// //             });

// //             const data = await response.json();

// //             if (!response.ok) {
// //                 throw new Error(data.message || 'Failed to delete certificate permanently');
// //             }

// //             setDeletedCertificates(prev => prev.filter(cert => cert.id !== certificateId));
// //             showAlert('success', 'Certificate permanently deleted');
// //         } catch (error) {
// //             console.error('Error deleting certificate:', error);
// //             showAlert('error', 'Failed to delete certificate permanently');
// //         }
// //     };

// //     const handlePageChange = (page: number) => {
// //         setCurrentPage(page);
// //     };

// //     // Add this helper function to strip HTML tags
// //     const stripHtmlTags = (html: string) => {
// //         const tmp = document.createElement('div');
// //         tmp.innerHTML = html;
// //         return tmp.textContent || tmp.innerText || '';
// //     };

// //     if (isLoading) return <div>Loading...</div>;
// //     if (error) return <div>Error: {error}</div>;

// //     return (
// //         <div className="p-6">
// //             <div className="flex justify-between items-center mb-6">
// //                 <h1 className="text-2xl font-bold">Manage Certificates</h1>
// //                 <button
// //                     onClick={() => setShowTrash(!showTrash)}
// //                     className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
// //                 >
// //                     <FaTrash />
// //                     {showTrash ? 'Show Active' : 'Show Deleted'}
// //                 </button>
// //             </div>

// //             {showTrash ? (
// //                 <table className="w-full border-collapse">
// //                     <thead>
// //                         <tr className="bg-gray-50">
// //                             <th className="text-left p-4 border">Title</th>
// //                             <th className="text-left p-4 border">Deleted At</th>
// //                             <th className="text-left p-4 border">Actions</th>
// //                         </tr>
// //                     </thead>
// //                     <tbody>
// //                         {deletedCertificates.map((cert) => (
// //                             <tr key={cert.id} className="border">
// //                                 <td className="p-4">{cert.title}</td>
// //                                 <td className="p-4">
// //                                     {new Date(cert.deletedAt).toLocaleDateString()}
// //                                 </td>
// //                                 <td className="p-4 flex gap-4">
// //                                     <button
// //                                         onClick={() => handleRestore(cert.id)}
// //                                         className="text-green-500 hover:text-green-600"
// //                                         title="Restore Certificate"
// //                                     >
// //                                         <FaTrashRestore className="text-xl" />
// //                                     </button>
// //                                     <button
// //                                         onClick={() => handlePermanentDelete(cert.id)}
// //                                         className="text-red-500 hover:text-red-600"
// //                                         title="Delete Permanently"
// //                                     >
// //                                         <FaTrashAlt className="text-xl" />
// //                                     </button>
// //                                 </td>
// //                             </tr>
// //                         ))}
// //                     </tbody>
// //                 </table>
// //             ) : (
// //                 <>
// //                     <table className="w-full border-collapse">
// //                         <thead>
// //                             <tr className="bg-gray-50">
// //                                 <th className="text-left p-4 border">Title</th>
// //                                 <th className="text-left p-4 border">Description</th>
// //                                 <th className="text-left p-4 border">Course</th>
// //                                 <th className="text-left p-4 border">Created At</th>
// //                                 <th className="text-left p-4 border">Status</th>
// //                                 <th className="text-left p-4 border">Preview</th> {/* New column */}
// //                                 <th className="text-left p-4 border">Actions</th>
// //                             </tr>
// //                         </thead>
// //                         <tbody>
// //                             {currentCertificates.map((cert) => (
// //                                 <tr key={cert.id} className="border">
// //                                     <td className="p-4">{stripHtmlTags(cert.title)}</td>
// //                                     <td className="p-4">
// //                                         {cert.description ? stripHtmlTags(cert.description) : 'N/A'}
// //                                     </td>
// //                                     <td className="p-4">{cert.courseTitle || 'N/A'}</td>
// //                                     <td className="p-4">
// //                                         {cert.createdAt ? new Date(cert.createdAt).toLocaleDateString() : 'N/A'}
// //                                     </td>
// //                                     <td className="p-4">
// //                                         <span className={`px-2 py-1 rounded-full text-sm ${
// //                                             cert.isPublished
// //                                             ? 'bg-green-100 text-green-800'
// //                                             : 'bg-yellow-100 text-yellow-800'
// //                                         }`}>
// //                                             {cert.isPublished ? 'Active' : 'Draft'}
// //                                         </span>
// //                                     </td>
// //                                     <td className="p-4">
// //                                         {cert.previewUrl ? (
// //                                             <img src={cert.previewUrl} alt="Certificate Preview" className="w-20 h-auto" />
// //                                         ) : (
// //                                             'No Preview'
// //                                         )}
// //                                     </td>
// //                                     <td className="p-4">
// //                                         <button
// //                                             onClick={() => handleEdit(cert)}
// //                                             className="text-blue-500 mr-4 hover:text-blue-600
// //                                                      transition-all duration-300 hover:scale-110
// //                                                      relative group inline-flex items-center"
// //                                         >
// //                                             Edit
// //                                             <span className="absolute bottom-0 left-0 w-0 h-0.5
// //                                                            bg-blue-500 group-hover:w-full
// //                                                            transition-all duration-300"></span>
// //                                         </button>
// //                                         <button
// //                                             onClick={() => handleDelete(cert.id)}
// //                                             className="text-red-500 hover:text-red-600
// //                                                      transition-all duration-300 hover:scale-110
// //                                                      relative group inline-flex items-center"
// //                                         >
// //                                             Delete
// //                                             <span className="absolute bottom-0 left-0 w-0 h-0.5
// //                                                            bg-red-500 group-hover:w-full
// //                                                            transition-all duration-300"></span>
// //                                         </button>
// //                                     </td>
// //                                 </tr>
// //                             ))}
// //                         </tbody>
// //                     </table>

// //                     {/* Pagination */}
// //                     <div className="flex justify-center items-center mt-4 gap-2">
// //                         <button
// //                             onClick={() => handlePageChange(currentPage - 1)}
// //                             disabled={currentPage === 1}
// //                             className={`px-3 py-1 rounded ${
// //                                 currentPage === 1
// //                                     ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
// //                                     : 'bg-blue-500 text-white hover:bg-blue-600'
// //                             }`}
// //                         >
// //                             Previous
// //                         </button>

// //                         {[...Array(totalPages)].map((_, index) => (
// //                             <button
// //                                 key={index + 1}
// //                                 onClick={() => handlePageChange(index + 1)}
// //                                 className={`px-3 py-1 rounded ${
// //                                     currentPage === index + 1
// //                                         ? 'bg-blue-500 text-white'
// //                                         : 'bg-gray-200 hover:bg-gray-300'
// //                                 }`}
// //                             >
// //                                 {index + 1}
// //                             </button>
// //                         ))}

// //                         <button
// //                             onClick={() => handlePageChange(currentPage + 1)}
// //                             disabled={currentPage === totalPages}
// //                             className={`px-3 py-1 rounded ${
// //                                 currentPage === totalPages
// //                                     ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
// //                                     : 'bg-blue-500 text-white hover:bg-blue-600'
// //                             }`}
// //                         >
// //                             Next
// //                         </button>
// //                     </div>
// //                 </>
// //             )}

// //             {editingCertificate && (
// //                 <EditCertificateModal
// //                     certificate={editingCertificate}
// //                     isOpen={!!editingCertificate}
// //                     onClose={() => setEditingCertificate(null)}
// //                     onSave={handleSaveEdit}
// //                 />
// //             )}
// //         </div>
// //     );
// // };

// // export default ManageCertificateTable;
