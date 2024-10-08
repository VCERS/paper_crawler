(function () {
  var scheme = (("https:" == document.location.protocol) ? "https" : "http");
  var adnxs_domain = 'secure.adnxs.com';
  var aol_domain = 'secure.leadback.advertising.com';
  window.adroll_seg_eid = "46U26RAQONGNHBVT2HKCQR";
  window.adroll_sendrolling_cross_device = false;
  window.adroll_form_fields = {"form[name=\"prechat-form\"] input[name=\"email\"]":{"sel":"form[name=\"prechat-form\"] input[name=\"email\"]","type":"email","auth":0},"form[name=\"prechat-form\"] input[name=\"email\"]:noconsent":{"sel":"form[name=\"prechat-form\"] input[name=\"email\"]:noconsent","type":":contact","auth":0}};
  window.adroll_third_party_forms = {};
  window.adroll_third_party_detected = {"3LBZJ4KXKBF2PJ46QCMT3X":{"advertisable_eid":"3LBZJ4KXKBF2PJ46QCMT3X","has_hubspot":false,"has_mailchimp":false,"has_marketo":false}};
  window.adroll_snippet_errors = [];
  if (typeof __adroll._form_attach != 'undefined') {
    __adroll._form_attach();
  }
  if (typeof __adroll._form_tp_attach != 'undefined') {
    __adroll._form_tp_attach();
  }
  window.adroll_rule_type = "c";
  var rule = ["4b120633", "*10.1021/acsenergylett*"];
  var conversion = __adroll.get_conversion_value()
  if(conversion == null){
    adroll_conversion_value = 1;
    adroll_currency = 'USD';
  } else if (conversion.currency == 'USC'){
    adroll_conversion_value = conversion.conv_value / 100
    adroll_currency = 'USD'
  }
  if (scheme=='http') { adnxs_domain = 'ib.adnxs.com'; aol_domain = 'leadback.advertising.com';}
  var el = document.createElement("div");
  el.style["width"] = "1px";
  el.style["height"] = "1px";
  el.style["display"] = "inline";
  el.style["position"] = "absolute";
  var content = '';

  if (__adroll.consent_allowed(__adroll.consent_networks.facebook)) {
  }

  try {
      try {
          
(function() {
var rtb = document.createElement("div");
rtb.style["width"] = "1px";
rtb.style["height"] = "1px";
rtb.style["display"] = "inline";
rtb.style["position"] = "absolute";
rtb.innerHTML = ["/cm/b/out?advertisable=3LBZJ4KXKBF2PJ46QCMT3X","/cm/experian/out?advertisable=3LBZJ4KXKBF2PJ46QCMT3X","/cm/g/out?advertisable=3LBZJ4KXKBF2PJ46QCMT3X","/cm/index/out?advertisable=3LBZJ4KXKBF2PJ46QCMT3X","/cm/n/out?advertisable=3LBZJ4KXKBF2PJ46QCMT3X","/cm/o/out?advertisable=3LBZJ4KXKBF2PJ46QCMT3X","/cm/outbrain/out?advertisable=3LBZJ4KXKBF2PJ46QCMT3X","/cm/pubmatic/out?advertisable=3LBZJ4KXKBF2PJ46QCMT3X","/cm/r/out?advertisable=3LBZJ4KXKBF2PJ46QCMT3X","/cm/taboola/out?advertisable=3LBZJ4KXKBF2PJ46QCMT3X","/cm/triplelift/out?advertisable=3LBZJ4KXKBF2PJ46QCMT3X","/cm/x/out?advertisable=3LBZJ4KXKBF2PJ46QCMT3X"].reduce(function (acc, cmURL) {
    return acc + '<img height="1" width="1" style="border-style:none;" alt="" src="' + __adroll._srv(cmURL) + '"/>';
}, '');
__adroll._head().appendChild(rtb);
})();

      } catch(e) {
          window.adroll_snippet_errors['maya_snippet'] = e;
      }
      try {
          
(function(){
    window.adroll_sendrolling_hashed_only = true;
    var scr = document.createElement("script");
    scr.type = "text/javascript";
    scr.src = "//s.adroll.com/j/sendrolling.js";
    ((document.getElementsByTagName("head") || [null])[0] || document.getElementsByTagName("script")[0].parentNode).appendChild(scr);
}());

      } catch(e) {
          window.adroll_snippet_errors['sendrolling'] = e;
      }
  } catch(e) {}

  var r = Math.random()*10000000000000000;
  content = content.replace(/\[ord\]/gi, r);
  content = content.replace(/\[protocol\]/gi, scheme);
  content = content.replace(/\[adnxs_domain\]/gi, adnxs_domain);
  content = content.replace(/\[aol_domain\]/gi, aol_domain);
  var adroll_tpc = __adroll._global('adroll_tpc');
  if (adroll_tpc) {
    var srv_parts = __adroll._srv().split('?');
    var srv_host = srv_parts[0].substr(srv_parts[0].indexOf(':') + 1);
    var srv_re = new RegExp(srv_host + '([^\?\"\'\>\#\S]+)\\?*', 'gi');
    content = content.replace(srv_re, srv_host + '$1?' + srv_parts[1] + '&');
  }
  content = __adroll.replace_external_data(content);
  el.innerHTML = content;
  __adroll._head().appendChild(el);
  if (typeof __adroll.set_pixel_cookie != 'undefined') {__adroll.set_pixel_cookie(adroll_adv_id, adroll_pix_id, "46U26RAQONGNHBVT2HKCQR");}
}());
