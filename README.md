# eleventy-plugin-hubspot
An Eleventy [shortcode](https://www.11ty.dev/docs/shortcodes/) that generates HubSpot forms or Meetings Calendar.

## Installation
Install the plugin from [npm](https://www.npmjs.com/package/eleventy-plugin-hubspot):

```
npm install eleventy-plugin-hubspot
```


Add it to your [Eleventy Config](https://www.11ty.dev/docs/config/) file:

```js
const eleventyPluginHubspot = require('eleventy-plugin-hubspot');

module.exports = function (eleventyConfig) {
    eleventyConfig.addPlugin(eleventyPluginHubspot, {
        portalId: 1234567
    });
};
```


Advanced usage and [How to customize the form embed code](https://legacydocs.hubspot.com/docs/methods/forms/advanced_form_options):

```js
const eleventyPluginHubspot = require('eleventy-plugin-hubspot');

module.exports = function (eleventyConfig) {
    eleventyConfig.addPlugin(eleventyPluginHubspot, {
        portalId: 1234567,
        locale: "en",
        cssRequired: "",
        cssClass: "",
        translations: {
            en: {
                invalidEmail: "Please enter a valid business email."
            },
        },
        onBeforeFormInit: function($form) {
            console.log('onBeforeFormInit formID:', $form.data.id);
        },
        onFormReady: function($form) {
            console.log('onFormReady formID:', $form.data.id);
        },
        onFormSubmit: function($form) {
            console.log('onFormSubmit formID:', $form.data.id);
        },
        onFormSubmitted: function($form) {
            console.log('onFormSubmitted formID:', $form.data.id);
        }
    });
};
```


## What does it do?
The plugin turns [11ty shortcodes](https://www.11ty.dev/docs/shortcodes/) like this:

```nunjucks
{% hubspotForm "e3595481-9ab1-4d00-a98d-1a96a50058ad" %}
```
and
```nunjucks
{% hubspotMeetings "https://meetings.hubspot.com/alex-zappa" %}
```

into HTML code like this:

```html
<script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/v2-legacy.js"></script>
<![endif]-->
<script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/v2.js"></script>
<script data-hubspot-rendered="true">hbspt.forms.create({"portalId":1234567,"locale":"en","translations":{"en":{"invalidEmail":"Please enter a valid business email."}},"formId":"e3595481-9ab1-4d00-a98d-1a96a50058ad"});</script>
```
and
```html
<div class="meetings-iframe-container" data-src="https://meetings.hubspot.com/alex-zappa?embed=true"></div>
<script charset="utf-8" type="text/javascript" src="//static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js"></script>
```

## Custom Usage

```nunjucks
{% hubspotForm "e3595481-9ab1-4d00-a98d-1a96a50058ad", {
    portalId: 1234567,
    locale: "en",
    cssRequired: "",
    cssClass: ""
} %}
```


## Contributing
If you notice an issue, feel free to [open an issue](https://github.com/reatlat/eleventy-plugin-hubspot/issues).

1. Fork this repo
2. Clone `git clone git@github.com:reatlat/eleventy-plugin-hubspot.git`
3. Install dependencies `npm install`
4. Build `npm run build`
5. Serve locally `npm run dev`


## License
The code is available under the [MIT license](LICENSE).


## May 4th be with you
<img src="https://cdn.sunnypixels.io/imgs/yoda-close-up.jpg" alt="May 4th be with you" width="280">