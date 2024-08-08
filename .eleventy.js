/* global hbspt */
module.exports = (eleventyConfig, options = {}) => {

    const randomUUID = () => {
        if (typeof crypto !== 'undefined') {
            return crypto.randomUUID();
        }

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    const hsScripts = {
        forms: {
            id: randomUUID(),
            src: "https://js.hsforms.net/forms/embed/v2.js"
        },
        meetings: {
            id: randomUUID(),
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

    // default options
    options = {
        ...{
            loadingSpinner: `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" width="36" height="36" style="margin: 2rem auto; shape-rendering: auto; display: block; background: rgba(255, 255, 255, 0);" xmlns:xlink="http://www.w3.org/1999/xlink"><g><circle fill="none" stroke-width="12" stroke="#7fd1de" r="36" cy="50" cx="50"></circle><circle fill="none" stroke-linecap="square" stroke-width="12" stroke="#05a6be" r="36" cy="50" cx="50"><animateTransform keyTimes="0;0.5;1" values="0 50 50;180 50 50;720 50 50" dur="1.408450704225352s" repeatCount="indefinite" type="rotate" attributeName="transform"></animateTransform><animate keyTimes="0;0.5;1" values="11.309733552923255 214.88493750554184;113.09733552923255 113.09733552923255;11.309733552923255 214.88493750554184" dur="1.408450704225352s" repeatCount="indefinite" attributeName="stroke-dasharray"></animate></circle><g></g></g></svg>`,
        },
        ...options
    };

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
                    const interval = setInterval(function() {
                        if (hbspt?.forms?.create && typeof hbspt.forms.create === 'function') {
                            clearInterval(interval);
                            hbspt.forms.create(JSON.parse(decodeURIComponent('${encodedConfig}')));
                        }
                    }, 100);
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
                if ( !document.querySelector('[src="${hsScripts.forms.src}"]') ) {
                    const s = document.createElement("script");
                    s.src = "${hsScripts.forms.src}";
                    s.defer = true;
                    s.onload = postMessage('hsFormsEmbedLoaded');
                    document.body.appendChild(s);
                } else {
                    postMessage('hsFormsEmbedLoaded');
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
                    const interval = setInterval(function() {
                        if (hbspt?.forms?.create && typeof hbspt.forms.create === 'function') {
                            clearInterval(interval);
                            hbspt.forms.create(JSON.parse(decodeURIComponent('${encodedConfig}')));
                        }
                    }, 100);
                }
            };
            w.addEventListener("message", cb);
        })(window);
        ((w, d, f, s) => {
            ["keydown", "click", "scroll", "mousemove", "touchstart"].forEach((en) => {
                w.addEventListener(en, function() {
                    if (!f) {
                        f = true;
                        postMessage("user_first_interaction");
                        if ( !d.querySelector('[src="${hsScripts.forms.src}"]') ) {
                            s = d.createElement("script");
                            s.src = "${hsScripts.forms.src}";
                            s.defer = true;
                            s.onload = postMessage('hsFormsEmbedLoaded');
                            d.body.appendChild(s);
                        } else {
                            postMessage('hsFormsEmbedLoaded');
                        }
                    }
                },{once: true});
            })
        })(window, document, false);
        /*]]>*/
        </script>`;
    }

    const eagerLoadingCode = (encodedConfig, hsScripts) => {
        return `<script type="text/javascript">
        /*<![CDATA[|*/
        window.addEventListener("message", function(e) {
            if (e.data === "hsFormsEmbedLoaded") {
                const interval = setInterval(function() {
                    if (hbspt?.forms?.create && typeof hbspt.forms.create === 'function') {
                        clearInterval(interval);
                        hbspt.forms.create(JSON.parse(decodeURIComponent('${encodedConfig}')));
                    }
                }, 100);
            }
        }, {once: true});
        (function(w, d, s) {
            w.addEventListener("DOMContentLoaded", function() {
                if ( !d.querySelector('[src="${hsScripts.forms.src}"]') ) {
                    s = d.createElement("script");
                    s.src = "${hsScripts.forms.src}";
                    s.defer = true;
                    s.onload = postMessage("hsFormsEmbedLoaded");
                    d.body.appendChild(s);
                } else {
                    postMessage("hsFormsEmbedLoaded");
                }
            });
        })(window, document);
        /*]]>*/
        </script>`;
    }

    eleventyConfig.addShortcode("hubspotForm", (formId, args = {}) => {
        if (!formId) {
            throw new Error(
                `[eleventy-plugin-hubspot] the formId of hubspotForm must be specified`
            );
        }

        const uuid = randomUUID();

        let hubspotFormCode = ``;

        if (['eager', 'lazy', 'interact'].includes(loadingMode) && !args.target) {
            options.target = `#form-wrapper-${uuid}`;
            hubspotFormCode += `<div id="form-wrapper-${uuid}">`;
            if (options.loadingSpinner) {
                hubspotFormCode += minifyCode(options.loadingSpinner);
            }
            hubspotFormCode += `</div>`;
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