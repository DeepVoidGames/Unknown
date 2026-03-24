const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const SECRET_KEY = import.meta.env.VITE_GAME_SECRET || "love-u-rick-<3";

export async function generateHMAC(
  message: string,
  secret: string,
): Promise<string> {
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

export function getUUID(): string {
  let uuid = localStorage.getItem("rick-morty-player-id");
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem("rick-morty-player-id", uuid);
  }
  return uuid;
}

export async function cloudSave(gameState: any) {
  const uuid = getUUID();
  const nickname = gameState.nickname || "Rick";
  const stateString = JSON.stringify(gameState);
  const signature = await generateHMAC(stateString, SECRET_KEY);

  try {
    const response = await fetch(`${API_URL}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: uuid,
        nickname: nickname,
        game_state: gameState,
        signature: signature,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Cloud save failed:", error);
    return { success: false, message: "Server offline" };
  }
}

export async function cloudLoad() {
  const uuid = getUUID();
  try {
    const response = await fetch(`${API_URL}/load?id=${uuid}`);
    if (response.status === 404) return { success: true, data: null }; // Not found is a success, but no data
    if (!response.ok) return { success: false, message: "Server error" };

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Cloud load failed:", error);
    return { success: false, message: "Server offline" };
  }
}
