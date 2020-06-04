export default function Options() {
  function readFromStorage(key) {
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

  function writeToStorage(key, value) {
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
    })
  };

  this.defaultAppLandUrl = () => chrome.runtime.getManifest().homepage_url;
  const applandUrlKey = 'applandUrl';
  this.getAppLandUrl = async function() {
    return readFromStorage(applandUrlKey).then((value) => {
      if (value) {
        return value;
      }
      
      const url = this.defaultAppLandUrl();
      return this.setAppLandUrl(url);
    });
  };
  this.setAppLandUrl = async function(url) {
    return writeToStorage(applandUrlKey, url);
  };
  

  const useCurrentKey = 'useCurrent';
  this.getUseCurrent = async function() {
    return readFromStorage(useCurrentKey).then((value) => {
      if (typeof value !== 'undefined') {
        return value;
      }
      
      return this.setUseCurrent(true);
    });
  };
  this.setUseCurrent = async function(useCurrent) {
    return writeToStorage(useCurrentKey, useCurrent);
  }
  
  const alternateUrlKey = 'alternateUrl';
  this.getAlternateUrl = async function() {
    return readFromStorage(alternateUrlKey).then((url) => {
      if (typeof url !== 'undefined') {
        return url;
      }

      return this.setAlternateUrl('');
    });
  };
  this.setAlternateUrl = async function(url) {
    return writeToStorage(alternateUrlKey, url);
  };
};
