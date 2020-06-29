import Options from "/options/options.js";
const options = new Options();

const settingsForm = document.querySelector('#settings');
const saveBtn = document.querySelector('#save');

function Setting(id) {
  this.id = id;
  this.input = document.querySelector(this.id);
}

function UrlInputSetting(id, get, set, placeholder) {
  Setting.call(this, id);
  this.load = async() => {
    this.input.placeholder = placeholder();
    return get().then((value) => {
      this.input.value = value;
    });
  };
  this.save = async () =>
    set(this.input.value);
}

function CheckboxSetting(id, get, set) {
  Setting.call(this, id);
  this.load = async() => 
    get().then((checked) => {
      this.input.checked = checked;
    });
  this.save = async () => 
    set(this.input.checked);
}

const applandUrl = new UrlInputSetting('#appland_url', options.getAppLandUrl, options.setAppLandUrl, options.defaultAppLandUrl);
const showTarget = new CheckboxSetting('#show_target', options.getShowTarget, options.setShowTarget);
const saveErrors = new CheckboxSetting('#save_errors', options.getSaveErrors, options.setSaveErrors);

const settings = [
  applandUrl,
  showTarget,
  saveErrors
];

document.addEventListener('DOMContentLoaded', onLoad);

settingsForm.addEventListener('input', () => {
  saveBtn.disabled = false;
});

settingsForm.addEventListener('submit', onSubmit);
async function onSubmit(e) {
  e.preventDefault();
  if (saveBtn.disabled) {
    return;
  }

  saveBtn.disabled = true;
    
  Promise.all(
    settings.reduce((acc, setting) => acc + setting.save(), [])
  ).then(() => {
    saveBtn.innerText = 'Settings saved';
    setTimeout(() => {
      saveBtn.innerText = 'Save';
    },
    1000);
  });
  
}

async function onLoad(e) {
  await Promise.all(
    settings.map((setting) => setting.load())
  );
}
