function ntvOnReadyCheck82579(){
    if (this.PostRelease == undefined || ! typeof this.PostRelease.PushAd === 'function'){
        setTimeout(function () { ntvOnReadyCheck82579() }, 100);
    } else {
    	(function(){PostRelease.ProcessResponse({"version":"3","placements":[],"trackingCode":"","safeIframe":false,"isWebview":false,"responseConsent":{"usPrivacyApplies":false,"gdprApplies":false,"gppApplies":false},"flags":{"useObserverViewability":true,"useMraidViewability":false}});})();
	}
}
ntvOnReadyCheck82579();