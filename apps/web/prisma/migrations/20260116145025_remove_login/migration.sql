/*
  Warnings:

  - You are about to drop the column `email` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Member` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Member_email_key";

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "email",
DROP COLUMN "password";
