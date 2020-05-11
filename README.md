# Nitrokey Webupdate

Firmware updates through web browser for the Nitrokey FIDO2, available at https://update.nitrokey.com/.

This is a fork of https://github.com/solokeys/solo-webupdate.
## Supported configurations

| Browser/OS   |     Windows      |  macOS | Linux   |
|:---|:---:|:---:|:---:|
| Firefox (75) | Yes | Yes | Yes (same for FF77)  |
| Chrome (81)|  Yes   |   No | No (same for CH84)  |
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

## License
This project is licensed under MIT or Apache2 licenses.

## Parent Readme
Parent readme is available at [README-parent.md](README-parent.md).
