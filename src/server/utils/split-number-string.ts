const splitNumberString = (string: string, delimiter = ',') => {
  return string.split(delimiter).map((s: string) => {
    return Number(s);
  });
};

export default splitNumberString;
