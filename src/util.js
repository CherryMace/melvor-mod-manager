export const sortModsByLoadOrder = (mods, modLoadOrder) => {
  const modsSortedByLoadOrder = [ ...mods ];
  modsSortedByLoadOrder.sort((modA, modB) => {
    const loadOrderA = modLoadOrder.indexOf(modA.id);
    const loadOrderB = modLoadOrder.indexOf(modB.id);

    if (loadOrderA === -1 && loadOrderB === -1) return 0;
    if (loadOrderA === -1) return 1;
    if (loadOrderB === -1) return -1;

    if (loadOrderA < loadOrderB) return -1;
    if (loadOrderB < loadOrderA) return 1;
    return 0;
  });
  return modsSortedByLoadOrder;
};

export const isGreasyForkUrl = url => {
  return (/^https?:\/\/(www\.)?greasyfork\.org/).test(url);
};

export const isGitUrl = url => {
  // should add support for all git urls, not only github; but i'm not 100% sure about the proper url syntax
  // ssh urls should be easier than http ones though
  const httpsGit = /^(https:\/\/)?(www\.)?github.com?\/([^/]*)\/([^/]*)(.git)?$/;
  const sshGit = /^git@github.com:([^/]*)\/([^/]*)(.git)?$/;
  return httpsGit.test(url) || sshGit.test(url);
};

export const getExecutableFilename = (platform) => ({
  win32: 'Melvor Idle.exe',
  darwin: 'Melvor Idle.app',
  linux: 'Melvor Idle',
}[platform]);

export const ppJson = obj => {
  if (obj !== null) {
    console.dir(obj, { depth: null, colors: true });
  }
}
