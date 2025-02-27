"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaTrash, FaTrashRestore, FaTrashAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import EditCertificateModal from "./EditCertificateModal";
import useSweetAlert from "@/hooks/useSweetAlert";

// Define session user type to include `id`
interface CustomUser {
	id: string;
	name?: string | null;
	email?: string | null;
	image?: string | null;
}

// Define Certificate structure
interface Certificate {
	id: string;
	owner_id: string;
	course_id: string;
	title: string;
	name?: string;
	description: string | null;
	courseTitle?: string | null;
	filePath?: string;
	previewUrl?: string;
	created_at: string;
	updatedAt?: string;
	isPublished: boolean;
	unique_identifier: string;
}

interface DeletedCertificate extends Certificate {
	deletedAt: string;
}

const ITEMS_PER_PAGE = 10;

const ManageCertificateTable = () => {
	const [certificates, setCertificates] = useState<Certificate[]>([]);
	const [deletedCertificates, setDeletedCertificates] = useState<
		DeletedCertificate[]
	>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [showTrash, setShowTrash] = useState(false);
	const [editingCertificate, setEditingCertificate] =
		useState<Certificate | null>(null);

	const { data: session } = useSession();
	const showAlert = useSweetAlert();
	const router = useRouter();

	const userId = (session?.user as CustomUser)?.id; // Safely extract user ID

	useEffect(() => {
		if (!session?.user) {
			setIsLoading(false);
			return;
		}

		const fetchCertificates = async () => {
			try {
				setIsLoading(true);
				setError(null);

				console.log("Fetching certificates...");

				const response = await fetch("/api/manageCertificates", {
					method: "GET",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
				});

				if (!response.ok) {
					throw new Error("Failed to fetch certificates");
				}

				const data = await response.json();
				console.log("Fetched data from API:", data); // ✅ Log API response

				const userId = (session?.user as { id: string })?.id;
				console.log("Logged-in user ID:", userId); // ✅ Log user ID

				if (!userId) {
					console.warn("User ID is undefined, skipping filtering.");
					setCertificates([]); // Ensure state is reset if user ID is missing
					return;
				}

				const filteredCertificates = data.filter(
					(cert: Certificate) => cert.owner_id === userId
				);
				console.log("Filtered certificates:", filteredCertificates); // ✅ Log filtered data

				setCertificates(filteredCertificates);
			} catch (error) {
				console.error("Error fetching certificates:", error);
				setError(
					error instanceof Error
						? error.message
						: "Failed to load certificates"
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchCertificates();
	}, [session?.user]);

	const handleEdit = (certificate: Certificate) => {
		if (!certificate?.course_id) {
			showAlert("error", "Invalid certificate data! Cannot edit.");
			return;
		}
		router.push(`/dashboards/certificates/edit/${certificate.course_id}`);
	};

	const handleDelete = async (certificateId: string) => {
		if (!confirm("Are you sure you want to delete this certificate?"))
			return;

		try {
			const response = await fetch(
				`/api/manageCertificates/${certificateId}/permanent`,
				{
					method: "DELETE",
					credentials: "include",
				}
			);

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(
					result.message || "Failed to delete certificate"
				);
			}

			// Remove the deleted certificate from state
			setCertificates((prev) =>
				prev.filter((c) => c.id !== certificateId)
			);

			showAlert("success", "Certificate deleted successfully!");
		} catch (error) {
			console.error("Error deleting certificate:", error);
			showAlert("error", error.message || "Failed to delete certificate");
		}
	};

	// const handleRestore = async (certificateId: string) => {
	// 	try {
	// 		const response = await fetch(
	// 			`/api/manageCertificates/${certificateId}/restore`,
	// 			{ method: "POST", credentials: "include" }
	// 		);

	// 		if (!response.ok) throw new Error("Failed to restore certificate");

	// 		setDeletedCertificates((prev) =>
	// 			prev.filter((c) => c.id !== certificateId)
	// 		);
	// 	} catch (error) {
	// 		showAlert("error", "Failed to restore certificate");
	// 	}
	// };

	const handleSaveEdit = async (updatedCertificate: Certificate) => {
		try {
			const response = await fetch(
				`/api/manageCertificates/${updatedCertificate.id}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify(updatedCertificate),
				}
			);

			if (!response.ok) throw new Error("Failed to update certificate");

			setCertificates((prev) =>
				prev.map((cert) =>
					cert.id === updatedCertificate.id
						? { ...cert, ...updatedCertificate }
						: cert
				)
			);
		} catch (error) {
			showAlert("error", "Failed to update certificate");
		}
	};

	const handlePageChange = (page: number) => setCurrentPage(page);

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

	const totalPages = Math.ceil(certificates.length / ITEMS_PER_PAGE);
	const currentCertificates = certificates.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Manage Certificates</h1>
			</div>

			{showTrash ? (
				<table className="w-full border-collapse">
					<thead>
						<tr className="bg-gray-50">
							<th className="p-4 border">Title</th>
							<th className="p-4 border">Deleted At</th>
							<th className="p-4 border">Actions</th>
						</tr>
					</thead>
					{/* <tbody>
						{deletedCertificates.map((cert) => (
							<tr key={cert.id} className="border">
								<td className="p-4">{cert.title}</td>
								<td className="p-4">
									{new Date(
										cert.deletedAt
									).toLocaleDateString()}
								</td>
								<td className="p-4 flex gap-4">
									<button
										onClick={() => handleRestore(cert.id)}
										className="text-green-500 hover:text-green-600"
										title="Restore"
									>
										<FaTrashRestore className="text-xl" />
									</button>
									<button
										onClick={() => handleDelete(cert.id)}
										className="text-red-500 hover:text-red-600"
										title="Delete"
									>
										<FaTrashAlt className="text-xl" />
									</button>
								</td>
							</tr>
						))}
					</tbody> */}
				</table>
			) : (
				<table className="w-full border-collapse">
					<thead>
						<tr className="bg-gray-50">
							<th className="p-4 border">Title</th>
							<th className="p-4 border">Description</th>
							<th className="p-4 border">Course</th>
							<th className="p-4 border">Created At</th>
							<th className="p-4 border">Status</th>
							<th className="p-4 border">Actions</th>
						</tr>
					</thead>
					<tbody>
						{currentCertificates.map((cert) => (
							<tr key={cert.id} className="border">
								<td className="p-4">
									{cert.title}-{cert.unique_identifier}
								</td>
								<td className="p-4">
									{cert.description || "N/A"}
								</td>
								<td className="p-4">
									{cert.courseTitle || "N/A"}
								</td>
								<td className="p-4">
									{cert.created_at.slice(0, 16) || "N/A"}
								</td>

								<td className="p-4">
									{cert.isPublished === true
										? "Active"
										: "Draft"}
								</td>

								<td className="p-4">
									<button
										onClick={() => handleEdit(cert)}
										className="text-blue-500"
									>
										Edit
									</button>
									<button
										onClick={() => handleDelete(cert.id)}
										className="text-red-500 ml-4"
									>
										Delete
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
};

export default ManageCertificateTable;
