var getFile = function (type) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      var obj = {}
      obj[type] = JSON.parse(xhr.responseText)
      browser.storage.local.set(obj);
    }
  };
  xhr.open('GET', 'http://jeffreyatw.com/static/mbfc/' + type + '.json', true);
  xhr.send();
}

var update = function () {
  browser.storage.local.get('lastUpdated', function (items) {
    if (items.lastUpdated === undefined || Date.now() - items.lastUpdated > 86400000) {
      getFile('sources');
      getFile('biases');
      browser.storage.local.set({
        lastUpdated: Date.now()
      });
    }
  });
}

browser.storage.local.get(['biases', 'sources'], function (items) {
  if (items.sources === undefined || items.biases === undefined) {
    update();
  }
});

browser.alarms.create('updater', {
  periodInMinutes: 1
});

browser.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === 'updater') {
    update();
  }
});

var tabListener = function (tab) {
  if (tab.url !== undefined) {
    getTabSource(tab.url, function (source, bias) {
      var path = '/icon.png';
      if (source === undefined || bias === undefined) {
        browser.pageAction.hide(tab.id);
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
          case 'fake-news':
            path += 'fake-news';
            break;
        }
        path += '.png';
        browser.pageAction.show(tab.id);
        browser.pageAction.setTitle({
          title: bias.name,
          tabId: tab.id
        });
      }
      browser.pageAction.setIcon({
        path: path,
        tabId: tab.id
      });
    });
  }
}

browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  tabListener(tab);
});

browser.tabs.onActivated.addListener(function (ids) {
  browser.tabs.get(ids.tabId, tabListener);
});