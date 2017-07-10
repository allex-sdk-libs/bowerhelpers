
function createBowerHelpers (lib) {
  'use strict';

  return {
    commands : require('./commands')(lib),
    readers: require('./readers'),
    'native': require('bower')
  };
}

module.exports = createBowerHelpers;
