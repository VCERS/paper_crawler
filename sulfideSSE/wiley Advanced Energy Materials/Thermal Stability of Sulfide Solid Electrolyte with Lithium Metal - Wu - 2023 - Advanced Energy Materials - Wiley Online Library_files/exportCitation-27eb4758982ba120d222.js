(window.webpackJsonp=window.webpackJsonp||[]).push([[17],{320:function(t,e,a){"use strict";a.r(e);a(321);UX.exportCitation.control=function(){$(document).ready((function(){$(".exportCitationWrapper").length&&$(".articles-toolbar, .exportCitationCheckbox").removeClass("js--hidden")})),$(document).on("click",".export-citations__submit",(function(t){t.preventDefault();var e=$(this).data("form");$(e).submit()})),$(document).on("click",".articles-toolbar-option",(function(){var t=$(this),e=$("body"),a=t.data("target"),o=t.data("access-type"),n=e.find('[data-type="exportCitation"]:checked');n.length?($('[data-type="filled"]').show(),$('[data-type="empty"]').hide(),UX.exportCitation.collectDois(n,a,o)):($('[data-type="empty"]').show(),$('[data-type="filled"]').hide())})),$(document).on("change",".selectAllCitation",(function(){var t=$(this);$(t).is(":checked")?($('[data-type="exportCitation"]').prop("checked",!0),t.next(".label-txt").attr("aria-label","Deselect all articles")):($('[data-type="exportCitation"]').prop("checked",!1),t.next(".label-txt").attr("aria-label","Select all articles"))})),$(document).on("change",'[data-type="exportCitation"]',(function(){!$(this).is(":checked")&&$(".selectAllCitation").is(":checked")&&$(".selectAllCitation").prop("checked",!1),$('[data-type="exportCitation"]:not(:checked)').length||$(".selectAllCitation").prop("checked",!0)}))},UX.exportCitation.collectDois=function(t,e,a){var o,n=$(e),i=n.find(".collectedDois"),r=n.find(".collectedDoisNum"),s=n.find(".pdfSize"),l=0,c=0,d=0;switch(i.html(""),r.html(""),$(t).each((function(t,e){i.append('<input type="hidden" name="doi" value="'+$(e).val()+'"/>'),l++,$(e).data("pdf-size")&&(d+=parseFloat($(e).data("pdf-size")),c++)})),s.text(d.toFixed(1)),o=l>1?"s":"",e){case"#exportCitation":r.html("<p>You have chosen to export&nbsp;<span>"+l+"</span>&nbsp;citation"+o+".</p>");break;case"#pdfDownload":switch(a){case"all":r.html("<p>You have chosen to download&nbsp;<span>"+l+"</span>&nbsp;PDF"+o+".</p>");break;case"some":r.html("<p>You can continue to download&nbsp;<span>"+c+"</span>&nbsp;PDF"+o+"&nbsp;of the "+l+" you have selected.</p>");break;case"full-book":r.html("<p>Continue to download&nbsp;<span>"+c+"</span>&nbsp;PDF"+o+".</p>")}}}},321:function(t,e){var a;a={$toggle:$("#citation-format"),$target:$(".csl-response"),$wrapper:null,$multiToggle:$(".issue-Item__checkbox:checked"),dois:null,$trigger:null,response:null,selectCiteStyle:null,responseFormat:{},citationLimited:!1,citationLimitNumber:0,loadingAdditionalInfo:"",init:function init(){a.control()},control:function control(t,e,o){$(document).on("click",'[data-target="#exportCitation"]',(function(){a.$trigger=$(this),a.resetPopup(a.$trigger),a.dois=a.collectDois(a.$trigger).toString(),a.loadCiteProc(a.$toggle)})),$(document).on("change","#citation-format",(function(){a.loadCiteProc($(this))}))},getWarningMessage:function getWarningMessage(t){return t},performServerSideAjax:function performServerSideAjax(t,e,o){$.ajax({url:t,data:e,async:!0,success:function success(t){a.response=t,a.responseFormat[o]=a.response,a.setContent(a.responseFormat[o].content),a.downloadCiteProc()}})},collectDois:function collectDois(t){var e=[],o=!1;return t.hasClass("export-citation")&&(o=!0),o?(a.$multiToggle=$(".issue-Item__checkbox:checked"),a.$multiToggle.each((function(){var t=$(this),a="doi"===t.attr("name")?t.val():t.attr("name");e.push(a)}))):t.find('[name="doiVal"]').each((function(){e.push($(this).val())})),e},loadCiteProc:function loadCiteProc(t){a.selectCiteStyle=t.val();var e=$("[value="+a.selectCiteStyle+"]").data("format"),o="custom-"+a.selectCiteStyle;if($("#export-warning").empty(),a.$wrapper=t.closest(".csl-wrapper"),a.$target=a.$wrapper.find(".csl-response"),a.selectCiteStyle){a.$wrapper.find(".copy__btn, .download__btn").addClass("disabled").parent("li").css("cursor",""),a.$wrapper.find("#citation-format").attr("disabled","disabled");var n="Loading "+a.loadingAdditionalInfo+"... ";a.$target.html("<span>"+n+"</span>");var i=a.setParams(o,e);void 0!==a.responseFormat[a.selectCiteStyle]?(a.setContent(a.responseFormat[a.selectCiteStyle].content),a.downloadCiteProc()):a.performServerSideAjax("/action/exportCiteProcCitation",i,a.selectCiteStyle),a.$wrapper.find('[name="dois"]').val(a.dois),a.$wrapper.find('[name="format"]').val(e)}},setParams:function setParams(t,e){return{dois:a.dois,targetFile:t,format:e}},resetPopup:function resetPopup(t){a.$target.html(""),a.responseFormat={},a.$toggle.prop("selectedIndex",0);var e=$(t.attr("data-target"));e.find(".copy__btn, .download__btn").addClass("disabled").parent("li").css("cursor",""),e.find("#citation-format").attr("disabled","disabled")},setContent:function setContent(t){a.$target.html(t),a.$wrapper.find('[name="content"]').val(a.$target.text()),a.$wrapper.find(".copy__btn, .download__btn").removeClass("disabled").parent("li").css("cursor","pointer"),a.$wrapper.find("#citation-format").removeAttr("disabled"),a.responseFormat[a.selectCiteStyle].warning&&a.$wrapper.find("#export-warning").html(a.getWarningMessage(a.responseFormat[a.selectCiteStyle].warning))},downloadCiteProc:function downloadCiteProc(){var t=$(".download__btn"),e=a.$target,o="";if(e.is(".csl-response")&&(a.$target.find(".csl-right-inline").length?(o=(e=a.$target.find(".csl-right-inline")).html(),/<\/?[a-z][\s\S]*>/i.test(e.html())&&(o=e.text())):a.$target.find(".csl-entry").length&&(o=(e=a.$target.find(".csl-entry")).html(),/<\/?[a-z][\s\S]*>/i.test(e.html())&&(o=e.text())),e.length>1)){var n="";e.each((function(){var t=$(this);/<\/?[a-z][\s\S]*>/i.test(t.html())?n+=t.text()+"\n\n":n+=t.html()+"\n\n"})),o=n}o=a.additionalDownloadDataFormat(o),t.attr("href","data:"+a.responseFormat[a.selectCiteStyle].contentType+";charset=utf-8,"+encodeURIComponent(o)),t.attr("download",a.responseFormat[a.selectCiteStyle].fileName+"."+a.responseFormat[a.selectCiteStyle].suffix)},additionalDownloadDataFormat:function additionalDownloadDataFormat(t){return t}},UX.exportCitation=a}}]);
//# sourceMappingURL=exportCitation-27eb4758982ba120d222.js.map