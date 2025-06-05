BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "films" (
	"id"	INTEGER,
	"title"	TEXT NOT NULL,
	"favorite"	INTEGER NOT NULL DEFAULT (0),
	"watchdate"	TEXT,
	"rating"	INTEGER,
	"user"	INTEGER NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT) 
);
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER NOT NULL,
	"email"	TEXT NOT NULL,
	"name"	TEXT,
	"hash"	TEXT NOT NULL,
	"salt"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
INSERT INTO "films" ("title","favorite","watchdate","rating","user") VALUES ('Pulp Fiction',1,'2023-03-10',5,1);
INSERT INTO "films" ("title","favorite","watchdate","rating","user") VALUES ('21 Grams',1,'2023-03-17',4,1);
INSERT INTO "films" ("title","favorite","watchdate","rating","user") VALUES ('Star Wars',0,NULL,NULL,1);
INSERT INTO "films" ("title","favorite","watchdate","rating","user") VALUES ('Matrix',0,NULL,NULL,2);
INSERT INTO "films" ("title","favorite","watchdate","rating","user") VALUES ('Shrek',0,'2023-03-21',3,2);
INSERT INTO "users" VALUES (1,'u1@p.it','John','15d3c4fca80fa608dcedeb65ac10eff78d20c88800d016369a3d2963742ea288','72e4eeb14def3b21');
INSERT INTO "users" VALUES (2,'u2@p.it','Alice','1d22239e62539d26ccdb1d114c0f27d8870f70d622f35de0ae2ad651840ee58a','a8b618c717683608');
INSERT INTO "users" VALUES (3,'u3@p.it','George','61ed132df8733b14ae5210457df8f95b987a7d4b8cdf3daf2b5541679e7a0622','e818f0647b4e1fe0');
COMMIT;
