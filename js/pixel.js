/* Meta Pixel for The Customized House.
   Paste the Pixel ID from Meta Events Manager below. While it is empty, nothing loads. */
(function(){
  var PIXEL_ID = '';

  window.tchTrack = function(){};
  if(!PIXEL_ID) return;

  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');

  window.tchTrack = function(event, params){
    try{ fbq('track', event, params || {}); }catch(e){}
  };

  /* Any tap on a WhatsApp link counts as a Contact */
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href*="wa.me"]');
    if(a) window.tchTrack('Contact', {content_name: location.pathname.replace(/^\//,'') || 'home'});
  }, true);
  /* Order buttons that open WhatsApp from script count too */
  var _open = window.open;
  window.open = function(u){
    if(typeof u === 'string' && u.indexOf('wa.me') > -1) window.tchTrack('Contact', {content_name: location.pathname.replace(/^\//,'') || 'home'});
    return _open.apply(window, arguments);
  };
})();
