const DISCOVERY_DOC = ['https://sheets.googleapis.com/$discovery/rest?version=v4', 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'];
const SCOPES = 'https://mail.google.com/ https://www.googleapis.com/auth/spreadsheets';
let tokenClient;
let gapiInited = false;
let gisInited = false;

let btn_auth = document.getElementById('authorize_button');
let btn_sigout = document.getElementById('signout_button');
btn_auth.setAttribute('hidden', '')
btn_sigout.setAttribute('hidden', '')

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOC,
    });
    gapiInited = true;
    maybeEnableButtons();
}


function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '',
    });
    gisInited = true;
    maybeEnableButtons();
}

async function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        btn_auth.removeAttribute('hidden')
        handleAuthClick()
    }
}

function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        btn_sigout.removeAttribute('hidden')
        btn_auth.innerText = 'Refresh';
        let form = document.querySelector('form')
        if(form){
            form.removeAttribute('hidden')
        }
        let token = gapi.client.getToken().access_token
        if(!localStorage.getItem('token')) {
            localStorage.setItem('token',token)
        }
        await loadedWindow();
    };
    gapi.client.setToken(localStorage.getItem('token'))
    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
        
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        btn_auth.innerText = 'Authorize';
        btn_sigout.setAttribute('hidden','');
    }
}