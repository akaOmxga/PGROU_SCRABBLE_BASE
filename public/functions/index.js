const functions = require("firebase-functions");
const admin = require("firebase-admin");
const pako = require("pako");

admin.initializeApp();
const db = admin.firestore();

// Set CORS headers manually
function setCorsHeaders(req, res) {
  res.set("Access-Control-Allow-Origin", "*"); // Allow all origins for local dev
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(204).send(""); // No content
  }
}

// Load compressed DAWG chunks from Firestore
async function fetchDawgChunks() {
  const chunksRef = db.collection("compressed_dawg_chunks");
  const snapshot = await chunksRef.get();

  let chunks = [];
  snapshot.forEach(doc => {
    if (doc.id.startsWith("dawg_chunk_")) {
      chunks[parseInt(doc.id.split("_").pop())] = doc.data().data;
    }
  });

  return chunks.join("");
}

// Decompress and parse the DAWG
function decompressDawg(base64Data) {
  const compressedBytes = Buffer.from(base64Data, "base64");
  const decompressed = pako.inflate(compressedBytes, { to: "string" });
  return JSON.parse(decompressed);
}

// Search for an exact word in the DAWG
function searchWordInDawg(dawg, word, root_id = "root") {
  let current_node = dawg[root_id];
  for (const char of word) {
    if (!current_node.edges || !current_node.edges[char]) {
      return false;
    }
    current_node = dawg[current_node.edges[char]];
  }
  return current_node.final === true;
}

// Search for all words with a given prefix
function prefixSearchInDawg(dawg, prefix, root_id = "root") {
  let current_node = dawg[root_id];
  for (const char of prefix) {
    if (!current_node.edges || !current_node.edges[char]) {
      return [];
    }
    current_node = dawg[current_node.edges[char]];
  }
  return reconstructWordsFromDawg(dawg, current_node, prefix);
}

// Reconstruct all words starting from a node
function reconstructWordsFromDawg(dawg, node, prefix = "", words = []) {
  if (node.final) {
    words.push(prefix);
  }
  if (!node.edges) return words;

  for (const char in node.edges) {
    const nextNode = dawg[node.edges[char]];
    reconstructWordsFromDawg(dawg, nextNode, prefix + char, words);
  }

  return words;
}

// Firebase function: Check exact word
exports.checkWord = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") return;

  const { word } = req.query;
  if (!word) {
    return res.status(400).json({ error: "Missing word parameter" });
  }

  try {
    const chunks = await fetchDawgChunks();
    const dawg = decompressDawg(chunks);
    const exists = searchWordInDawg(dawg, word.toLowerCase());
    return res.json({ exists });
  } catch (error) {
    console.error("Error in checkWord:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Firebase function: Search by word or prefix
exports.search_dictionary = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") return;

  const { word, prefix } = req.query;
  if (!word && !prefix) {
    return res.status(400).json({ error: "Missing 'word' or 'prefix' parameter" });
  }

  try {
    const chunks = await fetchDawgChunks();
    const dawg = decompressDawg(chunks);

    if (prefix) {
      const result = prefixSearchInDawg(dawg, prefix.toLowerCase());
      return res.status(200).json({ prefix, result });
    } else {
      const found = searchWordInDawg(dawg, word.toLowerCase());
      return res.status(200).json({ word, found });
    }
  } catch (error) {
    console.error("Error in search_dictionary:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
