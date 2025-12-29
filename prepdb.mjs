import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("people.db");

db.exec("PRAGMA journal_mode = WAL;"); // Enable WAL
db.exec("PRAGMA synchronous = NORMAL;"); // Safe but fast (default is FULL)
db.exec("PRAGMA cache_size = -20000;"); // ~20 MB cache (negative = KiB)
db.exec("PRAGMA temp_store = MEMORY;"); // Temp tables/indexes in RAM
db.exec("PRAGMA mmap_size = 30000000000;"); // Memory-map large DBs (if enough RAM)

db.exec("DROP TABLE IF EXISTS sorted_people_names;");

db.exec(`
  CREATE TABLE sorted_people_names (
    name TEXT PRIMARY KEY,
    ids TEXT
  );
`);

const allPeople = db.prepare("SELECT name, id FROM people");
let count = 0;

for (const person of allPeople.iterate()) {
  // console.log(person.name, person.id);
  const names = person.name.split(" ");

  if (count % 10000 === 0) {
    console.log("Processing person ", count, person.name);
  }
  count++;

  for (const name of names) {
    const existing = db
      .prepare("SELECT ids FROM sorted_people_names WHERE name = ?")
      .get(name);
    if (existing) {
      // console.log("   ", name);
      const newIds = JSON.parse(existing.ids);
      newIds.push(person.id);
      const sortedIds = newIds.sort((a, b) => a - b);
      db.prepare("UPDATE sorted_people_names SET ids = ? WHERE name = ?").run(
        JSON.stringify(sortedIds),
        name
      );
    } else {
      db.prepare(
        "INSERT INTO sorted_people_names (name, ids) VALUES (?, ?)"
      ).run(name, JSON.stringify([person.id]));
    }
  }
}
