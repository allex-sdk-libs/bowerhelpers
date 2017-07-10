var Bower = require('bower');

function createCommands(lib) {
  'use strict';
  var Node = require('allex_nodehelpersserverruntimelib')(lib),
    Readers = require('./readers.js')(Node),
    arryOperations = require('allex_arrayoperationslowlevellib')(lib.extend, lib.readPropertyFromDotDelimitedString, lib.isFunction, lib.Map, lib.AllexJSONizingError),
    Fs = Node.Fs,
    Path = require('path');


  function doSafeDirLink (source, target) {
    Fs.ensureDirSync(Path.dirname(target));

    if (!Fs.dirExists(source)) return;//Node.throwerror('Source dir '+source+' missing, unable to link dir...');
    if (!Fs.dirExists(Path.dirname(target))) return;//Node.throwerror('Target dir '+Path.dirname(target)+' missing, unable to link dir...');

    try {
      if (Fs.existsSync(target)) {
        Fs.removeSync(target);
      }
      Fs.symlinkSync(source, target);
    }catch(e) {
      console.log('ERROR: ', e.stack);
      Node.throwerror('Unable to link due to '+e.message);
    }
  }

  function createLink (source, dir, name) {
    try {
      Fs.ensureDir(dir);
      var target = Path.join(dir, name);
      doSafeDirLink(Path.join(source,name),target);
      return true;
    }catch (e) {
      console.log(e.stack, e.message);
      Node.throwerror('Failed component symlinking: '+ source, name, target+ ' due to:'+ e.message);
      return false;
    }
  }

  function link (dependencies) {
    if (!dependencies) dependencies = Readers.allDependenciesList();
    if (lib.isString(dependencies)) dependencies = dependencies.split(',');
    if (!(Bower.config && Bower.config.storage && Bower.config.storage.links)) Node.throwerror('No config for bower, do run node install -g bower in order to move on ...');
    if (!Fs.dirExists(Bower.config.storage.links)) {
      return true;
    }
    try {
    var result = arryOperations.intersect(dependencies, Fs.readdirSync(Bower.config.storage.links))
     .filter(createLink.bind(null, Bower.config.storage.links, Readers.componentsPath()));

    return result.length === dependencies.length;
    }catch (e) {
      console.log(e);
      console.log(e.stack);
    }
  }


  ///TODO: at this moment, we support only postinstall scripts from installed components only from component in current dir ...
  ///should be fixed in future ...
  function postinstall () {
    var json = Readers.getBowerJSON();
    if (!json.scripts || !json.scripts.postinstall) return; ///nothing to be done ...
    Node.executeCommand(json.scripts.postinstall).done(Node.info.bind(null, 'Postinstall done'), Node.info.bind(null, 'Postinstall failed'));
  }

  function linkToCache (name, path) {
    doSafeDirLink(path, Path.join(Bower.config.storage.links, name));
  }

  function listCache () {
    var bp = Bower.config.storage.links;
    return Fs.dirExists(bp) ? Fs.readdirSync (bp) : [];
  }

  function isInCache (component) {
    return listCache().indexOf(component) > -1;
  }

  function unlink (component){
    var p = Path.resolve(Bower.config.storage.links, component);
    if (!Fs.existsSync(p)) return;
    Fs.unlinkSync(p);
  }


  return {
    link: link,
    unlink: unlink,
    postinstall: postinstall,
    linkToCache: linkToCache,
    listCache : listCache,
    isInCache : isInCache
  };
}

module.exports = createCommands;
