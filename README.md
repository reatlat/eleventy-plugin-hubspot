# eleventy-plugin-hubspot
[![npm](https://img.shields.io/npm/v/eleventy-plugin-hubspot.svg)](https://npmjs.com/package/eleventy-plugin-hubspot)
[![npm](https://img.shields.io/npm/dt/eleventy-plugin-hubspot.svg)](https://npmjs.com/package/eleventy-plugin-hubspot)
[![license](https://img.shields.io/npm/l/eleventy-plugin-hubspot.svg)](https://npmjs.com/package/eleventy-plugin-hubspot)

An Eleventy [shortcode](https://www.11ty.dev/docs/shortcodes/) that generates HubSpot forms or Meetings Calendar.

## Installation
Install the plugin from [npm](https://www.npmjs.com/package/eleventy-plugin-hubspot):

```
npm install eleventy-plugin-hubspot --save-dev
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


Advanced usage:

- [Configuration options](#user-content-configuration-options)
- [How to customize the form embed code (HubSpot's Knowledge Base)](https://legacydocs.hubspot.com/docs/methods/forms/advanced_form_options)

```js
const eleventyPluginHubspot = require('eleventy-plugin-hubspot');

module.exports = function (eleventyConfig) {
    eleventyConfig.addPlugin(eleventyPluginHubspot, {
        portalId: 1234567,
        locale: "en",
        loadingMode: "default",
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
<script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/embed/v2.js"></script>
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
    loadingMode: "lazy",
    cssRequired: "",
    cssClass: ""
} %}
```


## Configuration options

Type legend:
    
    R - (required) This attribute must be provided for the embed code to work properly.
    I - (internal) Used internally by a HubSpot tool. Use with caution, as it will likely affect how this form behaves or how the submission data is processed.
    O - (optional) Optional form customization attribute intended for use by end-users.
    C - (callback) A callback function that will be executed at various points in the form's lifecycle.


| Attribute                  | Types | Description                                                                                                                                                                                                                                                                                                                                                               |
|:---------------------------|:-----:|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| loadingMode                |   O   | The loading mode for the form. Options are `default`, `eager`, `interact` and `lazy`. Default is `default`.                                                                                                                                                                                                                                                               |
| portalId                   | R, I  | User's portal ID                                                                                                                                                                                                                                                                                                                                                          |
| formId                     | R, I  | Unique ID of the form you wish to build                                                                                                                                                                                                                                                                                                                                   |
| target                     |   O   | jQuery style selector specifying an existing element on the page into which the form will be placed once built. NOTE: If you're including multiple forms on the page, it is strongly recommended that you include a separate, specific target for each form.                                                                                                              |
| redirectUrl                | O, I  | URL to which the form will redirect upon a successful form completion. Cannot be used with inlineMessage.                                                                                                                                                                                                                                                                 |
| inlineMessage              | O, I  | Inline message to display in place of the form upon a successful form completion. Cannot be used with redirectUrl.                                                                                                                                                                                                                                                        |
| pageId                     | O, I  | ID of the landing page on which the form exists. This must be the content ID of a landing page built in HubSpot.                                                                                                                                                                                                                                                          |
| cssRequired                | O, I  | CSS string specific to validation error messages and form styling. Empty string == no style. Note: when setting/declaring this field in the embed code, elements of your form will no longer have default HubSpot styling applied.                                                                                                                                        |
| cssClass                   |   O   | CSS class that will be applied to the form.                                                                                                                                                                                                                                                                                                                               |
| submitButtonClass          | O, I  | CSS class that will be applied to the submit input instead of the default .hs-button.primary.large.                                                                                                                                                                                                                                                                       |
| errorClass                 | O, I  | CSS class that will be applied to inputs with validation errors instead of the default .invalid.error.                                                                                                                                                                                                                                                                    |
| errorMessageClass          | O, I  | CSS class that will be applied to error messages instead of the default .hs-error-msgs.inputs-list.                                                                                                                                                                                                                                                                       |
| groupErrors                |   O   | Show all errors at once inside a single container. Defaults to true, otherwise only shows the first error for each field.                                                                                                                                                                                                                                                 |
| locale                     |   O   | Locale for the form, used to customize language for form errors and the date picker. See Add internationalized error messages below.                                                                                                                                                                                                                                      |
| translations               |   O   | An object containing additional translation languages or to override field labels or messages for existing languages. See Customize internationalization below.                                                                                                                                                                                                           |
| manuallyBlockedEmailDomain | O, I  | Array of domains to block in email inputs.                                                                                                                                                                                                                                                                                                                                |
| formInstanceId             | O, I  | When embedding the same form on the same page twice, provide this Id for each identical form embed. The Id value is arbitrary, so long as it is not the same between forms.                                                                                                                                                                                               |
| onBeforeFormInit           | O, C  | Callback that executes before the form builds, takes form configuration object as single argument: onBeforeFormInit(ctx)                                                                                                                                                                                                                                                  |
| onFormReady                | O, C  | Callback that executes after form is built, placed in the DOM, and validation has been initialized. This is perfect for any logic that needs to execute when the form is on the page. Takes the jQuery form object as the argument: onFormReady($form)                                                                                                                    |
| onFormSubmit               | O, C  | Callback that executes after form is validated, just before the data is actually sent. This is for any logic that needs to execute during the submit. Any changes will not be validated. Takes the jQuery form object as the argument: onFormSubmit($form). Note: Performing a browser redirect in this callback is not recommended and could prevent the form submission |
| onFormSubmitted            | O, C  | Callback the data is actually sent.This allows you to perform an action when the submission is fully complete, such as displaying a confirmation or thank you message.                                                                                                                                                                                                    |

### Loading modes

- `default` - The form will load when the page loads (Like you use HubSpot code directly).
- `eager` - The form will load when DOMContentLoaded event is fired.
- `interact` - The form will load when the user makes first interaction with the page. (best for performance)
- `lazy` - The form will load when it is in the viewport. (check the note below)

***Note: if you place HubSpot form below the fold, `lazy` loading mode may have some effect on the form conversion rate, since HubSpot tracking script and form itself will be not loaded on the page until user scrolls to the form.***


## Contributing
If you notice an issue, feel free to [open an issue](https://github.com/reatlat/eleventy-plugin-hubspot/issues).

1. Fork this repo
2. Clone `git clone git@github.com:reatlat/eleventy-plugin-hubspot.git`
3. Install dependencies `npm install`
4. Build `npm run build`
5. Serve locally `npm run dev`


## License
The code is available under the [MIT license](LICENSE).


## May the 4th be with you
<img src="https://cdn.sunnypixels.io/imgs/yoda-close-up.jpg" alt="May 4th be with you" width="280">
