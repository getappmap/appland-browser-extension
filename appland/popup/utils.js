function showXHRError(req, msg) {
  console.log(msg);
  console.log(`status: ${req.status}`);
  console.log(req.response);
  alert(msg);
}
  

function saveApplandUrl(url) {
  chrome.storage.local.set({applandUrl: url}, () => {
    if (chrome.runtime.lastError) {
      alert(`Failed saving url, ${chrome.runtime.lastError.message}`);
    }
  });
}

async function getApplandUrl() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('applandUrl', (result) => {
      if (!chrome.runtime.lastError) {
        let url = result['applandUrl'];
        if (url) {
          resolve(url);
        }
        else {
          url = chrome.runtime.getManifest().homepage_url;
          chrome.storage.local.set({applandUrl: url}, () => resolve(url));
        }
      }
      else {
        reject(Error(chrome.runtime.lastError.message))
      }
    });
  });
}

