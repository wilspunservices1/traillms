// Define the interfaces
export interface CertificateMetadata {
	file_name?: string;
	course_name?: string;
	instructor?: string;
	course_duration?: string;
}

export interface CertificateData {
	id?: string;
	owner_id?: string;
	course_id?: string;
	certificate_data_url?: string;
	description?: string; // Description of the certificate
	is_published?: boolean; // Publication status
	unique_identifier?: string;
	title?: string; // Course title associated with the certificate
	expiration_date?: string;
	is_revocable?: boolean;
	created_at?: string;
	updated_at?: string;
	metadata?: CertificateMetadata;
	is_enabled?: boolean;
	orientation?: string;
	max_download?: number;
	is_deleted?: boolean;
	placeholders?: CertificatePlaceHolders[];
}
// src/types/certificates.ts
export interface Certificate {
	id?: string;
	owner_id?: string;
	course_id?: string;
	certificate_data_url?: string;
	description?: string ; // Description of the certificate
	is_published?: boolean; // Publication status
	unique_identifier?: string;
	title?: string; // Course title associated with the certificate
	expiration_date?: string;
	is_revocable?: boolean;
	created_at?: string;
	updated_at?: string;
	metadata?: CertificateMetadata;
	is_enabled?: boolean;
	orientation?: string;
	max_download?: number;
	is_deleted?: boolean;
}

export interface DeletedCertificate extends Certificate {
	deleted_at?: string; // Deletion date
}

export type CertificatePlaceHolders = {
	id?: string;
	certificate_id?: string;
	key?: string;
	discount?: number;
	x?: number; // X-coordinate for positioning
	y?: number; // Y-coordinate for positioning
	font_size?: number;
	is_visible?: boolean;
	label?: string;
	color?: string;
	value?: string;
};
