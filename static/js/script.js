var randString = function() {
  return (Math.random().toString(36)+'00000000000000000').slice(2, 16+2)
}

var execute = function(file, text) {
  // add a file with text
  file = randString();
  var repo = "cripplet-db/db";
  var key = ['6', 'f', '9', '2', '0', 'f', '5', '0', 'f', '5', 'c', '8', '1', '3', '0', '8', 'e', 'e', '0', 'a', 'a', 'd', '4', '6', '3', 'a', '4', '0', 'a', 'c', '8', '3', 'b', '4', 'c', 'd', '5', 'b', '1', '6'].join("");
  var url = "https://api.github.com/repos/" + repo + "/contents/" + file;
  var username = "cripplet-db";
  var data = {
    "path": file,
    "message": "test commit",
    "committer": {
      "name": "Minke Zhang",
      "email": "minke.zhang@gmail.com"
    },
    "content": btoa(text),
  };

  $.ajax({
    type: "PUT",  // not POST for some reason
    url: url,
    dataType: "json",
    contentType: "application/json",
    xhrFields: {
        withCredentials: false
    },
    headers:{
        'Authorization': "Basic " + btoa(username + ":" + key)
    },
    data: JSON.stringify(data),
    success: function(response) {
      $("#error").text("success");
      $("#content").text(JSON.stringify(response));
    },
    error: function(xhr, textStatus, errorThrown) {
      $("#error").text("failure");
      $("#content").text(JSON.stringify([xhr, textStatus, errorThrown]));
    }
  });
};
