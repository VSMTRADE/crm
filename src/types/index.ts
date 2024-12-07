export type DocumentType = 'contract' | 'id' | 'resume' | 'certificate' | 'other';

export interface Document {
  id: string;
  title: string;
  description?: string;
  type: DocumentType;
  file_path: string;
  file_size: number;
  employee_id?: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}
