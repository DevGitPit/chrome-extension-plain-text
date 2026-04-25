
import { formatFileName, composeText } from "./utils.js";

// DOWNLOAD TEXT
function downloadText(filename, text) {
  if (isWindows()) {
    text = text.replace(/\r?\n/g, "\r\n");
  }
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

//OS
function isWindows() {
  if (window && window.navigator && window.navigator.userAgent) {
    return window.navigator.userAgent.toLowerCase().indexOf("windows") != -1;
  }
  return false;
}

// EVENTS
function addOnClick(id, fn) {
  let el = document.getElementById(id);
  el.onclick = fn;
}

let params = (new URL(document.location)).searchParams;
let title = params.get("t");
let url = params.get("u");
let txt = params.get("tx");
let allText = composeText(title, url, txt);
let body = document.getElementById('chrome-extension-plain-text-body');
let infoBox = document.getElementById('info-box');

function highlightText(text) {
    const lines = text.split('\n');
    // A valid line must end with . ! or ? optionally followed by closing quotes or brackets
    const validEndingRegex = /[.!?]['"”’\)\]}]*$/;
    
    const processedLines = lines.map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.length > 0) {
            if (!validEndingRegex.test(trimmedLine)) {
                return `<span class="highlight">${line}</span>`;
            }
        }
        return line;
    });
    return processedLines.join('<br>');
}

body.innerHTML = highlightText(allText);
let zoomValue = 1;

addOnClick('zoom-in', function (e) {
  e.preventDefault();
  zoomValue *= 1.1
  body.style.setProperty('zoom', zoomValue);
});

addOnClick('zoom-out', function (e) {
  e.preventDefault();
  zoomValue *= 0.9
  body.style.setProperty('zoom', zoomValue);
});

addOnClick('delete', function (e) {
  e.preventDefault();
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    if (body.contains(range.startContainer) && body.contains(range.endContainer)) {
      selection.deleteFromDocument();
    }
  }
});

addOnClick('copy', function (e) {
  e.preventDefault();
  navigator.clipboard.writeText(body.innerText)
});

addOnClick('download', function (e) {
  e.preventDefault();
  downloadText(formatFileName(title), body.innerText);
});

body.addEventListener('click', () => {
  if (body.contentEditable !== 'true') {
    body.contentEditable = 'true';
    body.focus();
  }
});

body.addEventListener('blur', () => {
  body.contentEditable = 'false';
});

let isSending = false;

document.addEventListener("visibilitychange", function() {
  if (document.visibilityState === 'hidden' && isSending) {
    window.close();
  }
});

addOnClick('supertonic', function (e) {
  e.preventDefault();
  let textToSend = body.innerText.trim();
  if (!textToSend) return;

  isSending = true;

  const encodedText = encodeURIComponent(textToSend);
  const intentUri = `intent://send?text=${encodedText}#Intent;scheme=supertonic;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.android.intent.extra.TEXT=${encodedText};S.browser_fallback_url=https%3A%2F%2Fgithub.com%2F;end`;
  
  const link = document.createElement('a');
  link.href = intentUri;
  link.click();
});