import Options from "/options/options.js";

const settingsForm = document.querySelector('#settings');
const applandUrlInput = document.querySelector('#appland_url');
const showTargetCB = document.querySelector('#show_target');
const saveButton = document.querySelector('#save');
const saveErrorsCB = document.querySelector('#save_errors');
const errorsLink = document.querySelector('#errors_link');

const options = new Options();

document.addEventListener('DOMContentLoaded', onLoad);

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
  const savedApplandUrl = options.setAppLandUrl(applandUrlInput.value);
  const savedShowTarget = options.setShowTarget(showTargetCB.checked);
  const savedSaveErrors = options.setSaveErrors(saveErrorsCB.checked);
  const onceAllSaved = Promise.all([savedApplandUrl, savedShowTarget, savedSaveErrors]);
  onceAllSaved.then(() => {
    saveButton.innerText = 'Settings saved';
    setTimeout(() => {
      saveButton.innerText = 'Save';
    },
    1000);
  });
  
}

async function onLoad(e) {
  options.getAppLandUrl().then((url) =>
    applandUrlInput.value = url
  );
  applandUrlInput.placeholder = options.defaultAppLandUrl();
  
  options.getShowTarget().then((showTarget) => 
    showTargetCB.checked = showTarget
  );
    
  options.getSaveErrors().then((saveErrors) => {
    saveErrorsCB.checked = saveErrors;
  });
}
