import axios from 'axios';

const API_KEY = 'AIzaSyBk8OdaB5Ba0B7KltZOb_G_yU-HX1kjM9Q';
const API_ENDPOINT = `https://identitytoolkit.googleapis.com/v1/accounts:`;

async function authUser(mode, email, password) {
  const url = `${API_ENDPOINT}${mode}?key=${API_KEY}`;
  const data = {
    email: email,
    password: password,
    returnSecureToken: true,
  };

  const response = await axios.post(url, data);
  console.log('response', response.data);

  return response.data.idToken;
}

export function createUser(email, password) {
  return authUser('signUp', email, password);
}

export function login(email, password) {
  return authUser('signInWithPassword', email, password);
}
