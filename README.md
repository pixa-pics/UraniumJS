# UraniumJS

![UraniumJS branding logo](https://raw.githubusercontent.com/pixa-pics/UraniumJS/main/Branding.png)

> ENRICH a text into a simple and compressed BASE92 readable string &amp; DEPLETE it back!

---

## How to use it?

```JavaScript

import UraniumJS from "./UraniumJS"; // In node.js
/* OR */
var UraniumJS = window.UraniumJS; // Use the minified version for browser (> safari 10 & > Chrome 51)

/* STEP 1 --INPUT-- */

var text = `var t = function(base64) {
    "use strict";
    return new Promise(function(resolve, reject) {
        var img = new Image();
        var is_png = base64.startsWith("data:image/png;");
        img.onload = function() {
    
            var canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL(is_png ? "image/png": "image/jpeg")); 
        };
        img.onerror = function() { reject(); };
        img.src = base64;
    });
}; return t;`;

/* STEP 2 --PROCESSING-- */

var enriched = UraniumJS.enrichString(text); // 0-45% Lighter in average, in this case it is only 16% lighter because the source text is already small
// RAW -> #K;tD,5o{w!c!)O0.,jkiP6H#A8jY@JMJx2~cw3=*0j2SX;_M=!&#?!§g:uXoG#:Jy=.Sr24.T~C7S0HJ6_Dn25C¡HjBiBP:I2^tk<V)qjtW,§1@I2T5V<§c~MmnA8[&!!¡L!!4 #jm~AV!_6F§¡~9a.KY>8?d!§,u¡nk9cirQ!!Zc¡ #mkWl_d.;%_MBf8yBF<vQ§3* VHa,MMIHmtDIV,e%bm~AVJYHnSuP{Eb!2{Z!%*J!BO#!fO2!:htB5azJN¡aOU5W5KoxB5ZiD{<zQ§3l@Pj(O¡U)BF:!!&aX!!MY!2ccTbkh 66LOdL},L#HHm2Cn23-hI~C¡xs.)%!&O##4_t§)O%P0E^1kZs!2Ja!&UAZ:#.O#%!!![Y!!H@!vJz#Gx|8a§W!;oI[!I2k[Vc6HQ%:&Wq8PJ8T<d96,*8jfA(<QF;PHfRO#4<!!F^!61VfQ%JO#K-!c1U!%j%.*ZS!-~lq9*U[@@!;pZom¡)~NF*+)3!H^>R~¡ ¡ mq*v6c.#0e!-8,wF!a!%r}Hm_<ixd1_v#Sfb!6!dEr!S6=~I8_;?Z<!l8QRPV9aX{(r](PHe§+v2!!!!!!

var depleted = UraniumJS.stringDeplete("#K;tD,5o{w!c!)O0.,jkiP6H#A8jY@JMJx2~cw3=*0j2SX;_M=!&#?!§g:uXoG#:Jy=.Sr24.T~C7S0HJ6_Dn25C¡HjBiBP:I2^tk<V)qjtW,§1@I2T5V<§c~MmnA8[&!!¡L!!4 #jm~AV!_6F§¡~9a.KY>8?d!§,u¡nk9cirQ!!Zc¡ #mkWl_d.;%_MBf8yBF<vQ§3* VHa,MMIHmtDIV,e%bm~AVJYHnSuP{Eb!2{Z!%*J!BO#!fO2!:htB5azJN¡aOU5W5KoxB5ZiD{<zQ§3l@Pj(O¡U)BF:!!&aX!!MY!2ccTbkh 66LOdL},L#HHm2Cn23-hI~C¡xs.)%!&O##4_t§)O%P0E^1kZs!2Ja!&UAZ:#.O#%!!![Y!!H@!vJz#Gx|8a§W!;oI[!I2k[Vc6HQ%:&Wq8PJ8T<d96,*8jfA(<QF;PHfRO#4<!!F^!61VfQ%JO#K-!c1U!%j%.*ZS!-~lq9*U[@@!;pZom¡)~NF*+)3!H^>R~¡ ¡ mq*v6c.#0e!-8,wF!a!%r}Hm_<ixd1_v#Sfb!6!dEr!S6=~I8_;?Z<!l8QRPV9aX{(r](PHe§+v2!!!!!!"); // AS ORIGINAL
// RAW -> var t = function(base64) {     "use strict";     return new Promise(function(resolve, reject) {         var img = new Image();         var is_png = base64.startsWith("data:image/png;");         img.onload = function() {                  var canvas = document.createElement("canvas");             canvas.width = img.naturalWidth || img.width;             canvas.height = img.naturalHeight || img.height;             var ctx = canvas.getContext("2d");             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);             resolve(canvas.toDataURL(is_png ? "image/png": "image/jpeg"));          };         img.onerror = function() { reject(); };         img.src = base64;     }); }; return t;
```

## How to use it with JavaScript function?

```JavaScript
/* STEP 3 --EVAL-- (optional) */
var AsyncFunctionConstructor = Object.getPrototypeOf(async function(){}).constructor;
var FunctionConstructor = Object.getPrototypeOf(function(){}).constructor;

var sanitizeInlineImageFunction = new FunctionConstructor(depleted);
    sanitizeInlineImageFunction("data:image/png;base64,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")
    .then(function(result){ console.log(result); })
```
