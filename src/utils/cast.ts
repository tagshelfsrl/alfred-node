export enum DataType {
  Date = "date",
}

// An ISO 8601 date and time: `YYYY-MM-DDTHH:mm`, optional seconds and
// fraction, optional `Z` or `±HH:mm` offset.
const ISO_DATE_TIME =
  /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?)(?:\.(\d+))?(Z|[+-]\d{2}:?\d{2})?$/;

/**
 * Parses a date sent by Alfred. A date and time without a timezone designator
 * (`"2026-11-26T16:34:41.94"`) is UTC, so it is read as UTC rather than as the
 * machine's local time. Fractions of a second beyond milliseconds are dropped
 * so every JavaScript engine accepts the string. Values that are not strings
 * in that form are handed to `new Date()` unchanged.
 * @param value - The value to parse.
 * @returns The parsed date.
 */
export const parseDate = (value: string | number | Date): Date => {
  if (typeof value === "string") {
    const match = ISO_DATE_TIME.exec(value.trim());
    if (match) {
      const [, dateTime, fraction, zone] = match;
      const millis = fraction ? `.${fraction.substring(0, 3)}` : "";
      // Write an offset as `±HH:mm`, the form ECMAScript requires.
      const offset = !zone
        ? "Z"
        : zone === "Z"
          ? zone
          : `${zone.substring(0, 3)}:${zone.substring(zone.length - 2)}`;
      return new Date(`${dateTime}${millis}${offset}`);
    }
  }
  return new Date(value);
};

/**
 * Recursively casts specified properties of an object to a specified data type.
 * `null` and `undefined` values are left as they are.
 * @param {any} obj - An object that you want to cast the properties of.
 * @param {string[]} props - An array of strings that represent the properties of
 * the object `obj` that you want to cast to a specific data type.
 * @param {DataType} dataType - Specifies the type of data to which the properties should be cast.
 */
export const castProps = (
  obj: any,
  props: string[],
  dataType: DataType
): void => {
  const castRecursive = (current: any) => {
    if (current !== null && typeof current === "object") {
      Object.keys(current).forEach((key) => {
        // Check if the current key is in the list of properties to cast
        if (props.includes(key)) {
          switch (dataType) {
            case DataType.Date:
              if (
                current[key] !== null &&
                current[key] !== undefined &&
                !(current[key] instanceof Date)
              ) {
                current[key] = parseDate(current[key]);
              }
              break;
            default:
              console.warn(
                `Data type ${dataType} is not supported for casting.`
              );
              break;
          }
        }
        // Recur into the object or array
        castRecursive(current[key]);
      });
    }
  };

  castRecursive(obj);
};
