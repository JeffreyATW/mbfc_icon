/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  browser.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  document.body.style.display = 'none';

  document.querySelectorAll('a[href]').forEach(function (el) {
    el.addEventListener('click', function (event) {
      event.preventDefault();
      browser.tabs.create({
        url: event.target.getAttribute('href')
      });
    });
  });

  getCurrentTabUrl(function(url) {
    getTabSource(url, function (source, bias) {
      if (source !== undefined && bias !== undefined) {

        // Add 50ms timeout to defeat popup opening animation
        setTimeout(function() {
          document.getElementById('bias').textContent = bias.name;
          document.getElementById('description').textContent = bias.description;
          document.getElementById('name').textContent = source.name;
          document.getElementById('notes').textContent = source.notes;
          document.getElementById('homepage').setAttribute('href', source.homepage);
          document.getElementById('more-info').setAttribute('href', source.url);
          var factualParagraph = document.getElementById('factualParagraph');
          var factualEl = document.getElementById('factual');
          if (!source.factual) {
            factualParagraph.style.display = 'none';
          } else {
            factualParagraph.style.display = 'block';
            factualEl.textContent = source.factual;
            factualEl.classList.add([source.factual]);
          }
          document.body.style.display = 'block';
        }, 50);
      }
    });
  });
});
