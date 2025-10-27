export const createSearchOptions = (
  query: string,
  queryFields: string[] = [],
  filters: Record<string, { value: any; condition: boolean }>
) => {
  let searchOption: any = {};

  if (query) {
    const regex = new RegExp(String(query), "i");
    searchOption = {
      $or: queryFields.map((field) => ({ [field]: { $regex: regex } })),
    };
  }

  filters &&
    Object.keys(filters).forEach((key) => {
      const value = filters[key]?.value;
      const condition = filters[key]?.condition;
      if (value) {
        if (condition) {
          searchOption[key] = value;
        } else {
          throw new Error(`The value '${value}' for ${key} is invalid.`);
        }
      }
    });

  return searchOption;
};
