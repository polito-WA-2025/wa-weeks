BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "questions" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"text"	TEXT,
	"author"	TEXT,
	"date"	DATE
);
CREATE TABLE IF NOT EXISTS "answers" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"text"	TEXT,
	"respondent"	TEXT,
	"score"	INTEGER,
	"date"	DATE,
	"questionId"	INTEGER
);

CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"username"	TEXT,
	"password"	TEXT
);

INSERT INTO "questions" VALUES (1,'Best way of enumerating an array in JS?','Enrico','2024-02-28');
INSERT INTO "answers" VALUES (1,'for of','Alice',3,'2024-03-06',1);
INSERT INTO "answers" VALUES (2,'for i=0,i<N,i++','Harry',1,'2024-03-04',1);
INSERT INTO "answers" VALUES (3,'for in','Harry',-2,'2024-03-02',1);
INSERT INTO "answers" VALUES (4,'i=0 while(i<N)','Carol',-1,'2024-03-01',1);

INSERT INTO "users" VALUES (1,'admin','adminPassword');
INSERT INTO "users" VALUES (2,'user1','difficultPwd');
COMMIT;
