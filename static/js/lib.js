/**
 * JSON config file
 * TODO(cripplet): move to external defaults.json file
 */

var name = "Minke Zhang";
var email = "minke.zhang@gmail.com";

var username = "cripplet-db";
var password = "6f920f50f5c81308ee0" + "aad463a40ac83b4cd5b16";
var repo = "db";

var getEndpoint = function(path) {
  return "https://api.github.com/repos/" + username + "/" + repo + "/contents/" + path;
};

var getMockPath = function() {
  return (Math.random().toString(36)+'00000000000000000').slice(2, 16+2)
};

var getFile = function(path, el_status = null, el_debug = null, el_data = null) {
  var sha = null;

  $.ajax({
    type: "GET",
    url: getEndpoint(path),
    dataType: "json",
    contentType: "application/json",
    success: function(resp) {
      if (el_status !== null) {
        el_status.text("success");
      }
      if (el_debug !== null) {
        el_debug.text(JSON.stringify(resp));
      }
      if (el_data !== null) {
        el_data.text(atob(resp.content));
      }
      sha = resp.sha;
    },
    error: function(req) {
      if (el_status !== null) {
        el_status.text("failure");
      }
      if (el_debug !== null) {
        el_debug.text(JSON.stringify(req));
      }
    }
  });

  return sha;
}

var addFile = function(path, content, el_status, el_debug, el_data) {
  path = getMockPath();

  var payload = {
    "path": path,
    "message": "added " + path,
    "committer": {
      "name": name,
      "email": email
    },
    "content": btoa(content)
  }
  
  $.ajax({
    type: "PUT",  // not POST for some reason
    url: getEndpoint(path),
    dataType: "json",
    contentType: "application/json",
    xhrFields: { withCredentials: false },
    headers: { 'Authorization': "Basic " + btoa(username + ":" + password) },
    data: JSON.stringify(payload),
    success: function(resp) {
      if (el_status !== null) {
        el_status.text("success");
      }
      if (el_debug !== null) {
        el_debug.text(JSON.stringify(resp));
      }
      if (el_data !== null) {
        el_data.text(resp.content.name);
      }
    },
    error: function(req) {
      if (el_status !== null) {
        el_status.text("failure");
      }
      if (el_debug !== null) {
        el_debug.text(JSON.stringify(req));
      }
    }
  });
};
