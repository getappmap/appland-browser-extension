import Options from "/options/options.js";

export async function showXHRError(req, msg) {
  const entry = {
    ts: new Date().toISOString(),
    url: req.responseURL,
    msg: msg,
    status: req.status
  };
  // Only record the response for a server error. Other errors
  // (e.g. 404) won't have interesting content and just take up
  // space.
  if (req.status >= 500) {
    entry.resp =  req.responseText;
  }
          
  return new Options().getSaveErrors()
    .then((saveErrors) => {
      const emptyLog = {idx: 0, entries: []};
      if (!saveErrors) {
        return Promise.resolve(emptyLog);
      }
      
      return readFromStorage('log').then((log) => {
        if (typeof log === 'undefined') {
          log = emptyLog;
        }

        log.entries[log.idx++ % 100] = entry ;
        return writeToStorage('log', log);
      });
    })
    .finally(() => alert(msg));
}

export async function readFromStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      if (!chrome.runtime.lastError) {
        resolve(result[key]);
      }
      else {
        reject(Error(chrome.runtime.lastError.message));
      }
    });
  });
};

export async function writeToStorage(key, value) {
  let entry = {[key.toString()]: value};
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(entry, () => {
      if (!chrome.runtime.lastError) {
        resolve(value);
      }
      else {
        reject(Error(chrome.runtime.lastError.message));
      }
    });
  });
};

export async function deleteFromStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, () => {
      if (!chrome.runtime.lastError) {
        resolve();
      }
      else {
        reject(Error(chrome.runtime.lastError.message));
      }
    });
  });
}

export function showInternalError(error) {
  // Something went really wrong
  console.error(error);
  alert(error.message);
}

export function showInternalWarning(error) {
  // Something went wrong, but it wasn't serious enough to alert the
  // user.
  console.warn(error);
}
