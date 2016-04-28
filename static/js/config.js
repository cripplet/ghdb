/**
 * Params file for lib.js.
 */

var name = "Minke Zhang";
var email = "minke.zhang@gmail.com";

var username = "cripplet-db";
var password = "6f920f50f5c81308ee0" + "aad463a40ac83b4cd5b16";
var repo = "db";


/**
 * vars = { "name": NAME, ... }
 */
var configure = function(vars) {
  if vars.hasOwnProperty("name") {
    name = vars.name;
  }
  if vars.hasOwnProperty("email") {
    email = vars.email;
  }
  if vars.hasOwnProperty("username") {
    username = vars.username;
  }
  if vars.hasOwnProperty("password") {
    password = vars.password;
  }
  if vars.hasOwnProperty("repo") {
    repo = vars.repo;
  }
}
