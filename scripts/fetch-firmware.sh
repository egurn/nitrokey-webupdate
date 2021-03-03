#!/bin/bash -xe

mkdir -p data
ls -l data > data.previous
sha256sum data/* >> data.previous

rm -f data/*

STABLEURL=https://raw.githubusercontent.com/Nitrokey/nitrokey-fido2-firmware/master/STABLE_VERSION

wget -P data/ ${STABLEURL}
STABLE_VERSION="$(cat data/STABLE_VERSION)"
echo "${STABLE_VERSION}"
SVS=${STABLE_VERSION//.nitrokey/}
echo "${SVS}"

NAMEMAIN=nitrokey-fido2-firmware-${SVS}
# NAMEDEV=nitrokey-fido2-firmware-dev-${SVS}

BINMAIN=${NAMEMAIN}.json
# BINDEV=${NAMEDEV}.json

# https://github.com/Nitrokey/nitrokey-fido2-firmware/releases/download/2.0.0.nitrokey/nitrokey-fido2-firmware-2.0.0.json
DOWNLOAD_URL=https://github.com/Nitrokey/nitrokey-fido2-firmware/releases/download/${STABLE_VERSION}
BINURL=${DOWNLOAD_URL}/${BINMAIN}
# BINURLDEV=${DOWNLOAD_URL}/${BINDEV}

wget -P data/ "${BINURL}"

# quick workaround for the different path coded in the WebUpdate
pushd data; ln -s ${BINMAIN} fido2-firmware-${STABLE_VERSION}.json; popd

ls -l data > data.current
sha256sum data/* >> data.current

ls -lh data

git diff --no-index data.previous data.current || true
