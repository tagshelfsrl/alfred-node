/**
 * Severity of a validation rule: `0` info, `1` warning, `2` error.
 */
export type DataPointValidationSeverity = 0 | 1 | 2;

/**
 * Outcome of one validation rule for a data point value.
 *
 * Alfred stores the result with PascalCase keys and the SDK converts keys to
 * camelCase. The conversion lowercases only the first letter of each key, so
 * keys inside `metadata` that are written in capitals (for example `URL`) come
 * back as `uRL`, not `url`. Treat the keys of `metadata` as opaque.
 */
export interface DataPointValidationResult {
  /** Identifier of the validator that produced this result. */
  validatorId: string;
  /** Kind of validator (for example a built-in rule or a script). */
  type: string;
  /** `true` when the value satisfied the rule. */
  passed: boolean;
  /** `true` when the rule did not run for this value. */
  skipped: boolean;
  /** `0` info, `1` warning, `2` error. */
  severity: DataPointValidationSeverity;
  /** `true` when a failure of this rule stops the file from completing. */
  blocksCompletion: boolean;
  /** Human readable explanation, usually set when the rule failed. */
  message?: string;
  /** Free-form details from the validator. Key names are not reliable (see above). */
  metadata?: Record<string, unknown>;
  /** Time the rule took to run, in milliseconds. */
  durationMs?: number;
  /** Name of the script, for script validators. */
  scriptName?: string;
  /** Runtime of the script, for script validators. */
  runtime?: string;
}

/** Totals over all rules that ran for a data point value. */
export interface DataPointValidationSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  /** Highest severity among the failed rules, when any failed. */
  highestSeverityFailed?: "info" | "warning" | "error";
  /** `true` when at least one failed rule blocks completion. */
  hasBlockingFailures: boolean;
}

/** The recorded validation result for a data point value. */
export interface DataPointValidation {
  /** Overall outcome. */
  status: "passed" | "failed" | "skipped";
  /** When validation ran (ISO 8601, UTC). */
  executedAt: string;
  /** Total time validation took, in milliseconds. */
  durationMs: number;
  /** One entry per rule. */
  results: DataPointValidationResult[];
  summary?: DataPointValidationSummary;
  /** Why validation was skipped, when it was. */
  reason?: string;
  /** Whether the data point is configured to require validation to pass. */
  mustPassValidation?: boolean;
}

/**
 * One data point value of a file, as returned by `client.dataPoints.getValues()`.
 */
export interface DataPointResult {
  /** Identifier of this value. */
  id: string;
  /**
   * The final value, after formatting rules. An empty string means the data
   * point was not found in the document.
   */
  value: string;
  fileLogId: string;
  /** Identifier of the data point definition. */
  metadataId: string;
  /**
   * Display label of the data point. It can be renamed, so do not key an
   * integration on it; use `fieldKey`.
   */
  metadataName: string;
  /**
   * Stable machine key of the data point (for example `invoice_number`).
   * Integrations should key on this.
   */
  fieldKey: string;
  /**
   * Confidence from 0 to 1. A data point that was not found comes back with
   * `value: ""` and a score of `0`.
   */
  classificationScore: number;
  /**
   * The extractor's original output. Present only when formatting rules
   * changed it; when absent, `value` is the original.
   */
  extractedValue?: string;
  /**
   * The value after type normalization. In practice present on every row, and
   * an empty string when there is no value.
   */
  normalizedValue?: string;
  /**
   * Recorded result of the validation rules, present only when validation ran
   * for this value. Normally a `DataPointValidation`. An older stored form is a
   * bare array of result items, and text that Alfred could not parse arrives
   * as a plain string.
   */
  validation?: DataPointValidation | DataPointValidationResult[] | string;
}

/** Clearer name for `DataPointResult`. */
export type DataPointValue = DataPointResult;
