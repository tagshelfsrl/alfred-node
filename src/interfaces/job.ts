export interface CreateJobResult {
  jobId: string;
}

export interface JobResult {
  id: string;
  creationDate: string;
  hasJobRequestInfo: boolean;
  jobRequestDate?: string;
  updateDate: string;
  companyId: string;
  bulkId?: string;
  deferredSessionId?: string;
  userName: string;
  channel: string;
  source?: string;
  container?: string;
  remoteFileName?: string;
  remoteFileNames?: string;
  merge: boolean;
  decompose: boolean;
  propagateMetadata: boolean;
  parentFilePrefix?: string;
  decomposedPageRotation: number;
  metadata: any;
  fileCount: number;
  fileSourcesCount: number;
  metadataObjectsCount: number;
  finishedFiles: number;
  files: FileItem[];
  retries: number;
  exceededRetries: boolean;
  fileUrls: string[];
  errorMessages: string[];
  stage: string;
  priority: number;
  inputSourceType: number;
  startDate: string;
  emailFrom?: string;
  emailSubject?: string;
  emailBody?: string;
}

interface FileItem {
  id: string;
  creationDate: string;
  updateDate: string;
  fileName: string;
  tagName: string;
  isParent: boolean;
  isChildren: boolean;
  status: string;
}

export interface CreateJob {
  sessionId?: string;
  propagateMetadata?: boolean;
  merge?: boolean;
  decompose?: boolean;
  metadata?: any;
  channel?: string;
  parentFilePrefix?: string;
  pageRotation?: number;
  container?: string;
  fileName?: string;
  fileNames?: string[];
}
