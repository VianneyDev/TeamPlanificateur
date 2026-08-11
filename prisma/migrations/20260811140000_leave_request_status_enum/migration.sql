-- CreateEnum
CREATE TYPE "LeaveRequestStatus" AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');

-- Normalize any unexpected legacy string values before cast (defensive; V2 rows should already match).
UPDATE "LeaveRequest"
SET "status" = 'pending'
WHERE "status" NOT IN ('pending', 'approved', 'rejected', 'withdrawn');

-- AlterTable
ALTER TABLE "LeaveRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "LeaveRequest"
  ALTER COLUMN "status" TYPE "LeaveRequestStatus"
  USING ("status"::"LeaveRequestStatus");
ALTER TABLE "LeaveRequest" ALTER COLUMN "status" SET DEFAULT 'pending'::"LeaveRequestStatus";
