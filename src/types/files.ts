
export type FileType = 'pdf' | 'excel' | 'powerpoint' | 'csv' | 'other';

export interface FileData {
  id: string;
  name: string;
  type: FileType;
  size: number;
  dateUploaded: Date;
  content: {
    topics: string[];
    summary: string;
    data: Record<string, any>;
  };
}
