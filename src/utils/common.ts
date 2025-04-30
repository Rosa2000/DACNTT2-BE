import crypto from "crypto";

export const generateCode = (count: number): string => {
  const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const countString = count.toString().padStart(8, "0");
  return `${currentDate}${countString}`;
};

export const generateUniqueCode = (length: number): string => {
  const symbols =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const usedIndexes = new Set();

  while (result.length < length) {
    const randomIndex = Math.floor(Math.random() * symbols.length);
    if (!usedIndexes.has(randomIndex)) {
      result += symbols.charAt(randomIndex);
      usedIndexes.add(randomIndex);
    }
  }
  return result;
};

export function checkIsValidUUID(value: string): boolean {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(value);
}

export const convertToGMT7 = (utcDate: string | Date): string => {
  const date = new Date(utcDate);
  date.setHours(date.getHours() + 7);
  return date.toISOString().replace("T", " ").slice(0, 19);
};

export function generateKey(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function passwordHash(password: string): Buffer {
  return crypto
    .createHash("md4")
    .update(Buffer.from(password, "utf16le"))
    .digest();
}
