const list = document.getElementById("list");
const q = document.getElementById("q");

async function load() {
  const res = await fetch("/api/items?q=" + encodeURIComponent(q.value));
  const items = await res.json();
  list.innerHTML = items.map((item) => `
    <article>
      <div>
        <a href="${item.url}" target="_blank" rel="noreferrer">${item.title}</a>
        <p>${item.url}</p>
        <p class="tags">${(item.tags || []).map((t) => `<span>${t}</span>`).join("")}</p>
      </div>
      <button data-id="${item.id}" type="button">Remove</button>
    </article>
  `).join("") || "<p class='muted'>Nothing saved yet.</p>";
}

document.getElementById("add").addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  event.target.reset();
  load();
});

list.addEventListener("click", async (event) => {
  const id = event.target.dataset.id;
  if (!id) return;
  await fetch("/api/items/" + id, { method: "DELETE" });
  load();
});

q.addEventListener("input", load);
load();
