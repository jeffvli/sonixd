const splitString = (
  string: string,
  delimiter: string,
  returnType: 'string' | 'number' | 'boolean'
) => {
  return string.split(delimiter).map((s: string) => {
    if (returnType === 'string') {
      return String(s);
    }

    if (returnType === 'number') {
      return Number(s);
    }

    return Boolean(s);
  });
};

export default splitString;
