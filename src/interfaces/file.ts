/**
 * Details of a file, as returned by `client.files.get()`.
 *
 * Optional fields are left out of the API response when they have no value.
 */
export interface FileDetails {
  id: string;
  /** ISO 8601 UTC date. */
  creationDate: string;
  /** ISO 8601 UTC date. */
  updateDate: string;
  fileName: string;
  fileNameWithoutExtension: string;
  /** Legacy size field, 0 in practice. Use `fileSize` for the byte count. */
  size: number;
  blobName: string;
  blobUrl: string;
  userName: string;
  /** Base64 of the binary MD5 digest of the content (not the hex form). */
  md5Hash: string;
  contentType: string;
  channel: string;
  shouldBeClassified: boolean;
  excludeFromClassificationData: boolean;
  /** Name of the classifier that handled the file, for example `"zero"`. */
  classifier: string;
  description: string;
  classificationScore: number;
  status:
    | "uploaded"
    | "metadata"
    | "pre_processing"
    | "pre_processed"
    | "decomposing"
    | "decomposed"
    | "transforming"
    | "transformed"
    | "classifying"
    | "classified"
    | "indexing"
    | "indexed"
    | "extracting"
    | "extracted"
    | "confirmation_required"
    | "confirmation_submitted"
    | "confirmed"
    | "finished"
    | "re_tagged"
    | "tag_removed"
    | "failed_classification"
    | "deleted"
    | "duplicate"
    | "waiting_to_be_sent_to_third_party"
    | "sent_to_third_party"
    | "re_queued"
    | "failed_extraction"
    | "failed_to_send_to_third_party"
    | "failed_file_operation"
    | "failed_transformation"
    | "failed_job"
    | "canceled_job"
    | "requeued_for_extraction"
    | "pending_job_validation"
    | "preparing"
    | "prepared"
    | "password_required"
    | (string & {});
  inputType: "single_unit" | "primary" | "derived" | "virtual" | (string & {});
  extractionType: "none" | "text" | "multimodal" | "reused" | (string & {});
  isDuplicate: boolean;
  isDataDuplicate: boolean;
  isDuplicateByValues: boolean;
  duplicateOriginId?: string;
  tagId?: string;
  isParent: boolean;
  parentId?: string;
  /** Role of the file in a grouped document: `standalone`, `virtual` or `member`. */
  groupRole: "standalone" | "virtual" | "member" | (string & {});
  groupId?: string;
  /**
   * True when the file is classified and extracted in its own right, that is,
   * it is not a split parent and not a page of a grouped document.
   */
  isProcessingUnit: boolean;
  /**
   * True when an automated result exists and can be read. A human review may
   * still be pending.
   */
  isResultReady: boolean;
  deferredSessionId?: string;
  tagName: string;
  companyId: string;
  /** Size of the file in bytes. */
  fileSize: number;
  proposedTagId?: string;
  proposedTagVariance: number;
  classificationScoreAboveDeviation: boolean;
  confirmedTagId?: string;
  confirmedBy: string;
  manualClassification: boolean;
  /** Whatever JSON the caller attached (object, array or text), or null. */
  metadata: any | null;
  /**
   * The file's metadata merged with its job's metadata, as a JSON string
   * (empty when there is none).
   */
  effectiveMetadata: string;
  jobOrderIndex: number;
  pageCount: number;
  pageNumber: number;
  assignedTo: string;
  /** ISO 8601 UTC date. */
  assignmentDate?: string;
  /** ISO 8601 UTC date. */
  validationDate?: string;
}

/**
 * @deprecated Use `FileDetails`. Kept so existing imports keep compiling.
 */
export type File = FileDetails;

export interface UploadFilePayload {
  file: {
    buffer: Buffer;
    originalName: string;
    mimetype: string;
  };
  sessionId: string;
  metadata?: any;
  /** Channel the file came through, for example `"api"`. */
  channel?: string;
}

export interface FileUploadPayload {
  /** URL of a single remote file. */
  url?: string;
  /** URLs of several remote files (at most 100). */
  urls?: string[];
  /** Name of a remote source configured in the workspace. */
  source?: string;
  /** Container (bucket) of the remote source where the file lives. */
  container?: string;
  /** Name of the file within the remote source. */
  fileName?: string;
  /** Names of several files within the remote source. */
  fileNames?: string[];
  /** @deprecated Use `fileName`. */
  filename?: string;
  /** @deprecated Use `fileNames`. */
  filenames?: string[];
  /** Merge all remote files (which must be images) into a single PDF. */
  merge?: boolean;
  /** Decompose the file into its parts. */
  decompose?: boolean;
  /** Page rotation in degrees. Only read when `decompose` is set. */
  pageRotation?: number;
  /** Metadata object (or array of objects), sent exactly as written. */
  metadata?: any;
  /** Apply a single metadata object to every file. */
  propagateMetadata?: boolean;
  /** Virtual folder for the uploaded files. Applied with `decompose`. */
  parentFilePrefix?: string;
  /** Channel the files came through, for example `"api"`. */
  channel?: string;
  /** Your own identifier for the job (at most 512 characters). */
  correlationId?: string;
  /** Password for protected files. */
  password?: string;
  /** Processing priority of the job. */
  priority?: "low" | "normal" | "high" | "urgent";
}

/** Result of a remote (URL) upload: it creates a job. */
export interface FileUploadResult {
  jobId: string;
  /** The correlation id given in the request, or an empty string. */
  correlationId?: string;
  /** Present only when the API raised warnings. */
  warnings?: string[];
}

export interface DownloadResult {
  buffer: Buffer;
  originalName: string;
  mimetype: string;
}
