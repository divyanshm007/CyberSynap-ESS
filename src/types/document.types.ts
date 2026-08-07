export type DocCategory =
  | 'contract'
  | 'policy'
  | 'certificate'
  | 'id_proof'
  | 'appraisal'
  | 'offer_letter'
  | 'other';

export interface Document {
  id: string;
  userId: string;
  name: string;
  category: DocCategory;
  size: number;          // bytes
  mimeType: string;
  uploadedAt: string;
  expiresAt?: string;
  isShared: boolean;
  tags: string[];
  description?: string;
}
