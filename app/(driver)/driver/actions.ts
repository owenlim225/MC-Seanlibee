"use server";

import { OrderStatus, Role } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRoleLite } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { realtime } from "@/lib/realtime";

export async function claimOrder(orderId: string): Promise<{ ok: boolean }> {
  const driver = await requireRoleLite(Role.DRIVER);
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"f8a007"},body:JSON.stringify({sessionId:"f8a007",runId:"pre-fix",hypothesisId:"H3",location:"app/(driver)/driver/actions.ts:12",message:"claimOrder invoked",data:{orderId,driverId:driver.id},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { assignment: true },
      });
      // #region agent log
      fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"f8a007"},body:JSON.stringify({sessionId:"f8a007",runId:"pre-fix",hypothesisId:"H3",location:"app/(driver)/driver/actions.ts:20",message:"claimOrder availability check",data:{orderId,exists:!!order,status:order?.status??null,hasAssignment:!!order?.assignment},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (!order || order.status !== OrderStatus.READY || order.assignment) {
        throw new Error("unavailable");
      }
      await tx.deliveryAssignment.create({
        data: { orderId, driverId: driver.id },
      });
    });
  } catch (e) {
    // #region agent log
    fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"f8a007"},body:JSON.stringify({sessionId:"f8a007",runId:"pre-fix",hypothesisId:"H4",location:"app/(driver)/driver/actions.ts:33",message:"claimOrder failed in catch",data:{orderId,errorName:e instanceof Error?e.name:"unknown",errorMessage:e instanceof Error?e.message:"unknown",errorCode:e instanceof Prisma.PrismaClientKnownRequestError?e.code:null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false };
    }
    return { ok: false };
  }

  realtime.publish(`order:${orderId}`, { type: "assignment", orderId });
  revalidatePath("/driver");
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"f8a007"},body:JSON.stringify({sessionId:"f8a007",runId:"pre-fix",hypothesisId:"H5",location:"app/(driver)/driver/actions.ts:44",message:"claimOrder succeeded",data:{orderId,driverId:driver.id},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  return { ok: true };
}

export async function markPickedUp(orderId: string): Promise<void> {
  const driver = await requireRoleLite(Role.DRIVER);
  const assignment = await prisma.deliveryAssignment.findUnique({
    where: { orderId },
    include: { order: true },
  });
  if (!assignment || assignment.driverId !== driver.id) return;
  if (assignment.order.status !== OrderStatus.READY) return;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.PICKED_UP } });
    await tx.orderStatusEvent.create({
      data: {
        orderId,
        fromStatus: OrderStatus.READY,
        toStatus: OrderStatus.PICKED_UP,
        actorUserId: driver.id,
      },
    });
  });

  realtime.publish(`order:${orderId}`, { type: "order-status", orderId, status: OrderStatus.PICKED_UP });
  revalidatePath("/driver");
}

export async function markDelivered(orderId: string): Promise<void> {
  const driver = await requireRoleLite(Role.DRIVER);
  const assignment = await prisma.deliveryAssignment.findUnique({
    where: { orderId },
    include: { order: true },
  });
  if (!assignment || assignment.driverId !== driver.id) return;
  if (assignment.order.status !== OrderStatus.PICKED_UP) return;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.DELIVERED } });
    await tx.deliveryAssignment.update({
      where: { orderId },
      data: { deliveredAt: new Date() },
    });
    await tx.orderStatusEvent.create({
      data: {
        orderId,
        fromStatus: OrderStatus.PICKED_UP,
        toStatus: OrderStatus.DELIVERED,
        actorUserId: driver.id,
      },
    });
  });

  realtime.publish(`order:${orderId}`, { type: "order-status", orderId, status: OrderStatus.DELIVERED });
  revalidatePath("/driver");
}
