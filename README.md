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
        key: "your-key",
        secret: "your-secret",
    }
});
```

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
console.log("Job created:", response.fileId); // This is actually a job ID
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
    filename: "2025/january/invoice-001.pdf",
    metadata: {
        documentType: "invoice",
        year: "2025",
    },
};

await client.files.upload(cloudStoragePayload);
```

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
import { AlfredClient, Configuration, File } from "@tagshelf/alfred";

// ... Initialization code here ...

// Get file details by ID
const fileId = "87654321-4321-4321-4321-210987654321";
const fileInfo: File = await client.files.get(fileId);

console.log("File name:", fileInfo.fileName);
console.log("File size:", fileInfo.fileSize);
console.log("Tag name:", fileInfo.tagName);
console.log("Status:", fileInfo.status);
console.log("Classification score:", fileInfo.classificationScore);
```

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
        key: string;
        secret: string;
      }
    }
  | { 
      oauth: {
        username: string;
        password: string;
      }
    };
```

### Domains

The AlfredClient class provides access to the following domains:

- sessions:
- files:
- jobs:
- datapoints:
- accounts:

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
  | `metadata`  | any |  JSON object or JSON array of objects containing metadata fields for a given remote file.|

***Returns***
- A Promise that resolves to an object of type `UploadFileResponse` with the following properties:
- | Key       | Type | Description |
  |-----------| --- | --- |
  | `id`        | string | File ID |
  | `name`      | string | File name |
  | `mimetype`  | string | File mimetype |
  | `size`      | number | File size |
  | `metadata`  | any | File metadata |

---

#### `upload()` Method

***Signature***

```typescript
upload(payload: FileUploadPayload): Promise<{ fileId: string }>;
```

***Description***

Uploads a file from a remote source to Alfred.

***Parameters***- `payload`: An object of type `FileUploadPayload` with the following properties:

| Key                 | Type | Description |
|---------------------| --- | --- |
| `url`               | string | URL of the file to upload (use url, when you have an URl to single remote file.)|
| `urls`              | string[] | URLs of the files to upload. (Use urls, when you have URl's for multiple remote files. The current limit for this parameter is **100 elements**.) |
| `source`            | string | Configured object storage source name. Ideal for referring to files hosted in existing cloud containers. When used, **file_name** and **container** are required. |
| `container`         | string | Virtual container where the referenced remote file is located. When used, **source** and **file_name** are required.|
| `filename`          | string | Unique name of the file within an object storage source. When used, **source** and **container** are required.|
| `filenames`         | string[] | Array of unique names of the files within an object storage source. When used, **source** and **container** are required.|
| `merge`             | boolean | Boolean value [true/false] - When set to true, will merge all of the remote files into a single PDF file. All of the remote files MUST be images. </br></br>By default this field is set to **false**. |
| `metadata`          | any | JSON object or JSON array of objects containing metadata fields for a given remote file. </br></br>When merge field is set to **false**:</br></br>When using the urls field this should be a JSON object array that matches the urls field array length.</br></br>When using the url field the metadata field should be a JSON object.</br></br>When the merge field is set to true: The metadata field should be a JSON object.|
| `propagateMetadata` | boolean | This parameter enables the specification of a single metadata object to be applied across multiple files from remote URLs or remote sources. When used, `propagate_metadata` ensures that the defined metadata is consistently attached to all the specified files during their upload and processing. This feature is particularly useful for maintaining uniform metadata across a batch of files, streamlining data organization and retrieval. |
| `parentFilePrefix`  | string | The `parent_file_prefix` parameter is used to specify a virtual folder destination for the uploaded files, diverging from the default 'Inbox' folder. By setting this parameter, users can organize files into specific virtual directories, enhancing file management and accessibility within Alfred's system. |

***Returns***
- A Promise that resolves to an object of type `UploadResponse` with the following properties:
- | Key       | Type | Description |
  |-----------| --- | --- |
  | `id`        | string | File ID |
  | `name`      | string | File name |
  | `mimetype`  | string | File mimetype |
  | `size`      | number | File size |
  | `metadata`  | any | File metadata |

---

#### `get()` Method

***Signature***

```typescript
get(id: string): Promise<File>;
```

***Description***

Retrieves detailed information about a file by its ID.

***Parameters***
- `id`: The ID of the file to retrieve.

***Returns***
- A Promise that resolves to an object of type `File` with the file details including:

| Key       | Type | Description |
|-----------| --- | --- |
| `id` | string | File ID |
| `fileName` | string | File name |
| `fileSize` | number | File size in bytes |
| `tagName` | string | Applied tag name |
| `tagId` | string | Applied tag ID |
| `status` | string | File processing status |
| `classificationScore` | number | Classification confidence score |
| `blobUrl` | string | File blob URL |
| `contentType` | string | File MIME type |
| `metadata` | string \| null | File metadata |
| ...and more | | See `File` interface for complete details |

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
| `originalName` | string | Original file name |
| `mimetype` | string | File MIME type |

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

### Account Domain Methods

---

#### `whoAmI()` Method

***Signature***

```typescript
whoAmI(): Promise<any>;
```

***Description***

Retrieves the account information of the authenticated user.

****Returns****
- A Promise that resolves to an object of type `any` with the information of the authenticated user.
---
# Contributing

Contributions to improve this library are welcome. Please feel free to fork the repository, make your changes, and submit a pull request for review.

# License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/tagshelfsrl/dotnet-alfred-api-wrapper/blob/feature/AL-887/LICENSE) file for details.
