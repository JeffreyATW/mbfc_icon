var getHostName = function (url) {
  try {
    return new URL(url).hostname.match(/(www[0-9]?\.)?(.+)/i)[2];
  } catch (e) {
    return null; // Invalid URL
  }
}

var getPath = function (url) {
  try {
    return new URL(url).pathname;
  } catch (e) {
    return '/';
  }
}

var getTabSource = function (url, cb) {
  browser.storage.local.get(['biases', 'sources'], function (items) {
    var domain = getHostName(url);
    var path = getPath(url);
    var domainSources;
    var source;

    if (items.biases !== undefined && items.sources !== undefined) {
      domainSources = items.sources[domain];
      // check if value is an array or object
      if (domainSources && domainSources.length) {
        // if array has more than one value
        if (domainSources.length > 1) {
          // iterate
          for (var i = 0; i < domainSources.length; i += 1) {
            // if source hasn't been set, settle for root path
            if (domainSources[i].path === '/' && source === undefined) {
              source = domainSources[i];
            } else {
              // check for source's path at beginning of current path
              if (path.indexOf(domainSources[i].path) === 0) {
                source = domainSources[i];
                // we found it, no need to iterate further
                break;
              }
            }
          }
          /* note: source could still be undefined if no domain source paths
            were found in current path */
        } else {
          // just match with domain if only one value
          source = domainSources[0];
        }
      } else {
        // not an array, must be undefined or slurping old JSON
        source = domainSources;
      }
      if (source !== undefined) {
        var bias = items.biases[source.bias];
      }
    }
    cb(source, bias);
  });
};
