import * as utils from '/utils.js';

export default function Options() {
  this.defaultAppLandUrl = () => chrome.runtime.getManifest().homepage_url;
  const applandUrlKey = 'applandUrl';
  this.getAppLandUrl = async () => 
    utils.readFromStorage(applandUrlKey)
      .then((value) => 
        value?
          value
          : this.setAppLandUrl(this.defaultAppLandUrl())
        );

  this.setAppLandUrl = async (url) => {
    return utils.writeToStorage(applandUrlKey, url);
  };
  

  const showTargetKey = 'showTarget';
  this.getShowTarget = async () => 
    utils.readFromStorage(showTargetKey)
    .then((value) => 
      typeof value !== 'undefined'?
        value
        : this.setShowTarget(false)
      );

  this.setShowTarget = async (showTarget) =>
    utils.writeToStorage(showTargetKey, showTarget);


  const targetUrlsKey = 'targetUrls';
  this.getTargetUrl = async (url) => 
    utils.readFromStorage(targetUrlsKey)
      .then((targetUrls = {}) => targetUrls[url]);

  this.setTargetUrl = async (url, targetUrl) => 
    utils.readFromStorage(targetUrlsKey)
      .then((targetUrls = {}) => {
        targetUrls[url] = targetUrl;
        return utils.writeToStorage(targetUrlsKey, targetUrls);
      });
  this.getAllTargetUrls = async () => utils.readFromStorage(targetUrlsKey);

  const defaultTargetUrlKey = 'defaultTargetUrl';
  const getDefaultTargetUrl = async () => utils.readFromStorage(defaultTargetUrlKey);
  this.setDefaultTargetUrl = async (defaultTarget) => 
    utils.writeToStorage(defaultTargetUrlKey, defaultTarget.origin);

  const saveErrorsKey = 'saveErrors';
  this.getSaveErrors = async () => 
    utils.readFromStorage(saveErrorsKey)
      .then((saveErrors) => 
        typeof saveErrors !== 'undefined'?
          saveErrors
          : utils.writeToStorage(saveErrorsKey, true)
        );                                        

  this.setSaveErrors = async (saveErrors) => 
    utils.writeToStorage(saveErrorsKey, saveErrors);

};
