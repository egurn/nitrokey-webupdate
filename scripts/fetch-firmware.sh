#!/bin/bash -xe

rm -f data/*

STABLEURL=https://raw.githubusercontent.com/Nitrokey/nitrokey-fido2-firmware/master/STABLE_VERSION

wget -P data/ ${STABLEURL}
STABLE_VERSION="$(cat data/STABLE_VERSION)"
echo "${STABLE_VERSION}"

BINMAIN=fido2-firmware-${STABLE_VERSION}.json
BINDEV=fido2-firmware-${STABLE_VERSION}.hex

BINURL=https://github.com/Nitrokey/nitrokey-fido2-firmware/releases/download/${STABLE_VERSION}/fido2-firmware-${STABLE_VERSION}
BINURLDEV=https://github.com/Nitrokey/nitrokey-fido2-firmware/releases/download/${STABLE_VERSION}/fido2-firmware-dev-${STABLE_VERSION}

wget -P data/ ${BINURL}.json
wget -P data/ ${BINURL}.sha2
wget -P data/ ${BINURLDEV}.hex
wget -P data/ ${BINURLDEV}.sha2

pushd data/
sha256sum -c ${BINMAIN}
sha256sum -c ${BINDEV}
popd
