const eleventyPluginHubspot = require("../.eleventy.js");

module.exports = function (eleventyConfig) {
    /**
     * How to customize the form embed code
     * @link https://legacydocs.hubspot.com/docs/methods/forms/advanced_form_options
     */
    eleventyConfig.addPlugin(eleventyPluginHubspot, {
        portalId: 8768191,
        locale: "en",
        //cssRequired: "",
        //cssClass: "",
        translations: {
            en: {
                invalidEmail: "Please enter a valid business email."
            },
        },
    });
};