import Database from "better-sqlite3";
import { readFileSync } from "fs";

const db = new Database("./sqlite.db");
db.exec(readFileSync("./sqlite.sql", "utf8"));

const tables = db
  .prepare("select name from sqlite_master where type = 'table'")
  .all();
console.log("Tables créées :", tables.map((t) => t.name));
db.close();