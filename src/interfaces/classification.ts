/**
 * One class the text or file can be classified as. Criteria are supplied with
 * each request, so no document types need to exist in the workspace.
 */
export interface ClassificationCriterion {
  /** Name of the class. Required, at most 350 characters, unique ignoring case. */
  name: string;
  /** What documents of this class look like. Required, at most 1,000 characters. */
  description: string;
  /**
   * Minimum score (0 to 1) for this class to count as a match. Optional.
   * Defaults to 0, which always picks the best class.
   */
  threshold?: number;
}

/** Payload to classify text. */
export interface CreateClassification {
  /** The classes to choose from. Between 2 and 50 criteria. */
  tags: ClassificationCriterion[];
  /** The text to classify. Required, at most 200,000 characters; only the first 32,000 are classified. */
  text: string;
  /** Optional name for the text, at most 250 characters. */
  fileName?: string;
  /** Optional identifier of your own, at most 512 characters. */
  correlationId?: string;
}

/** Payload to classify a file. */
export interface CreateClassificationFromFile {
  /**
   * The file to classify: at most 20 MB; PDF, PNG, JPEG, WebP, TIFF, GIF or
   * UTF-8 TXT. The type is decided from the extension of `originalName`, so
   * the name must carry the right extension. Only the first 10 pages are used.
   */
  file: {
    buffer: Buffer;
    originalName: string;
    mimetype?: string;
  };
  /** The classes to choose from. Between 2 and 50 criteria. */
  tags: ClassificationCriterion[];
  /** Optional identifier of your own, at most 512 characters. */
  correlationId?: string;
}

/**
 * Status of a classification request. `queued` covers every intermediate
 * state until the request completes or fails.
 */
export type ClassificationStatus = "queued" | "completed" | "failed";

/** A class and the score the classifier gave it. */
export interface ClassificationPrediction {
  /** Name of the class. */
  class: string;
  /** Score between 0 and 1. */
  score: number;
}

/** Why no class matched. */
export type ClassificationNoMatchReason =
  | "no_match"
  | "no_text"
  | "no_candidates";

/** The outcome of a completed classification. */
export interface ClassificationResult {
  /** Name of the winning class, or an empty string when nothing matched (see `reason`). */
  class: string;
  /** Score of the winning class. */
  score: number;
  /** True when the best class scored below its threshold. */
  belowThreshold: boolean;
  /** Every class with its score, best first. */
  predictions: ClassificationPrediction[];
  /** The model that produced the result. */
  model: string;
  /** The model's explanation, when available. */
  reasoning?: string;
  /** Whether the model gave an answer, when reported. */
  answered?: boolean;
  /** Why nothing matched, when `class` is an empty string. */
  reason?: ClassificationNoMatchReason;
}

/** Why a classification request failed. */
export interface ClassificationFailure {
  /** `classification_failed`, `canceled` or `failed`. */
  code: "classification_failed" | "canceled" | "failed" | string;
  /** Human readable message. */
  message: string;
}

/** How a file was read. Only present on file requests. */
export interface ClassificationInput {
  /** Pages in the file. */
  pages: number;
  /** Pages that were classified (at most 10). */
  classifiedPages: number;
  /** True when pages beyond the limit were dropped. */
  pagesTruncated: boolean;
  /** True when the text was cut to the classifier's limit. */
  textTruncated: boolean;
  /** Size of the file in bytes. */
  bytes: number;
  /** `native_text` when the file's own text was used, `ocr_text` when OCR was needed. */
  mode: "native_text" | "ocr_text";
  /** Pages read with OCR. */
  ocrPages?: number;
  /** Pages read from the file's own text. */
  nativePages?: number;
  /** OCR provider used, when OCR ran. */
  ocrProvider?: string;
}

/** A classification request, as returned by create and get. */
export interface Classification {
  /** Id of the request (it is also a job id). */
  id: string;
  /** Id of the file created for the request. */
  fileId: string;
  /** Current status. */
  status: ClassificationStatus;
  /** When the request was created (ISO 8601 UTC). */
  createdAt: string;
  /** Your correlation id, or an empty string when none was given. */
  correlationId: string;
  /** True when the text was longer than the classified limit. */
  textTruncated: boolean;
  /** When the request finished (ISO 8601 UTC). Present when completed or failed. */
  completedAt?: string;
  /** The outcome. Present when `status` is `completed`. */
  result?: ClassificationResult;
  /** The failure. Present when `status` is `failed`. */
  error?: ClassificationFailure;
  /** How the file was read. May be present on file requests. */
  input?: ClassificationInput;
}
