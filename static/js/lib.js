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

var getFile = function(path, el_status, el_debug, el_data) {
  $.ajax({
    type: "GET",
    url: getEndpoint(path),
    dataType: "json",
    contentType: "application/json",
    success: function(resp) {
      el_status.text("success");
      el_debug.text(JSON.stringify(resp));
      el_data.text(atob(resp.content));
    },
    error: function(req) {
      el_status.text("failure");
      el_debug.text(JSON.stringify(req));
    }
  });
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
      el_status.text("success");
      el_debug.text(JSON.stringify(resp));
    },
    error: function(req) {
      el_status.text("failure");
      el_debug.text(JSON.stringify(req));
    }
  });
};
