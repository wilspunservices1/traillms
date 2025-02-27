export const stripHtmlTags = (input: string): string => {
    const div = document.createElement('div');
    div.innerHTML = input;
    return div.innerText || div.textContent || '';
};

export const formatDate = (dateString: string | Date): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};
