const eleventyPluginHubspot = require("../.eleventy.js");

module.exports = function (eleventyConfig) {
    /**
     * How to customize the form embed code
     * @link https://legacydocs.hubspot.com/docs/methods/forms/advanced_form_options
     */
    eleventyConfig.addPlugin(eleventyPluginHubspot, {
        region: "na1",
        portalId: "45442241",
        locale: "en",
        // loadingMode: "eager",
        //loadingMode: "interact",
        loadingMode: "lazy",
        //cssRequired: "",
        //cssClass: "",
        translations: {
            en: {
                invalidEmail: "Please enter a valid business email."
            },
        },
    });
};