function readPackageHook(pkg) {
  if (pkg.name === 'tailwindcss') {
    pkg.peerDependencies = pkg.peerDependencies || {};
    pkg.peerDependencies['nanoid'] = '3.3.7';
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage: readPackageHook,
  },
};
