function createReaders (Node) {
  'use strict';
  var Fs = Node.Fs;

  function filereadFailed (name, e) {
    Node.throwerror('There was a problem reading '+name+' at '+process.cwd()+', responded with message:'+e.message);
  }

  function getBowerJSON () {
    try {
      return Fs.safeReadJSONFileSync('bower.json');
    }catch (e) {
      //rethrow error with bit more user friendly error message
      filereadFailed('bower.json', e);
    }
  };

  function getBowerRc () {
    try {
      return Fs.safeReadJSONFileSync('.bowerrc');
    }catch (e) {
      filereadFailed('.bowerrc', e);
    }
  }

  function componentsPath () {
    var ret = getBowerRc();
    return ret && ret.directory ? ret.directory : 'bower_components';
  }

  function dependeciesList () {
    var ret = getBowerJSON();
    return ret && ret.dependencies ? Object.keys(ret.dependencies) : undefined;
  }

  function allDependenciesList () {
    var bwr = getBowerJSON();
    if (!bwr) Node.throwerror('Missing bower.json in '+process.cwd());
    var deps = bwr.dependencies;
    var devdeps=bwr.devDependencies;
    var ret = [];
    if (deps) Array.prototype.push.apply(ret, Object.keys(deps));
    if (devdeps) Array.prototype.push.apply(ret, Object.keys(devdeps));
    return ret.length ? ret : undefined;
  }

  return {
    getBowerJSON : getBowerJSON,
    getBowerRc : getBowerRc,
    componentsPath: componentsPath,
    dependeciesList:dependeciesList,
    allDependenciesList: allDependenciesList
  };
}

module.exports = createReaders;
