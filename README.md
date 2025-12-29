# Prepare your environment

- Install node
- Install nvm
- Clone this repo to this directory

## First time run

- `nvm use`
- `node createdb.mjs`

The "npm run create" does this:

It creates (or recreates) the SQLite database people.db with 1.6 million records where each record is a person's name consisting of three rando names. Each person also has a random date and an ID. You only need to do this once.

## Prep the database for searching

- `node prepdb.mjs`

This might take a few minutes to run. This only needs to be done once.

## Now search the database

- `node query.mjs`
