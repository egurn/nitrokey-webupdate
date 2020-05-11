
const default_device = "Nitrokey FIDO2";

const known_certs_hashed = {
	"Nitrokey FIDO2":             "8e06b4060fc58677055285ce3ee6a69a0666b59f4c2a0a00a025c7f0f3ce9a50",
	"Nitrokey FIDO2 2.0":         "5fb3d8c9b3f2ff8d2f922c89f493fcf87df580df2185fcba89a9908241505284",
	"Nitrokey FIDO2 Development": "6c081e7b6d16010fac8aa14ac46f8132138843cc2d1f3ff0b29ccc6d6ff9aa0d",
};

const known_pubkey_hashed = {
	"Nitrokey FIDO2":             "6910be885991e4c8776020e946e991474e2805db52445de99fb9c74dc54c8d53",
	"Nitrokey FIDO2 Development": "f835275e39519a8305c629ce065f47a8b9577663bf5c57876f2cc76d03bbc078",
};

const firmware_file_name = {
	"Nitrokey FIDO2":             "fido2-firmware-",
	"Nitrokey FIDO2 2.0":             "fido2-firmware-",
	"Nitrokey FIDO2 Development": "fido2-firmware-dev-",
};

const supported_devices = Object.keys(firmware_file_name);

// invert known_certs_hashed
const known_certs_lookup = Object.assign(
	{},
	...Object.entries(known_certs_hashed).map(
		([a, b]) => ({[b]: a})
	)
);

const known_pubkey_lookup = Object.assign(
	{},
	...Object.entries(known_pubkey_hashed).map(
		([a, b]) => ({[b]: a})
	)
);

const CMD = {
    solo_sign: 0x10,
    solo_register: 0x11,
    solo_pin: 0x12,
    solo_reset: 0x13,
    solo_version: 0x14,
    solo_rng: 0x15,
    solo_pubkey: 0x16,
    solo_bootloader: 0x20,

    boot_write: 0x40,   // 64
    boot_done: 0x41,    // 65
    boot_check: 0x42,   // 66
    boot_erase: 0x43,   // 67
    boot_version: 0x44, // 68
    boot_pubkey: 0x48,  // 72
};

const command_codes = {
	0x14: "SOLO VERSION",
	0x15: "SOLO RNG",
	0x20: "SOLO BOOTLOADER",

	0x40: "BOOT WRITE",
	0x41: "BOOT DONE",
	0x42: "BOOT CHECK",
	0x43: "BOOT ERASE",
  0x44: "BOOT VERSION",
  0x48: "BOOT PUBKEY",
};

const ctap_error_codes = {
    0x00: 'CTAP1_SUCCESS',
    0x01: 'CTAP1_ERR_INVALID_COMMAND',
    0x02: 'CTAP1_ERR_INVALID_PARAMETER',
    0x03: 'CTAP1_ERR_INVALID_LENGTH',
    0x04: 'CTAP1_ERR_INVALID_SEQ',
    0x05: 'CTAP1_ERR_TIMEOUT',
    0x06: 'CTAP1_ERR_CHANNEL_BUSY',
    0x0A: 'CTAP1_ERR_LOCK_REQUIRED',
    0x0B: 'CTAP1_ERR_INVALID_CHANNEL',

    0x10: 'CTAP2_ERR_CBOR_PARSING',
    0x11: 'CTAP2_ERR_CBOR_UNEXPECTED_TYPE',
    0x12: 'CTAP2_ERR_INVALID_CBOR',
    0x13: 'CTAP2_ERR_INVALID_CBOR_TYPE',
    0x14: 'CTAP2_ERR_MISSING_PARAMETER',
    0x15: 'CTAP2_ERR_LIMIT_EXCEEDED',
    0x16: 'CTAP2_ERR_UNSUPPORTED_EXTENSION',
    0x17: 'CTAP2_ERR_TOO_MANY_ELEMENTS',
    0x18: 'CTAP2_ERR_EXTENSION_NOT_SUPPORTED',
    0x19: 'CTAP2_ERR_CREDENTIAL_EXCLUDED',
    0x20: 'CTAP2_ERR_CREDENTIAL_NOT_VALID',
    0x21: 'CTAP2_ERR_PROCESSING',
    0x22: 'CTAP2_ERR_INVALID_CREDENTIAL',
    0x23: 'CTAP2_ERR_USER_ACTION_PENDING',
    0x24: 'CTAP2_ERR_OPERATION_PENDING',
    0x25: 'CTAP2_ERR_NO_OPERATIONS',
    0x26: 'CTAP2_ERR_UNSUPPORTED_ALGORITHM',
    0x27: 'CTAP2_ERR_OPERATION_DENIED',
    0x28: 'CTAP2_ERR_KEY_STORE_FULL',
    0x29: 'CTAP2_ERR_NOT_BUSY',
    0x2A: 'CTAP2_ERR_NO_OPERATION_PENDING',
    0x2B: 'CTAP2_ERR_UNSUPPORTED_OPTION',
    0x2C: 'CTAP2_ERR_INVALID_OPTION',
    0x2D: 'CTAP2_ERR_KEEPALIVE_CANCEL',
    0x2E: 'CTAP2_ERR_NO_CREDENTIALS',
    0x2F: 'CTAP2_ERR_USER_ACTION_TIMEOUT',
    0x30: 'CTAP2_ERR_NOT_ALLOWED',
    0x31: 'CTAP2_ERR_PIN_INVALID',
    0x32: 'CTAP2_ERR_PIN_BLOCKED',
    0x33: 'CTAP2_ERR_PIN_AUTH_INVALID',
    0x34: 'CTAP2_ERR_PIN_AUTH_BLOCKED',
    0x35: 'CTAP2_ERR_PIN_NOT_SET',
    0x36: 'CTAP2_ERR_PIN_REQUIRED',
    0x37: 'CTAP2_ERR_PIN_POLICY_VIOLATION',
    0x38: 'CTAP2_ERR_PIN_TOKEN_EXPIRED',
    0x39: 'CTAP2_ERR_REQUEST_TOO_LARGE',
}

const CONST_chunk_size = 240;


const const_app_steps = {
  communication_error: 0,
  not_set: 1,
  inspect: 2,
  bootloader_check: 3,
  after_inspection: 4,
  bootloader_execution_start: 5,
  bootloader_executed: 6,
  update_ongoing: 7,
  update_success: 8,
  update_failure: 9,
}

const const_app_steps_strings = {
  0: 'Communication Error',
  1: 'Ready',
  2: 'Running inspection',
  3: 'Checking for bootloader',
  4: 'Inspection finished',
  5: 'Executing bootloader',
  6: 'Bootloader executed',
  7: 'Update in progress',
  8: 'Update succeeded',
  9: 'Update failed',
}

const const_device_state = {
  not_set: [0,'not set'],
  normal_mode: [1, 'normal mode'],
  bootloader: [2, 'bootloader'],
  not_available: [3, 'not available'],
}
