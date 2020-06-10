import Options from "/options/options.js";
import * as utils from '/utils.js';

document.addEventListener('DOMContentLoaded', onLoad, false);

const options = new Options();

function onLoad() {
  const url = (new URL(document.location).searchParams).get('url');
  const req = new XMLHttpRequest();
  req.open('DELETE', `${url}/_appmap/record`);
  req.onload = () => {
    if (req.status === 200) {
      if ( req.response ) {
        saveScenario(JSON.parse(req.response));
      }
    }
    else {
      utils.showXHRError(req, 'Failed saving recording');
    }
  };
  req.send();
}

async function saveScenario(data) {
  const form = document.querySelector('form');
  const applandUrl = await options.getAppLandUrl();
  form.setAttribute('action', `${applandUrl}/scenarios`);
  form.querySelector('input').value = JSON.stringify(data);
  form.submit();
}
