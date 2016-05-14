var execute = function(table) {
  var store = new KVStore().connect(config.username, config.password);
  store.set_db(config.username, config.repo, config.branch);
  $(table).empty();

  var tmpl = $.templates("<div class='db_entry'><div class='db_entry_path'>{{:path}}</div><div class='db_entry_content'>{{:content}}</div></div>");

  store.set_entry("new_entry", "newer_content").then(
      function(succ) {
        return store.mov_entry("new_entry", "new_fn").then(
            function(succ) {
              return store.del_entry("new_fn");
            }
        );
      }
  );
}


var KVStore = function(name, email) {
  this._committer = name;
  this._email = email;
}


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
 * @param {string} path The filename.
 * @throws {Error} Raise if value could not be obtained from filename.
 * @return {Promise}
 */
KVStore.prototype.get_entry = function(path) {
  this._check_db();
  return this._db.getContents(this._branch, path, false).then(
      function(succ) {
        return {
            path: succ.data.path,
            content: atob(succ.data.content),
            sha: succ.data.sha
        };
      },
      function(fail) {
        throw new Error("KVStore: could not get entry");
      }
  );
}


/**
 * Updates a file in the GitHub repo; creates the file if none exists.
 * @param {string} path The filename.
 * @param {string} content The data to be written to the file.
 * @throws {Error} Raise if file could not be written to.
 * @return {Promise}
 */
KVStore.prototype.set_entry = function(path, content) {
  this._check_db();
  options = {
    committer: this._committer,
    email: this._email,
    encode: false
  }
  return this._db.writeFile(this._branch, path, btoa(content), `Updated the file at '${path}'`, options).then(
      function(succ) {
        return {
            path: path,
            content: content,
            sha: succ.data.content.sha
        };
      },
      function(fail) {
        throw new Error("KVStore: could not write entry");
      }
  );
}


/**
 * Deletes a file in the GitHub repo.
 * @param {string} path The filename.
 * @throws {Error} Raise if the file could not be deleted.
 * @return {Promise}
 */
KVStore.prototype.del_entry = function(path) {
  this._check_db();
  return this._db.deleteFile(this._branch, path).then(
      function(succ) {
        return succ;
      },
      function(fail) {
        throw new Error("KVStore: could not delete file.");
      }
  );
}


/**
 * Deletes a file in the GitHub repo.
 * @param {string} src Current file path.
 * @param {string} dst Destination file path.
 * @throws {Error} Raise if the file could not be moved.
 * @return {Promise}
 */
KVStore.prototype.mov_entry = function(src, dst) {
  // TODO(cripplet) use db.move(src, dst), make atomic
  this._check_db();
  return this._db.move(this._branch, src, dst);
}


/**
 * Queries GitHub for the contents of a directory.
 * @param {string} path The path of the directory to query.
 * @throws {Error} Raise error if KVStore could not query path or passed from _check_db()
 * @return {Promise}
 */
KVStore.prototype.query = function(path) {
  this._check_db();
  return this._db.getContents(this._branch, path).then(
      function(succ) {
        var result = [];
        for (var i = 0; i < succ.data.length; i++) {
          result.push(this.get_entry(succ.data[i].name));
        }
        return Promise.all(result);
      }.bind(this),
      function(fail) {
        throw new Error("KVStore: could not query path");
      }
  );
}
