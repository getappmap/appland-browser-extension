import * as utils from '/utils.js';

export default function Options() {

  this.defaultAppLandUrl = () => chrome.runtime.getManifest().homepage_url;
  const applandUrlKey = 'applandUrl';
  this.getAppLandUrl = async function() {
    return utils.readFromStorage(applandUrlKey).then((value) => {
      if (value) {
        return value;
      }
      
      const url = this.defaultAppLandUrl();
      return this.setAppLandUrl(url);
    });
  };
  this.setAppLandUrl = async function(url) {
    return utils.writeToStorage(applandUrlKey, url);
  };
  

  const useCurrentKey = 'useCurrent';
  this.getUseCurrent = async function() {
    return utils.readFromStorage(useCurrentKey).then((value) => {
      if (typeof value !== 'undefined') {
        return value;
      }
      
      return this.setUseCurrent(true);
    });
  };
  this.setUseCurrent = async function(useCurrent) {
    return utils.writeToStorage(useCurrentKey, useCurrent);
  };
  
  const alternateUrlKey = 'alternateUrl';
  this.getAlternateUrl = async function() {
    return utils.readFromStorage(alternateUrlKey).then((url) => {
      if (typeof url !== 'undefined') {
        return url;
      }

      return this.setAlternateUrl('');
    });
  };
  this.setAlternateUrl = async function(url) {
    return utils.writeToStorage(alternateUrlKey, url);
  };

  this.getSaveErrors = async function() {
    return Promise.resolve(true);
  };
};
