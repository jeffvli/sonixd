const getAuth = () => {
  const serverConfig = {
    username: localStorage.getItem('username') || '',
    salt: localStorage.getItem('salt') || '',
    hash: localStorage.getItem('hash') || '',
    server: localStorage.getItem('server') || '',
  };

  return serverConfig;
};

export default getAuth;
