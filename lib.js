(function(){
// Fonction pour connaître l'origine de l'utilisateur'
function getTrafficSource() {
  var urlParams = new URLSearchParams(window.location.search);
  var source = urlParams.get('utm_source') || urlParams.get('mtm_source') || urlParams.get('gm_source');
  var medium = urlParams.get('utm_medium') || urlParams.get('mtm_medium') || urlParams.get('gm_medium');
  var campaign = urlParams.get('utm_campaign') || urlParams.get('mtm_campaign') || urlParams.get('gm_campaign');
  var audience = urlParams.get('gm_audience');
  var remarketing = urlParams.get('gm_remarketing');
  // Ajouter d'autres paramètres si nécessaire

  var referrerDomain = new URL(document.referrer).hostname.replace(/^www\./i, "");
  var concatString = null

  if (source) {
    concatString = `source=${source}&medium=${medium || 'inconnu'}&campaign=${campaign || 'inconnu'}&audience=${audience || 'inconnu'}&remarketing=${remarketing || 'inconnu'}`;
  } else if (referrerDomain) {
    if (referrerDomain.includes("google.com")) {
      concatString = "source=organique&medium=google.com";
    } else if (referrerDomain.includes("bing.com")) {
      concatString = "source=organique&medium=bing.com";
    } else if (referrerDomain) {
      concatString = `source=referral&medium=${referrerDomain}`;
    } else {
      concatString = "source=inconnu"
    }
  }

  return {
    concatString: concatString,
    source: source
  }
}
      
// Fonction pour générer un ID utilisateur
function generateUniqueID() {
  var timestamp = new Date().getTime();
  var randomNumber = Math.floor(Math.random() * 900000);
  return 'gm.' + timestamp + '.' + randomNumber;
}
      
// Fonction pour générer un ID de session
function generateSessionID(){
  return Math.floor(Math.random() * 90000000)
}

// Retourne le temps écoulé depuis la dernière mise à jour du cookie 
function getTimeSpent(lastTimeStamp){
  var currentTime = new Date();
  var timeDifference = currentTime - new Date(lastTimeStamp).getTime()
  return timeDifference
}
        
// Fonction pour créer ou mettre à jour le cookie
function setCookie(params) {
    var expires = new Date();
    expires.setMonth(expires.getMonth() + 13);
    expires = expires.toUTCString();
    document.cookie = '_gm=' + JSON.stringify(params) + '; expires=' + expires + "; path=/; domain=." + location.hostname.replace(/^www\./i, "");
}
              
// Fonction principale pour créer ou mettre à jour le cookie
function createOrUpdateCookie() {
    var params = {
        id: null,
        sessionId: null,
        sessionNumber: null,
        sessionInfos: null,
        firstSessionOrigin: null,
        pageCount: 0,
        engagedSession: false,
        sessionTimeLength: null,
        previousPageTimeLength: null,
        startSessionTime: null,
        time: null,
    };

    var maxSessionDuration = 12 * 60 * 60 * 1000
    var cookie = document.cookie.replace(/(?:(?:^|.*;\s*)_gm\s*=\s*([^;]*).*$)|^.*$/, "$1");

    if (!cookie) {
        // Le cookie n'existe pas, initialiser les valeurs
        params.sessionNumber = 1;
        params.pageCount = 1;
        params.sessionInfos = getTrafficSource().concatString;
        params.time = new Date();
        params.startSessionTime = new Date();
        params.id = generateUniqueID();
        params.sessionId = generateSessionID()
        params.firstSessionOrigin = getTrafficSource().source;
      
        setCookie(params);
    } else {
        // Le cookie existe, mettre à jour les valeurs
        var existingParams = JSON.parse(cookie);

        if (getTimeSpent(existingParams.time) >= maxSessionDuration) {
            // Nouvelle session
            existingParams.sessionNumber++;
            existingParams.pageCount = 1;
            existingParams.startSessionTime = new Date();
            existingParams.sessionInfos = getTrafficSource().concatString;
            existingParams.sessionId = generateSessionID();
            existingParams.engagedSession = false;
        } else {
            // Même session
            existingParams.pageCount++
            existingParams.sessionTimeLength = getTimeSpent(existingParams.startSessionTime)
            existingParams.previousPageTimeLength = getTimeSpent(existingParams.time)
        }

        existingParams.time = new Date();
        setCookie(existingParams);
    }
}

// Appeler la fonction principale pour créer ou mettre à jour le cookie
createOrUpdateCookie();
})()