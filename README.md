# alfred-node

TypeScript/Node library for seamless integration with Alfred's Intelligent Process Automation platform.

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
