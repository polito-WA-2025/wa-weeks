BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "courses" (
	"code"	TEXT CHECK(length("code") = 7),
	"name"	TEXT NOT NULL,
	"cfu"	INTEGER NOT NULL CHECK("cfu" > 0),
	"max_students"	INTEGER CHECK("max_students" > 0),
	"mandatory"	TEXT,
	PRIMARY KEY("code"),
	FOREIGN KEY("mandatory") REFERENCES "courses"("code")
);
CREATE TABLE IF NOT EXISTS "incompats" (
	"course"	TEXT NOT NULL,
	"incompat"	TEXT NOT NULL CHECK("incompat" <> "course"),
	PRIMARY KEY("course","incompat"),
	FOREIGN KEY("incompat") REFERENCES "courses"("code"),
	FOREIGN KEY("course") REFERENCES "courses"("code")
);
CREATE TABLE IF NOT EXISTS "course_in_studyplan" (
	"course"	TEXT NOT NULL,
	"student"	INTEGER NOT NULL,
	PRIMARY KEY("course","student"),
	FOREIGN KEY("course") REFERENCES "courses"("code"),
	FOREIGN KEY("student") REFERENCES "students"("id")
);
CREATE TABLE IF NOT EXISTS "students" (
	"id"	INTEGER,
	"email"	TEXT NOT NULL UNIQUE,
	"name"	TEXT,
	"hash"	TEXT NOT NULL,
	"salt"	TEXT NOT NULL,
	"full_time"	INTEGER CHECK("full_time" = 0 OR "full_time" = 1),
	"secret" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
INSERT INTO "courses" VALUES ('02GOLOV','Architetture dei sistemi di elaborazione',12,NULL,NULL);
INSERT INTO "courses" VALUES ('02LSEOV','Computer architectures',12,NULL,NULL);
INSERT INTO "courses" VALUES ('01SQJOV','Data Science and Database Technology',8,NULL,NULL);
INSERT INTO "courses" VALUES ('01SQMOV','Data Science e Tecnologie per le Basi di Dati',8,NULL,NULL);
INSERT INTO "courses" VALUES ('01SQLOV','Database systems',8,NULL,NULL);
INSERT INTO "courses" VALUES ('01OTWOV','Computer network technologies and services',6,3,NULL);
INSERT INTO "courses" VALUES ('02KPNOV','Tecnologie e servizi di rete',6,3,NULL);
INSERT INTO "courses" VALUES ('01TYMOV','Information systems security services',12,NULL,NULL);
INSERT INTO "courses" VALUES ('01UDUOV','Sicurezza dei sistemi informativi',12,NULL,NULL);
INSERT INTO "courses" VALUES ('05BIDOV','Ingegneria del software',6,NULL,'02GOLOV');
INSERT INTO "courses" VALUES ('04GSPOV','Software engineering',6,NULL,'02LSEOV');
INSERT INTO "courses" VALUES ('01UDFOV','Applicazioni Web I',6,NULL,NULL);
INSERT INTO "courses" VALUES ('01TXYOV','Web Applications I',6,3,NULL);
INSERT INTO "courses" VALUES ('01TXSOV','Web Applications II',6,NULL,'01TXYOV');
INSERT INTO "courses" VALUES ('02GRSOV','Programmazione di sistema',6,NULL,NULL);
INSERT INTO "courses" VALUES ('01NYHOV','System and device programming',6,3,NULL);
INSERT INTO "courses" VALUES ('01SQOOV','Reti Locali e Data Center',6,NULL,NULL);
INSERT INTO "courses" VALUES ('01TYDOV','Software networking',7,NULL,NULL);
INSERT INTO "courses" VALUES ('03UEWOV','Challenge',5,NULL,NULL);
INSERT INTO "courses" VALUES ('01URROV','Computational intelligence',6,NULL,NULL);
INSERT INTO "courses" VALUES ('01OUZPD','Model based software design',4,NULL,NULL);
INSERT INTO "courses" VALUES ('01URSPD','Internet Video Streaming',6,2,NULL);
INSERT INTO "incompats" VALUES ('02GOLOV','02LSEOV');
INSERT INTO "incompats" VALUES ('02LSEOV','02GOLOV');
INSERT INTO "incompats" VALUES ('01SQJOV','01SQMOV');
INSERT INTO "incompats" VALUES ('01SQJOV','01SQLOV');
INSERT INTO "incompats" VALUES ('01SQMOV','01SQJOV');
INSERT INTO "incompats" VALUES ('01SQMOV','01SQLOV');
INSERT INTO "incompats" VALUES ('01SQLOV','01SQJOV');
INSERT INTO "incompats" VALUES ('01SQLOV','01SQMOV');
INSERT INTO "incompats" VALUES ('01OTWOV','02KPNOV');
INSERT INTO "incompats" VALUES ('02KPNOV','01OTWOV');
INSERT INTO "incompats" VALUES ('01TYMOV','01UDUOV');
INSERT INTO "incompats" VALUES ('01UDUOV','01TYMOV');
INSERT INTO "incompats" VALUES ('05BIDOV','04GSPOV');
INSERT INTO "incompats" VALUES ('04GSPOV','05BIDOV');
INSERT INTO "incompats" VALUES ('01UDFOV','01TXYOV');
INSERT INTO "incompats" VALUES ('01TXYOV','01UDFOV');
INSERT INTO "incompats" VALUES ('02GRSOV','01NYHOV');
INSERT INTO "incompats" VALUES ('01NYHOV','02GRSOV');
INSERT INTO "students" VALUES (1,'s123456@studenti.polito.it','Mario Rossi','0eb64110ccfdc5197e08f64b7aa90d5572e34db3704ff93a84072d47daeda597','96a0f4e845fc918f5400b4e92ed0d345',1,'LXBSMDTMSP2I5XFXIYRGFVWSFI');
INSERT INTO "students" VALUES (2,'a@p.it','Luigi Verdi','e2d154a84fc9a8bb626cd4e53b83c9586aac6ab4951a3a38d262549c29f263af','cef0009f306c0743825d0a4d82b936cd',0,'LXBSMDTMSP2I5XFXIYRGFVWSFI');
INSERT INTO "students" VALUES (3,'b@p.it','Maria Bianchi','944a92a9005c710c1b8680de4ebdbf9bf6f02f52d50036e71b740288bbff4e32','cc87df425167e7e0d33555d096e11c2b',0,'LXBSMDTMSP2I5XFXIYRGFVWSFI');
INSERT INTO "students" VALUES (4,'c@p.it','Francesca Neri','4205f4b997488026ed0875355ef55dfeb63a3aefc3955a34e9b9c146655cc24c','2cafabadd7d7fadf9c8e41c65133e45f',1,'LXBSMDTMSP2I5XFXIYRGFVWSFI');
INSERT INTO "students" VALUES (5,'d@p.it','John Doe','cd0aa683aee7f04a79fc35558562584d5636f8f5913ac3a6bb3d87692f78d0e3','1d68f9281e66b5b48e54b4978507da3a',NULL,'LXBSMDTMSP2I5XFXIYRGFVWSFI');
INSERT INTO "course_in_studyplan" VALUES ('01URROV',1);
INSERT INTO "course_in_studyplan" VALUES ('01OTWOV',1);
INSERT INTO "course_in_studyplan" VALUES ('01SQJOV',1);
INSERT INTO "course_in_studyplan" VALUES ('01OUZPD',1);
INSERT INTO "course_in_studyplan" VALUES ('02GRSOV',1);
INSERT INTO "course_in_studyplan" VALUES ('01URSPD',1);
INSERT INTO "course_in_studyplan" VALUES ('01SQOOV',1);
INSERT INTO "course_in_studyplan" VALUES ('02LSEOV',1);
INSERT INTO "course_in_studyplan" VALUES ('01OTWOV',2);
INSERT INTO "course_in_studyplan" VALUES ('01URSPD',2);
INSERT INTO "course_in_studyplan" VALUES ('01NYHOV',2);
INSERT INTO "course_in_studyplan" VALUES ('01TYMOV',2);
INSERT INTO "course_in_studyplan" VALUES ('01SQJOV',2);
INSERT INTO "course_in_studyplan" VALUES ('01OTWOV',3);
INSERT INTO "course_in_studyplan" VALUES ('01TXYOV',3);
INSERT INTO "course_in_studyplan" VALUES ('03UEWOV',3);
INSERT INTO "course_in_studyplan" VALUES ('02LSEOV',3);
INSERT INTO "course_in_studyplan" VALUES ('01TXYOV',1);
INSERT INTO "course_in_studyplan" VALUES ('01TXYOV',4);
INSERT INTO "course_in_studyplan" VALUES ('01TXSOV',4);
INSERT INTO "course_in_studyplan" VALUES ('01TYDOV',4);
INSERT INTO "course_in_studyplan" VALUES ('01SQOOV',4);
INSERT INTO "course_in_studyplan" VALUES ('02GRSOV',4);
INSERT INTO "course_in_studyplan" VALUES ('01SQJOV',4);
INSERT INTO "course_in_studyplan" VALUES ('02GOLOV',4);
INSERT INTO "course_in_studyplan" VALUES ('01URROV',4);
INSERT INTO "course_in_studyplan" VALUES ('01TYMOV',4);
INSERT INTO "course_in_studyplan" VALUES ('03UEWOV',1);
COMMIT;
