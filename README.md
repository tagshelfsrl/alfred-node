# Table of contents
- [Table of contents](#table-of-contents)
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
    - [Upload a file from a local source](#upload-a-file-from-a-local-source)
    - [Upload a file from a remote source](#upload-a-file-from-a-remote-source)
  - [Create Jobs](#create-jobs)
  - [Get Job Information](#get-job-information)
  - [Retrieve Data Points](#retrieve-data-points)
  - [Real-Time Events](#real-time-events)
    - [Getting started](#getting-started)
      - [File event](#file-event)
      - [Job event](#job-event)
      - [Custom event](#custom-event)
      - [Disconnect](#disconnect)
- [Reference](#reference)
    - [AlfredClient](#alfredclient)
      - [Constructor](#constructor)
      - [Client Configuration](#client-configuration)
      - [Authentication](#authentication)
      - [Domains](#domains)
      - [File Domain Methods](#file-domain-methods)
        - [`uploadFile` Method](#uploadfile-method)
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

For API Key authentication, and production environment use the following code:
```js
import { AlfredClient, Configuration } from "@tagshelf/alfred";

// Choose environment
const config = Configuration.v1("production");

// Initialize Alfred client with API Key
const client = new AlfredClient(config, {
    apiKey: "your-api-key",
});
```

For HMAC authentication, and staging environment use the following code:
```js
import { AlfredClient, Configuration } from "@tagshelf/alfred";

// Choose environment
const config = Configuration.v1("staging");

// Initialize Alfred client with HMAC
const client = new AlfredClient(config, {
    hmac: {
        key: "your-key",
        secret: "your-secret",
    }});
```

For OAuth authentication, and production environment use the following code:
```js
import { AlfredClient, Configuration } from "@tagshelf/alfred";

// Choose environment
const config = Configuration.v1("production");

// Initialize Alfred client with OAuth
const client = new AlfredClient(config, {
    oauth: {
        username: "your-username",
        password: "your-password",
    }});
```

## Upload Files

With the client initialized, you can now upload files to Alfred using the `files` domain of the client 
and its upload capabilities. 

You can upload files in two different ways:

1. **Upload a file from a local source**: This method allows you to upload a file from your local machine to Alfred.
2. **Upload a file from a remote source**: This method enables you to upload a file from a remote source (e.g., a URL) to Alfred.


### Upload a file from a local source

In order to upload a file from a local source, you need to create a deferred session first and then upload the files to the session.
Once all the files are uploaded, you need to create a job to process the files.

```js
import { AlfredClient, Configuration } from "@tagshelf/alfred";

// ... Initialization code here ...

// Create a deferred session
client.sessions.create().then((session) => {
    // Upload file
    client.files.uploadFile({
        file: {
            buffer: Buffer.from("file-content"),
            originalName: "file-name",
            mimetype: "application/pdf",
        },
        sessionId: session.data.id,
        metadata: {
            key: "value",
        },
    }).then((resp) => console.log(resp));
});
```

### Upload a file from a remote source
When uploading files from a remote source, jobs are created directly without the need for a session, so you need to provide all the necessary files and metadata needed for the job.

```js
import { AlfredClient, Configuration } from "@tagshelf/alfred";

// ... Initialization code here ...

// Upload file from URL
client.files.upload({
    url: "file-url",
    sessionId: "session-id",
    metadata: {
        key: "value",
    },
}).then((resp) => console.log(resp));
```

## Create Jobs
A Job represents a single unit of work that group one or more Files within Alfred. To create a job, you need to provide the session ID, metadata, and other optional parameters.
This method creates and triggers a job in Alfred, which processes the uploaded files.

```js
import { AlfredClient, Configuration } from "@tagshelf/alfred";

// ... Initialization code here ...

// Create a job
const job = {
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


## Get Job Information

Once you've triggered a Job, you can get its information by providing the job ID.
This way you can check the stage or status of the job processing so you can access to its results.
For more information about the job stages please visit  the Job section of our [official documentation](https://docs.tagshelf.dev/enpoints/job).


```js
import { AlfredClient, Configuration } from "@tagshelf/alfred";

// ... Initialization code here ...

// Get job by ID
client.jobs.get("job-id").then((resp) => console.log(resp));
```

## Retrieve Data Points

Data Points are the core of Alfred's platform and represent data that you want to extract. Once your job is processed,
you can retrieve the data points from the files if job was successful. For more information visit the Metadata section of our [official documentation](https://docs.tagshelf.dev/enpoints/metadata).

> [!IMPORTANT]  
> Data Points where previously known as Metadata.
```js
import { AlfredClient, Configuration } from "@tagshelf/alfred";

// ... Initialization code here ...

// Get Data Points by File ID
client.dataPoints.getValues("file-id").then((resp) => console.log(resp));
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

# Reference

This is the class reference for the `alfred-node` library.

### AlfredClient

The AlfredClient class is the main class that provides access to all the Alfred API endpoints.

#### Constructor

```js
new AlfredClient(config: Configuration, auth: Auth);
```

#### Client Configuration

The Configuration class provides the configuration for the AlfredClient.

```js
Configuration.v1(environment: Environment);
```

#### Authentication

The Auth class provides the authentication methods for the AlfredClient.

```js
{
  apiKey: string;
} | {
  hmac: {
    key: string;
    secret: string;
  };
} | {
  oauth: {
    username: string;
    password: string;
  };
}
```

#### Domains

The AlfredClient class provides access to the following domains:

- accounts:
- dataPoints:
- files:
- jobs:
- sessions:

Each domain provides access to a set of methods that interact with the Alfred API.

#### File Domain Methods

##### `uploadFile` Method

**Signature**

```js
uploadFile(payload: UploadFilePayload): Promise<UploadFileResponse>;
```

**Parameters**
- `payload`: An object of type `UploadFilePayload` with the following properties:
 
- | Key       | Type | Description |
  |-----------| --- | --- |
  | file      | File | Object containing the file buffer, original name, and mimetype.|
  | sessionId | string | Session ID to link multiple files to a job.|
  | metadata  | any |  JSON object or JSON array of objects containing metadata fields for a given remote file.|

**Returns**
- A Promise that resolves to an object of type `UploadFileResponse` with the following properties:
- | Key       | Type | Description |
  |-----------| --- | --- |
  | id        | string | File ID |
  | name      | string | File name |
  | mimetype  | string | File mimetype |
  | size      | number | File size |
  | metadata  | any | File metadata |

# Contributing

Contributions to improve this library are welcome. Please feel free to fork the repository, make your changes, and submit a pull request for review.

# License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/tagshelfsrl/dotnet-alfred-api-wrapper/blob/feature/AL-887/LICENSE) file for details.
