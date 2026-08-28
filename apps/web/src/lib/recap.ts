import { Storage } from "@google-cloud/storage";
import { db } from "@/lib/db";

const storage = new Storage();

export async function generateDailyRecap() {
  const today = new Date();
  const start = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 30);

  const daysOff = await db.dayOff.findMany({
    where: { date: { gte: start, lt: end } },
    include: { member: { select: { id: true, name: true } } },
    orderBy: [{ date: "asc" }, { member: { name: "asc" } }],
  });

  const pending = await db.leaveRequest.count({ where: { status: "pending" } });

  const recap = {
    generatedAt: today.toISOString(),
    window: { from: start.toISOString(), to: end.toISOString() },
    pendingLeaveRequests: pending,
    daysOffCount: daysOff.length,
    daysOff: daysOff.map((entry) => ({
      date: entry.date.toISOString().slice(0, 10),
      memberId: entry.memberId,
      memberName: entry.member.name,
    })),
  };

  const bucketName = process.env.RECAP_BUCKET;
  if (!bucketName) {
    throw new Error("RECAP_BUCKET is not set");
  }

  const objectName = `recaps/${start.toISOString().slice(0, 10)}.json`;

  await storage
    .bucket(bucketName)
    .file(objectName)
    .save(JSON.stringify(recap, null, 2), { contentType: "application/json" });

  return {
    objectName,
    daysOffCount: recap.daysOffCount,
    pendingLeaveRequests: pending,
  };
}
