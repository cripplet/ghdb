var execute = function() {
  var store = new KVStore().connect(config.username, config.password);
  store.set_db(config.username, config.repo, config.branch);
  store.query("").then(function(succ) {
    JSON.stringify(succ);
  });
  store.query("").then(
    function(succ) {
      $("#error_dir").text(JSON.stringify(succ));
    }, function(fail) {
    }
  );
}


var KVStore = function() {}

/**
 * Connects to the GitHub account.
 * @param {string} username GitHub username.
 * @param {string} password GitHub password or personal access token.
 * @return {KVStore}
 */
KVStore.prototype.connect = function(username, password) {
    this._gh = new GitHub({
       username: username,
       password: password
    });
    return this;
}

/**
 * Sets the database the KVStore will alter.
 * TODO(cripplet): If db does not exist, create it.
 * @param {string} username Owner of the GitHub repo.
 * @param {string} db Name of the GitHub repo.
 * @param {string} branch Branch of the repo storing appropriate data.
 * @throws {Error} Raise error if KVStore has not connected.
 */
KVStore.prototype.set_db = function(username, db, branch) {
  if (this._gh === undefined) {
    throw new Error("KVStore: not connected");
  }
  this._branch = branch;
  this._db = this._gh.getRepo(username, db);
}

/**
 * Checks that the KVStore has set a database to query.
 * @throws {Error} Raise error if KVStore database is not set.
 */
KVStore.prototype._check_db = function() {
  if (this._db === undefined) {
    throw new Error("KVStore: db not set");
  }
}

/**
 * Gets value of key.
 * @param {string} path The key.
 * @throws {Error} Raise if value could not be obtained from key.
 * @return {Promise}
 */
KVStore.prototype.get_entry = function(path) {
  this._check_db();
  return this._db.getContents(this._branch, path, true).then(
      function(succ) {
        return succ.data;
      },
      function(fail) {
        throw new Error("KVStore: could not get entry");
      }
  );
}

KVStore.prototype.set_entry = function() {}
KVStore.prototype.del_entry = function() {}
KVStore.prototype.mov_entry = function() {}

/**
 * Queries GitHub for the contents of a directory.
 * @param {string} path The path of the directory to query.
 * @return {Promise}
 */
KVStore.prototype.query = function(path) {
  this._check_db();
  return this._db.getContents(this._branch, path).then(
      succ => {
        var results = {}

        // problem area
        for (var i = 0; i < succ.data.length; i++) {
          var el = succ.data[i];
          results[el.name] = this.get_entry(el.name)
        }

        return results;
      },
      fail => {
        throw new Error("KVStore: could not query path");
      }
  );
}
