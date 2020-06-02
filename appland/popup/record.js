const statusElement = document.querySelector('.status');
const recordButton = document.querySelector('#appmap-record');
const recordButtonGraphic = document.querySelector('.appmap-record-button');
const urlInput = document.querySelector("#appland-url");
const header = document.querySelector('.header');

const colorReady = '#FF07AA';
const colorDisabled = '#350020';

let ellipsisTimeoutId = -1;

document.addEventListener('DOMContentLoaded', onLoad);
header.addEventListener('click', onHeaderClick);
recordButton.addEventListener('change', (e) => {
  e.target.checked ? startRecording() : stopRecording()
});

urlInput.addEventListener('change', (e) => {
  saveApplandUrl(e.target.value);
});

async function onHeaderClick() {
  const url = await getApplandUrl();
  if (isUrlValid(url)) {
    window.open(url, '_blank');
  }
  else {
    alert(`${url} is not a valid URL`);
  }
}

function getTabUrl(callback) {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const url = new URL(tabs[0].url);
    callback(url, tabs[0].windowId);
  });
}

function startRecording() {
  getTabUrl((url) => {
    const req = new XMLHttpRequest();
    req.open('POST', `${url.origin}/_appmap/record`);
    req.onload = () => {
      if (req.status === 200) {
        displayRecording(true);
      }
      else {
        showXHRError(req, `Failed to start recording`);
      }
    };
    req.send();
  });
}

function stopRecording() {
  getTabUrl((url, windowId) => {
    chrome.tabs.create({
      url: `/popup/save.html?url=${url.origin}`,
      windowId: windowId
    }, () => {
      displayRecording(false)
    });
  });
}

function setEnabled(enabled) {
  recordButtonGraphic.style.background = enabled ? colorReady : colorDisabled;
  recordButton.disabled = !enabled;

  const cursor = enabled ? 'pointer' : 'default';
  recordButton.style.cursor = cursor;
  recordButtonGraphic.style.cursor = cursor;
}
function setStatus(status, enabled) {
  statusElement.innerHTML = status;
}

function animateEllipsis(isAnimating, numEllipsis) {
  if (!isAnimating) {
    if (ellipsisTimeoutId >= 0) {
      clearTimeout(ellipsisTimeoutId);
      ellipsisTimeoutId = -1;
    }
    return;
  }

  ellipsisTimeoutId = setTimeout(() => {
    let n = numEllipsis;
    if (!n || n > 3) {
      n = 0;
    }
    
    let text = statusElement.innerText.replace(/\./g, '');
    for (let i = 0; i < n; ++i) {
      text += '.';
    }

    statusElement.innerText = text;

    animateEllipsis(true, n + 1);
  }, 250);
}

function displayRecording(isRecording) {
  recordButton.checked = isRecording;
  statusElement.innerText = isRecording ? 'Recording' : 'Ready';
  animateEllipsis(isRecording);
}

async function onLoad() {
  setStatus('Preparing');
  setEnabled(false);

  urlInput.value = await getApplandUrl();

  getTabUrl((url) => {
    const req = new XMLHttpRequest();
    req.open('GET', `${url.origin}/_appmap/record`);
    req.onload = () => {
      if (req.status === 200) {
        const recordingState = JSON.parse(req.response);
        displayRecording(recordingState.enabled);
        setEnabled(true);
      } else {
        setStatus('Not available for this domain');
      }
    };
    req.send();
  });
}

function isUrlValid(url) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    // fall through;
  }
  return false;
}

