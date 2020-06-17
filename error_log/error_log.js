import * as utils from '/utils.js';
const errorsDiv = document.querySelector('#errors');
const newestFirstBtn = document.querySelector('#newest_first');
const oldestFirstBtn = document.querySelector('#oldest_first');
const showAllCb = document.querySelector('#show_all');
const reloadBtn = document.querySelector('#reload');
const deleteAllBtn = document.querySelector('#delete_all');

document.addEventListener('DOMContentLoaded', onLoad);
newestFirstBtn.addEventListener('change', reload);
oldestFirstBtn.addEventListener('change', reload);

showAllCb.addEventListener('click', (e) => {
  document.querySelectorAll('details').forEach((e) => {
    e.open = showAllCb.checked;
  });
});
reloadBtn.addEventListener('click', reload);

deleteAllBtn.addEventListener('click', (e) => {
  if (confirm('Delete all log entries?')) {
    deleteErrors().then(reload);
  }
});

async function reload() {
  const all_errors = document.querySelector('#all_errors');
  if (all_errors) {
    all_errors.remove();
  }
  showErrors();
}

async function onLoad(e) {
  showErrors();
}

async function getErrors() {
  return utils.readFromStorage('log').then((log) => 
    typeof log !== 'undefined'?
      log.entries                                 
      : []
    );
}

async function deleteErrors() {
  return utils.deleteFromStorage('log');
}


async function showErrors() {
  const compare = (e1, e2) => {
    if (e1.ts < e2.ts) {
      return -1;
    }
    if (e1.ts > e2.ts) {
      return 1;
    }
    return 0;
  };
  const newestFirst = newestFirstBtn.checked;
  
  getErrors().then((entries) => {
    const sorted = entries.sort((e1,e2) => 
      newestFirst? compare(e1,e2) : compare(e2,e1)
    );

    const allErrorsDiv = document.createElement('div');
    allErrorsDiv.id = 'all_errors';
    entries.forEach((entry) => {
      let error = `
<details ${showAllCb.checked? "open" : ""}>
  <summary>
    ${entry.ts} ${entry.msg}
  </summary>    
    <ul>
      <li><span class="error-label">ts:</span> ${entry.ts}</li>
      <li><span class="error-label">url:</span> ${entry.url}</li>
      <li><span class="error-label">status:</span> ${entry.status}</li>
      <li><span class="error-label">msg:</span> ${entry.msg}</li>
`;
      if (entry.resp) {
        error += `<li><span class="error-label">resp:</span> ${entry.resp}</li>\n`;
      }
      error += `
    </ul>
</details>
`;
      
      allErrorsDiv.insertAdjacentHTML('afterbegin', error);
    });
    if (allErrorsDiv.childElementCount === 0) {
      const noErrorsText = document.createTextNode('No errors');
      allErrorsDiv.appendChild(noErrorsText);
    }
    errorsDiv.appendChild(allErrorsDiv);
      
  });
}

