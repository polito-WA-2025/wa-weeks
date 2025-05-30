'use strict';

/* Data Access Object (DAO) module for accessing films data */

const db = require('./db');
const dayjs = require("dayjs");

const filterValues = {
  'favorite': { filterFunction: film => film.favorite },
  'best': { filterFunction: film => film.rating >= 5 },
  'lastmonth': { filterFunction: film => isSeenLastMonth(film) },
  'unseen': { filterFunction: film => film.watchDate ? false : true },
  'all': { filterFunction: film => true },
};


const isSeenLastMonth = (film) => {
  if ('watchDate' in film && film.watchDate) {  // Accessing watchDate only if defined
    const diff = dayjs(film.watchDate).diff(dayjs(), 'month')   // watchDate is kept as a string (or null value) in the film object
    const isLastMonth = diff <= 0 && diff > -1;      // last month
    return isLastMonth;
  }
}

const convertFilmFromDbRecord = (dbRecord) => {
  const film = {};
  film.id = dbRecord.id;
  film.title = dbRecord.title;
  film.favorite = dbRecord.favorite;
  // Note that the column name is all lowercase, JSON object requires camelCase as per the API specifications we defined.
  // We convert "watchdate" to the camelCase version ("watchDate").


  // FIXME
  // Also, here you decide how to transmit an empty date in JSON. We decided to use the empty string.
  // Using the null value is an alternative, but the API documentation must be updated and the client must be modified accordingly.
  //film.watchDate = dbRecord.watchdate ? dayjs(dbRecord.watchdate) : "";
  film.watchDate = dbRecord.watchdate;
  film.rating = dbRecord.rating;

  /* // ALTERNATIVE:
  // WARNING: the column names in the database are all lowercases. JSON object requires camelCase as per the API specifications we defined.
  // We convert "watchdate" to the camelCase version ("watchDate").
  // Object.assign will copy all fields returned by the DB (i.e., all columns if SQL SELECT did not specify otherwise)
  const film = Object.assign({}, e, { watchDate: e.watchdate? dayjs(e.watchdate) : "" });  // adding camelcase "watchDate"
  delete film.watchdate;  // removing lowercase "watchdate"
  */
  return film;
}


/** NOTE
 * return error messages as json object { error: <string> }
 */


// This function retrieves the whole list of films from the database.
exports.listFilms = (filter) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM films';
    db.all(sql, (err, rows) => {
      if (err) { reject(err); }

      const films = rows.map((e) => {
        const film = convertFilmFromDbRecord(e);
        delete film.watchdate;  // removing lowercase "watchdate"
        return film;
      });

      // Check if a filter is specified, otherwise just return the complete list.
      if (filter) {
        // WARNING: if implemented as if(filterValues[filter]) returns true also for filter = 'constructor' but then .filterFunction does not exists
        if (filterValues.hasOwnProperty(filter))
          resolve(films.filter(filterValues[filter].filterFunction));
        else
          reject({ error: "The specified filter is not available" });
        return;  // Do not forget return here!
      }
      resolve(films);
    });
  });
};

exports.searchFilms = (searchString) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM films WHERE title LIKE ?';
    // NOTE: DO NOT construct SQL string directly as ... 'title LIKE %'+searchString+'%'; // NO!!!
    const sqlSearchString = '%'+searchString+'%';
    db.all(sql, [ sqlSearchString ], (err, rows) => {
      if (err) { reject(err); }

      const films = rows.map((e) => {
        const film = convertFilmFromDbRecord(e);
        delete film.watchdate;  // removing lowercase "watchdate"
        return film;
      });
      resolve(films);
    });
  });

}

// This function retrieves a film given its id.
exports.getFilm = (user, id) => {
  return new Promise((resolve, reject) => {
    console.log(`getFilm: user=${user} id=${id}`);
    const sql = 'SELECT * FROM films WHERE id=? AND user=?';
    db.get(sql, [id, user], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row == undefined) {
        resolve({ error: 'Film not found.' });
      } else {
        const film = convertFilmFromDbRecord(row);
        resolve(film);
      }
    });
  });
};


/**
 * This function adds a new film in the database.
 * The film id is added automatically by the DB, and it is returned as this.lastID.
 */
exports.createFilm = (film) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO films (title, favorite, watchDate, rating) VALUES(?, ?, ?, ?)';
    db.run(sql, [film.title, film.favorite, film.watchDate, film.rating], function (err) {
      if (err) {
        reject(err);
      }
      // Returning the newly created object with the DB additional properties (i.e., unique id) to the client.
      resolve(exports.getFilm(this.lastID));
    });
  });
};

// This function updates an existing film given its id and the new properties.
exports.updateFilm = (id, film) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE films SET title = ?, favorite = ?, watchDate = ?, rating = ? WHERE id = ?';
    db.run(sql, [film.title, film.favorite, film.watchDate, film.rating, id], function (err) {
      if (err) {
        reject(err);
      }
      if (this.changes !== 1) {
        resolve({ error: 'Film not found.' });
      } else {
        resolve(exports.getFilm(id));
      }
    });
  });
};

// This function updates an existing rating of a film given its id.
exports.updateFilmRating = (id, deltaRating) => {
  console.log(`id: ${id} deltaRating: ${deltaRating}`);
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE films SET rating=rating+? WHERE id = ?';
    db.run(sql, [deltaRating, id], function (err) {
      if (err) {
        reject(err);
      }
      if (this.changes !== 1) {
        resolve({ error: 'Film not found.' });
      } else {
        resolve(exports.getFilm(id));
      }
    });
  });
};

// This function deletes an existing film given its id.
exports.deleteFilm = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM films WHERE id = ?';
    db.run(sql, [id], function (err) {
      if (err) {
        reject(err);
      } else
        resolve(this.changes);
    });
  });
}
