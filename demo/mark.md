---
permalink: /mark/
---
<!DOCTYPE html>
<html lang="en">
<head>
    <title>11ty Plugin HubSpot - Demo</title>
    <link rel="stylesheet"
          href="https://unpkg.com/purecss@2.1.0/build/pure-min.css"
          integrity="sha384-yHIFVG6ClnONEA5yB5DJXfW2/KC173DIQrYoZMEtBvGzmf0PKiGyNEqe9N6BNDBH"
          crossorigin="anonymous">
    <style>
        body {
            background: #fafafa;
        }
        .page-wrapper {
            background: #fff;
            max-width: 960px;
            margin: 0 auto;
            padding: 30px;
            box-shadow: 0 5px 20px rgba(0,0,0,.15);
        }
        fieldset {
            border: none;
        }
    </style>
</head>
<body>

{% hubspotForm "f4e72b0a-fbd9-4ab3-938d-debdbdb7ea6e" %}
{% hubspotForm "82b488a3-4a86-4f03-9e45-02f7d82c23ea" %}
{% hubspotForm "160a18ba-dd02-4194-9da6-095ccee2ba87" %}

{# TODO findout how to pass event callback functions like onBeforeFormInit #}

{% hubspotMeetings "https://meetings.hubspot.com/alex-zappa" %}

{% hubspotForm "f4e72b0a-fbd9-4ab3-938d-debdbdb7ea6e" %}



</body>
</html>
