#!/bin/bash -xe

rm -f data/*

STABLEURL=https://raw.githubusercontent.com/Nitrokey/nitrokey-fido2-firmware/master/STABLE_VERSION

wget -P data/ ${STABLEURL}
STABLE_VERSION="$(cat data/STABLE_VERSION)"
echo "${STABLE_VERSION}"

NAMEMAIN=fido2-firmware-${STABLE_VERSION}
NAMEDEV=fido2-firmware-dev-${STABLE_VERSION}

BINMAIN=${NAMEMAIN}.json
BINDEV=${NAMEDEV}.json

BINURL=https://github.com/Nitrokey/nitrokey-fido2-firmware/releases/download/${STABLE_VERSION}/fido2-firmware-${STABLE_VERSION}
BINURLDEV=https://github.com/Nitrokey/nitrokey-fido2-firmware/releases/download/${STABLE_VERSION}/fido2-firmware-dev-${STABLE_VERSION}

wget -P data/ ${BINURL}.json
wget -P data/ ${BINURL}.json.sha2
wget -P data/ ${BINURLDEV}.json
wget -P data/ ${BINURLDEV}.json.sha2

pushd data/
sha256sum -c ${BINMAIN}.sha2
sha256sum -c ${BINDEV}.sha2
popd

ls -lh data
