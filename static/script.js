const notesInput = document.getElementById("notes");
const charCount = document.getElementById("charCount");
const generateBtn = document.getElementById("generateBtn");
const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const resultState = document.getElementById("resultState");
const resultText = document.getElementById("resultText");

const sampleNotes = `Artificial Intelligence (AI) is a branch of computer science that focuses on creating systems capable of performing tasks that normally require human intelligence.

Machine Learning (ML) is a subset of AI. It allows computers to learn patterns from data and improve their performance without being explicitly programmed for every task. Common types include supervised learning, unsupervised learning, and reinforcement learning.

Deep Learning is a specialized area of Machine Learning that uses multi-layered artificial neural networks. It is useful for tasks such as image recognition, speech processing, and natural language understanding.

Natural Language Processing (NLP) is a field of AI that helps computers understand, interpret, and generate human language. Applications include chatbots, translation systems, sentiment analysis, and text summarization.`;

notesInput.addEventListener("input", () => {
  charCount.textContent = `${notesInput.value.length.toLocaleString()} / 20,000`;
});

document.getElementById("sampleBtn").addEventListener("click", () => {
  notesInput.value = sampleNotes;
  notesInput.dispatchEvent(new Event("input"));
  notesInput.focus();
});

document.getElementById("clearBtn").addEventListener("click", () => {
  notesInput.value = "";
  notesInput.dispatchEvent(new Event("input"));
  showOnly(emptyState);
  notesInput.focus();
});


let lastResult = "";

function renderResult(text) {
  lastResult = text;
  resultText.textContent = "";
  let list = null;

  const closeList = () => { list = null; };

  text.split("\n").forEach(raw => {
    // remove stray markdown the model may still add
    let line = raw.replace(/\*\*/g, "").replace(/^#+\s*/, "").trim();
    if (!line) { closeList(); return; }

    if (/^(SUMMARY|KEY POINTS|IMPORTANT QUESTIONS)\s*:?$/i.test(line)) {
      closeList();
      const h = document.createElement("h3");
      const name = line.replace(/:$/, "").toLowerCase();
      h.textContent = name.charAt(0).toUpperCase() + name.slice(1);
      resultText.appendChild(h);
      return;
    }

    const bullet = line.match(/^[-*\u2022]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      const type = numbered ? "OL" : "UL";
      if (!list || list.tagName !== type) {
        list = document.createElement(type.toLowerCase());
        resultText.appendChild(list);
      }
      const li = document.createElement("li");
      li.textContent = (bullet || numbered)[1];
      list.appendChild(li);
      return;
    }

    closeList();
    const p = document.createElement("p");
    p.textContent = line;
    resultText.appendChild(p);
  });
}

function showOnly(element) {
  [emptyState, loadingState, errorState, resultState].forEach(item => {
    item.hidden = item !== element;
  });
}

generateBtn.addEventListener("click", generateSummary);

async function generateSummary() {
  const notes = notesInput.value.trim();
  const length = document.getElementById("length").value;

  if (!notes) {
    showOnly(errorState);
    errorState.textContent = "Please paste your study notes first, or click “Use sample notes”.";
    notesInput.focus();
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";
  showOnly(loadingState);

  try {
    const response = await fetch("/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes, length })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong. Please try again.");
    }

    renderResult(data.result);
    showOnly(resultState);
  } catch (error) {
    showOnly(errorState);
    errorState.textContent = error.message || "Could not connect to the server.";
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate summary";
  }
}

document.getElementById("copyBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(lastResult);
    const button = document.getElementById("copyBtn");
    button.textContent = "Copied";
    setTimeout(() => { button.textContent = "Copy result"; }, 1600);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(resultText);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    alert("Select the highlighted text and copy it.");
  }
});