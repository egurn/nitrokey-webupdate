# Nitrokey Webupdate

Firmware updates through web browser for Nitrokey FIDO2.

## Supported configurations

| Browser/OS   |     Windows      |  macOS | Linux   |
|:---|:---:|:---:|:---:|
| Firefox (75) | Yes | Yes | Yes (and FF77)  |
| Chrome (81)|  Yes   |   No | No (and CH84)  |
| Edge (18)|    Yes |    - |  - |
| Safari (13.0.4, macOS 10.15.2)|  - |    Yes * |  - |
| Chromium (80)|    -   |   - | No  |

Notes:
- Safari blinks whole screen on every Webauthn request, not recommended to use due to this UI issue (otherwise works);
- Windows OS needs additional touch to run the bootloader due to doubled requests; additionally execution time is longer due to that;
- Chrome is not working due to a bug in the bootloader, which should be fixed in the coming bootloader firmware updates.
- Windows shows a monit asking user to try another device while switching to the bootloader. User has to be instrumented to not take any action on such message.
- Update process could be interrupted on Firefox, when it does lose application focus (e.g. due to the Alt+Tab);
This is not the case for Chrome based browsers (Chrome forces app focus, Edge continues regardless).

## What is this?
While advanced users capable of using the command line can test if their keys are genuine, and update them via
<https://github.com/solokeys/solo-python>, this project lets you do the same more easily
using any WebAuthn-capable web browser (all current versions of Chrome, Firefox, Edge, Opera, Vivaldi, ...).

To use it, visit <https://update.solokeys.com> and follow the instructions.

## What does it do?
In a first step, it inspects your key to determine whether you have a Solo Secure or a Solo Hacker.

During this process, the signature of the key is checked, letting you determine whether your key is genuine.

Once this is done, it tells you whether the firmware is out of date.
If so, we recommend you update, to receive bug fixes and possibly additional functionality.

To do so, you need to unplug your key, and plug it in an while keeping its button pressed, until the LED light blinks.

Once this is done, your key is in "bootloader mode" and can be updated by the website.

You can simply click on "Update Firmware", and your key will be updated.

**NOTE:** Due to how this update is implemented, while your firmware is being updated you will see a LOT of popups (that disappear again immediately). This is no reason for concern!

## How does it work?
For general information on WebAuthn, the new standard for secure login in the browser, we recommend the following sites:
- https://webauthn.io
- https://webauthn.guide
- https://www.w3.org/TR/webauthn/

This standard replaces its predecessor, U2F, and consists of two API methods:
- `navigator.credentials.create()`
- `navigator.credentials.get()`

We use the first method to verify that your Solo is genuine, and determine whether it is the secure or the hacker version.

We use the second method to update your key if necessary. The method used is to encode custom commands that your key understands, and [send these encoded commands as "keyhandle"](https://github.com/solokeys/solo-webupdate/blob/master/js/ctaphid.js).

## Hosting & Verification
The site <https://update.solokeys.com> is hosted on Netlify, as configured via [netlify.toml](netlify.toml).

## Running solo-webupdate locally

*For advanced users only*

1. Download or clone the solo-webupdate repo to a directory on your machine. 
1. Enter the _solo-webupdate_ directory in your terminal and run the following two commands:
```
make setup-local
make serve-local
```
Note that you may get messages about missing packages and dependencies when running the `make setup-local` command. Install and then run the command again. 
1. If all goes well, you will get a message `serving on http://localhost:8080`. Visit <http://localhost:8080> to access webupdate on your machine.
1. Follow the on screen directions to update your firmware. *Do not* leave the webupdate window or change tabs when running webupdate. Stay on the webupdate page until the process is complete. This does not take long. 

## Troubleshooting

* If your Solo is stuck in bootloader mode (yellow flashing LED) and webupdate won't detect it, then you may need to use _Advanced Mode_ to re-flash the Solo Key.
	1. Make sure you know which version of the Solo Key you are working with. It's either _Solo Secure_ or _Solo Hacker_.
	1. Click on the _Advanced Mode (DANGER ZONE)_ button.
	1. Select the appropriate Solo Key version you have and follow the on-screen instructions.

One technical detail: Our official firmware builds are hosted as releases under <https://github.com/solokeys/solo/releases>, with the file [STABLE_VERSION](https://github.com/solokeys/solo/blob/master/STABLE_VERSION) specifying the latest stable version. Unfortunately, due to [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) restrictions, these files can't be fetched by your browser during the update process. For this reason, the current latest builds are [fetched and hosted](https://github.com/solokeys/solo-webupdate/blob/master/scripts/fetch-firmware.sh) on the update site itself, which always checks whether its firmware is out of date.
