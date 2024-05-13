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
            "[eleventy-plugin-hubspot] the loadingMode is not set, defaulting to 'default'.\nYou can set it to 'lazy', 'eager', or 'interact' to enable lazy loading feature,\ncheck the documentation for more details https://github.com/reatlat/eleventy-plugin-hubspot#custom-usage\n"
        );
    }

    delete options.loadingMode;

    if (!["default", "lazy", "eager", "interact"].includes(loadingMode)) {
        throw new Error(
            `[eleventy-plugin-hubspot] the loadingMode must be one of 'default', 'lazy', 'eager', 'interact'`
        );
    }

    const minifyCode = (code) => {
        return code
            .split('\n') // split on new line
            .map(line => line.trim()) // remove leading/trailing white space
            .filter(line => line.length && !line.startsWith('//')) // remove empty lines & single line comments
            .join(''); // join back to a single string
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

    const lazyLoadingCode = (encodedConfig, options, hsScripts) => {
        return `<script type="text/javascript">
        /*<![CDATA[|*/
        (function(w, cb){
            cb = function(e) {
                if (e.data === "hsFormsEmbedLoaded") {
                    w.removeEventListener("message", cb);
                    hbspt.forms.create(JSON.parse(decodeURIComponent('${encodedConfig}')));
                }
            };
            w.addEventListener("message", cb);
        })(window);
        (function(w,d,o,cb,observer,target) {
            observer = new IntersectionObserver(cb, o);
            target = d.querySelector('${options.target}');
            observer.observe(target);
        })(window, document, {threshold:0.1}, function(entries, observer) {
            if (entries[0].isIntersecting) {
                let scriptID = "hs-script-${hsScripts.forms.id}";
                if (!document.getElementById(scriptID)) {
                    const s = document.createElement("script");
                    s.id = scriptID;
                    s.src = "${hsScripts.forms.src}";
                    s.defer = true;
                    s.onload = s.onreadystatechange = function() {
                        if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                            s.onload = s.onreadystatechange = null;
                            postMessage('hsFormsEmbedLoaded');
                        }
                    };
                    document.body.appendChild(s);
                }
                observer.disconnect()
            }
        });
        /*]]>*/
        </script>`;
    }

    const interactLoadingCode = (encodedConfig, options, hsScripts) => {
        return `<script type="text/javascript">
        /*<![CDATA[|*/
        (function(w, cb){
            cb = function(e) {
                if (e.data === "hsFormsEmbedLoaded") {
                    w.removeEventListener("message", cb);
                    hbspt.forms.create(JSON.parse(decodeURIComponent('${encodedConfig}')));
                }
            };
            w.addEventListener("message", cb);
        })(window);
        ((w, f, i, s) => {
            ["keydown", "click", "scroll", "mousemove", "touchstart"].forEach((en) => {
                w.addEventListener(en, function() {
                    if (!f) {
                        f = true;
                        postMessage("user_first_interaction");
                        if (!document.getElementById(i)) {
                            s = document.createElement("script");
                            s.id = i;
                            s.src = "${hsScripts.forms.src}";
                            s.defer = true;
                            s.onload = s.onreadystatechange = function() {
                                if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                                    s.onload = s.onreadystatechange = null;
                                    postMessage('hsFormsEmbedLoaded');
                                }
                            };
                            document.body.appendChild(s);
                        }
                    }
                },{once: true});
            })
        })(window, false, "hs-script-${hsScripts.forms.id}");
        /*]]>*/
        </script>`;
    }

    const eagerLoadingCode = (encodedConfig, hsScripts) => {
        return `<script type="text/javascript">
        /*<![CDATA[|*/
        window.addEventListener("message", function(e) {
            if (e.data === "hsFormsEmbedLoaded") {
                hbspt.forms.create(JSON.parse(decodeURIComponent('${encodedConfig}')));
            }
        }, {once: true});
        (function(w,d,id,s) {
            w.addEventListener("DOMContentLoaded", function() {
                if (!d.getElementById(id)) {
                    s = d.createElement("script");
                    s.id = id;
                    s.src = "${hsScripts.forms.src}";
                    s.defer = true;
                    s.onload = s.onreadystatechange = function() {
                        if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                            postMessage("hsFormsEmbedLoaded");
                            s.onload = s.onreadystatechange = null;
                        }
                    };
                    d.body.appendChild(s);
                }
            });
        })(window, document, "hs-script-${hsScripts.forms.id}");
        /*]]>*/
        </script>`;
    }

    eleventyConfig.addShortcode("hubspotForm", (formId, args = {}) => {
        if (!formId) {
            throw new Error(
                `[eleventy-plugin-hubspot] the formId of hubspotForm must be specified`
            );
        }

        const uuid = crypto.randomUUID();

        let hubspotFormCode = ``;

        if (['eager', 'lazy', 'interact'].includes(loadingMode) && !args.target) {
            options.target = `#form-wrapper-${uuid}`;
            hubspotFormCode += `<div id="form-wrapper-${uuid}"></div>`;
        }

        const config = { ...options, formId, ...args };
        const encodedConfig = encodeURIComponent(JSON.stringify(config));

        if (loadingMode === "lazy") {
            hubspotFormCode += lazyLoadingCode(encodedConfig, options, hsScripts);
        } else if (loadingMode === "eager") {
            hubspotFormCode += eagerLoadingCode(encodedConfig, hsScripts);
        } else if (loadingMode === "interact") {
            hubspotFormCode += interactLoadingCode(encodedConfig, options, hsScripts);
        } else {
            hubspotFormCode = `<script charset="utf-8" type="text/javascript" src="${hsScripts.forms.src}"></script><script type="text/javascript">/*<![CDATA[|*/hbspt.forms.create(JSON.parse(decodeURIComponent('${encodedConfig}')))/*]]>*/</script>`;
        }

        return minifyCode(hubspotFormCode);
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

        return minifyCode(`
            <div class="meetings-iframe-container" data-src="${url.split('?')[0]}?embed=true"></div>
            <script id="hs-script-${hsScripts.meetings.id}" charset="utf-8" type="text/javascript" src="${hsScripts.meetings.src}"></script>
        `);
    });
};