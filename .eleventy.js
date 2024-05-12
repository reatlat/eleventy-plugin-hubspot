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
            `[eleventy-plugin-hubspot] the portalId must be specified in plugin options`
        );
    }

    let loadingMode = options.loadingMode || null;

    if (!loadingMode) {
        loadingMode = "default";
        console.info(
            "[eleventy-plugin-hubspot] the loadingMode is not set, defaulting to 'default'.\nYou can set it to 'lazy' or 'eager' to enable lazy loading feature,\ncheck the documentation for more details https://github.com/reatlat/eleventy-plugin-hubspot#custom-usage\n"
        );
    }

    delete options.loadingMode;

    if (!["default", "lazy", "eager"].includes(loadingMode)) {
        throw new Error(
            `[eleventy-plugin-hubspot] the loadingMode must be one of 'default', 'lazy', 'eager'`
        );
    }

    function validURL(str) {
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
    }

    const lazyLoadingCode = (encodedConfig, options, hsScripts) => {
        return `<script type="text/javascript">
        /*<![CDATA[|*/
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
        /*]]>*/
        </script>`;
    };

    const eagerLoadingCode = (encodedConfig, hsScripts) => {
        return `<script type="text/javascript">
        /*<![CDATA[|*/
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
        /*]]>*/
        </script>`;
    };

    eleventyConfig.addShortcode("hubspotForm", (formId, args = {}) => {
        if (!formId) {
            throw new Error(
                `[eleventy-plugin-hubspot] the formId of hubspotForm must be specified`
            );
        }

        const uuid = crypto.randomUUID();

        let hubspotFormCode = ``;

        if (['eager', 'lazy'].includes(loadingMode) && !args.target) {
            options.target = `#form-wrapper-${uuid}`;
            hubspotFormCode += `<div id="form-wrapper-${uuid}"></div>`;
        }

        const config = { ...options, formId, ...args };
        const encodedConfig = encodeURIComponent(JSON.stringify(config));

        if (loadingMode === "lazy") {
            hubspotFormCode += lazyLoadingCode(encodedConfig, options, hsScripts);
        } else if (loadingMode === "eager") {
            hubspotFormCode += eagerLoadingCode(encodedConfig, hsScripts);
        } else {
            hubspotFormCode = `<script charset="utf-8" type="text/javascript" src="${hsScripts.forms.src}"></script><script type="text/javascript">/*<![CDATA[|*/hbspt.forms.create(JSON.parse(decodeURIComponent('${encodedConfig}')))/*]]>*/</script>`;
        }

        return hubspotFormCode.replace(/\n/g, '').trim();
    });

    eleventyConfig.addShortcode("hubspotMeetings", (url) => {
        if (!url) {
            throw new Error(
                `[eleventy-plugin-hubspot] URL of hubspotMeeting must be specified`
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