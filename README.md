# AppLand Browser Extension

## Development

### The Easy Way
Use
[web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/).

### The Hard Way

#### Chrome
Open Chrome to `chrome://extensions/` and enable developer mode. Click "Load Unpacked" and select
this repository.

#### Firefox
To enable extension development, start by following the instructions here:
https://developer.mozilla.org/en-US/docs/Tools/Browser_Toolbox#Enabling_the_Browser_Toolbox .

Then, visit `about:debugging#/runtime/this-firefox`, click "Load Temporary
Add-on..."  and select `appland/manifest.json` from this repository.

Once the add-on is installed, click the "Inspect" button to open the Browser
Toolbox for the extension. Then, choose "Disable Popup Auto-Hide" from the
Toolbox menu. If you don't, you won't see errors loading the extension, and you
won't be able to debug it.

More details about extension debugging can be found here:
https://extensionworkshop.com/documentation/develop/debugging/ .
