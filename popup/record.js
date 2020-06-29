import Options from "/options/options.js";
import * as utils from '/utils.js';

const statusElement = document.querySelector('.status');
const recordBtn = document.querySelector('#appmap-record');
const recordBtnGraphic = document.querySelector('.appmap-record-button');
const header = document.querySelector('.header');
const targetUrlForm = document.querySelector('#target_form');
const targetUrlIn = document.querySelector('#target_url');
const targetCancelBtn = document.querySelector('#cancel');

const colorReady = '#FF07AA';
const colorDisabled = '#350020';

let ellipsisTimeoutId = -1;

const options = new Options();

// Call `onLoad` once our page (i.e. /popup/record.html) finishes
// rendering.
//
// Note that there are two different contexts in which the
// page can be loaded:
//
//   * as the popup over the button on the toolbar. In this case,
//     the target server will be based on the active tab.
//
//   * by being visited directly, when testing. In this case, the page
//     is loaded into the active tab. The target server can't be
//     inferred, so the tests set it explicitly.
//
document.addEventListener('DOMContentLoaded', onLoad);

// `underTest` is true if we're testing the page, false otherwise.
let underTest = false;

// `getTabInfo` is the function to call to get the URL that should be
// used as the basis for selecting a recording target. It also returns
// the id of the window in which it's loaded. It's set in `onLoad`
// below, once we determine whether we're under test.
let getTabInfo = null;

header.addEventListener('click', onHeaderClick);
recordBtn.addEventListener('change', (e) => {
  const action  = e.target.checked ? startRecording : stopRecording;
  action().then(() => !underTest? window.close() : null);
});

async function onLoad() {
  console.log("onLoad");
  setEnabled(false);

  // document.documentURI isn't available before loading, so it must
  // be set here.
  const docUrl = new URL(document.documentURI);

  // The presence of the query parameter `t` indicates we're testing
  // the popup. The browser doesn't offer a way to tell if the page is
  // opened as a popup, or if it's being visited directly.
  underTest = docUrl.search === '?t=true';

  const docInfo = () => Promise.resolve({url: docUrl});

  // If we're not under test, we want to query the current tab to
  // determine the URL of interest. Otherwise, we'll use the URL of
  // the current document. Note that, when testing, we don't need the
  // id of the current window, so `docInfo` doesn't attempt to
  // determine it.
  //
  // This approach means that we're not testing querying the active
  // tab, but that's a limitation we're stuck with.
  getTabInfo = !underTest? queryActiveTab : docInfo;
  
  getRecordingTarget()
    .then((target) => {
      targetUrlIn.value = target.url;
      options.getShowTarget().then(setTargetVisible);
      
      const targetUrl = target.url;
      targetUrlIn.value = targetUrl;
      if (targetUrl.origin === 'null') {
        setStatus('No target for this tab');
        return;
      }
      else if (!targetUrl.protocol || !targetUrl.protocol.match('https*:')) {
        setStatus('Only available for web sites');
        return;
      }
      
      const req = new XMLHttpRequest();
      req.open('GET', `${targetUrl.origin}/_appmap/record`);
      req.onload = () => {
        if (req.status === 200) {
          const recordingState = JSON.parse(req.response);
          displayRecording(recordingState.enabled);
          setEnabled(true);
        } else {
          utils.showXHRError(req, 'Does not support AppLand recording');
          setStatus('Does not support AppLand recording');
        }
      };
      req.onerror = () => {
        utils.showXHRError(req, 'Network error checking recording status');
        setStatus('Network error');
      };
      
      req.send();
    })
    .catch((error) => {
      handleInternalError(error);
    });
}

function handleInternalError(error) {
  utils.showInternalError(error);
  setEnabled(false);
  displayRecording(false);
  setStatus('Internal error');
}

targetUrlForm.addEventListener('submit', (e) => {
  // The browser strips off the query string when submitting, so set
  // the hidden param instead.
  e.target.querySelector('#t').value = underTest;
  
  const targetUrl = targetUrlIn.value;
  setRecordingTarget(targetUrl)
    .then(getRecordingTarget)
    .then((newTarget) => 
      targetUrlIn.value = newTarget.url
    )
    .catch((error) => {
      handleInternalError(error);
    });
});

targetCancelBtn.addEventListener('click', (e) => {
  e.preventDefault();

  getRecordingTarget()
    .then((target) => targetUrlIn.value = target.url);
  
  return false;
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

async function getRecordingTarget() {
  
  return getTabInfo()
    .then((info) => {
      const url = info.url;
      const origin = new URL(url).origin;
      const windowId = info.windowId;

      // If the tab's origin is not "opaque" (i.e. not a page internal
      // to the browser), use it to try to map to a target.  If it is
      // opaque, use the full URL instead.
      if (origin !== 'null') {
        return options.getTargetUrl(origin)
          .then((targetUrl) => ({
            url: new URL(targetUrl || origin),
            windowId: windowId
          }));
      }
      
      return options.getTargetUrl(url)
          .then((targetUrl) => ({
            url: new URL(targetUrl || url),
            windowId: windowId
          }));
    });
}

async function setRecordingTarget(newTarget) {
  return getTabInfo()
    .then((info) => {
      const url = info.url;
      const origin = new URL(url).origin;
      const newOrigin = newTarget? new URL(newTarget).origin : '';
      
      if (origin !== 'null') {
        return options.setTargetUrl(origin, newOrigin);
      }

      return options.setTargetUrl(url, newOrigin);
    });
}
          
async function startRecording() {
  return getRecordingTarget()
    .then((target) => {
      return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.open('POST', `${target.url.origin}/_appmap/record`);
        req.onload = () => {
          if (req.status === 200) {
            displayRecording(true);
            resolve();
          }
          else {
            utils.showXHRError(req, 'Failed to start recording')
              .then(resolve);
          }
        };
        req.send();
      });
    })
    .catch((error) => {
      handleInternalError(error);
    });
}

async function stopRecording() {
  return getRecordingTarget()
    .then((target) => {
      return new Promise((resolve, reject) => {
        chrome.tabs.create({
          url: `/popup/save.html?url=${target.url.origin}`,
          windowId: target.windowId
        }, () => {
          displayRecording(false);
          resolve();
        });
      });
    })
    .catch((error) => {
      handleInternalError(error);
    });
}

function setEnabled(enabled) {
  recordBtnGraphic.style.background = enabled ? colorReady : colorDisabled;
  recordBtn.disabled = !enabled;

  const cursor = enabled ? 'pointer' : 'default';
  recordBtn.style.cursor = cursor;
  recordBtnGraphic.style.cursor = cursor;
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
  recordBtn.checked = isRecording;
  targetUrlIn.disabled = isRecording;
  setStatus(isRecording ? 'Recording' : 'Ready');
  animateEllipsis(isRecording);
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

function setTargetVisible(visible) {
  targetUrlForm.classList.toggle('hidden', !visible);
}

// Return the URL and windowId for the active tab once it's fully
// loaded.
async function queryActiveTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab.status === 'complete') {
        resolve({
          url: activeTab.url,
          windowId: activeTab.windowId
        });
        return;
      }

      const waitForUpdate = (id, changes, info) => {
        if (info.status === 'complete') {
          resolve({
            url: info.url,
            windowId: info.windowId
          });
        }
      };
      const filter = {
        tabId: tabs[0].id,
        properties: ['status']
      };
      chrome.tabs.onUpdated.addListener(waitForUpdate, filter);
    });
  });
}
