const fetch = require('node-fetch'),
      { uriEncode } = require('utility');

function DiscordOAuth2(options) {
  this.client_id = options?.clientId;
  this.client_secret = options?.clientSecret;
  this.redirect_uri = options?.redirectUri;
  this.scope = options?.scope;
  this.discordBaseUri = options?.discordBaseUri || 'https://discord.com/api';
}

DiscordOAuth2.prototype.getAuthenticationUri = function(scope) {
  return `${this.discordBaseUri}/oauth2/authorize?${uriEncode({
    client_id: this.client_id,
    response_type: 'code',
    scope: scope || this.scope,
    redirect_uri: this.redirect_uri,
  })}`;
};

DiscordOAuth2.prototype.getToken = async function(code) {
  const response = await fetch(
    `${this.discordBaseUri}/oauth2/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: uriEncode({
        client_id: this.client_id,
        client_secret: this.client_secret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirect_uri,
      }),
    }
  );

  if (!response.ok) throw JSON.parse(await response.text());

  return JSON.parse(await response.text());
};

DiscordOAuth2.prototype.refreshToken = async function(refreshToken) {
  const response = await fetch(
    `${this.discordBaseUri}/oauth2/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: uriEncode({
        client_id: this.client_id,
        client_secret: this.client_secret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    }
  );

  if (!response.ok) throw JSON.parse(await response.text());

  return JSON.parse(await response.text());
};

DiscordOAuth2.prototype.revokeToken = async function(token) {
  const response = await fetch(
    `${this.discordBaseUri}/oauth2/token/revoke`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: uriEncode({
        client_id: this.client_id,
        client_secret: this.client_secret,
        token: token,
      }),
    }
  );

  if (!response.ok) throw JSON.parse(await response.text());

  return response.status;
};

DiscordOAuth2.prototype.getUser = async function(token_type, access_token) {
  const response = await fetch(
    `${this.discordBaseUri}/users/@me`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token_type} ${access_token}`,
      },
    }
  );

  if (!response.ok) throw await response.json();

  return await response.json();
};

module.exports = DiscordOAuth2;
