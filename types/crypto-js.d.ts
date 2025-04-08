declare module 'crypto-js' {
  namespace CryptoJS {
    interface WordArray {
      words: number[];
      sigBytes: number;
      toString(encoder?: any): string;
      concat(wordArray: WordArray): WordArray;
      clamp(): void;
      clone(): WordArray;
    }

    interface Encoder {
      stringify(wordArray: WordArray): string;
      parse(str: string): WordArray;
    }

    interface CipherParams {
      ciphertext: WordArray;
      key: WordArray;
      iv: WordArray;
      salt: WordArray;
      algorithm: any;
      mode: any;
      padding: any;
      blockSize: number;
      formatter: any;
      toString(): string;
    }

    interface CipherOption {
      iv?: WordArray | string;
      mode?: any;
      padding?: any;
      salt?: WordArray | string;
    }

    interface Cipher {
      encrypt(message: string | WordArray, key: string | WordArray, option?: CipherOption): CipherParams;
      decrypt(ciphertext: CipherParams | string, key: string | WordArray, option?: CipherOption): WordArray;
    }

    interface Hasher {
      update(message: string | WordArray): Hasher;
      finalize(message?: string | WordArray): WordArray;
    }

    interface Lib {
      WordArray: {
        create: (words?: Array<number>, sigBytes?: number) => WordArray;
        random: (nBytes?: number) => WordArray;
      };
    }

    interface Mode {}
    interface Pad {}

    const lib: Lib;
    const enc: {
      Hex: Encoder;
      Latin1: Encoder;
      Utf8: Encoder;
      Utf16: Encoder;
      Utf16BE: Encoder;
      Utf16LE: Encoder;
      Base64: Encoder;
    };

    const mode: {
      CBC: Mode;
      CFB: Mode;
      CTR: Mode;
      CTRGladman: Mode;
      ECB: Mode;
      OFB: Mode;
    };

    const pad: {
      Pkcs7: Pad;
      AnsiX923: Pad;
      Iso10126: Pad;
      Iso97971: Pad;
      NoPadding: Pad;
      ZeroPadding: Pad;
    };

    const AES: Cipher;
    const DES: Cipher;
    const TripleDES: Cipher;
    const MD5: () => Hasher;
    const SHA1: () => Hasher;
    const SHA256: () => Hasher;
    const SHA224: () => Hasher;
    const SHA512: () => Hasher;
    const SHA384: () => Hasher;
    const SHA3: () => Hasher;
    const RIPEMD160: () => Hasher;
    const HmacMD5: (key: string | WordArray) => Hasher;
    const HmacSHA1: (key: string | WordArray) => Hasher;
    const HmacSHA256: (key: string | WordArray) => Hasher;
    const HmacSHA224: (key: string | WordArray) => Hasher;
    const HmacSHA512: (key: string | WordArray) => Hasher;
    const HmacSHA384: (key: string | WordArray) => Hasher;
    const HmacSHA3: (key: string | WordArray) => Hasher;
    const HmacRIPEMD160: (key: string | WordArray) => Hasher;
    const PBKDF2: (password: string | WordArray, salt: string | WordArray, cfg?: any) => WordArray;
    const EvpKDF: (password: string | WordArray, salt: string | WordArray, cfg?: any) => WordArray;
  }

  export = CryptoJS;
}