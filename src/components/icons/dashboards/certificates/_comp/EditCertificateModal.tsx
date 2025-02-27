"use client"

import { useState, useEffect } from 'react';

interface Certificate {
    id: string;
    title: string;
    description: string | null;
    courseTitle?: string | null;
    isPublished: boolean;
}

interface EditCertificateModalProps {
    certificate: Certificate;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedCertificate: Certificate) => Promise<void>;
}

const EditCertificateModal = ({ certificate, isOpen, onClose, onSave }: EditCertificateModalProps) => {
    const [editedCertificate, setEditedCertificate] = useState<Certificate>(certificate);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setEditedCertificate(certificate);
    }, [certificate]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await onSave(editedCertificate);
            onClose();
        } catch (error) {
            console.error('Error updating certificate:', error);
            setError(error instanceof Error ? error.message : 'Failed to update certificate');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-4">Edit Certificate</h2>
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2">Title</label>
                        <input
                            type="text"
                            value={editedCertificate.title}
                            onChange={(e) => setEditedCertificate({
                                ...editedCertificate,
                                title: e.target.value
                            })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2">Description</label>
                        <textarea
                            value={editedCertificate.description || ''}
                            onChange={(e) => setEditedCertificate({
                                ...editedCertificate,
                                description: e.target.value
                            })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={4}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2">Status</label>
                        <select
                            value={editedCertificate.isPublished ? 'published' : 'draft'}
                            onChange={(e) => setEditedCertificate({
                                ...editedCertificate,
                                isPublished: e.target.value === 'published'
                            })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Active</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 
                                     transition-colors duration-300 hover:bg-gray-100 
                                     rounded-md"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-500 text-white rounded-md 
                                     hover:bg-blue-600 transform hover:scale-105 
                                     transition-all duration-300 
                                     hover:shadow-lg active:scale-95
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCertificateModal;