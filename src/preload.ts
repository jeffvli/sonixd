const { remote } = require('electron');

const win = remote.getCurrentWindow(); /* Note this is different to the
html global `window` variable */

window.onbeforeunload = () => {
  /* If window is reloaded, remove win event listeners
    (DOM element listeners get auto garbage collected but not
    Electron win listeners as the win is not dereferenced unless closed) */
  win.removeAllListeners();
};

function handleWindowControls() {
  // Make minimise/maximise/restore/close buttons work when they are clicked
  document.getElementById('min-button')?.addEventListener('click', () => {
    win.minimize();
  });

  document.getElementById('max-button')?.addEventListener('click', () => {
    win.maximize();
  });

  document.getElementById('restore-button')?.addEventListener('click', () => {
    win.unmaximize();
  });

  document.getElementById('close-button')?.addEventListener('click', () => {
    win.close();
  });

  function toggleMaxRestoreButtons() {
    if (win.isMaximized()) {
      document.body.classList.add('maximized');
    } else {
      document.body.classList.remove('maximized');
    }
  }

  // Toggle maximise/restore buttons when maximisation/unmaximisation occurs
  toggleMaxRestoreButtons();
  win.on('maximize', toggleMaxRestoreButtons);
  win.on('unmaximize', toggleMaxRestoreButtons);
}

// When document has loaded, initialise
document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    handleWindowControls();
  }
};
