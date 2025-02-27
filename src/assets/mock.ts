import type { CertificatePlaceHolders } from "@/types/certificates";

export const initialPlaceholders: CertificatePlaceHolders[] = [
    { id:"", certificate_id:"", key:'studentName',       discount: 0 , label: 'Student Name',       is_visible: true, font_size: 14, color: '#000000' , value: '[STUDENT_NAME]',       x: 20, y: 20  },
    { id:"", certificate_id:"", key:'sessionName',       discount: 0 , label: 'Session Name',       is_visible: true, font_size: 14, color: '#000000' , value: '[SESSION_NAME]',       x: 20, y: 60  },
    { id:"", certificate_id:"", key:'sessionStartDate',  discount: 0 , label: 'Session Start Date', is_visible: true, font_size: 14, color: '#000000' , value: '[SESSION_START_DATE]', x: 20, y: 100 },
    { id:"", certificate_id:"", key:'sessionEndDate',    discount: 0 , label: 'Session End Date',   is_visible: true, font_size: 14, color: '#000000' , value: '[SESSION_END_DATE]',   x: 20, y: 140 },
    { id:"", certificate_id:"", key:'dateGenerated',     discount: 0 , label: 'Date Generated',     is_visible: true, font_size: 14, color: '#000000' , value: '[DATE_GENERATED]',     x: 20, y: 180 },
    { id:"", certificate_id:"", key:'companyName',       discount: 0 , label: 'Company Name',       is_visible: true, font_size: 14, color: '#000000' , value: '[COMPANY_NAME]',       x: 20, y: 220 },
    { id:"", certificate_id:"", key:'certificateNumber', discount: 0 , label: 'Certificate Number', is_visible: true, font_size: 14, color: '#000000' , value: '[CERTIFICATE_NUMBER]', x: 20, y: 260 },
];
