import type { CertificatePlaceHolders } from "@/types/certificates";
import { BASE_URL } from "./constant";
import { getErrorMessage } from "@/utils/errorUtils"; // Import the error handling utility



export const fetchCertificateDetails = async (certificateId: string): Promise<any> => {
    try {
        const response = await fetch(`/api/certificates/${certificateId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(getErrorMessage('FETCH_FAILED'));
        }

        const data = await response.json();
        return data;
    } catch (err) {
        console.error('Error fetching certificate:', err);
        throw new Error(getErrorMessage('NETWORK_ERROR'));
    }
};
// ###################################################################################
// *************************| Certification PlaceHolders |****************************
// ###################################################################################
export const savePlaceholders = async (placeholders: CertificatePlaceHolders[], certificateId: string): Promise<boolean> => {
    try {
        const response = await fetch(`/api/certificates/${certificateId}/placeholders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ placeholders }),
        });

        if (!response.ok) {
            throw new Error(getErrorMessage('SAVE_FAILED'));
        }

        console.log('Placeholders saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving placeholders:', error);
        return false;
    }
};

export const fetchPlaceholders = async (certificateId: string): Promise<CertificatePlaceHolders[]> => {
    try {
        const res = await fetch(`/api/certificates/${certificateId}/placeholders`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!res.ok) {
            throw new Error(getErrorMessage('FETCH_FAILED'));
        }

        const data = await res.json();
        return data.placeholders || [];
    } catch (error) {
        console.error("Error fetching placeholders:", error);
        throw new Error(getErrorMessage('NETWORK_ERROR'));
    }
};

export const fetchCertificates = async (userId: string) => {
    const response = await fetch(`/api/certificates?userId=${userId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch certificates');
    }
    return await response.json(); // Adjust based on your API response structure
};