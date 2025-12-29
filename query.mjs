const searchWord = "TIMOTHY";

import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("people.db");

const startTime = Date.now();

const allPeople = db
  .prepare(
    "SELECT name, ids FROM sorted_people_names WHERE name >= ? and name < ?"
  )
  .iterate(searchWord, searchWord + "\uffff");

let allIds = [];

for (const person of allPeople) {
  allIds = allIds.concat(JSON.parse(person.ids));
}

let people = [];

// get all records from people where id is in allIds
const stmt = db.prepare(`SELECT id, name, birthday FROM people WHERE id = ?`);

for (const id of allIds) {
  const person = stmt.get(id);
  people.push(person);
}

// sort people by birthday
people.sort((a, b) => {
  if (a.birthday < b.birthday) return -1;
  if (a.birthday > b.birthday) return 1;
  return 0;
});

console.log(searchWord, JSON.stringify(people));
const endTime = Date.now();
console.log("Query took ", endTime - startTime, " ms");
