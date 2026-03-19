const crypto = require("node:crypto");

async function generateHMAC(message, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, msgData);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const secret = "love-u-rick-<3";
const gameState = { seeds: 10 };
const stateString = JSON.stringify(gameState);
generateHMAC(stateString, secret).then(sig => {
  console.log("String:", stateString);
  console.log("Sig:", sig);
});
