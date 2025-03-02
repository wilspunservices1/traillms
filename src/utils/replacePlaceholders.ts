// src/utils/replacePlaceholders.ts

interface UserData {
    course: string;
    name: string;
    date: string;
}

export const replacePlaceholders = (text: string, userData: UserData): string => {
    return text
        .replace(/{Course}/g, userData.course)
        .replace(/{Name}/g, userData.name)
        .replace(/{Date}/g, userData.date);
};
