import { AlfredClient } from "./src";
import { Configuration } from "./src";

const client = new AlfredClient(Configuration.v1("staging"), {
  apiKey: "AIzaSyClzfrUzZ818x55FASHvX4Jh5QciR9lv0r",
});

async function main() {
  const resp = await client.sessions.createDeferredSession();
  console.log(resp.sessionId);
}

main();
