-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "isExternal" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "MonthlyWorkedDays" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "days" INTEGER NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyWorkedDays_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyWorkedDays_memberId_idx" ON "MonthlyWorkedDays"("memberId");

-- CreateIndex
CREATE INDEX "MonthlyWorkedDays_year_month_idx" ON "MonthlyWorkedDays"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyWorkedDays_memberId_year_month_key" ON "MonthlyWorkedDays"("memberId", "year", "month");

-- AddForeignKey
ALTER TABLE "MonthlyWorkedDays" ADD CONSTRAINT "MonthlyWorkedDays_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
