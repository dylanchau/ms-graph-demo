// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

var graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

module.exports = {
  getUserDetails: async function (msalClient, userId) {
    const client = getAuthenticatedClient(msalClient, userId);

    const user = await client
      .api('/me')
      .select('displayName,mail,mailboxSettings,userPrincipalName')
      .get();
    return user;
  },

  sendMail: async function (msalClient, userId) {
    const mail = {
      subject: "Microsoft Graph JavaScript Sample",
      toRecipients: [
        {
          emailAddress: {
            address: "nguyen.van.a.911a@gmail.com",
          },
        },
      ],
      body: {
        content: "<h1>MicrosoftGraph JavaScript Sample</h1>Check out https://github.com/microsoftgraph/msgraph-sdk-javascript",
        contentType: "html",
      },
    };
    try {
      const client = getAuthenticatedClient(msalClient, userId);
      await client
        .api('/me/sendMail')
        .post(
          { message: mail }
        )
    } catch (err) {
      console.log(JSON.stringify(err))
    }
  }
};

function getAuthenticatedClient(msalClient, userId) {
  if (!msalClient || !userId) {
    throw new Error(
      `Invalid MSAL state. Client: ${msalClient ? 'present' : 'missing'}, User ID: ${userId ? 'present' : 'missing'}`);
  }

  // Initialize Graph client
  const client = graph.Client.init({
    // Implement an auth provider that gets a token
    // from the app's MSAL instance
    authProvider: async (done) => {
      try {
        // Get the user's account
        const account = await msalClient
          .getTokenCache()
          .getAccountByHomeId(userId);

        if (account) {
          // Attempt to get the token silently
          // This method uses the token cache and
          // refreshes expired tokens as needed
          const scopes = process.env.OAUTH_SCOPES || 'https://graph.microsoft.com/.default';
          const response = await msalClient.acquireTokenSilent({
            scopes: scopes.split(','),
            // scopes: ['https://graph.microsoft.com/.default'],
            redirectUri: process.env.REDIRECT_URI,
            account: account
          });

          // First param to callback is the error,
          // Set to null in success case
          done(null, response.accessToken);
        }
      } catch (err) {
        console.log(JSON.stringify(err, Object.getOwnPropertyNames(err)));
        done(err, null);
      }
    }
  });

  return client;
}