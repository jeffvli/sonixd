const getServerUrl = (url: string) => {
  if (url[url.length - 1] === '/') {
    return `${url}api`;
  }

  return `${url}/api`;
};

export default getServerUrl;
