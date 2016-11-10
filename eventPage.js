var getFile = function (type) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      var obj = {}
      obj[type] = JSON.parse(xhr.responseText)
      chrome.storage.local.set(obj);
    }
  };
  xhr.open('GET', 'http://jeffreyatw.com/static/mbfc/' + type + '.json', true);
  xhr.send();
}

var getSources = function () {
  getFile('sources');
}

var getBiases = function () {
  getFile('biases');
}

var update = function () {
  getSources();
  getBiases();
}

chrome.storage.local.get(['biases', 'sources'], function (items) {
  if (items.sources === undefined || items.biases === undefined) {
    update();
  }
});

chrome.alarms.create('updater', {
  periodInMinutes: 1440
});

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === 'updater') {
    update();
  }
});

var tabListener = function (tab) {
  if (tab.url !== undefined) {
    getTabSource(tab.url, function (source, bias) {
      var path = '/icon.png';
      if (source === undefined || bias === undefined) {
        chrome.browserAction.disable(tab.id);
      } else {
        path = '/icons/';
        switch (source.bias) {
          case 'left':
            path += 'left';
            break;
          case 'leftcenter':
          case 'left-center':
            path += 'left-center';
            break;
          case 'center':
            path += 'center';
            break;
          case 'rightcenter':
          case 'right-center':
            path += 'right-center';
            break;
          case 'right':
            path += 'right';
            break;
          case 'pro-science':
            path += 'pro-science';
            break;
          case 'conspiracy':
            path += 'conspiracy-pseudoscience';
            break;
          case 'satire':
            path += 'satire';
            break;
        }
        path += '.png';
        chrome.browserAction.enable(tab.id);
        chrome.browserAction.setTitle({
          title: bias.name,
          tabId: tab.id
        });
      }
      chrome.browserAction.setIcon({
        path: path,
        tabId: tab.id
      });
    });
  }
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  tabListener(tab);
});

chrome.tabs.onActivated.addListener(function (ids) {
  chrome.tabs.get(ids.tabId, tabListener);
});