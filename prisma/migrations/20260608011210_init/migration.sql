-- CreateTable
CREATE TABLE "Problem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "line" TEXT NOT NULL,
    "jenisProblem" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "namaMesin" TEXT NOT NULL,
    "planningPerbaikan" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'On progress',
    "keterangan" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
