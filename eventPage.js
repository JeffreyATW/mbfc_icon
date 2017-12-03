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
  browser.storage.local.get(['biases', 'lastUpdated', 'sources'], function (items) {
    if (
      items.lastUpdated === undefined ||
      Date.now() - items.lastUpdated > 86400000 ||
      items.biases === undefined ||
      items.sources === undefined
    ) {
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

function convertScoreToColor(score) {
  if (score > 80) return "#009e73";
  if (score > 70) return "#cc79a7";
  if (score <= 70) return "#d55e00";
}

function getImageData(text, color) {
  var canvas = document.getElementById('canvas') ||
      document.createElement('canvas');
  canvas.id = 'canvas';

  var ctx = canvas.getContext("2d", {alpha: false});
  ctx.height = 48;
  ctx.width = 48;
  ctx.font = "condensed bolder 36px tahoma";


  ctx.fillStyle = color
  ctx.fillRect(0, 0, ctx.width, ctx.height);

  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(text, ctx.width/2, 3*ctx.height/4, 46);

  return ctx.getImageData(0, 0, ctx.width, ctx.height);
}

var tabListener = function (tab) {
  if (tab.url !== undefined) {
    getTabSource(tab.url, function (source, bias) {
      var path = '/icon.png';
      var score = 0;
      var args = [];
      if (source === undefined || bias === undefined) {
        browser.pageAction.hide(tab.id);
        browser.pageAction.setIcon({
          path: path,
          tabId: tab.id
        });
      } else {
        switch (source.bias) {
          case 'left':
            args.push("L");
            score += 40;
            break;
          case 'leftcenter':
          case 'left-center':
            args.push("LC");
            score += 50;
            break;
          case 'center':
            args.push("C");
            score += 60;
            break;
          case 'rightcenter':
          case 'right-center':
            args.push("RC");
            score += 50;
            break;
          case 'right':
            args.push("R");
            score += 40;
            break;
          case 'pro-science':
            args.push("PS");
            score += 50;
            break;
          case 'conspiracy':
            args.push("CP");
            score = 30;
            break;
          case 'satire':
            args.push("S");
            score = 20;
            break;
          case 'fake-news':
            args.push("FN");
            score = 30;
            break;
        }
        switch (source.factual) {
          case 'LOW':
            score += 10;
            break;
          case 'MIXED':
            score += 20;
            break;
          case 'HIGH':
            score += 30;
            break;
          case 'VERY HIGH':
            score += 40;
            break;
          case '':
          case null:
          default:
            break;
        }
        args.push(convertScoreToColor(score));
        browser.pageAction.show(tab.id);
        browser.pageAction.setTitle({
          title: bias.name+" | Truthiness: "+(source.factual||"NR"),
          tabId: tab.id
        });
        browser.pageAction.setIcon({
          imageData: getImageData(...args),
          tabId: tab.id
        });
      }
    });
  }
}

browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  tabListener(tab);
});

browser.tabs.onActivated.addListener(function (ids) {
  browser.tabs.get(ids.tabId, tabListener);
});