import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import { createInterface } from "node:readline";

let db = null; // the sqlite database object
let insert = null; // the prepared insert statement

let names = [];

function prepDB() {
  // delete file peope.db if it exists
  if (fs.existsSync("people.db")) {
    fs.unlinkSync("people.db");
  }

  db = new DatabaseSync("people.db");

  db.exec("PRAGMA journal_mode = WAL;"); // Enable WAL
  db.exec("PRAGMA synchronous = NORMAL;"); // Safe but fast (default is FULL)

  // Optional extras for more speed
  db.exec("PRAGMA cache_size = -20000;"); // ~20 MB cache (negative = KiB)
  db.exec("PRAGMA temp_store = MEMORY;"); // Temp tables/indexes in RAM
  db.exec("PRAGMA mmap_size = 30000000000;"); // Memory-map large DBs (if enough RAM)

  db.exec(`
  CREATE TABLE people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    birthday DATE
  );
`);

  insert = db.prepare("INSERT INTO people (name, birthday) VALUES (?, ?)");
}

function insertFromCSV() {
  return new Promise(async (resolve, reject) => {
    const lineReader = createInterface({
      input: fs.createReadStream("names.csv"),
      crlfDelay: Infinity, // Handles both \n and \r\n line endings
    });

    lineReader.on("line", (line) => {
      names.push(line);
    });

    lineReader.on("close", () => {
      console.log("Finished reading the file");
      resolve();
    });
  });
}

function createPeople() {
  for (let i = 0; i < 1649233; i++) {
    if (i % 10000 === 0) {
      console.log("Inserting person ", i);
    }
    const randomYear = Math.floor(Math.random() * 130) + 1890;
    const randomMonth = String(Math.floor(Math.random() * 12) + 1).padStart(
      2,
      "0"
    );
    const randomDay = String(Math.floor(Math.random() * 28) + 1).padStart(
      2,
      "0"
    );
    const birthday = `${randomYear}-${randomMonth}-${randomDay}`;
    const randomName =
      names[Math.floor(Math.random() * names.length)] +
      " " +
      names[Math.floor(Math.random() * names.length)] +
      " " +
      names[Math.floor(Math.random() * names.length)];
    // console.log(randomName, birthday);
    insert.run(randomName, birthday);
  }
}

async function main() {
  console.log("Started at ", new Date().toISOString());
  prepDB();
  await insertFromCSV();
  createPeople();
  console.log("Ended at ", new Date().toISOString());
}

main();
