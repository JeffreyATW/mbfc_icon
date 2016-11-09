var getHostName = function (url) {
  var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
  if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
    return match[2];
  }
  else {
    return null;
  }
}

var getTabSource = function (url, cb) {
  chrome.storage.local.get(['biases', 'sources'], function (items) {
    var domain = getHostName(url);
    var source = items.sources[domain];
    if (source !== undefined) {
      var bias = items.biases[source.bias];
    }
    cb(source, bias);
  });
};
