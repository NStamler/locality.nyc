(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-55357845-1', 'auto');
ga('send', 'pageview');

var openedInfo = new google.maps.InfoWindow(),
    polyIsVisible = true,
    isMobile = false,
    stableConnection = true, reconnectTimeout, reconnectInterval = 3;

$(document).ready((function() {
  if(!$("footer").is(":visible")) {
    isMobile = true;
  }

  // console.log("ready");

  initMap();

  addMainListeners();
}));

function getCurrentPosition(options) {
  var deferred = $.Deferred();

  navigator.geolocation.getCurrentPosition(
    deferred.resolve,
    deferred.reject,
    options
  );

  return deferred.promise();
}

function setCurrentPosition(position) {
  var deferred = $.Deferred();

  var lat = position.coords.latitude;
  var lng = position.coords.longitude;
  var latlng = getLatLng(lat,lng);
  var geoCoder = new google.maps.Geocoder();
  geoCoder.geocode({ location: latlng }, deferred.resolve);

  return deferred.promise();
}

function addMainListeners() {
  $(document).on('keyup', function(e) {
    if(e.keyCode === 27) {
      if($(document.activeElement).is('body')) {
        $(document).trigger("reset");
      } else {
        $(document.activeElement).blur();
      }
    }
  });

  $("#offline_notice").on("click", function() {
    alert("You are offline! locality.nyc uses Google Maps which may be cached on your device, however search functionality will not work while you are offline.");
  });

  setTimeout(checkNetwork, 5000);
}

function checkNetwork() {
  // console.log("checkNetwork");
  // var networkState = navigator.connection.type;

  // var states = {};
  // states[Connection.UNKNOWN]  = 'Unknown connection';
  // states[Connection.ETHERNET] = 'Ethernet connection';
  // states[Connection.WIFI]     = 'WiFi connection';
  // states[Connection.CELL_2G]  = 'Cell 2G connection';
  // states[Connection.CELL_3G]  = 'Cell 3G connection';
  // states[Connection.CELL_4G]  = 'Cell 4G connection';
  // states[Connection.CELL]     = 'Cell generic connection';
  // states[Connection.NONE]     = 'No network connection';

  // alert('Connection type: ' + states[networkState]);

  if(typeof Connection !== "undefined" && navigator.connection) {
    alert([Connection.UNKNOWN, Connection.CELL, Connection.NONE].indexOf(navigator.connection.type) === -1);
    updateConnectivityState([Connection.UNKNOWN, Connection.CELL, Connection.NONE].indexOf(navigator.connection.type) === -1);
  } else {
    $.get("connection-test").done(function(data, xhr) {
      updateConnectivityState(true);
    }).fail(function() {
      updateConnectivityState(false);
    });
  }
}

function updateConnectivityState(state) {
  // console.log("updateConnectivityState");
  if(state) {
    if(!stableConnection) {
      alert("coming from unstable");
      stableConnection = true;
      $("#offline_notice").removeClass("active");
    }
    setTimeout(checkNetwork, 5000);
  } else {
    if(stableConnection) {
      alert("coming from stable");
      stableConnection = false;
      reconnectInterval = 0;
      $("#offline_notice").addClass("active");
    }
    if(reconnectInterval < 5) {
      reconnectInterval++;
    }
    setTimeout(checkNetwork, reconnectInterval * 1000);
  }
}