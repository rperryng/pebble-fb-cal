function submit() {
  var data = {
    doneSetup: true
  };
  document.location = 'pebblejs://close#' + encodeURIComponent(JSON.stringify(data));
}
