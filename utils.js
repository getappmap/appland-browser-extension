function showXHRError(req, msg) {
  console.log(msg);
  console.log(`status: ${req.status}`);
  console.log(req.response);
  alert(msg);
}

// Get the URL show in the active tab of the current window.
async function getTabUrl() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const url = new URL(tabs[0].url);
      const windowId = tabs[0].windowId;
      resolve({url, windowId});
    });
  });
}
                     
