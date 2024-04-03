export class Env {
  /**
   * Cast environment variable as numeric value.
   * @param key
   * @param defaultValue
   * @returns
   */
  static castNumericValue(key: string, defaultValue = 0) {
    const value = process.env[key];
    if (value && !Number.isNaN(Number(value))) return Number(value);
    return defaultValue;
  }

  /**
   * Cast environment variable as string value.
   * @param key
   * @param defaultValue
   * @returns
   */
  static castStringValue(key: string, defaultValue = "") {
    const value = process.env[key];
    if (value) return value;
    return defaultValue;
  }

  /**
   * Cast environment variable as boolean value.
   * @param key
   * @param defaultValue
   * @returns
   */
  static castBooleanValue(key: string, defaultValue = false) {
    const value = process.env[key];
    if (value === "0" || (value && value.toLowerCase() === "false"))
      return false;

    if (value === "1" || (value && value.toLowerCase() === "true")) return true;

    return defaultValue;
  }

  /**
   * Cast environment variable as array of string.
   * The environment variable must be a comma separated text.
   * @param key
   * @param defaultValue
   * @returns
   */
  static castArrayValue(key: string, defaultValue: string[] = []) {
    const value = process.env[key];
    if (value) {
      const splitValues = value.split(",");
      if (splitValues.length > 0) return splitValues;
    }
    return defaultValue;
  }
}
