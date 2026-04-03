/*
  Warnings:

  - A unique constraint covering the columns `[teamName]` on the table `submissions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "submissions_teamName_key" ON "submissions"("teamName");

-- CreateIndex
CREATE INDEX "submissions_accuracyScore_submissionTime_idx" ON "submissions"("accuracyScore" DESC, "submissionTime" ASC);
