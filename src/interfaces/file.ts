
export interface File {
  id: string;
  creationDate: string;
  updateDate: string;
  fileName: string;
  fileNameWithoutExtension: string;
  blobName: string;
  blobUrl: string;
  userName: string | null;
  md5Hash: string;
  contentType: string;
  channel: string;
  shouldBeClassified: boolean;
  classifier: string;
  classificationScore: number;
  status: string;
  inputType: string;
  isDuplicate: boolean;
  isDuplicateByValues: boolean;
  duplicateOriginId: string | null;
  tagId: string;
  isParent: boolean;
  parentId: string | null;
  deferredSessionId: string | null;
  tagName: string;
  companyId: string;
  fileSize: number;
  proposedTagId: string;
  proposedTagVariance: number;
  classificationScoreAboveDeviation: boolean;
  confirmedTagId: string;
  confirmedBy: string;
  manualClassification: boolean;
  metadata: string | null;
  pageCount: number;
  pageNumber: number;
}

export interface UploadFilePayload {
  file: {
    buffer: Buffer,
    originalName: string;
    mimetype: string;
  };
  sessionId: string;
  metadata?: any;
}

export interface FileUploadPayload {
  url?: string;
  urls?: string[];
  source?: string;
  container?: string;
  filename?: string;
  filenames?: string[];
  merge?: boolean;
  metadata?: any;
  propagateMetadata?: boolean;
  parentFilePrefix?: string;
}

export interface DownloadResult {
  buffer: Buffer;
  originalName: string;
  mimetype: string;
}
