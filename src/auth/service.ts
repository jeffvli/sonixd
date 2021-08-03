import axios from 'axios';
import { randomString, md5 } from '../shared/utils';
import { config } from '../shared/config';

class AuthService {
  public server = '';

  public username = '';

  public salt = '';

  public hash = '';

  private authenticated = false;

  constructor() {
    this.server = config.serverUrl || localStorage.getItem('server') || '';
    this.username = localStorage.getItem('username') || '';
    this.salt = localStorage.getItem('salt') || '';
    this.hash = localStorage.getItem('hash') || '';
  }

  private saveSession() {
    if (!config.serverUrl) {
      localStorage.setItem('server', this.server);
    }
    localStorage.setItem('username', this.username);
    localStorage.setItem('salt', this.salt);
    localStorage.setItem('hash', this.hash);
  }

  async autoLogin(): Promise<boolean> {
    if (!this.server || !this.username) {
      return false;
    }
    return this.loginWithHash(
      this.server,
      this.username,
      this.salt,
      this.hash,
      false
    )
      .then(() => true)
      .catch(() => false);
  }

  async loginWithPassword(
    server: string,
    username: string,
    password: string,
    remember: boolean
  ) {
    const salt = randomString();
    const hash = md5(password + salt);
    return this.loginWithHash(server, username, salt, hash, remember);
  }

  private async loginWithHash(
    server: string,
    username: string,
    salt: string,
    hash: string,
    remember: boolean
  ) {
    const url = `${server}/rest/ping?u=${username}&s=${salt}&t=${hash}&v=1.15.0&c=app&f=json`;
    return axios.get(url).then((response: any) => {
      const subsonicResponse = response.data['subsonic-response'];
      if (!subsonicResponse || subsonicResponse.status !== 'ok') {
        const err = new Error(subsonicResponse.status);
        // eslint-disable-next-line promise/no-return-wrap
        return Promise.reject(err);
      }
      this.authenticated = true;
      this.server = server;
      this.username = username;
      this.salt = salt;
      this.hash = hash;
      // eslint-disable-next-line promise/always-return
      if (remember) {
        this.saveSession();
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  logout() {
    localStorage.clear();
    sessionStorage.clear();
  }

  isAuthenticated() {
    return this.authenticated;
  }
}

export default AuthService;
