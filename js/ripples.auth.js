var scopes = 'https://www.googleapis.com/auth/analytics.readonly';

// This function is called after the Client Library has finished loading
function handleClientLoad() {
  // 1. Set the API Key
  gapi.client.setApiKey(apiKey);

  // 2. Call the function that checks if the user is Authenticated. This is defined in the next section
  window.setTimeout(checkAuth,1);
}

function checkAuth() {
  // Call the Google Accounts Service to determine the current user's auth status.
  // Pass the response to the handleAuthResult callback function
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
}

function handleAuthResult(authResult) {
  if (authResult) {
    // The user has authorized access
    // Load the Analytics Client. This function is defined in the next section.

    console.log(authResult.status);

    localStorage.setItem("access_token", authResult.access_token);
    localStorage.setItem("client_id", authResult.client_id);

    loadAnalyticsClient();
  } else {
    // User has not Authenticated and Authorized
    handleUnAuthorized();
  }
}

// Authorized user
function handleAuthorized() {
    $("#authorize-button").addClass("hide");
    $("#test-api").removeClass("hide");
}

// Unauthorized user
function handleUnAuthorized() {
    $("#authorize-button").removeClass("hide");
    $("#test-api").addClass("hide");
}

// Load Analytics Client
function loadAnalyticsClient() {
  // Load the Analytics client and set handleAuthorized as the callback function
  gapi.client.load('analytics', 'v3', handleAuthorized);
}

// Make API call
function makeApiCall() {
  queryAccounts();
}

$("#authorize-button").on("click", function (e){
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
  return false;
});

$("#test-api").on("click", function(e) {
    makeApiCall();
});
