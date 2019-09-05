var app = new Vue({
  el: '#app',
  data: {
    platform_description: '',
    webauthn_support: '',
    what_is_it: '',
    solo_version_parts: null,
    solo_version: null,
    stable_version_parts: null,
    stable_version: null,
    is_solo_secure: null,
    is_solo_hacker: null,
    needs_update: false,
    ask_for_attestation: null,
    correct_firmware: true,
    signed_firmware: null,
    update_status: null,
    update_progress: null,
    advanced_mode: false,
    cannot_inspect: null,
    cannot_flash: null,
    update_success: null,
    update_failure: null,
    about_to_flash: null,
    p_progress: null,
    is_linux: null,
    user_selected_device: '',
    supported_devices: supported_devices,
  }
});

async function reset_messages() {
  app.cannot_inspect = null;
  app.cannot_flash = null;
  app.update_success = null;
  app.update_progress = null;
  app.ask_for_attestation = null;
}

async function toggle_advanced_mode() {
  app.advanced_mode = !app.advanced_mode;
}

async function inspect_browser() {
  app.platform_description = platform.description;
  if (!window.PublicKeyCredential) {
    app.webauthn_support = "Your browser does not support WebAuthn, please use another one";
  } else {
    app.webauthn_support = "Your browser supports WebAuthn";
  }
  if (platform.os["family"] == "Linux") {
    app.is_linux = true;
  }
}

async function run_bootloader(){

  await ctaphid_via_webauthn(
    CMD.solo_bootloader, null, null, 1000
  ).then(response => {
    console.log("bootloader RESPONSE", response);
    // FIXME handle failure in call
  }
  )
  .catch(error => {
    console.log(error);
  });

}

async function check_version(){
  await ctaphid_via_webauthn(
    // option a) timeout --> leads to ugly persistent popup in chrome (firefox is better)
    CMD.solo_version, null, null, 1000
    // option b) no timeout --> user needs to click cancel
    // CMD.solo_version,
  ).then(response => {
    console.log("check-version RESPONSE", response);
    if (typeof response !== "undefined") {
      app.solo_version_parts = response.slice(0, 3);
      let solo_version = response[0] + '.' + response[1] + '.' + response[2];
      app.solo_version = solo_version;
    } else {
      // we assume this is a pre-1.1.0 solo
      app.solo_version_parts = new Uint8Array([0, 0, 0]);
      app.solo_version = "unknown";
    }
  }
  )
  .catch(error => {
    console.log(error);
  });
}

async function fetch_stable_version() {
  var response = await fetch(
    "https://raw.githubusercontent.com/Nitrokey/nitrokey-fido2-firmware/master/STABLE_VERSION",
    {cache: "no-store"}
  );
  let stable_version_github = (await response.text()).trim();
  console.log("STABLE_VERSION GITHUB", stable_version_github);

  var response = await fetch(
    "data/STABLE_VERSION",
    {cache: "no-store"}
  );
  let stable_version_fetched = (await response.text()).trim();
  console.log("STABLE_VERSION FETCHED", stable_version_fetched);

  if (stable_version_github != stable_version_fetched) {
    app.stable_version = "fetched firmware out of date";
    app.correct_firmware = false;
  } else {
    app.stable_version = stable_version_fetched;
    app.stable_version_parts = new Uint8Array(stable_version_fetched.split(".").map(Number));
    app.correct_firmware = true;
  }
}

async function prepare() {
  await inspect_browser();
  await fetch_stable_version();
  await check_version();
}

async function create_direct_attestation(timeout) {
    // random nonce
    var challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // our relying party
    let rp_id = window.location.hostname;

    // GOAL: register a key signed by key's attestation certificate
    let publicKeyCredentialCreationOptions = {
		rp: {
			name: 'Nitrokey Web Update',
			id: rp_id,
		},
    authenticatorSelection: {
      userVerification: 'discouraged',
    },
		attestation: 'direct',

		challenge,

		pubKeyCredParams: [
			{ type: 'public-key', alg: -7 },
		],

		user: {
			id: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
			name: "test-email@nitrokey.com",
			displayName: "Nitrokey test user",
		},

		timeout: timeout,
		excludeCredentials: [],
	};

	return navigator.credentials.create({
		publicKey: publicKeyCredentialCreationOptions
	});
};

