Pebble.addEventListener('ready', onReady);
Pebble.addEventListener('webviewclosed', onWebViewClosed);
Pebble.addEventListener('showConfiguration', onShowConfiguration);

var BASE_URL = 'http://9a37aa87.ngrok.io';

function onReady() {
  console.log('Hello world! - Sent from your javascript application.');
}

function onWebViewClosed(e) {
  var configData = JSON.parse(decodeURIComponent(e.response));
  console.log('got data', configData);

  Pebble.sendAppMessage(dict, function () {
    console.log('data sent successfully');
  }, function (err) {
    console.log('Error sending data');
  });
}

function onShowConfiguration() {
  console.log('onshowconfiguartion');

  Pebble.getTimelineToken(function(timelineToken) {
    Pebble.openURL(BASE_URL + '/register?timelineToken=' + timelineToken);
  }, function (err) {
    console.log('Error getting timeline token', err);
    console.log(err);
  });
}
