const { createClient } = require("redis");

let client = createClient({ url: "redis://localhost:6379" }).on(
  "error",
  (err) => console.log("Redis Client Error", err)
);

if (!client.isReady) {
  (async () => {
    client = await client.connect();
  })();
}

module.exports = client;
