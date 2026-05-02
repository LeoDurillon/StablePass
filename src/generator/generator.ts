import { ALL, LOWERCASE, NUMBERS, PASSWORD_LENGTH, SPECIAL, UPPERCASE } from "../consts";

/**
 * Generate a password from an Uint8Array Stream
 */
export class PasswordGenerator {
  private stream: Uint8Array;
  private offset: number = 0;

  constructor(bytes: Uint8Array) {
    this.stream = bytes;
  }

  /**
   * Get the next accepted index from the byte stream
   * an accepted index is a byte that is less than the largest multiple of max that is less than 256
   * this ensures that the distribution of indices is uniform and does not bias towards lower indices
   * if a byte is rejected, it is simply skipped and the next byte is checked until an accepted byte is found or the stream ends
   * if the stream ends before an accepted byte is found, 0 is returned as a fallback (though this should be unlikely with a sufficiently long stream)
   *
   * @param max The maximum value for the index (exclusive)
   * @returns The next accepted index from the byte stream, or 0 if the stream ends before an accepted byte is found
   */
  private nextIndex(max: number): number {
    const limit = Math.floor(256 / max) * max;
    for (let i = this.offset; i < this.stream.length; i++) {
      const byte = this.stream.at(i);
      if (byte === undefined) throw new Error("Unexpected end of byte stream");
      if (byte < limit) {
        this.offset = i + 1;
        return byte % max;
      }
    }
    return 0;
  }

  /**
   * Get the next character from the specified charset using the next accepted index from the byte stream
   *
   * @param charset The string of characters to choose from
   * @returns The next character from the specified charset, or throws an error if the stream ends before an accepted byte is found
   */
  private getCharacter(charset: string): string {
    const index = this.nextIndex(charset.length);
    const char = charset.at(index);
    if (char === undefined) throw new Error("Unexpected end of byte stream");
    return char;
  }

  /**
   * Generate a password using the specified character sets and the byte stream
   *
   * @returns The generated password
   */
  generatePassword(): string {
    const chars: string[] = [
      this.getCharacter(LOWERCASE),
      this.getCharacter(UPPERCASE),
      this.getCharacter(NUMBERS),
      this.getCharacter(SPECIAL),
      ...Array.from({ length: PASSWORD_LENGTH - 4 }, () => this.getCharacter(ALL)),
    ];

    for (let i = chars.length - 1; i > 0; i--) {
      const j = this.nextIndex(i + 1);
      const charI = chars.at(i);
      const charJ = chars.at(j);
      if (charI === undefined || charJ === undefined)
        throw new Error("Unexpected end of byte stream");
      [chars[i], chars[j]] = [charJ, charI];
    }
    return chars.join("");
  }
}
