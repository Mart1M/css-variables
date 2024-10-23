import "./style.css";

// get the current theme from the URL
const searchParams = new URLSearchParams(window.location.search);
document.body.dataset.theme = searchParams.get("theme") ?? "light";

const colorList = document.getElementById('color-list');

document.querySelector("[data-handler='get-colors']")?.addEventListener("click", () => {
  // send message to plugin.ts
  window.parent.postMessage("get-colors", "*");
});

// Listen plugin.ts messages
window.addEventListener("message", (event) => {
  const data = event.data;
  if (data.source === "penpot" && data.type === "themechange") {
    document.body.dataset.theme = data.theme;
  } else if (data.type === "colors") {
    displayColors(data.cssVariables);
  } else if (data.type === "error") {
    displayError(data.message);
  }
});

function displayColors(cssVariables: string[]) {
  if (colorList) {
    const cssContent = cssVariables.join('\n');
    colorList.innerHTML = `
      <div class="css-variables-container">
        <button id="copy-button" data-appearance="secondary">Copy</button>
        <textarea class="input" id="css-variables" readonly>${cssContent}</textarea>
      </div>
    `;

    const copyButton = document.getElementById('copy-button');
    const textarea = document.getElementById('css-variables') as HTMLTextAreaElement;
    
    copyButton?.addEventListener('click', () => {
      textarea.select();
      copyToClipboard(textarea.value);
    });

    // Adjust textarea height to fit content
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}

function copyToClipboard(text: string) {
  // Try to use the Clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      updateCopyButton('Copied!');
    }).catch(() => {
      // If Clipboard API fails, fall back to execCommand
      fallbackCopyTextToClipboard(text);
    });
  } else {
    // If Clipboard API is not available, use execCommand
    fallbackCopyTextToClipboard(text);
  }
}

function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      updateCopyButton('Copied!');
    } else {
      updateCopyButton('Copy failed');
    }
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
    updateCopyButton('Copy failed');
  }

  document.body.removeChild(textArea);
}

function updateCopyButton(text: string) {
  const copyButton = document.getElementById('copy-button');
  if (copyButton) {
    copyButton.textContent = text;
    setTimeout(() => {
      copyButton.textContent = 'Copy';
    }, 2000);
  }
}

function displayError(message: string) {
  if (colorList) {
    colorList.innerHTML = `<p class="penpot-text-error">${message}</p>`;
  }
}
