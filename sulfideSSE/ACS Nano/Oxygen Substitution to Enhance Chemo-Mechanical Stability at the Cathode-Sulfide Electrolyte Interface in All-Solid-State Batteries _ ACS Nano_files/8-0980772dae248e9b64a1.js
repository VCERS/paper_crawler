(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{283:function(n,t,e){"use strict";e.r(t);var a=function(){function Mathjax(){this.elements={head:document.head,mathjaxConfig:document.createElement("script"),mathjaxRoot:document.createElement("script")},this.src="/specs/products/achs/releasedAssets/public/mathjax-a1a62166529fca7938f616f5a0ab9f7d/MathJax.js?config=TeX-AMS-MML_HTMLorMML",this.config='MathJax.Hub.Config({\n            menuSettings: {\n                zoom: "Click",\n                zscale: "150%"\n            },\n            SVG: {\n                fonts: ["STIX-Web"],\n                linebreaks: { automatic: true },\n            },\n            "HTML-CSS": {\n                fonts: ["STIX"],\n                linebreaks: { automatic: true },\n                scale: 90,\n            },\n        });\n\n        MathJax.Hub.Register.StartupHook("mml Jax Ready", function () {\n            var MML = MathJax.ElementJax.mml;\n            MML.mi.prototype.setTeXclass = function (prev) {\n                this.getPrevClass(prev);\n                return this;\n            };\n            MML.mfrac.Augment({\n                setTeXclass: function (prev) {\n                    this.getPrevClass(prev);\n                    for (var i = 0, m = this.data.length; i < m; i++) {\n                        if (this.data[i]) this.data[i].setTeXclass();\n                    }\n                    return this;\n                }\n            });\n        });\n\n        MathJax.Hub.Register.StartupHook("SVG Jax Ready", function () {\n            var FONT = MathJax.OutputJax.SVG.FONTDATA.VARIANT["-STIX-Web-variant"] || MathJax.OutputJax.SVG.FONTDATA.VARIANT["-STIX-variant"];\n            delete MathJax.ElementJax.mml.mo.prototype.remapChars[\'°\'];\n            if (FONT) {\n                FONT.remap[0xB0]= [0x25E6, "normal"];\n                FONT.remap[0x2A]= [0x2217, "normal"];\n            }\n\n        });\n\n        MathJax.Hub.Register.StartupHook("MathML Jax Ready", function () {\n            var PARSE = MathJax.InputJax.MathML.Parse;\n            var ADD = PARSE.prototype.AddChildren;\n            PARSE.Augment({\n                AddChildren: function (mml, node) {\n                    ADD.call(this, mml, node);\n                    if (mml.type === \'mrow\') {\n                        var first = mml.data[0], last = mml.data[mml.data.length-1];\n                        if (mml.open && !mml.data[0].Get(\'stretchy\')) delete mml.open;\n                        if (mml.close && !mml.data[mml.data.length - 1].Get(\'stretchy\')) delete mml.close;\n                    }\n                }\n            });\n        });\n\n        MathJax.Hub.Register.StartupHook("HTML-CSS Jax Ready", function () {\n            var HTMLCSS = MathJax.OutputJax[\'HTML-CSS\'];\n            var DELIMITERS = HTMLCSS.FONTDATA.DELIMITERS;\n            var FONT = HTMLCSS.FONTDATA.VARIANT["-STIX-variant"] || HTMLCSS.FONTDATA.VARIANT["-STIX-Web-variant"]\n\n            var MML = MathJax.ElementJax.mml;\n\n            MML.mrow.Augment({\n              _HTMLlineBreaks: MML.mrow.prototype.HTMLlineBreaks,\n              HTMLlineBreaks: function (span) {\n\n                if (this.parent.linebreakContainer && this.Get("display") === "inline") return false;\n                return this._HTMLlineBreaks(span);\n              }\n            });\n\n\n            DELIMITERS[0x0305] = {dir: "H", alias: 0x00AF};\n            DELIMITERS[0x033F] = {dir: "H", alias: 0x003D};\n            DELIMITERS[0x20E1] = {dir: "H", alias: 0x2194};\n\n            if (FONT) {\n                FONT.remap[0xB0]= [0x25E6, "normal"];\n                FONT.remap[0x2A]= [0x2217, "normal"];\n            }\n\n            delete MathJax.ElementJax.mml.mo.prototype.remapChars[\'°\'];\n        });\n\n        MathJax.Hub.Register.StartupHook("HTML-CSS multiline Ready", function () {\n            var HTMLCSS = MathJax.OutputJax["HTML-CSS"];\n            var MML = MathJax.ElementJax.mml;\n            var PENALTY = MML.mbase.prototype.HTMLlinebreakPenalty;\n\n            MML.msqrt.Augment({\n                linebreakContainer: false,\n                HTMLbetterBreak: function () {return false}\n            });\n            MML.mroot.Augment({\n                linebreakContainer: false,\n                HTMLbetterBreak: function () {return false}\n            });\n            MML.mfrac.Augment({\n                linebreakContainer: false,\n                HTMLbetterBreak: function () {return false}\n            });\n            MML.mspace.Augment({\n                defaultDef: {\n                    indentalign: MML.INDENTALIGN.AUTO,\n                    indentshift: "0",\n                    indenttarget: "",\n                    indentalignfirst: MML.INDENTALIGN.INDENTALIGN,\n                    indentshiftfirst: MML.INDENTSHIFT.INDENTSHIFT,\n                    indentalignlast: MML.INDENTALIGN.INDENTALIGN,\n                    indentshiftlast: MML.INDENTSHIFT.INDENTSHIFT\n                },\n                HTMLbetterBreak: function (info,state) {\n                    if (info.values && info.values.id === this.spanID) {return false}\n                    var values = this.getValues(\n                        "linebreak",\n                        "indentalign","indentshift",\n                        "indentalignfirst","indentshiftfirst",\n                        "indentalignlast","indentshiftlast"\n                    );\n                    var linebreakValue = values.linebreak;\n                    if (!linebreakValue || this.hasDimAttr()) {\n                        linebreakValue = MML.LINEBREAK.AUTO;\n                    }\n                    var W = info.scanW, span = this.HTMLspanElement(), w = span.bbox.w;\n                    if (span.style.paddingLeft) {w += HTMLCSS.unEm(span.style.paddingLeft)}\n                    if (W - info.shift === 0) {return false} // don\'t break at zero width\n                    var offset = HTMLCSS.linebreakWidth - W;\n\n                    if (state.n === 0 && (values.indentshiftfirst !== state.VALUES.indentshiftfirst ||\n                        values.indentalignfirst !== state.VALUES.indentalignfirst)) {\n                        var align = this.HTMLgetAlign(state,values),\n                            shift = this.HTMLgetShift(state,values,align);\n                        offset += (info.shift - shift);\n                    }\n\n                    var penalty = Math.floor(offset / HTMLCSS.linebreakWidth * 1000);\n                    if (penalty < 0) {penalty = PENALTY.toobig - 3*penalty}\n                    penalty += info.nest * PENALTY.nestfactor;\n\n                    var linebreak = PENALTY[linebreakValue]||0;\n                    if (linebreakValue === MML.LINEBREAK.AUTO && w >= PENALTY.spacelimit &&\n                        !this.mathbackground && !this.background)\n                    {linebreak = [(w+PENALTY.spaceoffset)*PENALTY.spacefactor]}\n                    if (!MathJax.Object.isArray(linebreak)) {\n                        if (linebreak || offset >= 0) {penalty = linebreak * info.nest}\n                    } else {penalty = Math.max(1,penalty + linebreak[0] * info.nest)}\n\n                    if (penalty >= info.penalty) {return false}\n                    info.penalty = penalty; info.values = values; info.W = W; info.w = w;\n                    values.lineleading = state.VALUES.lineleading;\n                    values.linebreakstyle = "before"; values.id = this.spanID;\n                    return true;\n                }\n            });\n\n\n            \n            PENALTY.goodbreak = [-400];\n\n        });',this.init()}return Mathjax.prototype.init=function(){try{window.opera?this.elements.mathjaxConfig.innerHTML=this.config:this.elements.mathjaxConfig.text=this.config,this.elements.mathjaxRoot.type="text/javascript",this.elements.mathjaxConfig.type="text/x-mathjax-config",this.elements.mathjaxRoot.src=this.src,this.elements.head.appendChild(this.elements.mathjaxRoot),this.elements.head.appendChild(this.elements.mathjaxConfig)}catch(n){console.error("something went wrong when importing Mathjax :",n)}},Mathjax}();t.default=a}}]);
//# sourceMappingURL=8-0980772dae248e9b64a1.js.map