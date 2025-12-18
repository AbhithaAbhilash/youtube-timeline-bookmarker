const bookmarkBtn = document.getElementById("bookmarkBtn");
const noteInput = document.getElementById("note");
const list = document.getElementById("bookmarkList");

bookmarkBtn.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { type: "GET_TIME" }, (response) => {
    if (!response) {
      alert("Play a YouTube video first!");
      return;
    }

    const time = response.time;
    const videoId = new URL(tab.url).searchParams.get("v");
    const bookmarkUrl = `${tab.url}&t=${time}s`;

    chrome.storage.local.get([videoId], (result) => {
      const bookmarks = result[videoId] || [];

      bookmarks.push({
        time,
        note: noteInput.value || "No note",
        url: bookmarkUrl
      });

      chrome.storage.local.set({ [videoId]: bookmarks }, loadBookmarks);
      noteInput.value = "";
    });
  });
});

function loadBookmarks() {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab.url.includes("youtube.com/watch")) return;

    const videoId = new URL(tab.url).searchParams.get("v");

    chrome.storage.local.get([videoId], (result) => {
      list.innerHTML = "";
      const bookmarks = result[videoId] || [];

      bookmarks.forEach((bm, index) => {
        const li = document.createElement("li");

        const link = document.createElement("a");
        link.href = bm.url;
        link.target = "_blank";
        link.textContent = `${formatTime(bm.time)} — ${bm.note}`;

        // ✏️ Edit button
        const editBtn = document.createElement("button");
        editBtn.textContent = "✏️";
        editBtn.onclick = () => {
          const newNote = prompt("Edit note:", bm.note);
          if (newNote !== null) {
            bookmarks[index].note = newNote || "No note";
            chrome.storage.local.set({ [videoId]: bookmarks }, loadBookmarks);
          }
        };

        // ❌ Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.onclick = () => {
          bookmarks.splice(index, 1);
          chrome.storage.local.set({ [videoId]: bookmarks }, loadBookmarks);
        };

        li.appendChild(link);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        list.appendChild(li);
      });
    });
  });
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

loadBookmarks();
