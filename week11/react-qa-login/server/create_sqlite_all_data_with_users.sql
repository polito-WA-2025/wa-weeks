BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"email"	TEXT,
	"name"	TEXT,
	"salt"	TEXT,
	"password"	TEXT
);
CREATE TABLE IF NOT EXISTS "questions" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"text"	TEXT,
	"authorId"	INTEGER,
	"date"	DATE
);
CREATE TABLE IF NOT EXISTS "answers" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"text"	TEXT,
	"respondentId"	INTEGER,
	"score"	INTEGER,
	"date"	DATE,
	"questionId"	INTEGER
);

INSERT INTO "users" VALUES (1,'enrico@test.com','Enrico', '123348dusd437840', 'bddfdc9b092918a7f65297b4ba534dfe306ed4d5d72708349ddadb99b1c526fb'); /* password='pwd' */
INSERT INTO "users" VALUES (2,'luigi@test.com','Luigi',   '7732qweydg3sd637', '498a8d846eb4efebffc56fc0de16d18905714cf12edf548b8ed7a4afca0f7c1c');
INSERT INTO "users" VALUES (3,'alice@test.com','Alice',   'wgb32sge2sh7hse7', '09a79c91c41073e7372774fcb114b492b2b42f5e948c61d775ad4f628df0e160');
INSERT INTO "users" VALUES (4,'harry@test.com','Harry',   'safd6523tdwt82et', '330f9bd2d0472e3ca8f11d147d01ea210954425a17573d0f6b8240ed503959f8');
INSERT INTO "users" VALUES (5,'carol@test.com','Carol',   'ad37JHUW38wj2833', 'bbbcbac88d988bce98cc13e4c9308306d621d9e278ca62aaee2d156f898a41dd');
INSERT INTO "questions" VALUES (1,'Best way of enumerating an array in JS?',1,'2024-02-28');
INSERT INTO "questions" VALUES (2,'Is Javascript better than Python?',2,'2024-05-18');
INSERT INTO "answers" VALUES (1,'for of',3,3,'2024-03-06',1);
INSERT INTO "answers" VALUES (2,'for i=0,i<N,i++',4,1,'2024-03-04',1);
INSERT INTO "answers" VALUES (3,'for in',4,-2,'2024-03-02',1);
INSERT INTO "answers" VALUES (4,'i=0 while(i<N)',5,-1,'2024-03-01',1);
COMMIT;
