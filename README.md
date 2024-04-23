# Overview

`alfred-node` is a TypeScript/Node.js library that provides a streamlined approach to integrate with Alfred's Intelligent Process Automation platform. It enables developers to manage accounts, process and manipulate data points, handle job creation and management, manage sessions, and handle file operations with ease.

## Installation

To use the `alfred-node` library, first install it via npm:

```bash
npm install @tagshelf/alfred
```

or using yarn:

```bash
yarn add @tagshelf/alfred
```

## Usage

Check out this simple example in TypeScript to get up and running:

```js
import { AlfredClient, Configuration } from "@tagshelf/alfred";

// Set your API key (or any authorization property)
const client = new AlfredClient(Configuration.v1("staging"), {
  apiKey: "AXXXXXXXXXXXXXXXXX",
});

client.accounts.whoAmI().then((resp) => console.log(resp.data));
```

### Accounts

Account API allows you to get information about the account you are currently authenticated with. To see more information visit our [official documentation](https://docs.tagshelf.dev/enpoints/account).

#### Get account information

```js
client.accounts.whoAmI().then((resp) => console.log(resp.data));
```

### Data Points

Data Points are the core of Alfred's platform and represent data that you want to extract. To see more information visit our [official documentation](https://docs.tagshelf.dev/enpoints/metadata).

> [!IMPORTANT]  
> Data Points where previously known as Metadata.

#### Get Data Point by File ID

```js
client.dataPoints.getValues("file-id").then((resp) => console.log(resp));
```

### Sessions

A Session is a mechanism designed for asynchronous file uploads. It serves as a container or grouping for files that are uploaded at different times or from various sources, but are all part of a single Job. To see more information visit our [official documentation](https://docs.tagshelf.dev/enpoints/deferred-session).
  
#### Get session by ID

```js

// Get session by ID
client.sessions.get("session-id").then((resp) => console.log(resp));
```

#### Create session

```js
// Create a session
client.sessions.create().then((resp) => console.log(resp));
```

### Jobs

A Job represents a single unit of work that group one or more Files within Alfred. To see more information visit our [official documentation](https://docs.tagshelf.dev/enpoints/job).

#### Get job by ID

```js
// Get job by ID
client.jobs.get("job-id").then((resp) => console.log(resp));
```

#### Create job

| Parameter | Type | Description |
| --- | --- | --- |
| sessionId | string | Session ID |
| metadata | any | Metadata of the job |
| propagateMetadata | boolean | If `true` ensures that the provided metadata at the Job level is attached to all the specified Files. |
| merge | boolean | If `true`, when all provided Files are either images or PDFs, the system combines them into a single file for the purpose of processing. |
| decompose | boolean | If `true`, when the provided File is a PDF, the system will decompose it into individual pages for processing. |
| channel | string | Channel |
| parentFilePrefix | string | The `parent_file_prefix` parameter is used to specify a virtual folder destination for the uploaded files, diverging from the default 'Inbox' folder. By setting this parameter, users can organize files into specific virtual directories, enhancing file management and accessibility within Alfred's system. |
| pageRotation | number | Page rotation |
| container | string | Virtual container where the referenced remote file is located.|
| filename | string | Unique name of the file within an object storage source.|
| filenames | string[] | Array of unique names of the files within an object storage source.|

```js
// Create a job
const job: CreateJob = {
  sessionId: "session-id",
  propagateMetadata: true,
  merge: true,
  decompose: true,
  metadata: {
    key: "value",
  },
  channel: "channel",
  parentFilePrefix: "prefix",
  pageRotation: 90,
  container: "container",
  fileName: "file-name",
  fileNames: ["file-name-1", "file-name-2"],
};
client.jobs.create(job).then((resp) => console.log(resp));
```

### Files

File is an individual document or data unit undergoing specialized operations tailored for document analysis and management. To see more information visit our [official documentation](https://docs.tagshelf.dev/enpoints/file).

#### Get file by ID

```js
// Get file by ID
client.files.get("file-id").then((resp) => console.log(resp));
```

#### Upload file

| Parameter | Type | Description |
| --- | --- | --- |
| file | File | Object containing the file buffer, original name, and mimetype.|
| sessionId | string | Session ID to link multiple files to a job.|
| metadata | any |  JSON object or JSON array of objects containing metadata fields for a given remote file.|

```js
// Upload file
const file: UploadFilePayload = {
  file: {
    buffer: Buffer.from("file-content"),
    originalName: "file-name",
    mimetype: "application/pdf",
  },
  sessionId: "session-id",
  metadata: {
    key: "value",
  },
};

client.files.uploadFile(file).then((resp) => console.log(resp));
```

#### Upload file from remote source

| Parameter | Type | Description |
| --- | --- | --- |
| url | string | URL of the file to upload (use url, when you have an URl to single remote file.)|
| urls | string[] | URLs of the files to upload. (Use urls, when you have URl's for multiple remote files. the current limit for this parameter is **100 elements**.) |
| source | string | Configured object storage source name. Ideal for referring to files hosted in existing cloud containers. When used, **file_name** and **container** are required. |
| container | string | Virtual container where the referenced remote file is located. When used, **source** and **file_name** are required.|
| filename | string | Unique name of the file within an object storage source. When used, **source** and **container** are required.|
| filenames | string[] | Array of unique names of the files within an object storage source. When used, **source** and **container** are required.|
| merge | boolean | Boolean value [true/false] - When set to true, will merge all of the remote files into a single PDF file. All of the remote files MUST be images. </br></br>By default this field is set to **false**. |
| metadata | any | JSON object or JSON array of objects containing metadata fields for a given remote file. </br></br>When merge field is set to **false**:</br></br>When using the urls field this should be a JSON object array that matches the urls field array length.</br></br>When using the url field the metadata field should be a JSON object.</br></br>When the merge field is set to true: The metadata field should be a JSON object.|
| propagateMetadata | boolean | This parameter enables the specification of a single metadata object to be applied across multiple files from remote URLs or remote sources. When used, `propagate_metadata` ensures that the defined metadata is consistently attached to all the specified files during their upload and processing. This feature is particularly useful for maintaining uniform metadata across a batch of files, streamlining data organization and retrieval. |
| parentFilePrefix | string | The `parent_file_prefix` parameter is used to specify a virtual folder destination for the uploaded files, diverging from the default 'Inbox' folder. By setting this parameter, users can organize files into specific virtual directories, enhancing file management and accessibility within Alfred's system. |

```js
// Upload file from URL
const file: UploadFilePayload = {
  url: "file-url",
  sessionId: "session-id",
  metadata: {
    key: "value",
  },
};

client.files.upload(file).then((resp) => console.log(resp));
```

#### Download file

This method returns a buffer with the file content, the original name and the mimetype.

```js
// Download file it returns a buffer
client.files.download("file-id").then((resp) => {
  fs.writeFileSync(resp.originalName, resp.buffer);
});

```

##### Return example

```json
{
  "buffer": "file-content",
  "originalName": "file-name",
  "mimetype": "application/pdf"
}
```

## Real-Time Events

The `alfred-node` library provides a way to listen to events emitted by Alfred IPA in real-time through a websockets implementation. This feature is particularly useful when you need to monitor the progress of a Job, File, or any other event that occurs within the Alfred platform. To see more information visit our [official documentation](https://docs.tagshelf.dev/event-api).

### Getting started

To get started, you need to create an instance of the AlfredSocketClient class.

```js
import { Configuration, AlfredSocketClient } from "./src";

const socketClient = new AlfredSocketClient(
  Configuration.v1("staging"),
  "AXXXXXXXXXXXXXXXXX"
);
```

#### File event

These events are specifically designed to respond to a variety of actions or status changes related to Files. To see more details about File events, visit our [official documentation](https://docs.tagshelf.dev/event-api/fileevents).

```js
socketClient.onFileEvent((data) => console.log(data));
```

#### Job event

Alfred performs asynchronous document classification, extraction, and indexing on a variety of file types. The events detailed here offer insights into how a Job progresses, fails, retries, or completes its tasks. To see more details about Job events, visit our [official documentation](https://docs.tagshelf.dev/event-api/jobevents).

```js
socketClient.onJobEvent((data) => console.log(data));

```

#### Custom event

This enables you to select the specific event you wish to monitor. It's particularly beneficial when new events are introduced that have not yet received official support within the library.

```js
socketClient.on("custom-event", (data) => console.log(data));
```

#### Disconnect

This method disconnects the socket.

```js
socketClient.disconnect();
```
