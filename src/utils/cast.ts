export enum DataType {
  Date = "date",
}

/**
 * Recursively casts specified properties of an object to a specified data type.
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
              current[key] = new Date(current[key]);
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
