// Reversible byte scrambling shared by the build script and the browser reader.
// It keeps papers from being saved or indexed as ordinary PDFs. It is a deterrent,
// not encryption: the browser must be able to reconstruct the file to display it.
const SALT = 'ha-reader-v1';

function seedFor(id) {
  let hash = 0x811c9dc5;
  for (const char of `${SALT}:${id}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0 || 1;
}

/** Applying this twice with the same id returns the original bytes. */
export function scramble(bytes, id) {
  const out = new Uint8Array(bytes.length);
  let x = seedFor(id);
  for (let i = 0; i < bytes.length; i++) {
    if (i % 4 === 0) {
      x ^= x << 13;
      x ^= x >>> 17;
      x ^= x << 5;
      x >>>= 0;
    }
    out[i] = bytes[i] ^ ((x >>> ((i % 4) * 8)) & 255);
  }
  return out;
}
