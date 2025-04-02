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
INSERT INTO "questions" VALUES (1,'Best way of enumerating an array in JS?','Enrico','2024-02-28');
INSERT INTO "answers" VALUES (1,'for of','Alice',3,'2024-03-06',1);
-- Note that < cannot be used in this case, use &lt; instead
INSERT INTO "answers" VALUES (2,'for <b>i=0,i&lt;N,i++</b>','Harry',1,'2024-03-04',1);
INSERT INTO "answers" VALUES (3,'<i>for in</i>','Harry',-2,'2024-03-02',1);
INSERT INTO "answers" VALUES (4,'i=0 while(i&lt;N)','Carol',-1,'2024-03-01',1);
INSERT INTO "answers" VALUES (5,'<img src="/" onerror="alert(''hacked xss'');">','Eve',2,'2024-04-10',1);
COMMIT;
