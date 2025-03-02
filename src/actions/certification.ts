import type { CertificatePlaceHolders } from "@/types/certificates";
import { BASE_URL } from "./constant";
import { getErrorMessage } from "@/utils/errorUtils"; // Import the error handling utility



export const fetchCertificateDetails = async (certificateId: string): Promise<any> => {
    try {
        const response = await fetch(`${BASE_URL}/api/certificates/get-saved/${certificateId}`);

        if (!response.ok) {
            throw new Error(getErrorMessage('FETCH_FAILED')); // Use dynamic error message
        }

        const data = await response.json();
        return data.certificate; // Return the certificate data
    } catch (err) {
        console.error('Error fetching certificate:', err);
        throw new Error(getErrorMessage('NETWORK_ERROR')); // Use network error message
    }
};

// ###################################################################################
// *************************| Certification PlaceHolders |******************************
// ###################################################################################
export const savePlaceholders = async (placeholders: CertificatePlaceHolders[], certificateId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${BASE_URL}/api/certificates/${certificateId}/placeholders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ placeholders }),
        });

        if (!response.ok) {
            throw new Error(getErrorMessage('SAVE_FAILED')); // Use dynamic error message
        }

        console.log('Placeholders saved successfully');
        return true; // Indicate success
    } catch (error) {
        console.error('Error saving placeholders:', error);
        return false; // Indicate failure
    }
};


// Fetch placeholders
export const fetchPlaceholders = async (certificateId: string): Promise<CertificatePlaceHolders[]> => {
    try {
        const res = await fetch(`${BASE_URL}/api/certificates/${certificateId}/placeholders`);

        if (!res.ok) {
            throw new Error(getErrorMessage('FETCH_FAILED')); // Use dynamic error message
        }

        const data = await res.json();
        return data.placeholders || []; // Return fetched placeholders or an empty array
    } catch (error) {
        console.error("Error fetching placeholders:", error);
        throw new Error(getErrorMessage('NETWORK_ERROR')); // Use network error message
    }
};