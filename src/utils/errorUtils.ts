// errorUtils.ts
export const getErrorMessage = (errorType: string): string => {
    const errorMessages: { [key: string]: string } = {
        SAVE_FAILED: 'Failed to save placeholders. Please try again.',
        FETCH_FAILED: 'Failed to fetch certificate details. Please check the certificate ID and try again.',
        NETWORK_ERROR: 'A network error occurred. Please check your internet connection.',
        DEFAULT: 'An unexpected error occurred. Please try again later.',
    };

    return errorMessages[errorType] || errorMessages.DEFAULT;
};
