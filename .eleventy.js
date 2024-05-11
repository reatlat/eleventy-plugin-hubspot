/* global hbspt */
module.exports = (eleventyConfig, options = {}) => {

    const hsScripts = {
        forms: {
            id: crypto.randomUUID(),
            src: "https://js.hsforms.net/forms/embed/v2.js"
        },
        meetings: {
            id: crypto.randomUUID(),
            src: "https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js"
        }
    };

    if (!options.portalId) {
        throw new Error(
            "[eleventy-plugin-hubspot] the portalId must be specified in plugin options"
        );
    }

    let loadingMode = options.loadingMode || null;

    // if no value set default to default
    if (!loadingMode) {
        loadingMode = "default";
        console.info(
            "[eleventy-plugin-hubspot] the loadingMode is not set, defaulting to 'default'.\nYou can set it to 'lazy' or 'eager' to enable lazy loading feature,\ncheck the documentation for more details https://github.com/reatlat/eleventy-plugin-hubspot#custom-usage\n"
        );
    }

    delete options.loadingMode;

    if (!["default", "lazy", "eager"].includes(loadingMode)) {
        throw new Error(
            "[eleventy-plugin-hubspot] the loadingMode must be one of 'default', 'lazy', 'eager'"
        );
    }

    const validURL = (str) => {
        const pattern = new RegExp(
            "^(https?:\\/\\/)?" + // protocol
            "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
            "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
            "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
            "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
            "(\\#[-a-z\\d_]*)?$",
            "i"
        ); // fragment locator

        return pattern.test(str);
    };

    eleventyConfig.addShortcode("hubspotForm", (formId, args = {}) => {
        if (!formId) {
            throw new Error(
                "[eleventy-plugin-hubspot] the formId of hubspotForm must be specified"
            );
        }

        if (options.loadingMode) {
            loadingMode = options.loadingMode;
            delete options.loadingMode;
            if (!["default", "lazy", "eager"].includes(loadingMode)) {
                throw new Error(
                    "[eleventy-plugin-hubspot] the loadingMode must be one of 'default', 'lazy', 'eager'"
                );
            }
        }

        /**
         * How to customize the form embed code
         * @link https://legacydocs.hubspot.com/docs/methods/forms/advanced_form_options
         */

        const uuid = crypto.randomUUID();

        let _return = ``;

        if (['eager', 'lazy'].includes(loadingMode) && !args.target) {
            options.target = `#form-wrapper-${uuid}`;
            _return += `<div id="form-wrapper-${uuid}"></div>`;
        }

        const config = { ...options, formId, ...args };
        const encodedConfig = encodeURIComponent(JSON.stringify(config));


        /* Lazy loading ****************************************************************************************
        (function(window, callback){
            callback = function(messageEvent) {
                if (messageEvent.data === "hsFormsEmbedLoaded") {
                    window.removeEventListener("message", callback);
                    hbspt.forms.create(JSON.parse(decodeURIComponent('${encodedConfig}')));
                }
            }
            window.addEventListener("message", callback);
        })(window);
        (function(w,d,options, callback, observer, target) {
            observer = new IntersectionObserver(callback, options);
            target = d.querySelector('${options.target}');
            observer.observe(target);
        })(window, document, {threshold:0.1}, function(entries, observer) {
            if (entries[0].isIntersecting) {
                let scriptID = "hs-script-${hsScripts.forms.id}";
                let scriptSrc = "${hsScripts.forms.src}";
                if (!document.getElementById(scriptID)) {
                    const scriptElement = document.createElement("script");
                    scriptElement.id = scriptID;
                    scriptElement.src = scriptSrc;
                    scriptElement.defer = true;
                    scriptElement.onload = scriptElement.onreadystatechange = function() {
                        if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                            scriptElement.onload = scriptElement.onreadystatechange = null;
                            postMessage('hsFormsEmbedLoaded');
                        }
                    };
                    document.body.appendChild(scriptElement);
                }
                observer.disconnect()
            }
        });
        */

        if (loadingMode === "lazy") {
            _return += `<script type="text/javascript">/*<![CDATA[|*/(function(s,t){t=function(n){n.data==="hsFormsEmbedLoaded"&&(s.removeEventListener("message",t),hbspt.forms.create(JSON.parse(decodeURIComponent("${encodedConfig}"))))},s.addEventListener("message",t)})(window),function(s,t,n,o,e,d){e=new IntersectionObserver(o,n),d=t.querySelector("${options.target}"),e.observe(d)}(window,document,{threshold:.1},function(s,t){if(s[0].isIntersecting){let n="hs-script-${hsScripts.forms.id}",o="${hsScripts.forms.src}";if(!document.getElementById(n)){const e=document.createElement("script");e.id=n,e.src=o,e.defer=!0,e.onload=e.onreadystatechange=function(){(!this.readyState||this.readyState==="loaded"||this.readyState==="complete")&&(e.onload=e.onreadystatechange=null,postMessage("hsFormsEmbedLoaded"))},document.body.appendChild(e)}t.disconnect()}});/*]]>*/</script>`;
            return _return;
        }

        /* Eager loading ****************************************************************************************
        window.addEventListener("message", function(messageEvent) {
            if (messageEvent.data === "hsFormsEmbedLoaded") {
                hbspt.forms.create(JSON.parse(decodeURIComponent('${encodedConfig}')));
            }
        }, {once: true});
        (function(window, document, scriptID, scriptSrc, scriptElement) {
            window.addEventListener("DOMContentLoaded", function() {
                if (!document.getElementById(scriptID)) {
                    scriptElement = document.createElement("script");
                    scriptElement.id = scriptID;
                    scriptElement.src = scriptSrc;
                    scriptElement.defer = true;
                    scriptElement.onload = scriptElement.onreadystatechange = function() {
                        if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                            postMessage("hsFormsEmbedLoaded");
                            scriptElement.onload = scriptElement.onreadystatechange = null;
                        }
                    };
                    document.body.appendChild(scriptElement);
                }
            });
        })(window, document, "hs-script-${hsScripts.forms.id}", "${hsScripts.forms.src}");
        */

        if (loadingMode === "eager") {
            _return += `<script type="text/javascript">/*<![CDATA[|*/window.addEventListener("message",function(d){d.data==="hsFormsEmbedLoaded"&&hbspt.forms.create(JSON.parse(decodeURIComponent("${encodedConfig}")))},{once:!0}),function(d,o,a,n,e){d.addEventListener("DOMContentLoaded",function(){o.getElementById(a)||(e=o.createElement("script"),e.id=a,e.src=n,e.defer=!0,e.onload=e.onreadystatechange=function(){(!this.readyState||this.readyState==="loaded"||this.readyState==="complete")&&(postMessage("hsFormsEmbedLoaded"),e.onload=e.onreadystatechange=null)},o.body.appendChild(e))})}(window,document,"hs-script-${hsScripts.forms.id}","${hsScripts.forms.src}");/*]]>*/</script>`;
            return _return;
        }

        return `
            <script charset="utf-8" type="text/javascript" src="${hsScripts.forms.src}"></script>
            <script type="text/javascript">/*<![CDATA[|*/hbspt.forms.create(JSON.parse(decodeURIComponent('${encodedConfig}')))/*]]>*/</script>
        `;
    });

    eleventyConfig.addShortcode("hubspotMeetings", (url) => {
        if (!url) {
            throw new Error(
                "[eleventy-plugin-hubspot] URL of hubspotMeeting must be specified"
            );
        }

        if (!validURL(url)) {
            throw new Error(
                `[eleventy-plugin-hubspot] the URL: [${url}] of hubspotMeetings is not valid`
            );
        }

        return `
            <div class="meetings-iframe-container" data-src="${url.split('?')[0]}?embed=true"></div>
            <script id="hs-script-${hsScripts.meetings.id}" charset="utf-8" type="text/javascript" src="${hsScripts.meetings.src}"></script>
        `;
    });
};
