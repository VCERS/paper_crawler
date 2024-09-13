function isSessionStorageAvailable() {
  try {
    var storage = sessionStorage;
    var x = '__test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}
async function testFirebaseFCM() {
    url = "https://fcm.googleapis.com/";
    try {
        const response = await fetch(url, {method:"POST", signal:AbortSignal.timeout(8000), mode: 'no-cors'}); // 8 second timeout
        if (response) {
            return "True";
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
    return "False";
}
function isChrome() {
    if (navigator.userAgentData?.brands?.some(b => b.brand === 'Google Chrome')) {
        return "Chrome";
    } else {
        return "not Chrome";
    }
}
function SlidePrompt() {
    if (window.location.hostname.indexOf("stag") > -1) {
        var applicationID = "f8a2adb3-8d7a-497a-ae8c-b241b261d142"; //STAG
        document.addEventListener("DOMContentLoaded", (event) => $("<div class='onesignal-customlink-container'></div>").insertBefore("div.news-article-content-footer.mb-3"));
    } else if (window.location.hostname.indexOf("www") > -1) {
        var applicationID = "e35f1e35-8993-4812-85eb-964be3377ef8"; // PROD
    } else {
        return;
    }
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    OneSignalDeferred.push(function(OneSignal) {
        OneSignal.init({
          appId: applicationID,
        });
    });
    //<!-- insert Onesignal customlink -->
//        if (window.location.hostname.indexOf("stag") > -1) {
//            document.addEventListener("DOMContentLoaded", (event) => $("<div class='onesignal-customlink-container'></div>").insertBefore("div.news-article-content-footer.mb-3"));
//       }
}
async function setupSlidePrompt(){
    let WPvendor = sessionStorage.getItem("WPvendor");
    let WPfirebase = sessionStorage.getItem("WPfirebase");
    // if we don't know browser vendor, is it Chrome?
    if (WPvendor == "") {
        WPvendor = isChrome();
        sessionStorage.setItem("WPvendor", WPvendor);
        console.log("WPvendor >> ", WPvendor);
        console.log("WPfirebase >> ", WPfirebase);
    }
    // if vendor is chome and we don't know if we have access to Google APIs    
    console.log("WPfirebase >> ", WPfirebase);
    if ((WPvendor == "Chrome") && (WPfirebase == "")) {
        WPfirebase = await testFirebaseFCM();
        sessionStorage.setItem("WPfirebase", WPfirebase);
    }
    // if vendor is not chrome or firebase cloud messaging is available
    if ((WPvendor != "Chrome") || WPfirebase == "True") {
        SlidePrompt();
        console.log("OneSinal WebPush >> invoking slideprompt")
    } else {
        console.log("OneSinal WebPush >> NOT invoking slideprompt")
    }
}

function mainWebPushPrompt() {
  // if we are on an eligible page
  const myTypes = new Set(['article', 'feature-article', 'latest-news', 'scienceinsider', 'scienceshots', 'sifter']);
  try {
      if (! myTypes.has(AAASdataLayer.page.attributes.aaasProgram)) {
        return;
      }
  } catch(e) {
    window.alert(e);
    return;
  }
  if (isSessionStorageAvailable() && window.location.href.indexOf("/content/article") > -1 && (window.location.hostname.indexOf("stag") > -1 || window.location.hostname.indexOf("www") > -1)) {
    if (sessionStorage.getItem("WPvendor") == null) {
        sessionStorage.setItem("WPvendor", "");
    }
    if (sessionStorage.getItem("WPfirebase") == null) {
        sessionStorage.setItem("WPfirebase", "");
    }
    setupSlidePrompt();
  }
}

document.addEventListener("DOMContentLoaded", function(event){ mainWebPushPrompt();} );