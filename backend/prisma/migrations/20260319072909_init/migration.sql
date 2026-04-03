-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "accuracyScore" DOUBLE PRECISION NOT NULL,
    "submissionTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);
