
window.addEventListener('load', () => {
  if (!document.getElementById('m-page-loader')) return;

  const fs = require('fs');
  const path = require('path');

  const runtimeGetURL = chrome.runtime.getURL;
  chrome.runtime.getURL = (path, modId) => {
    if (modId) path = modId + path;
    return runtimeGetURL(path);
  };

  const mods = [
    { id: 'eta', scripts: ["Melvor ETA.user.js"], styles: [] }
  ];
  
  for (const mod of mods) {
    for (const script of mod.scripts) {
      const filePath = path.join('Mods', mod.id, script);
      fs.readFile(filePath, 'utf8', (err, content) => {
        const scriptEl = document.createElement('script');
        scriptEl.innerHTML = `(() => { ${content} })();`;
        document.body.appendChild(scriptEl);
      });
    }
    for (const style of mod.styles) {
      const filePath = path.join('Mods', mod.id, style);
      const linkEl = document.createElement('link');
      linkEl.rel = 'stylesheet';
      linkEl.href = chrome.runtime.getURL(filePath);
      document.head.appendChild(linkEl);
    }
  }
});