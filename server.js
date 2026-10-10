import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(root, "shelf.json");
const app = express();
app.use(express.json());
app.use(express.static(path.join(root, "public")));

function load() {
  if (!fs.existsSync(dbPath)) return [];
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}
function save(items) {
  fs.writeFileSync(dbPath, JSON.stringify(items, null, 2));
}

app.get("/api/items", (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const items = load().filter((item) => {
    if (!q) return true;
    return [item.title, item.url, ...(item.tags || [])].join(" ").toLowerCase().includes(q);
  });
  res.json(items);
});

app.post("/api/items", (req, res) => {
  const title = String(req.body.title || "").trim();
  const url = String(req.body.url || "").trim();
  const tags = String(req.body.tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (!title || !url) return res.status(400).json({ error: "title and url are required" });
  const items = load();
  const item = { id: Date.now().toString(36), title, url, tags, created: new Date().toISOString() };
  items.unshift(item);
  save(items);
  res.status(201).json(item);
});

app.delete("/api/items/:id", (req, res) => {
  const items = load().filter((item) => item.id !== req.params.id);
  save(items);
  res.json({ ok: true });
});

const port = process.env.PORT || 8100;
app.listen(port, () => console.log(`http://127.0.0.1:${port}`));
