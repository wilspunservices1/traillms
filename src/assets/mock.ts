import type { CertificatePlaceHolders } from "@/types/certificates";

export const initialPlaceholders: CertificatePlaceHolders[] = [
    { id: 'studentName', label: 'Student Name', isVisible: true, fontSize: 14, value: '[STUDENT_NAME]', x: 20, y: 20 },
    { id: 'sessionName', label: 'Session Name', isVisible: true, fontSize: 14, value: '[SESSION_NAME]', x: 20, y: 60 },
    { id: 'sessionStartDate', label: 'Session Start Date', isVisible: true, fontSize: 14, value: '[SESSION_START_DATE]', x: 20, y: 100 },
    { id: 'sessionEndDate', label: 'Session End Date', isVisible: true, fontSize: 14, value: '[SESSION_END_DATE]', x: 20, y: 140 },
    { id: 'dateGenerated', label: 'Date Generated', isVisible: true, fontSize: 14, value: '[DATE_GENERATED]', x: 20, y: 180 },
    { id: 'companyName', label: 'Company Name', isVisible: true, fontSize: 14, value: '[COMPANY_NAME]', x: 20, y: 220 },
    { id: 'certificateNumber', label: 'Certificate Number', isVisible: true, fontSize: 14, value: '[CERTIFICATE_NUMBER]', x: 20, y: 260 },
];
