function submit() {
  console.log('found', fb);
  document.location = 'pebblejs://close#' + encodeURIComponent(JSON.stringify(fb));
}
