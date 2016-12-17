var getHostName = function (url) {
   try {
       return new URL(url).hostname.match(/(www[0-9]?\.)?(.+)/i)[2];
   } catch (e) {
       return null; // Invalid URL
   }
}

var getTabSource = function (url, cb) {
  browser.storage.local.get(['biases', 'sources'], function (items) {
    var domain = getHostName(url);
    var source = items.sources[domain];
    if (source !== undefined) {
      var bias = items.biases[source.bias];
    }
    cb(source, bias);
  });
};