async function inspect() {
  await reset_messages();
  app.is_solo_secure = null;
  app.is_solo_hacker = null;
  console.log("app.solo_version", app.solo_version);
    console.log("PRE-CHECKING IF IN BOOTLOADER");
    if (await is_bootloader()) {
      app.cannot_inspect = true;
      return;
    }
  console.log("ASKING FOR ATTESTATION");
  app.ask_for_attestation = true;
  let credential = await create_direct_attestation();
  app.ask_for_attestation = null;

  let utf8_decoder = new TextDecoder('utf-8');
  let client_data_json = utf8_decoder.decode(credential.response.clientDataJSON);
  let client_data = JSON.parse(client_data_json);
  var attestation = CBOR.decode(credential.response.attestationObject);
  var certificate = attestation.attStmt.x5c[0];
  let certificate_fingerprint = sha256(certificate);
  let what_is_it = known_certs_lookup[certificate_fingerprint];
  app.what_is_it = what_is_it;

  if (typeof what_is_it === "undefined") {
    console.log("UNKNOWN ATTESTATION CERTIFIATE", certificate_fingerprint);
  } else {
      app.is_solo_secure = true;
  };

  // now we know a key is plugged in
  if (app.solo_version != "1.0.0") {
    await check_version();
  }

  let need = app.stable_version_parts;
  let have = app.solo_version_parts;
  console.log("NEED", need);
  console.log("HAVE", have);

  if (have == null) {
    app.needs_update = true;
  } else {
    app.needs_update = (need[0] > have[0]) || (need[1] > have[1]) || (need[2] > have[2]);
  }
}

async function fetch_firmware() {
  // TODO: cache downloads
  url_base = "data/";
    let fname = firmware_file_name[app.what_is_it]
    let file_url = url_base + fname + app.stable_version + ".json";
    console.log(file_url);

    let fetched = await fetch(file_url);
    let content = await fetched.json();

    let firmware = websafe2string(content.firmware);
    var signature = websafe2array(content.signature);

    return {
      firmware: firmware,
      signature: signature,
    }

}

async function is_bootloader() {
  let response = await ctaphid_via_webauthn(CMD.boot_check, null, null, 1000);
  // console.log(response);
  let _is_bootloader = !(response == null);
  // console.log(is_bootloader);
  return _is_bootloader;
}

async function update_hacker() {
  await update_secure();
}

async function update_secure() {
  app.is_solo_hacker = false;
  app.is_solo_secure = true;
  await reset_messages();
  await toggle_advanced_mode();
  await update();
}

async function update() {
  await reset_messages();

  if (app.user_selected_device){
    app.what_is_it = app.user_selected_device;
  }

  if (!await is_bootloader()) {
    app.cannot_flash = true;
    return
  }

  app.update_status = "DOWNLOADING FIRMWARE";
  let signed_firmware = await fetch_firmware();
  app.signed_firmware = signed_firmware;

  let firmware = signed_firmware.firmware;
  let signature = signed_firmware.signature;

  let num_pages = 64;

  let blocks = MemoryMap.fromHex(firmware);
  let addresses = blocks.keys();

  let addr = addresses.next();
  let chunk_size = 240;
  console.log("WRITING...");
  app.update_status = "FLASHING FIRMWARE";

  while(!addr.done) {
      var data = blocks.get(addr.value);
      var i;
      for (i = 0; i < data.length; i += chunk_size) {
          var chunk = data.slice(i,i+chunk_size);

          p = await ctaphid_via_webauthn(
              CMD.boot_write,
              addr.value + i,
              chunk
          );
          if (typeof p === "undefined") {
              console.log("...FAILURE");
              app.update_failure = true;
              app.update_status = "FLASHING FIRMWARE FAILED";
              return;
          }

          TEST(p.status != 'CTAP1_SUCCESS', 'Device wrote data');

          var progress = (((i/data.length) * 100 * 100) | 0)/100;
          console.log("PROGRESS:", progress);
          app.p_progress = Math.round(progress);
          app.update_progress = "Progress: " + progress + "%";
      }

      addr = addresses.next();
  }
  app.update_progress = "Progress: 100%";
  app.p_progress = null;
  console.log("...DONE");

  app.update_status = "VERIFYING FIRMWARE SIGNATURE";
  p = await ctaphid_via_webauthn(
    CMD.boot_done, 0x8000, signature
  );
  app.update_status = null;
  app.update_success = true;

  app.signed_firmware = null;
  await check_version();
}
