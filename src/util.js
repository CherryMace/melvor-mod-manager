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

export const getExecutableFilename = (platform) => ({
	win32: 'Melvor Idle.exe',
	darwin: 'Melvor Idle.app',
}[platform]);