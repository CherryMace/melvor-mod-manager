import { pathExists, readFile, readJson, writeFile, writeJson, ensureDir, opendir, emptyDir, copy, remove, readdir, lstat } from 'fs-extra';
import path from 'path';
import { app, BrowserWindow } from 'electron';

import axios from 'axios';
import simpleGit from 'simple-git';
import cheerio from 'cheerio';
import usp from 'userscript-parser';
import { download } from 'electron-dl';
import decompress from 'decompress';

import { isGreasyForkUrl, isGitUrl, ppJson } from './util';
import { mods } from './messageTypes';

export default async (_event, message) => {
  return await handlers[message.type](message);
};

const handlers = {
  [mods.parseFile]: async ({ filePath }) => {
    try {
      const isScriptFile = path.extname(filePath) === '.js';
      const content = await readFile(filePath, 'utf8');
      return isScriptFile ?
        await parseScript(path.parse(filePath).base, content) :
        await parseManifest(content);
    } catch (e) {
      console.error(e);
      return { error: 'Unable to parse the selected file. Make sure it is a valid userscript or WebExtensions extension manifest.' };
    }
  },

  [mods.parseWeb]: async ({ origin, fromBrowser }) => {
    try {
      console.log("Parsing web...");
      ppJson({origin, fromBrowser});
      if (!isWebOrigin(origin) || (!fromBrowser && !isGreasyForkUrl(origin)))
        return { error: 'Only web scripts from GreasyFork are currently supported.' };

      const script = await downloadScript(origin);
      
      if (!script) return { error: 'Unable to retrieve script.' };

      const manifest = await parseScript(script.file, script.content);
      return { manifest: { ...manifest, origin }, content: script.content };
    } catch (e) {
      console.error(e);
      return { error: 'Unable to parse the selected script.' };
    }
  },

  [mods.cloneGit]: async ({ origin, fromBrowser, packageDir }) => {
    try {
      console.log("Cloning git repository...");
      ppJson({origin, fromBrowser, packageDir});
      if (!fromBrowser && !isGitUrl(origin)) {
        ppJson( { origin: origin, fromBrowser: fromBrowser, isURL:isGitUrl(origin) });
        return { error: 'Only github repositories are currently supported.' };
      }

      const gitScript = await downloadGitRepository(origin, packageDir=packageDir);
      if (gitScript.error) return { error: gitScript.error };
      const manifestContent = await readFile(gitScript.manifestPath, 'utf8');
      const parsedManifest = await parseManifest(manifestContent);

      let res = await handlers[mods.add]({
        packageDir,
        origin: gitScript.origin,
        manifest: parsedManifest
      });
      
      ppJson(res);
      return res;
    } catch (e) {
      console.error(e);
      return { error: "Unable to clone repository" };
    }
  },

  [mods.browserInstall]: async ({ packageDir, data }) => {
    console.log("Installing from browser...");
    ppJson({packageDir, data});
    let res;

    if (data.type === 'script') {
      const { manifest, content } = await handlers[mods.parseWeb]({ origin: data.download, fromBrowser: true });
      const browserManifest = { ...manifest, name: data.title, origin: 'browser', browserId: data.id };
      res = await handlers[mods.add]({ packageDir, origin: data.url, manifest: browserManifest, content: content });
    } else {
      const tempPath = path.join(app.getPath('temp'), 'M3');
      await ensureDir(tempPath);
      const dl = await download(BrowserWindow.getFocusedWindow(), data.download, { directory: tempPath });
      const extDir = path.join(tempPath, dl.getFilename().split('.')[0]);
      await decompress(dl.savePath, extDir);
      const manifestPath = await findManifest(extDir);
      if (!manifestPath) return;
      const manifest = await handlers[mods.parseFile]({ filePath: manifestPath });
      const browserManifest = { ...manifest, name: data.title, origin: 'browser', browserId: data.id };
      res = await handlers[mods.add]({ packageDir, origin: manifestPath, manifest: browserManifest });
      await emptyDir(tempPath);
    }

    return res;
  },

  [mods.add]: async ({ packageDir, origin, manifest, content }) => {
    try {
      console.log("Adding mod...");
      ppJson({ packageDir, origin, manifest, content});
      if (isGitUrl(origin)) {
        return manifest;
      }
      const id = manifest.id ? manifest.id : generateId(manifest.name); // note that git repositories require id to be $owner_$reponame
      const duplicateCount = await getDuplicateCount(packageDir, id);
      manifest = {
        ...manifest,
        id: (duplicateCount > 0) ? `${id}_${duplicateCount}` : id,
        name: (duplicateCount > 0) ? `${manifest.name} (${duplicateCount})` : manifest.name
      };

      const modPath = getModPath(packageDir, manifest.id);
      await ensureDir(modPath);
      console.log("Using modPath:", modPath);

      if (content) {
        await writeFile(path.join(modPath, manifest.entryScripts[0]), content);
      } else {
        if (isWebOrigin(origin)) {
          await writeFile(path.join(modPath, manifest.entryScripts[0]), await downloadScript(origin));
        } else if (path.extname(origin) === '.js') {
          await copy(origin, path.join(modPath, manifest.entryScripts[0]));
        } else if (isGitUrl(origin)) {
          // Doing nothing, git repositories come with their own manifest files
          return manifest;
        } else {
          await copy(path.dirname(origin), modPath);
          await injectModId(modPath, manifest.id);
        }
      }

      await writeJson(path.join(modPath, 'manifest.json'), manifest, { spaces: 2 });

      return manifest;
    } catch (e) {
      console.error(e);
      if (manifest.id) await remove(getModPath(packageDir, manifest.id));
      return { error: 'Unable to add the selected mod.' };
    }
  },

  [mods.loadAll]: async ({ packageDir }) => {
    try {
      console.log("Loading all mods...");
      ppJson({packageDir});
      const modPath = getModPath(packageDir);
      if (!await pathExists(modPath)) return [];
      const loadedMods = [];

      const modDir = await opendir(modPath);
      for await (const dirent of modDir) {
        if (!dirent.isDirectory()) continue;

        const manifestPath = path.join(modPath, dirent.name, 'manifest.json');
        if (!await pathExists(manifestPath)) continue;
        try {
          const manifest = await readJson(manifestPath);
          loadedMods.push(manifest);
        } catch (e) {
          console.error(e);
          continue;
        }
      }

      return loadedMods;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  [mods.load]: async ({ packageDir, id }) => {
    console.log("Loading mod...");
    ppJson({packageDir, id});
    try {
      const modPath = getModPath(packageDir, id);
      const manifest = await readJson(path.join(modPath, 'manifest.json'));
      return manifest;
    } catch (e) {
      console.error(e);
      return { error: `Unable to load mod ${id}.`};
    }
  },

  [mods.checkForUpdates]: async ({ mod }) => {
    try {
      console.log("Checking for updates...");
      ppJson({mod});
      return await getUpdates(mod);
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  [mods.update]: async ({ packageDir, id, browserData }) => {
    try {
      console.log("Updating mod...");
      ppJson({packageDir, id, browserData});
      const modPath = getModPath(packageDir, id);
      const manifestPath = path.join(modPath, 'manifest.json');
      const manifest = await readJson(manifestPath);

      if (!manifest.origin) return;

      if (manifest.origin === 'browser' && browserData.type === 'ext')
        return await updateExtension(modPath, manifestPath, manifest, browserData);
      
      return await updateScript(modPath, manifestPath, manifest, browserData);
    } catch (e) {
      console.error(e);
      return `Unable to update mod ${id}.`;
    }
  },

  [mods.remove]: async ({ packageDir, id }) => {
    try {
      if (!id) return;
      console.log("Removing mod...");
      ppJson({packageDir, id});
      const modPath = getModPath(packageDir, id);

      await remove(modPath);
    } catch (e) {
      console.error(e);
      return `Unable to remove mod ${id}.`;
    }
  },

  [mods.inject]: async ({ packageDir, mods }) => {
    console.log("Injecting mods...");
    ppJson({packageDir, mods});
    const m3jsPath = path.join(packageDir, 'm3.js');
    const m3js = buildM3Js(mods);
    await writeFile(m3jsPath, m3js);

    const melvorPackagePath = path.join(packageDir, 'package.json');
    const melvorPackage = await readJson(melvorPackagePath);
    melvorPackage['inject_js_end'] = 'm3.js';
    await writeJson(melvorPackagePath, melvorPackage);
  }
};

const parseScript = async (scriptFile, content) => {
  console.log("Parsing script...");
  ppJson({scriptFile});
  const userScript = usp(content);

  if (!userScript) return {
    name: scriptFile.split('.')[0],
    entryScripts: [scriptFile]
  };

  const { meta } = userScript;
  return {
    name: (meta.name && meta.name.length) ? meta.name[0] : undefined,
    description: (meta.description && meta.description.length) ? meta.description[0] : undefined,
    version: (meta.version && meta.version.length) ? meta.version[0] : undefined,
    entryScripts: [scriptFile]
  };
};

const parseManifest = async (content) => {
  console.log("Parsing manifest...");
  ppJson({content});
  const manifest = JSON.parse(content);

  const isWebExtension = !!manifest.content_scripts;

  if (!isWebExtension) throw 'Invalid manifest - not a WebExtension';

  return {
    id: manifest.id ? manifest.id : manifest.name,
    name: manifest.name,
    description: manifest.description,
    version: manifest.version,
    entryScripts: manifest.content_scripts[0].js,
    styles: manifest.content_scripts[0].css
  };
};

const findManifest = async (dir) => {
  console.log("Looking for manifest...");
  ppJson({dir});
  const files = await readdir(dir, { withFileTypes: true });
  const manifest = files.find(file => file.isFile() && file.name === 'manifest.json');
  if (manifest) return path.join(dir, manifest.name);
  
  const folders = files.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
  for (const folder of folders) {
    const manifest = await findManifest(path.join(dir, folder));
    if (manifest) return manifest;
  }

  return false;
};

const generateId = name => {
  return name.replace(/[^a-z ]/gi, '').replace(/ /g, '_').toLowerCase();
};

const getModPath = (packageDir, modId) => {
  const baseModPath = path.join(packageDir, 'Mods');

  if (modId) return path.join(baseModPath, modId);

  return baseModPath;
};

const getDuplicateCount = async (packageDir, baseId) => {
  let testId = baseId;
  let duplicateCount = 0;

  while (await pathExists(getModPath(packageDir, testId))) {
    duplicateCount++;
    testId = `${baseId}_${duplicateCount}`;
  }

  return duplicateCount;
}

const isWebOrigin = origin => {
  try {
    const url = new URL(origin);
    return (/https?/).test(url.protocol);
  } catch {
    return false;
  }
};

const downloadScript = async (url, packageDir=undefined, update=false) => {
  if (isGreasyForkUrl(url)) {
    return await downloadGreasyForkScript(url);
  } else if (isGitUrl(url)) {
    return await downloadGitRepository(url, packageDir=packageDir);
  }

  console.log("Downloading file...");
  const scriptPath = url.split('/');
  const scriptFile = decodeURI(scriptPath[scriptPath.length - 1]);
  const { data } = await axios.get(url);
  return { file: scriptFile, content: data };
};

const downloadGreasyForkScript = async url => {
  try {
    console.log("Downloading Greasyfork script...", JSON.stringify({url}, null, 2));
    const scriptHomepage = await axios.get(url);
    const $ = cheerio.load(scriptHomepage.data);
    const scriptUrl = $('#install-area .install-link').attr('href');
    const scriptPath = scriptUrl.split('/');
    const scriptFile = decodeURI(scriptPath[scriptPath.length - 1]);
    const { data } = await axios.get(`https://greasyfork.org${scriptUrl}`);
    return { file: scriptFile, content: data };
  } catch (e) {
    console.error(e);
    return;
  }
};
const downloadGitRepository = async (url, packageDir, modPath=undefined) => {
  try {
    console.log("Downloading git script...");
    ppJson({url, packageDir, modPath});
    
    const git = simpleGit().env("GIT_TERMINAL_PROMPT", "0");
    let scriptPath;
    if (url.startsWith("git@")) {
      scriptPath = url.split(":")[1];
      scriptPath = scriptPath.split("/");
    } else {
      scriptPath = url.split("/");
    }
    const repoOwner = scriptPath[scriptPath.length-2];
    const repoName = scriptPath[scriptPath.length-1].replace(/^.git$/, '');
    modPath = modPath? modPath : getModPath(packageDir, repoOwner+"_"+repoName);
    ppJson({url, packageDir, modPath, repoOwner, repoName});


    if ((modPath === undefined) || (repoName === undefined))
      console.log("Invalid url");

    try {
      await git.clone(url, modPath);
    } catch (e) {
      return { error: "Couldn't clone the repository. Are you sure it exists?" };
    }
    return {
      name: repoName,
      author: repoOwner,
      origin: url,
      manifestPath: path.join(modPath, "manifest.json")
    }
  } catch (e) {
    console.error(e);
    return;
  }
};

const getUpdates = async (mod) => {
  if (!mod.origin) return null;

  const isGreasyForkOrigin = isGreasyForkUrl(mod.origin);

  // We only support Greasy Fork updates for now
  if (!isGreasyForkOrigin) return null;

  try {
    if (isGreasyForkOrigin) return await getGreasyForkUpdates(mod);
  } catch (e) {
    console.error(e);
    return null;
  }

  return null;
};

const getGreasyForkUpdates = async mod => {
  const { data } = await axios.get(mod.origin);
  const $ = cheerio.load(data);
  const originVersion = $('#install-area .install-link').attr('data-script-version');
  if (!originVersion) return null;

  const currentVersion = mod.version.split('.');
  const latestVersion = originVersion.split('.');

  let isNewVersion = false;

  for (let i = 0; i < latestVersion.length; i++) {
    if (currentVersion.length === i || latestVersion[i] > currentVersion[i]) {
      isNewVersion = true;
      break;
    }
  }

  if (isNewVersion) {
    return originVersion;
  }
}

const updateScript = async (modPath, manifestPath, manifest, browserData) => {
  const { content: updatedScript } = await downloadScript(
    manifest.origin === 'browser' ? browserData.download : manifest.origin,
    update=true
  );

  if (!updatedScript) return;

  const { meta, content } = usp(updatedScript);
  const updatedManifest = {
    ...manifest,
    name: (meta.name && meta.name.length) ? meta.name[0] : manifest.name,
    description: (meta.description && meta.description.length) ? meta.description[0] : manifest.description,
    version: (meta.version && meta.version.length) ? meta.version[0] : manifest.version,
  };
  
  const scriptPath = path.join(modPath, updatedManifest.entryScripts[0]);
  await writeFile(scriptPath, content);
  await writeJson(manifestPath, updatedManifest, { spaces: 2 });
  
  return { ...updatedManifest, version: updatedManifest.version, updateAvailable: null };
};

const updateExtension = async (modPath, manifestPath, manifest, browserData) => {
  const tempPath = path.join(app.getPath('temp'), 'M3');
  await ensureDir(tempPath);
  const dl = await download(BrowserWindow.getFocusedWindow(), browserData.download, { directory: tempPath });
  const extDir = path.join(tempPath, dl.getFilename().split('.')[0]);
  await decompress(dl.savePath, extDir);
  const tempManifestPath = await findManifest(extDir);
  if (!tempManifestPath) return;
  const tempManifest = await handlers[mods.parseFile]({ filePath: tempManifestPath });
  const updatedManifest = {
    ...manifest,
    name: browserData.title,
    description: tempManifest.description,
    version: browserData.version,
    origin: 'browser',
    browserId: browserData.id
  };
  await emptyDir(modPath);
  await copy(path.dirname(tempManifestPath), modPath);
  await injectModId(modPath, updatedManifest.id);
  await writeJson(manifestPath, updatedManifest, { spaces: 2 });
  await emptyDir(tempPath);

  return { ...updatedManifest, version: updatedManifest.version, updateAvailable: null };
}

const injectModId = async (dir, modId) => {
  if (!await pathExists(dir)) return;

  const files = await readdir(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await lstat(filePath);
    if (stat.isDirectory()) {
      await injectModId(filePath, modId);
      continue;
    }
    if (!(/\.js$/).test(filePath)) continue;

    const contents = await readFile(filePath, 'utf8');
    if (!(/getURL\(([^\)]*)/).test(contents)) continue;
    const newContents = contents.replace(/getURL\(([^\)]*)/g, 'getURL($1, "Mods/' + modId + '/"');
    await writeFile(filePath, newContents);
  }
}

const buildM3Js = (mods) => {
  const modInjectables = [];
  for (const mod of mods) {
    if (mod.disabled) continue;
    if (!!mod.content_scripts) {
      modInjectables.push(`{ id: '${mod.id}', scripts: ${JSON.stringify(mod.content_scripts[0].js || [])}, styles: ${JSON.stringify(mod.content_scripts[0].css || [])} }`);
    } else {
      modInjectables.push(`{ id: '${mod.id}', scripts: ${JSON.stringify(mod.entryScripts || [])}, styles: ${JSON.stringify(mod.styles || [])} }`);
    }
  }
  return `
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
    ${modInjectables.join(',\n    ')}
  ];
  
  for (const mod of mods) {
    for (const script of mod.scripts) {
      const filePath = path.join('Mods', mod.id, script);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const scriptEl = document.createElement('script');
        scriptEl.innerHTML = 
        \`(() => {
          \${content}
        })();\`;
        document.body.appendChild(scriptEl);
      } catch {}
    }
    for (const style of mod.styles) {
      const filePath = path.join('Mods', mod.id, style);
      const linkEl = document.createElement('link');
      linkEl.rel = 'stylesheet';
      linkEl.href = chrome.runtime.getURL(filePath);
      document.head.appendChild(linkEl);
    }
  }
});`
};
