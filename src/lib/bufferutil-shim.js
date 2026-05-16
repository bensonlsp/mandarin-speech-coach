// Pure-JS fallback for the bufferutil native addon.
// ws tries to load bufferutil for performance; when webpack bundles ws the native
// addon breaks. This shim satisfies the same interface so the try/catch in
// ws/lib/buffer-util.js succeeds without needing the native binary.
exports.mask = function mask(source, mask, output, offset, length) {
  for (let i = 0; i < length; i++) {
    output[offset + i] = source[i] ^ mask[i & 3];
  }
};

exports.unmask = function unmask(buffer, mask) {
  const length = buffer.length;
  for (let i = 0; i < length; i++) {
    buffer[i] ^= mask[i & 3];
  }
};
