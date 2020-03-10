const statusElement = document.querySelector('.status');
const recordButton = document.querySelector('#appmap-record');
const recordButtonGraphic = document.querySelector('.appmap-record-button');
const urlInput = document.querySelector("#appland-url");
const backendUrlInput = document.querySelector("#backend-url");
const header = document.querySelector('.header');
const browser = (window.chrome || window.browser);
const backendUrlObjectKey = 'backend_urls';

const colorReady = '#da0030';
const colorDisabled = '#350020';

let ellipsisTimeoutId = -1;


function saveApplandUrl(url) {
  browser.storage.local.set({applandUrl: url});
}

function getUrlHostname(urlString) {
  return new URL(urlString).hostname;
}

function getBackendUrl(callbackFn) {
  getTabUrl((urlString) => {
    browser.storage.local.get(backendUrlObjectKey, (data) => {
      const obj = data[backendUrlObjectKey] || {};
      const hostname = getUrlHostname(urlString);
      const currentValue = obj[hostname];
      if (currentValue) {
        callbackFn(currentValue);
        return;
      }

      const origin = new URL(urlString).origin;
      callbackFn(origin);
    });
  });
}

function saveBackendUrl(backendUrlString) {
  getTabUrl((tabUrlString) => {
    browser.storage.local.get(backendUrlObjectKey, (data) => {
      const obj = data || {};
      const tabUrl = new URL(tabUrlString);
      obj[tabUrl.hostname] = backendUrlString;
      browser.storage.local.set({[backendUrlObjectKey]: obj});
    });
  });
}

function getTabUrl(callbackFn) {
  browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const url = new URL(tabs[0].url);
    callbackFn(url);
  });
}

function getAppLandUrl() {
  return urlInput.value;
}

function startRecording() {
  getBackendUrl((url) => {
    const req = new XMLHttpRequest();
    req.open('POST', `${url}/_appmap/record`);
    req.send();
    displayRecording(true);
  });
}

function stopRecording() {
  getBackendUrl((url) => {
    const req = new XMLHttpRequest();
    req.open('DELETE', `${url}/_appmap/record`);
    req.send();
    req.onload = () => {
      if (req.status === 200) {
        if ( req.response ) {
          saveScenario(JSON.parse(req.response));
        }
      }
    };
    displayRecording(false);
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

function saveScenario(data) {
  const url = getAppLandUrl();
  const form = document.createElement("form");
  form.setAttribute("method", "post");
  form.setAttribute("action", `${url}/scenarios`);
  form.setAttribute("target", "_blank");
  var input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'data';
  input.value = JSON.stringify(data);
  form.appendChild(input);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
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
  statusElement.innerText = isRecording ? 'recording' : 'ready';
  animateEllipsis(isRecording);
}

recordButton.addEventListener('change', (e) => {
  e.target.checked ? startRecording() : stopRecording()
});

urlInput.addEventListener('change', (e) => {
  saveApplandUrl(e.target.value);
});

backendUrlInput.addEventListener('change', (e) => {
  saveBackendUrl(e.target.value);
});

function onLoad() {
  setStatus('preparing');
  setEnabled(false);

  browser.storage.local.get('applandUrl', (data) => {
    if (data.applandUrl) {
      urlInput.value = data.applandUrl;
    }
  });

  getBackendUrl((url) => {
    backendUrlInput.value = url;
    const req = new XMLHttpRequest();
    req.open('GET', `${url}/_appmap/record`);
    req.send();
    req.onload = () => {
      if (req.status === 200) {
        const recordingState = JSON.parse(req.response);
        displayRecording(recordingState.enabled);
        setEnabled(true);
      } else {
        setStatus('not available for this domain');
      }
    };
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

document.addEventListener('DOMContentLoaded', onLoad, false);
header.addEventListener('click', (e) => {
  const url = getAppLandUrl();
  if (!isUrlValid(url)) {
    return;
  }

  window.open(url, '_blank');
});