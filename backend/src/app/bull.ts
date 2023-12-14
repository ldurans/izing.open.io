import { BullAdapter, setQueues, router as bullRoute } from "bull-board";
import Queue from "../libs/Queue";

export default async function bullMQ(app) {
  console.info("bullMQ started");
  await Queue.process();

  // await Queue.add("VerifyScheduleMessages", {});
  await Queue.add("VerifyTicketsChatBotInactives", {});
  await Queue.add("SendMessageSchenduled", {});

  if (process.env.NODE_ENV !== "production") {
    setQueues(Queue.queues.map((q: any) => new BullAdapter(q.bull) as any));
    app.use("/admin/queues", bullRoute);
  }
}
