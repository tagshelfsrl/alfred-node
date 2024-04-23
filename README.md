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

Account API allows you to get information about the account you are currently authenticated with.

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
| propagateMetadata | boolean | Propagate metadata |
| merge | boolean | Merge files |
| decompose | boolean | Decompose |
| metadata | any | Metadata of the job |
| channel | string | Channel |
| parentFilePrefix | string | Prefix of the parent file |
| pageRotation | number | Page rotation |
| container | string | Container |
| fileName | string | Name of the file |
| fileNames | string[] | Names of the files |

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

### Sessions

Sessions are the way to hadle the processing of multiple documents in Alfred with deferred upload.
  
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

### Files

These are the files that you want to process in Alfred.

#### Get file by ID

```js
// Get file by ID
client.files.get("file-id").then((resp) => console.log(resp));
```

#### Upload file

| Parameter | Type | Description |
| --- | --- | --- |
| file | File | File to upload |
| sessionId | string | Session ID |
| metadata | any | Metadata of the file |

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

#### Upload file from URL

| Parameter | Type | Description |
| --- | --- | --- |
| url | string | URL of the file to upload |
| urls | string[] | URLs of the files to upload |
| source | string | Source of the file |
| container | string | Container of the file |
| filename | string | Name of the file |
| filenames | string[] | Names of the files |
| merge | boolean | Merge files |
| metadata | any | Metadata of the file |
| propagateMetadata | boolean | Propagate metadata |
| parentFilePrefix | string | Prefix of the parent file |

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
  fs.writeFileSync(resp.originalName, resp.file.buffer);
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

## Socket Events

The Alfred client provides a way to listen to socket events.

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

This event is emitted when a file is processed.

```js
socketClient.onFileEvent((data) => console.log(data));
```

#### Job event

This event is emitted when a job is processed.

```js
socketClient.onJobEvent((data) => console.log(data));

```

#### Custom event

This event is emitted when a custom event is triggered.

```js
socketClient.on("custom-event", (data) => console.log(data));
```

#### Disconnect

This method disconnects the socket.

```js
socketClient.disconnect();
```
