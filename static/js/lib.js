var _string = function() {
  return Math.random().toString(36).substring(2);
}

var generate = function(n) {
  var s = "";
  for(var i = 0; i < n; i++ ) {
    s = s.concat(_string());
  }
  return s.substring(0, n);
}


var execute = function(store, table) {
  store.set_entry(generate(10), generate(20)).then(
      (succ) => {
        store.render(table);
      }
  );
}


var KVStore = function(name, email) {
  this._committer = name;
  this._email = email;
  this._table = {};
}


KVStore.prototype.render = function(table) {
  $(table).empty();

  var _table = [];
  for (var key in this._table) {
    if (this._table.hasOwnProperty(key)) {
      _table.push({
          "path": key,
          "content": this._table[key]
      });
    }
  }

  var tmpl = $.templates("<div class='db_entry'><div class='db_entry_path'>{{:path}}</div><div class='db_entry_content'>{{:content}}</div></div>");
  $(table).html(tmpl.render(_table));
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
      (succ) => {
        return {
            path: succ.data.path,
            content: atob(succ.data.content),
            sha: succ.data.sha
        };
      },
      (fail) => {
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
      (succ) => {
        this._table[path] = content;
        return {
            path: path,
            content: content,
            sha: succ.data.content.sha
        };
      },
      (fail) => {
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
      (succ) => {
        delete this._table[path];
        return succ;
      },
      (fail) => {
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
  this._check_db();
  return this._db.move(this._branch, src, dst).then(
      (succ) => {
        this._table[dst] = this._table[src];
        delete this._table[src];
        return succ;
      },
      (fail) => {
        throw new Error("KVStore: could not move file.");
      }
  );
}


/**
 * Queries GitHub for the contents of a directory.
 * @param {string} path The path of the directory to query.
 * @throws {Error} Raise error if KVStore could not query path or passed from _check_db()
 * @return {Promise}
 */
KVStore.prototype.query = function(path) {
  this._check_db();
  this._table = {};
  return this._db.getContents(this._branch, path).then(
      (succ) => {
        for (var i = 0; i < succ.data.length; i++) {
          this.get_entry(succ.data[i].name).then(
              (succ) => {
                this._table[succ.path] = succ.content;
              }
          );
        }
        return Promise.all(succ.data);
      },
      (fail) => {
        throw new Error("KVStore: could not query path");
      }
  );
}
