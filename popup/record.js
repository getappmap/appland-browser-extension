import Options from "/options.js";

const statusElement = document.querySelector('.status');
const recordButton = document.querySelector('#appmap-record');
const recordButtonGraphic = document.querySelector('.appmap-record-button');
const header = document.querySelector('.header');

const colorReady = '#FF07AA';
const colorDisabled = '#350020';

let ellipsisTimeoutId = -1;

const options = new Options();

document.addEventListener('DOMContentLoaded', onLoad);
header.addEventListener('click', onHeaderClick);
recordButton.addEventListener('change', (e) => {
  e.target.checked ? startRecording() : stopRecording()
});

async function onHeaderClick() {
  options.getAppLandUrl().then((url) => {
    if (isUrlValid(url)) {
      window.open(url, '_blank');
    }
    else {
      alert(`${url} is not a valid URL`);
    }
  });
}

async function getTarget() {
  return options.getUseCurrent().then((useCurrent) => {
    if (useCurrent) {
      return getTabUrl();
    }

    return options.getAlternateUrl().then((url) => {
      return {url: new URL(url)};
    });
  });
}

function startRecording() {
  getTarget().then((target) => {
    const req = new XMLHttpRequest();
    req.open('POST', `${target.url.origin}/_appmap/record`);
    req.onload = () => {
      if (req.status === 200) {
        displayRecording(true);
      }
      else {
        showXHRError(req, 'Failed to start recording');
      }
    };
    req.send();
  });
}

async function stopRecording() {
  getTarget().then((target) => {
    chrome.tabs.create({
      url: `/popup/save.html?url=${target.url.origin}`,
      windowId: target.windowId
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
function setStatus(status) {
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
  setStatus(isRecording ? 'Recording' : 'Ready');
  animateEllipsis(isRecording);
}

async function onLoad() {
  setEnabled(false);

  getTarget().then((target) => {
    const req = new XMLHttpRequest();
    req.open('GET', `${target.url.origin}/_appmap/record`);
    req.onload = () => {
      if (req.status === 200) {
        const recordingState = JSON.parse(req.response);
        displayRecording(recordingState.enabled);
        setEnabled(true);
      } else {
        showXHRError(req, 'Failed checking recording status');
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

