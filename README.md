# Table of Contents
- [Table of Contents](#table-of-contents)
- [Overview](#overview)
  - [Alfred](#alfred)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
  - [Initialize the Client](#initialize-the-client)
    - [Environments description](#environments-description)
    - [Authentication Methods](#authentication-methods)
  - [Upload Files](#upload-files)
    - [Upload Files via Deferred Session (Binary Upload)](#upload-files-via-deferred-session-binary-upload)
    - [Upload Files via Remote Sources (URL Upload)](#upload-files-via-remote-sources-url-upload)
    - [Choosing the Right Upload Method](#choosing-the-right-upload-method)
  - [Create Jobs (Deferred Session Only)](#create-jobs-deferred-session-only)
  - [Get Job Information](#get-job-information)
  - [Get File Information](#get-file-information)
  - [Download Files](#download-files)
  - [Retrieve Data Points](#retrieve-data-points)
  - [Real-Time Events](#real-time-events)
    - [Getting started](#getting-started)
    - [File Events](#file-events)
    - [Job Events](#job-events)
    - [Specific Event Listening](#specific-event-listening)
    - [Available Event Types](#available-event-types)
    - [Disconnect](#disconnect)
- [Reference](#reference)
  - [`AlfredClient`](#alfredclient)
    - [Constructor](#constructor)
    - [Client Configuration](#client-configuration)
    - [Authentication](#authentication)
    - [Domains](#domains)
    - [Session Domain Methods](#session-domain-methods)
      - [-  `create()` Method](#---create-method)
      - [-  `get()` Method](#---get-method)
    - [File Domain Methods](#file-domain-methods)
      - [`uploadFile()` Method](#uploadfile-method)
      - [`upload()` Method](#upload-method)
      - [`get()` Method](#get-method-1)
      - [`download()` Method](#download-method)
    - [Job Domain Methods](#job-domain-methods)
      - [`create()` Method](#create-method)
      - [`get()` Method](#get-method)
    - [Data Points Domain Methods](#data-points-domain-methods)
      - [`getValues()` Method](#getvalues-method)
    - [Classification Domain Methods](#classification-domain-methods)
      - [`create()` Method](#create-method-1)
      - [`createFromFile()` Method](#createfromfile-method)
      - [`get()` Method](#get-method-2)
    - [Account Domain Methods](#account-domain-methods)
      - [`whoAmI()` Method](#whoami-method)
- [Contributing](#contributing)
- [License](#license)


# Overview

`alfred-node` is a TypeScript/Node.js library that provides a streamlined approach to integrate with Alfred's Intelligent Process Automation platform. It enables developers to manage accounts, process and manipulate data points, handle job creation and management, manage sessions, and handle file operations with ease.

## Alfred

Alfred is a powerful document processing platform that enables you to extract, index, and search through large document collections with ease. It offers a wide range of features, including:

- **Job Management**: Provides a robust job management system that allows you to schedule and monitor document processing jobs.

- **Tagging**: Tag documents based on their content, making it easy to organize and search through large document collections.

- **Extraction**: Can extract specific data from PDFs, images, and other documents with ease using its powerful extraction engine.

- **Indexing**: Powerful indexing engine that can index and search through millions of documents in seconds.

- **Integration**: Alfred can be easily integrated into your existing applications using its powerful [API](https://docs.tagshelf.dev) and SDKs.

- **Scalability**: Alfred is designed to scale with your needs, whether you're processing thousands of documents a day or millions.

## Features

- **Comprehensive Authentication Support**: Seamlessly handles OAuth, HMAC, and API key authentication methods, simplifying the process of connecting to the Alfred API.
- **Domain-Specific Operations**: Offers specialized support for File and Job operations, enabling developers to intuitively manage and interact with API resources.
- **Cross-Platform Compatibility**: Designed to be fully compatible across .NET Core, .NET Standard, and .NET Framework 4.7.2, ensuring broad usability in diverse development environments.
- **Minimal Dependencies**: Crafted to minimize external dependencies, facilitating an easier integration and deployment process with reduced conflict risk.
- **Real-Time Event Monitoring**: Provides an event monitoring system that allows developers to receive real-time updates on Job and File events within the Alfred platform.

## Prerequisites

Before you can use the `alfred-node` library, you need to:

- Have an Alfred account. If you don't have one, reach out to [TagShelf](https://tagshelf.com/) to get started.
- Choose the authentication method that best suits your needs. Please see the authentication section in the [official API documentation](https://docs.tagshelf.dev/authentication) for more information.
- Node.js version 18 or higher.

# Installation

To use the `alfred-node` library, first install it via npm:

```bash
npm install @tagshelf/alfred
```

or using yarn:

```bash
yarn add @tagshelf/alfred
```

# Usage

## Initialize the Client

Begin by creating an instance of the Alfred client using the desired environment (Production or Staging) along with your preferred authentication method. You can find detailed information about the Alfred Client in the reference section of this document


### Environments description

**Production**: The production environment are used for live applications and real-world scenarios. It is recommended to use this environment for production-ready applications. The frontend URL for the production environment is https://app.tagshelf.com


**Staging**: The staging environment is used for testing and development purposes. It is recommended to use this environment for testing and development scenarios. The frontend URL for the staging environment is https://staging.tagshelf.com
Check out this simple example in TypeScript to get up and running:

### Authentication Methods
To obtain the necessary credentials for the following authentication methods, please refer to authentication section in the [official API documentation](https://docs.tagshelf.dev/authentication) or contact the Alfred support team.

The following examples demonstrate how to initialize the client with different environments and different authentication methods:

For API Key authentication:
```typescript
import { AlfredClient, Configuration } from "@tagshelf/alfred";

// Choose environment
const config: Configuration = Configuration.default("production");

// Initialize Alfred client with API Key
const client: AlfredClient = new AlfredClient(config, {
    apiKey: "your-api-key",
});
```

For HMAC authentication:
```typescript
import { AlfredClient, Configuration } from "@tagshelf/alfred";

// Choose environment
const config: Configuration = Configuration.default("production");

// Initialize Alfred client with HMAC
const client: AlfredClient = new AlfredClient(config, {
    hmac: {
        apiKey: "your-api-key",
        secretKey: "your-secret-key",
    }
});
```

In the Alfred console, the "Secret key" identifies your account to the API and is sent with every request, so it goes in `secretKey`. The "API key" is the key your requests are signed with and is never sent, so it goes in `apiKey`.

For OAuth authentication:
```typescript
import { AlfredClient, Configuration } from "@tagshelf/alfred";

// Choose environment
const config: Configuration = Configuration.default("production");

// Initialize Alfred client with OAuth
const client: AlfredClient = new AlfredClient(config, {
    oauth: {
        username: "your-username",
        password: "your-password",
    }
});
```

## Upload Files

Alfred provides **two distinct workflows** for uploading files, each suited for different use cases:

1. **Deferred Session Workflow (Binary Upload)**: Upload files from your local machine using binary/stream data, then manually create a job
2. **Remote Sources Workflow (URL Upload)**: Upload files from URLs or cloud storage, and a job is automatically created

### Upload Files via Deferred Session (Binary Upload)

This workflow is ideal when you have **local files** (binary data) that need to be uploaded. The process involves three steps:

**Step 1: Create a Deferred Session**

First, create a deferred session to get a session ID that will link your files together.

```typescript
import { AlfredClient, Configuration, CreateSessionResult } from "@tagshelf/alfred";

// ... Initialization code here ...

// Step 1: Create a deferred session
const session: CreateSessionResult = await client.sessions.create();
console.log("Session ID:", session.sessionId);
```

**Step 2: Upload Files (Binary/Stream)**

Upload one or more files using the session ID. Each file is uploaded individually as binary data.

```typescript
import { UploadFilePayload } from "@tagshelf/alfred";
import * as fs from "fs";

// Upload first file
const file1Payload: UploadFilePayload = {
    file: {
        buffer: fs.readFileSync("./invoice1.pdf"),
        originalName: "invoice1.pdf",
        mimetype: "application/pdf",
    },
    sessionId: session.sessionId,
    metadata: {
        invoiceNumber: "INV-2025-001",
        customerName: "Acme Corp",
    },
};

const file1Response = await client.files.uploadFile(file1Payload);
console.log("File 1 uploaded:", file1Response.fileId);

// Upload second file (same session)
const file2Payload: UploadFilePayload = {
    file: {
        buffer: fs.readFileSync("./invoice2.pdf"),
        originalName: "invoice2.pdf",
        mimetype: "application/pdf",
    },
    sessionId: session.sessionId,
    metadata: {
        invoiceNumber: "INV-2025-002",
        customerName: "Global Inc",
    },
};

const file2Response = await client.files.uploadFile(file2Payload);
console.log("File 2 uploaded:", file2Response.fileId);
```

Optionally pass `channel` (for example `"api"`) in the payload to record where the file came from.

> **File names:** Alfred stores the file name with everything except letters `A-Z a-z`, digits, `-`, `_` and `.` removed. Spaces and accented letters are dropped, so `"my résumé 1.pdf"` is stored as `"myrsum1.pdf"`. The name you send does not round-trip; use plain names or keep your own reference in `metadata`.

**Step 3: Create Job to Process Files**

Once all files are uploaded, create a job using the session ID. This triggers the processing of all files uploaded to that session.

> **Important:** You cannot create a job if no files have been uploaded to the session.

```typescript
import { CreateJob, CreateJobResult } from "@tagshelf/alfred";

// Step 3: Create job to process all files in the session
const job: CreateJob = {
    sessionId: session.sessionId,
    metadata: {
        batchId: "BATCH-2025-001",
        processedBy: "automated-workflow",
    },
    channel: "api",
};

const jobResult: CreateJobResult = await client.jobs.create(job);
console.log("Job created:", jobResult.jobId);
// Now Alfred will process all files uploaded to this session
```

For more information about deferred sessions, see the [Deferred Session API documentation](https://docs.tagshelf.dev/enpoints/deferred-session).

### Upload Files via Remote Sources (URL Upload)

This workflow is ideal when files are already hosted remotely (URLs, AWS S3, GCP, DigitalOcean, etc.). **The job is created automatically** in the same API call - no session management needed.

> **Key Difference:** Unlike deferred sessions, this method **automatically creates a job** and Alfred downloads the files using the provided URLs.

```typescript
import { AlfredClient, Configuration, FileUploadPayload } from "@tagshelf/alfred";

// ... Initialization code here ...

// Upload single file from URL (job created automatically)
const remoteUploadPayload: FileUploadPayload = {
    url: "https://example.com/invoice.pdf",
    metadata: {
        documentType: "invoice",
        source: "external-system",
    },
    parentFilePrefix: "invoices/2025",
};

const response = await client.files.upload(remoteUploadPayload);
console.log("Job created:", response.jobId);
// Alfred will automatically download and process the file
```

**Upload Multiple Files from URLs**

```typescript
// Upload multiple files from URLs (single job for all files)
const multipleFilesPayload: FileUploadPayload = {
    urls: [
        "https://example.com/document1.pdf",
        "https://example.com/document2.pdf",
        "https://example.com/document3.pdf",
    ],
    metadata: [
        { documentId: "DOC-001", type: "invoice" },
        { documentId: "DOC-002", type: "receipt" },
        { documentId: "DOC-003", type: "contract" },
    ],
    propagateMetadata: false, // Each file gets its corresponding metadata
};

await client.files.upload(multipleFilesPayload);
```

**Upload from Cloud Storage (AWS S3, GCP, DigitalOcean)**

```typescript
// Upload from configured cloud storage source
const cloudStoragePayload: FileUploadPayload = {
    source: "my-s3-bucket", // Pre-configured source name in Alfred
    container: "invoices",
    fileName: "2025/january/invoice-001.pdf",
    metadata: {
        documentType: "invoice",
        year: "2025",
    },
};

await client.files.upload(cloudStoragePayload);
```

**Result, correlation ID, password and priority**

The upload creates a job and returns `{ jobId, correlationId, warnings? }`. `correlationId` is the value you sent (an empty string when none) and `warnings` is present only when the API raised some.

```typescript
const result = await client.files.upload({
    url: "https://example.com/protected.pdf",
    correlationId: "order-4711", // your own identifier, at most 512 characters
    password: "secret",          // for password-protected files
    priority: "high",            // "low" | "normal" | "high" | "urgent"
});

console.log(result.jobId, result.correlationId, result.warnings);
```

**Decompose a file**

Set `decompose: true` to split the file into its parts. `pageRotation` (in degrees) is only read together with `decompose`, and `parentFilePrefix` is applied with `decompose`.

```typescript
await client.files.upload({
    url: "https://example.com/scan.pdf",
    decompose: true,
    pageRotation: 90,
    parentFilePrefix: "scans/2025",
});
```

> **Deprecated:** `filename` and `filenames` still work but are deprecated. Use `fileName` and `fileNames`; when both spellings are given, the new one wins. `metadata` is sent exactly as you write it; its keys are never renamed.

For more information about remote sources, see the [Remote Sources API documentation](https://docs.tagshelf.dev/enpoints/file/source).

### Choosing the Right Upload Method

| Feature | Deferred Session (Binary) | Remote Sources (URL) |
|---------|--------------------------|----------------------|
| **File Location** | Local files, binary data | URLs, cloud storage |
| **Job Creation** | Manual (Step 3) | Automatic |
| **Session Required** | Yes | No |
| **Use Case** | Uploading from local system | Files already hosted remotely |
| **File Download** | Not needed (already binary) | Alfred downloads files |
| **API Calls** | 3 steps (session → upload → job) | 1 step (upload creates job) |

## Create Jobs (Deferred Session Only)

> **Note:** This section applies **only to the Deferred Session workflow**. When using Remote Sources (URL upload), jobs are created automatically and you don't need to call this method.

A Job represents a single unit of work that groups one or more Files within Alfred. When using deferred sessions, after uploading your files, you must manually create a job to trigger processing.

For more information about jobs, see the [Job API documentation](https://docs.tagshelf.dev/enpoints/job).

```typescript
import { AlfredClient, Configuration, CreateJob, CreateJobResult } from "@tagshelf/alfred";

// ... Initialization code here ...

// Step 1: Create a deferred session
const session = await client.sessions.create();

// Step 2: Upload files to the session
// (See "Upload Files via Deferred Session" examples above)

// Step 3: Create a job to process all files in the session
const job: CreateJob = {
    sessionId: session.sessionId,
    propagateMetadata: true,
    metadata: {
        batchId: "BATCH-2025-001",
        processedBy: "automated-workflow",
    },
    channel: "api",
    parentFilePrefix: "processed/invoices",
};

const jobResult: CreateJobResult = await client.jobs.create(job);
console.log("Job created with ID:", jobResult.jobId);
// Output: Job created with ID: 12345678-1234-1234-1234-123456789abc
```

**Advanced Job Options**

```typescript
// Merge multiple files into a single PDF
const mergeJob: CreateJob = {
    sessionId: session.sessionId,
    merge: true, // Combine all files into a single PDF
    metadata: {
        mergedDocument: "Combined Invoice Package",
        year: "2025",
    },
};

await client.jobs.create(mergeJob);

// Decompose PDF into individual pages
const decomposeJob: CreateJob = {
    sessionId: session.sessionId,
    decompose: true, // Split PDF into individual pages
    pageRotation: 90, // Rotate pages 90 degrees if needed
    metadata: {
        documentType: "contract",
    },
};

await client.jobs.create(decomposeJob);
```


## Get Job Information

Once you've triggered a Job, you can get its information by providing the job ID.
This way you can check the stage or status of the job processing so you can access to its results.
For more information about the job stages please visit the Job section of our [official documentation](https://docs.tagshelf.dev/enpoints/job).

```typescript
import { AlfredClient, Configuration, JobResult } from "@tagshelf/alfred";

// ... Initialization code here ...

// Get job by ID
const jobId = "12345678-1234-1234-1234-123456789abc";
const jobInfo: JobResult = await client.jobs.get(jobId);

console.log("Job stage:", jobInfo.stage);
console.log("File count:", jobInfo.fileCount);
console.log("Finished files:", jobInfo.finishedFiles);
console.log("Job metadata:", jobInfo.metadata);
console.log("Job files:", jobInfo.files);
```

## Get File Information

You can retrieve detailed information about a file using its ID.

```typescript
import { AlfredClient, Configuration, FileDetails } from "@tagshelf/alfred";

// ... Initialization code here ...

// Get file details by ID
const fileId = "87654321-4321-4321-4321-210987654321";
const fileInfo: FileDetails = await client.files.get(fileId);

console.log("File name:", fileInfo.fileName);
console.log("File size:", fileInfo.fileSize);
console.log("Tag name:", fileInfo.tagName);
console.log("Status:", fileInfo.status);
console.log("Classification score:", fileInfo.classificationScore);
```

`File` is still exported as a deprecated alias of `FileDetails`. See [`get()` Method](#get-method-1) in the reference for every field.

## Download Files

You can download processed files from Alfred.

```typescript
import { AlfredClient, Configuration, DownloadResult } from "@tagshelf/alfred";
import * as fs from "fs";

// ... Initialization code here ...

// Download file by ID
const fileId = "87654321-4321-4321-4321-210987654321";
const downloadResult: DownloadResult = await client.files.download(fileId);

// Save to disk
fs.writeFileSync(downloadResult.originalName, downloadResult.buffer);

console.log("Downloaded:", downloadResult.originalName);
console.log("MIME type:", downloadResult.mimetype);
console.log("Size:", downloadResult.buffer.length, "bytes");
```

`originalName` is read from the `Content-Disposition` header: the `filename*=` form (percent-decoded) is preferred, then a quoted `filename="..."`, then a plain `filename=`. Quotes and anything after a `;` are removed. When the header is missing, `originalName` is an empty string and `mimetype` falls back to `application/octet-stream`.

## Retrieve Data Points

Data Points are the core of Alfred's platform and represent data that you want to extract. Once your job is processed,
you can retrieve the data points from the files if the job was successful. For more information visit the Metadata section of our [official documentation](https://docs.tagshelf.dev/enpoints/metadata).

> [!IMPORTANT]  
> Data Points were previously known as Metadata.

```typescript
import { AlfredClient, Configuration, DataPointResult } from "@tagshelf/alfred";

// ... Initialization code here ...

// Get Data Points by File ID
const fileId = "87654321-4321-4321-4321-210987654321";
const dataPoints: DataPointResult[] = await client.dataPoints.getValues(fileId);

// Process extracted data points
dataPoints.forEach((dataPoint) => {
    console.log(`${dataPoint.metadataName}: ${dataPoint.value}`);
    console.log(`Confidence: ${dataPoint.classificationScore}`);
});
```

## Real-Time Events

The `alfred-node` library provides a way to listen to events emitted by Alfred IPA in real-time through a websockets implementation. This feature is particularly useful when you need to monitor the progress of a Job, File, or any other event that occurs within the Alfred platform. To see more information visit our [official documentation](https://docs.tagshelf.dev/event-api).

### Getting started

To get started, you need to create an instance of the AlfredRealTimeClient class.

```typescript
import { Configuration, AlfredRealTimeClient } from "@tagshelf/alfred";

const config: Configuration = Configuration.default("production");
const realTimeClient: AlfredRealTimeClient = new AlfredRealTimeClient(
    config,
    "your-api-key"
);
```

### File Events

These events are specifically designed to respond to a variety of actions or status changes related to Files. The library provides fully typed file events for type safety. To see more details about File events, visit our [official documentation](https://docs.tagshelf.dev/event-api/fileevents).

```typescript
import { FileEvent, AlfredEvent } from "@tagshelf/alfred";

// Listen to all file events with full typing
realTimeClient.onFileEvent((event: FileEvent) => {
    console.log("File event received:", event.eventName);
    console.log("Company ID:", event.companyId);
    
    // Type-safe event handling based on event name
    switch (event.eventName) {
        case AlfredEvent.FileDone:
            console.log("File processing completed!");
            console.log("File ID:", event.fileId);
            console.log("Tag Name:", event.tagName);
            console.log("File Status:", event.fileStatus);
            break;
            
        case AlfredEvent.FileStatusUpdate:
            console.log("File status updated");
            console.log("File ID:", event.fileId);
            console.log("Classification Score:", event.classificationScore);
            console.log("New Status:", event.fileStatus);
            break;
            
        case AlfredEvent.FileFailed:
            console.log("File processing failed");
            console.log("File ID:", event.fileId);
            console.log("Tag Name:", event.tagName);
            break;
            
        case AlfredEvent.FileMove:
            console.log("File moved");
            console.log("File ID:", event.fileId);
            console.log("From:", event.previousFileDirectory);
            console.log("To:", event.newFileDirectory);
            break;
    }
});
```

### Job Events

Alfred performs asynchronous document classification, extraction, and indexing on a variety of file types. The events detailed here offer insights into how a Job progresses, fails, retries, or completes its tasks. To see more details about Job events, visit our [official documentation](https://docs.tagshelf.dev/event-api/jobevents).

```typescript
import { JobEvent, AlfredEvent } from "@tagshelf/alfred";

// Listen to all job events with full typing
realTimeClient.onJobEvent((event: JobEvent) => {
    console.log("Job event received:", event.eventName);
    console.log("Job ID:", event.jobId);
    
    // Type-safe event handling based on event name
    switch (event.eventName) {
        case AlfredEvent.JobCreate:
            console.log("Job created!");
            console.log("File Count:", event.fileCount);
            console.log("User:", event.userName);
            console.log("Metadata:", event.metadata);
            break;
            
        case AlfredEvent.JobStart:
            console.log("Job processing started");
            console.log("Job ID:", event.jobId);
            break;
            
        case AlfredEvent.JobStageUpdate:
            console.log("Job stage updated");
            console.log("Job ID:", event.jobId);
            console.log("New Stage:", event.stage);
            break;
            
        case AlfredEvent.JobFinished:
            console.log("Job completed successfully!");
            console.log("Job ID:", event.jobId);
            break;
            
        case AlfredEvent.JobFailed:
            console.log("Job failed");
            console.log("Job ID:", event.jobId);
            console.log("Retries:", event.retries);
            console.log("Exceeded Retries:", event.exceededRetries);
            break;
            
        case AlfredEvent.JobRetry:
            console.log("Job retrying");
            console.log("Job ID:", event.jobId);
            console.log("Retry Count:", event.retries);
            break;
            
        case AlfredEvent.JobInvalid:
            console.log("Job is invalid");
            console.log("Job ID:", event.jobId);
            console.log("Retries:", event.retries);
            console.log("Exceeded Retries:", event.exceededRetries);
            console.log("Has Broken Input Sources:", event.hasBrokenInputSources);
            break;
            
        case AlfredEvent.JobExceededRetries:
            console.log("Job exceeded retry limit");
            console.log("Job ID:", event.jobId);
            console.log("Retries:", event.retries);
            break;
    }
});
```

### Specific Event Listening

You can also listen to specific events using the `on()` method. This is useful when you want to monitor a particular event type or when new events are introduced that have not yet received dedicated methods in the library.

```typescript
import { AlfredEvent } from "@tagshelf/alfred";

// Listen to a specific job event
realTimeClient.on<JobEvent>(AlfredEvent.JobFinished, (event) => {
    console.log("Job finished:", event.jobId);
});

// Listen to a specific file event
realTimeClient.on<FileEvent>(AlfredEvent.FileDone, (event) => {
    console.log("File done:", event.fileId);
    console.log("Tag applied:", event.tagName);
});

// Listen to file extraction data events
realTimeClient.on(AlfredEvent.FileExtractedDataCreate, (event: any) => {
    console.log("Data extracted from file:", event.fileLogId);
    console.log("Extracted content:", event.content);
    console.log("Provider:", event.provider);
});
```

### Available Event Types

The library supports the following event types through the `AlfredEvent` enum:

**Job Events:**
- `AlfredEvent.JobCreate` - Job is created
- `AlfredEvent.JobStart` - Job processing starts
- `AlfredEvent.JobStageUpdate` - Job stage changes
- `AlfredEvent.JobFinished` - Job completes successfully
- `AlfredEvent.JobFailed` - Job fails
- `AlfredEvent.JobRetry` - Job is retrying
- `AlfredEvent.JobExceededRetries` - Job exceeded retry limit
- `AlfredEvent.JobInvalid` - Job is invalid

**File Events:**
- `AlfredEvent.FileStatusUpdate` - File status changes
- `AlfredEvent.FileDone` - File processing complete
- `AlfredEvent.FileFailed` - File processing failed
- `AlfredEvent.FileMove` - File moved to different location
- `AlfredEvent.FileUpdate` - File updated
- `AlfredEvent.FileChangeTag` - File tag changed
- `AlfredEvent.FileRemoveTag` - Tag removed from file
- `AlfredEvent.FileAddToJob` - File added to job
- `AlfredEvent.FileMoveToPending` - File moved to pending
- `AlfredEvent.FileMoveToRecycleBin` - File moved to recycle bin
- `AlfredEvent.FilePropertyCreate` - File property created
- `AlfredEvent.FilePropertyDelete` - File property deleted
- `AlfredEvent.FileExtractedDataCreate` - Data extracted from file
- `AlfredEvent.FileExtractedDataDelete` - Extracted data deleted
- `AlfredEvent.FileCategoryCreate` - File category created
- `AlfredEvent.FileCategoryDelete` - File category deleted

### Disconnect

When you're done listening to events, disconnect the real-time client to close the websocket connection.

```typescript
realTimeClient.disconnect();
```

# Reference

This is the class reference for the `alfred-node` library.

## `AlfredClient`

The AlfredClient class is the main class that provides access to all the Alfred API endpoints.

### Constructor

```typescript
new AlfredClient(config: Configuration, auth: Auth);
```

### Client Configuration

The Configuration class provides the configuration for the AlfredClient.

```typescript
Configuration.default(environment: "production"): Configuration;
```

### Authentication

The Auth type provides the authentication methods for the AlfredClient.

```typescript
type Auth = 
  | { apiKey: string }
  | { 
      hmac: {
        apiKey: string;    // signing key (never sent)
        secretKey: string; // identifies your account (sent in the header)
      }
    }
  | { 
      oauth: {
        username: string;
        password: string;
      }
    };
```

For HMAC, `secretKey` is the console's "Secret key" (it identifies your account) and `apiKey` is the console's "API key" (the key requests are signed with).

### Domains

The AlfredClient class provides access to the following domains:

- sessions:
- files:
- jobs:
- datapoints:
- accounts:
- classifications:

Each domain provides access to a set of methods that interact with the Alfred API.

---

### Session Domain Methods

---

#### -  `create()` Method

***Signature***

```typescript
create(): Promise<CreateSessionResult>;
```

***Description***

Creates a new deferred session in Alfred.

***Returns***
- A Promise that resolves to an object of type `CreateSessionResult` with the following properties:

| Key       | Type | Description |
|-----------| --- | --- |
| `sessionId` | string | Session ID |

---

#### -  `get()` Method

***Signature***

```typescript
get(id: string): Promise<GetSessionResult>;
```

***Description***

Retrieves a deferred session by its ID.

***Parameters***
- `id`: The ID of the session to retrieve.

***Returns***
- A Promise that resolves to an object of type `GetSessionResult` with the following properties:

| Key       | Type | Description |
|-----------| --- | --- |
| `id` | string | Session ID |
| `creationDate` | string | Session creation date |
| `updateDate` | string | Session update date |
| `status` | string | Session status |
| `userName` | string | User name |
| `companyId` | string | Company ID |
| `jobId` | string \| null | Associated job ID if any |

---

### File Domain Methods

---

#### `uploadFile()` Method

***Signature***

```typescript
uploadFile(payload: UploadFilePayload): Promise<{ fileId: string }>;
```

***Description***

Uploads a local file to Alfred.

***Parameters***- `payload`: An object of type `UploadFilePayload` with the following properties:
 
- | Key       | Type | Description |
  |-----------| --- | --- |
  | `file`      | File | Object containing the file buffer, original name, and mimetype.|
  | `sessionId` | string | Session ID to link multiple files to a job.|
  | `metadata`  | any |  JSON object or JSON array of objects containing metadata fields for the file.|
  | `channel`   | string | Optional. Channel the file came through, for example `"api"`.|

***Returns***
- A Promise that resolves to an object with the following property:
- | Key       | Type | Description |
  |-----------| --- | --- |
  | `fileId`    | string | ID of the uploaded file |

Alfred stores the file name with everything except `A-Z a-z 0-9 - _ .` removed, so the stored name can differ from `originalName`.

---

#### `upload()` Method

***Signature***

```typescript
upload(payload: FileUploadPayload): Promise<FileUploadResult>;
```

***Description***

Uploads files from URLs or a remote source to Alfred. This creates a job. Field names are sent to the API in the form it reads (`fileName` as `file_name`, and so on).

***Parameters***- `payload`: An object of type `FileUploadPayload` with the following properties:

| Key                 | Type | Description |
|---------------------| --- | --- |
| `url`               | string | URL of the file to upload (use url, when you have an URl to single remote file.)|
| `urls`              | string[] | URLs of the files to upload. (Use urls, when you have URl's for multiple remote files. The current limit for this parameter is **100 elements**.) |
| `source`            | string | Configured object storage source name. Ideal for referring to files hosted in existing cloud containers. When used, `fileName` and `container` are required. |
| `container`         | string | Virtual container where the referenced remote file is located. When used, `source` and `fileName` are required.|
| `fileName`          | string | Unique name of the file within an object storage source. When used, **source** and **container** are required.|
| `fileNames`         | string[] | Array of unique names of the files within an object storage source. When used, **source** and **container** are required.|
| `filename`          | string | **Deprecated**, use `fileName`. |
| `filenames`         | string[] | **Deprecated**, use `fileNames`. |
| `merge`             | boolean | Boolean value [true/false] - When set to true, will merge all of the remote files into a single PDF file. All of the remote files MUST be images. </br></br>By default this field is set to **false**. |
| `metadata`          | any | JSON object or JSON array of objects containing metadata fields for a given remote file. </br></br>When merge field is set to **false**:</br></br>When using the urls field this should be a JSON object array that matches the urls field array length.</br></br>When using the url field the metadata field should be a JSON object.</br></br>When the merge field is set to true: The metadata field should be a JSON object.|
| `propagateMetadata` | boolean | Applies a single metadata object to every file from the remote URLs or remote source, so a batch gets uniform metadata. |
| `parentFilePrefix`  | string | Virtual folder destination for the uploaded files, instead of the default 'Inbox' folder. Applied with `decompose`. |
| `decompose`         | boolean | Splits the file into its parts. |
| `pageRotation`      | number | Page rotation in degrees. Only read when `decompose` is set. |
| `channel`           | string | Channel the files came through, for example `"api"`. |
| `correlationId`     | string | Your own identifier for the job, at most 512 characters. |
| `password`          | string | Password for password-protected files. |
| `priority`          | `"low"` \| `"normal"` \| `"high"` \| `"urgent"` | Processing priority of the job. |

Any other key is sent unchanged. The contents of `metadata` are never renamed.

***Returns***
- A Promise that resolves to an object of type `FileUploadResult` with the following properties:
- | Key       | Type | Description |
  |-----------| --- | --- |
  | `jobId`         | string | ID of the job created for the files |
  | `correlationId` | string \| undefined | The correlation ID you sent (empty string when none) |
  | `warnings`      | string[] \| undefined | Present only when the API raised warnings |

---

#### `get()` Method

***Signature***

```typescript
get(id: string): Promise<FileDetails>;
```

***Description***

Retrieves detailed information about a file by its ID.

***Parameters***
- `id`: The ID of the file to retrieve.

***Returns***
- A Promise that resolves to an object of type `FileDetails` (also exported as the deprecated `File`). Fields marked `?` are left out when they have no value.

| Key       | Type | Description |
|-----------| --- | --- |
| `id` | string | File ID |
| `creationDate` | string | When the file was created (ISO 8601 UTC) |
| `updateDate` | string | When the file was last updated (ISO 8601 UTC) |
| `fileName` | string | File name |
| `fileNameWithoutExtension` | string | File name without its extension |
| `size` | number | Legacy size field, 0 in practice; use `fileSize` |
| `fileSize` | number | File size in bytes |
| `blobName` | string | Storage name of the file |
| `blobUrl` | string | Storage URL of the file |
| `userName` | string | User who uploaded the file |
| `md5Hash` | string | Base64 of the binary MD5 digest of the content |
| `contentType` | string | File MIME type |
| `channel` | string | Channel the file came through |
| `shouldBeClassified` | boolean | Whether the file is to be classified |
| `excludeFromClassificationData` | boolean | Whether the file is excluded from classification training data |
| `classifier` | string | Classifier that handled the file, for example `"zero"` |
| `description` | string | Description of the file |
| `classificationScore` | number | Classification confidence score |
| `status` | string | Processing status, for example `finished` or `failed_extraction` |
| `inputType` | string | `single_unit`, `primary`, `derived` or `virtual` |
| `extractionType` | string | `none`, `text`, `multimodal` or `reused` |
| `isDuplicate` | boolean | The file duplicates another file |
| `isDataDuplicate` | boolean | The extracted data duplicates another file |
| `isDuplicateByValues` | boolean | The file duplicates another by field values |
| `duplicateOriginId` | string? | ID of the original file, when a duplicate |
| `tagId` | string? | Applied tag ID |
| `tagName` | string | Applied tag name |
| `proposedTagId` | string? | Tag ID proposed by the classifier |
| `proposedTagVariance` | number | Variance of the proposed tag |
| `classificationScoreAboveDeviation` | boolean | Score is above the tag's deviation threshold |
| `confirmedTagId` | string? | Tag ID confirmed by a reviewer |
| `confirmedBy` | string | Who confirmed the tag |
| `manualClassification` | boolean | The tag was set by a person |
| `isParent` | boolean | The file was split into children |
| `parentId` | string? | ID of the parent file |
| `groupRole` | string | Role in a grouped document: `standalone`, `virtual` or `member` |
| `groupId` | string? | ID of the group the file belongs to |
| `isProcessingUnit` | boolean | The file is classified and extracted in its own right: not a split parent and not a page of a grouped document |
| `isResultReady` | boolean | An automated result exists and can be read; review may still be pending |
| `deferredSessionId` | string? | Deferred session the file was uploaded to |
| `companyId` | string | Workspace ID |
| `metadata` | any \| null | Whatever JSON the caller attached (object, array or text), or null. The client converts the keys of every response to camelCase, and that includes the keys inside this object: metadata sent as `{ "invoice_id": 1 }` is read back as `{ invoiceId: 1 }` |
| `effectiveMetadata` | string | The file's metadata merged with its job's, as a JSON string |
| `jobOrderIndex` | number | Position of the file within its job |
| `pageCount` | number | Number of pages |
| `pageNumber` | number | Page number within the parent, -1 when not a page |
| `assignedTo` | string | User the file is assigned to for review |
| `assignmentDate` | string? | When the file was assigned (ISO 8601 UTC) |
| `validationDate` | string? | When the file was validated (ISO 8601 UTC) |


---

#### `download()` Method

***Signature***

```typescript
download(id: string): Promise<DownloadResult>;
```

***Description***

Downloads a file from Alfred by its ID.

***Parameters***
- `id`: The ID of the file to download.

***Returns***
- A Promise that resolves to an object of type `DownloadResult` with the following properties:

| Key       | Type | Description |
|-----------| --- | --- |
| `buffer` | Buffer | File content as a Buffer |
| `originalName` | string | File name from the `Content-Disposition` header (`filename*=` preferred, quotes removed); empty string when missing |
| `mimetype` | string | File MIME type; `application/octet-stream` when the header is missing |

---

### Job Domain Methods

---

#### `create()` Method

***Signature***

```typescript
create(job: CreateJob): Promise<CreateJobResult>;
```

***Description***

Creates a new job in Alfred.

***Parameters***
- `job`: An object of type `CreateJob` with the following properties:

| Key               | Type | Description |
|-------------------| --- | --- |
| `sessionId`        | string | Session ID |
| `metadata`         | any | Metadata of the job |
| `propagateMetadata` | boolean | If `true` ensures that the provided metadata at the Job level is attached to all the specified Files. |
| `merge`           | boolean | If `true`, when all provided Files are either images or PDFs, the system combines them into a single file for the purpose of processing. |
| `decompose`       | boolean | If `true`, when the provided File is a PDF, the system will decompose it into individual pages for processing. |
| `channel`         | string | Channel |
| `parentFilePrefix` | string | The `parent_file_prefix` parameter is used to specify a virtual folder destination for the uploaded files, diverging from the default 'Inbox' folder. By setting this parameter, users can organize files into specific virtual directories, enhancing file management and accessibility within Alfred's system. |
| `pageRotation`    | number | Page rotation |
| `container`       | string | Virtual container where the referenced remote file is located.|
| `filename`        | string | Unique name of the file within an object storage source.|
| `filenames`       | string[] | Array of unique names of the files within an object storage source.|

***Returns***
- A Promise that resolves to an object of type `CreateJobResult` with the following properties:

| Key         | Type | Description            |
|-------------| --- |------------------------|
| `jobId`     | string | ID of the created Job. |

---

#### `get()` Method

***Signature***
    
```typescript
get(id: string): Promise<JobResult>;
```

***Description***

Retrieves a job by its ID.

***Parameters***
- `id`: The ID of the job to retrieve.

***Returns***
- A Promise that resolves to an object of type `JobResult` with the following properties:


| Key | Type | Description |
| --- | --- | --- |
| `id` | string | Job ID |
| `creationDate` | string | Job creation date |
| `hasJobRequestInfo` | boolean | Indicates if the job has request information |
| `jobRequestDate` | string (optional) | Job request date |
| `updateDate` | string | Job update date |
| `companyId` | string | Company ID |
| `bulkId` | string (optional) | Bulk ID |
| `deferredSessionId` | string | Deferred session ID |
| `userName` | string | User name |
| `channel` | string | Channel |
| `source` | string (optional) | Source |
| `container` | string (optional) | Container |
| `remoteFileName` | string (optional) | Remote file name |
| `remoteFileNames` | string (optional) | Remote file names |
| `merge` | boolean | Merge flag |
| `decompose` | boolean | Decompose flag |
| `propagateMetadata` | boolean | Propagate metadata flag |
| `parentFilePrefix` | string (optional) | Parent file prefix |
| `decomposedPageRotation` | number | Decomposed page rotation |
| `fileCount` | number | File count |
| `fileSourcesCount` | number | File sources count |
| `metadataObjectsCount` | number | Metadata objects count |
| `finishedFiles` | number | Finished files count |
| `files` | object array | Array of file objects, each containing `id`, `creationDate`, `updateDate`, `fileName`, `tagName`, `isParent`, `isChildren`, `status` |
| `retries` | number | Number of retries |
| `exceededRetries` | boolean | Flag indicating if retries were exceeded |
| `fileUrls` | string array | Array of file URLs |
| `errorMessages` | string array | Array of error messages |
| `stage` | string | Job stage |
| `startDate` | string | Job start date |
| `emailFrom` | string (optional) | Email from |
| `emailSubject` | string (optional) | Email subject |
| `emailBody` | string (optional) | Email body |

---

### Data Points Domain Methods

---

#### `getValues()` Method

***Signature***

```typescript
getValues(fileId: string): Promise<DataPointResult[]>;
```

***Description***

Retrieves the data points of a file by its ID.

***Parameters***
- `fileId: string`: The ID of the file to retrieve data points from.

***Returns***
- A Promise that resolves to an object of type `DataPointResult[]` with the following properties:
- | Key       | Type | Description |
  |-----------| --- | --- |
-  |`id`        | string | Data point ID |
  | `fileLogId` | string | File log ID |
  | `metadataId` | string | Metadata ID |
- | `metadataName` | string | Metadata name |
  | `classificationScore` | number | Classification score |

---

### Classification Domain Methods

You can classify a piece of text or a file against criteria you send with the request. No document types or jobs need to exist in your workspace. This needs Alfred 1.130.0 or later, and the feature must be enabled for your workspace (otherwise the API answers 403).

> [!WARNING]
> Every create call creates and bills one request. There is no idempotency: if you retry a create call, you create (and pay for) a second request. If a create call timed out but you received an id, read that request with `get` instead of creating it again.

Each request needs 2 to 50 criteria (`tags`). Each criterion has a `name`, a `description` and an optional `threshold` between 0 and 1 (default 0, which always picks the best class). Create calls answer right away with a `queued` request; poll `get` every 1 to 2 seconds until its status is `completed` or `failed`. A result usually takes a few seconds.

```typescript
import { AlfredClient, Classification, ClassificationCriterion } from "@tagshelf/alfred";
import * as fs from "fs";

// ... Initialization code here ...

const tags: ClassificationCriterion[] = [
  { name: "Invoice", description: "A bill for goods or services", threshold: 0.5 },
  { name: "Receipt", description: "Proof of a completed payment" },
];

// Classify text
const fromText = await client.classifications.create({
  tags,
  text: "Invoice #123. Amount due: 450.00 USD. Payment terms: 30 days.",
  correlationId: "order-123", // optional
});

// Classify a file (PDF, PNG, JPEG, WebP, TIFF, GIF or UTF-8 TXT, up to 20 MB).
// The file type is decided from the extension of originalName.
const fromFile = await client.classifications.createFromFile({
  file: {
    buffer: fs.readFileSync("./document.pdf"),
    originalName: "document.pdf",
    mimetype: "application/pdf", // optional
  },
  tags,
});

// Poll until the request finishes, with a deadline
async function waitForClassification(id: string, timeoutMs = 60000): Promise<Classification> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const current = await client.classifications.get(id);
    if (current.status === "completed" || current.status === "failed") return current;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error(`Classification ${id} did not finish in time.`);
}

const done = await waitForClassification(fromText.id);
if (done.status === "completed" && done.result) {
  console.log("Class:", done.result.class);
  console.log("Score:", done.result.score);
  console.log("Predictions:", done.result.predictions);
} else if (done.error) {
  console.error(done.error.code, done.error.message);
}
```

When no class matches, `result.class` is an empty string and `result.reason` says why: `no_match` (no class scored high enough), `no_text` (no text could be read) or `no_candidates`. `result.belowThreshold` is `true` when the best class scored under its threshold. Only the first 32,000 characters of text are classified (`textTruncated` tells you when text was cut), and only the first 10 pages of a file are used (`input.pagesTruncated`).

---

#### `create()` Method

***Signature***

```typescript
create(payload: CreateClassification): Promise<Classification>;
```

***Description***

Classifies text against the criteria in the request (`POST api/classify`). The limits are checked by the API, which answers 400 or 413 with the details.

***Parameters***
- `payload: CreateClassification`:
- | Key       | Type | Description |
  |-----------| --- | --- |
  | `tags` | ClassificationCriterion[] | 2 to 50 criteria. Each has `name` (required, up to 350 characters, unique ignoring case), `description` (required, up to 1,000 characters) and optional `threshold` (0 to 1, default 0) |
  | `text` | string | The text to classify, up to 200,000 characters. Only the first 32,000 are classified |
  | `fileName` | string | Optional name, up to 250 characters |
  | `correlationId` | string | Optional identifier of your own, up to 512 characters |

***Returns***
- A Promise that resolves to a `Classification` with `status` `queued`:
- | Key       | Type | Description |
  |-----------| --- | --- |
  | `id` | string | Request ID. Use it with `get()` |
  | `fileId` | string | File ID |
  | `status` | string | `queued`, `completed` or `failed` |
  | `createdAt` | string | Creation time (ISO 8601 UTC) |
  | `correlationId` | string | Your correlation ID, or an empty string |
  | `textTruncated` | boolean | True when the text was longer than the classified limit |

---

#### `createFromFile()` Method

***Signature***

```typescript
createFromFile(payload: CreateClassificationFromFile): Promise<Classification>;
```

***Description***

Classifies a file against the criteria in the request (`POST api/classify`, as multipart form data). Throws an `Error`, without sending a request, when the file buffer or its name is missing. The API decides the file type from the extension of the name.

***Parameters***
- `payload: CreateClassificationFromFile`:
- | Key       | Type | Description |
  |-----------| --- | --- |
  | `file.buffer` | Buffer | The file content, up to 20 MB (PDF, PNG, JPEG, WebP, TIFF, GIF or UTF-8 TXT). Only the first 10 pages are used |
  | `file.originalName` | string | The file name, including its extension |
  | `file.mimetype` | string | Optional content type |
  | `tags` | ClassificationCriterion[] | The same criteria as in `create()` |
  | `correlationId` | string | Optional identifier of your own, up to 512 characters |

***Returns***
- A Promise that resolves to a `Classification` with `status` `queued`, with the same properties as `create()`.

---

#### `get()` Method

***Signature***

```typescript
get(classificationId: string): Promise<Classification>;
```

***Description***

Retrieves a classification request (`GET api/classify/{id}`). Throws an `Error` when the ID is blank. An unknown ID, an ID of another workspace, or a job that is not a classification request answers 404.

***Parameters***
- `classificationId: string`: The `id` returned by `create()` or `createFromFile()`.

***Returns***
- A Promise that resolves to a `Classification` with the properties of `create()` plus:
- | Key       | Type | Description |
  |-----------| --- | --- |
  | `completedAt` | string | Finish time. Present when `completed` or `failed` |
  | `result.class` | string | Winning class, or an empty string when nothing matched |
  | `result.score` | number | Score of the winning class |
  | `result.belowThreshold` | boolean | True when the best class scored under its threshold |
  | `result.predictions` | { class: string; score: number }[] | All classes, best first |
  | `result.model` | string | Model used |
  | `result.reasoning` | string | Explanation, when available |
  | `result.answered` | boolean | Whether the model answered, when reported |
  | `result.reason` | string | `no_match`, `no_text` or `no_candidates` when nothing matched |
  | `error.code` | string | `classification_failed`, `canceled` or `failed`. Present when `failed` |
  | `error.message` | string | Failure message |
  | `input` | object | File requests only: `pages`, `classifiedPages`, `pagesTruncated`, `textTruncated`, `bytes`, `mode` (`native_text` or `ocr_text`), `ocrPages`, `nativePages`, `ocrProvider` |

---

### Account Domain Methods

---

#### `whoAmI()` Method

***Signature***

```typescript
whoAmI(): Promise<WhoAmIResult>;
```

***Description***

Retrieves the account information of the authenticated user or application. The result is the account itself, so read its fields directly. It does not include the HTTP response, so the API key is never returned.

****Returns****
- A Promise that resolves to a `WhoAmIResult` with these fields:
  - `requestOriginIpAddress`: the IP address and port the request came from, as seen by the API.
  - `authenticationType`: how the caller authenticated, `ApiKey`, `Bearer` (OAuth) or `HMAC`.
  - `roles`: the roles granted to the caller, such as `Account Admin` or `Application`.
  - `appId` and `appName`: the id and name of the application (integration). Present for API key calls.
  - `status`: the status of the account, such as `active`.
  - `companyId` and `companyName`: the id and name of the tenant the caller belongs to.
  - `userId`, `userName`, `name` and `lastName`: the signed-in user's details. They are empty for applications.

****Example****

```typescript
const account = await client.accounts.whoAmI();
console.log(account.companyName, account.roles);
```

> Note: reading `.data` on the result (for example `(await client.accounts.whoAmI()).data`) still works but is deprecated and will be removed in the next major version. Read the fields directly instead.

---
# Contributing

Contributions to improve this library are welcome. Please feel free to fork the repository, make your changes, and submit a pull request for review.

To run the tests, install the dependencies with `npm ci` and run `npm test`. The test run fails if coverage of the code under `src/` drops below 100% for statements, branches, functions or lines, so please add tests for any code you add.

# License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/tagshelfsrl/dotnet-alfred-api-wrapper/blob/feature/AL-887/LICENSE) file for details.
