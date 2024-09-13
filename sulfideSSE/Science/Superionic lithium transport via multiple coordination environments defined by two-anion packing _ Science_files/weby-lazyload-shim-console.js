// web_lazyload_shim.js
// Don Fick, 12 Oct 2023
// Based on https://developers.google.com/publisher-tag/samples/lazy-loading

window.googletag = window.googletag || {cmd: []};

googletag.cmd.push(function() {

    // Enable lazy loading
    googletag.pubads().enableLazyLoad({
        // Fetch slots within 1 viewport. This is relatively close.
        // 500 is more conservative but fetches about 4 ads on initial desktop viewport.
        fetchMarginPercent: 50,
        
        // Render slots within 1 viewport. This is close.
        // 300 is more conservative.
        renderMarginPercent: 50,
        
        // Multiply the above values on mobile, where viewports are smaller
        // and users tend to scroll faster.
        mobileScaling: 2.0
    });

    // Register event handlers to observe lazy loading behavior.
    googletag.pubads().addEventListener('slotRequested', function(event) {
        updateSlotStatus(event.slot.getSlotElementId(), 'fetched');
    });

    googletag.pubads().addEventListener('slotOnload', function(event) {
        updateSlotStatus(event.slot.getSlotElementId(), 'rendered');
    });

});

function updateSlotStatus(slotId, state) {
    // Log or display results as ad slot is fetched and loaded
    console.log('Weby Lazy Shim >> ad slot: '+slotId + '; slot state: ' + state);
}