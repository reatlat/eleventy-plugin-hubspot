/* global hbspt */
module.exports = (eleventyConfig, options = {}) => {
    if (!options.portalId) {
        throw new Error(
            "[eleventy-plugin-hubspot] the portalId must be specified in plugin options"
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

        return !!pattern.test(str);
    };

    eleventyConfig.addShortcode("hubspotForm", (formId, args = {}) => {
        if (!formId) {
            throw new Error(
                "[eleventy-plugin-hubspot] the formId of hubspotForm must be specified"
            );
        }

        /**
         * How to customize the form embed code
         * @link https://legacydocs.hubspot.com/docs/methods/forms/advanced_form_options
         */
        const config = { ...options, ...{ formId: formId }, ...args };

        return `
          <!--[if lte IE 8]>
          <script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/v2-legacy.js"></script>
          <![endif]-->
          <script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/v2.js"></script>
          <script data-hubspot-rendered="true">hbspt.forms.create(${JSON.stringify(config)});</script>
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
            <script charset="utf-8" type="text/javascript" src="//static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js"></script>
        `;
    });
};
