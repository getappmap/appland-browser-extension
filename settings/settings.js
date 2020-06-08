import Options from "/options.js";

const settingsForm = document.querySelector('#settings');
const applandUrlInput = document.querySelector('#appland_url');
const useCurrentButton = document.querySelector('#use_current');
const useAlternateButton = document.querySelector('#use_alternate');
const alternateUrlInput = document.querySelector('#alternate_url');
const saveButton = document.querySelector('#save');
const saveErrorsInput = document.querySelector('#save_errors');
const errorsLink = document.querySelector('#errors_link');

const options = new Options();

function setAlternateRadio(value) {
  if (value === 'current') {
    useCurrentButton.checked = true;
  }
  else if (value === 'alternate') {
    useAlternateButton.checked = true;
  }
}

document.addEventListener('DOMContentLoaded', onLoad);
alternateUrlInput.addEventListener('focus', () => {
  setAlternateRadio('alternate');
  alternateUrlInput.required = true;
});

useAlternateButton.addEventListener('change', () => {
  alternateUrlInput.required = true;
});
                                 
useCurrentButton.addEventListener('change', () => {
  alternateUrlInput.required = false;
});

settingsForm.addEventListener('input', () => {
  saveButton.disabled = false;
});

settingsForm.addEventListener('submit', onSubmit);
async function onSubmit(e) {
  e.preventDefault();
  if (saveButton.disabled) {
    return;
  }

  saveButton.disabled = true;
  const applandUrl = applandUrlInput.value;
  const useCurrent = useCurrentButton.checked;
  const alternateUrl = alternateUrlInput.value;
  await Promise.all([options.setUseCurrent(useCurrent),
                     options.setAppLandUrl(applandUrl),
                     options.setAlternateUrl(alternateUrl)]);
}

async function onLoad(e) {
  const useCurrent = options.getUseCurrent();
  setAlternateRadio(useCurrent? 'current' : 'alternate');
  
  applandUrlInput.value = await options.getAppLandUrl();
  applandUrlInput.placeholder = options.defaultAppLandUrl();
  
  const alternateUrl = await options.getAlternateUrl();
  alternateUrlInput.value = await options.getAlternateUrl();

  const saveErrors = await options.getSaveErrors();
  saveErrorsInput.checked = saveErrors;
  if (saveErrors) {
    errorsLink.href = "/errors/errors.html";
  }
}
