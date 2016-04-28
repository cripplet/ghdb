/**
 * INSERT THINGS TO SAY HERE
 */


/**
 * vars = { "name": NAME, ... }
 */
var configure = function(vars) {
  if (vars.hasOwnProperty("name")) {
    name = vars.name;
  }
  if (vars.hasOwnProperty("email")) {
    email = vars.email;
  }
  if (vars.hasOwnProperty("username")) {
    username = vars.username;
  }
  if (vars.hasOwnProperty("password")) {
    password = vars.password;
  }
  if (vars.hasOwnProperty("repo")) {
    repo = vars.repo;
  }
}


/**
 * Gets the contents of all files in a directory.
 */
var getDir = function(path) {
  var result = getFile(path);
  if (result.success) {
    for (var i = 0; i < result.data.length; i++) {
      result.data[i].content = btoa(getRaw(result.data[i].download_url).data);
    }
  }
  return result;
}


/**
 * Downloads data from raw GitHub file endpoint.
 */
var getRaw = function(url) {
  var success = null;
  var data = null;
  
  $.ajax({
    type: "GET",
    url: url,
    async: false,
    success: function(resp) {
      success = true;
      data = resp;
    },
    error: function(req) {
      success = false;
      data = req;
    }
  });
  
  return {
    "success": success,
    "data": data
  };
};


/**
 * Constructs the appropriate GitHub API endpoint.
 */
var getEndpoint = function(path) {
  return "https://api.github.com/repos/" + username + "/" + repo + "/contents/" + path;
};


var getFile = function(path) {
  var success = null;
  var data = null;

  $.ajax({
    type: "GET",
    url: getEndpoint(path),
    dataType: "json",
    contentType: "application/json",
    xhrFields: { withCredentials: false },
    headers: { 'Authorization': "Basic " + btoa(username + ":" + password) },
    async: false,
    success: function(resp) {
      success = true;
      data = resp;
    },
    error: function(req) {
      success = false;
      data = req;
    }
  });

  return {
    "success": success,
    "data": data,
  };
}


var delFile = function(path) {
  var file = getFile(path);
  
  var sha = file.data.sha;
  var success = null;
  var data = null;
  
  var payload = {
    "sha": sha,
    "path": path,
    "message": "deleted " + path,
    "committer": {
      "name": name,
      "email": email
    },
  };
  
  $.ajax({
    type: "DELETE",
    url: getEndpoint(path),
    dataType: "json",
    contentType: "application/json",
    xhrFields: { withCredentials: false },
    headers: { 'Authorization': "Basic " + btoa(username + ":" + password) },
    data: JSON.stringify(payload),
    async: false,
    success: function(resp) {
      success = true;
      data = resp;
    },
    error: function(req) {
      success = false;
      data = req;
    }
  });
  
  return {
    "success": success,
    "data": data
  };
};


var updFile = function(path, content) {
  var file = getFile(path);
  
  var sha = file.data.sha;
  var success = null;
  var data = null;
  
  var payload = {
    "sha": sha,
    "path": path,
    "message": "updated " + path,
    "committer": {
      "name": name,
      "email": email
    },
    "content": btoa(content)
  };
  
  $.ajax({
    type: "PUT",
    url: getEndpoint(path),
    dataType: "json",
    contentType: "application/json",
    xhrFields: { withCredentials: false },
    headers: { 'Authorization': "Basic " + btoa(username + ":" + password) },
    data: JSON.stringify(payload),
    async: false,
    success: function(resp) {
      success = true;
      data = resp;
    },
    error: function(req) {
      success = false;
      data = req;
    }
  });
  
  return {
    "success": success,
    "data": data
  };
};


var addFile = function(path, content) {
  var success = null;
  var data = null;

  var payload = {
    "path": path,
    "message": "added " + path,
    "committer": {
      "name": name,
      "email": email
    },
    "content": btoa(content)
  };
  
  $.ajax({
    type: "PUT",  // not POST for some reason
    url: getEndpoint(path),
    dataType: "json",
    contentType: "application/json",
    xhrFields: { withCredentials: false },
    headers: { 'Authorization': "Basic " + btoa(username + ":" + password) },
    data: JSON.stringify(payload),
    async: false,
    success: function(resp) {
      success = true;
      data = resp;
    },
    error: function(req) {
      success = false;
      data = req;
    }
  });
  
  return {
    "success": success,
    "data": data
  };
};
