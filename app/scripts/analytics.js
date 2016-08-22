(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src='https://www.google-analytics.com/analytics.js';m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

try {
  if (typeof require === 'function') {
    // electron
    ga('create', 'UA-81497637-1', 'auto', {
      'storage': 'none',
      'clientId': localStorage.getItem('ga:clientId')
    });

    ga(function(tracker) {
      localStorage.setItem('ga:clientId', tracker.get('clientId'));
    });

  } else {
    // classic web site
    ga('create', 'UA-81497637-1', 'auto');
  }

  ga('set', 'checkProtocolTask', null);
  ga("set", "location", "http://necrovisualizer.nicontoso.eu");
  ga('send', 'pageview');
  ga("send", "event", "version", document.title, document.title);
} catch (err) {
  window.ga = function(){};
}