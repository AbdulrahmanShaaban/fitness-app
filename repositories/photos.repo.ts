import { and, desc, eq } from "drizzle-orm";

import { db } from "../db/client";
import { clientPhotos } from "../db/schema";
import { requestSync } from "../sync/engine";
import { nowIso, todayIso } from "../lib/utils/date";
import { newId } from "../lib/utils/id";
import type { ClientPhoto, NewClientPhoto, PhotoAngle } from "../types";

export async function listPhotosByClient(clientId: string): Promise<ClientPhoto[]> {
  return db
    .select()
    .from(clientPhotos)
    .where(and(eq(clientPhotos.clientId, clientId), eq(clientPhotos.isDeleted, false)))
    .orderBy(desc(clientPhotos.date), desc(clientPhotos.createdAt));
}

export async function listPhotosForAssessment(assessmentId: string): Promise<ClientPhoto[]> {
  return db
    .select()
    .from(clientPhotos)
    .where(
      and(
        eq(clientPhotos.assessmentId, assessmentId),
        eq(clientPhotos.isDeleted, false)
      )
    )
    .orderBy(desc(clientPhotos.date), desc(clientPhotos.createdAt));
}

export async function addPhoto(
  input: {
    clientId: string;
    assessmentId?: string;
    angle: PhotoAngle;
    uri: string;
    date?: string;
  }
): Promise<ClientPhoto> {
  const stamp = nowIso();
  const row: NewClientPhoto = {
    id: newId(),
    clientId: input.clientId,
    assessmentId: input.assessmentId,
    angle: input.angle,
    uri: input.uri,
    date: input.date ?? todayIso(),
    isDeleted: false,
    createdAt: stamp,
    updatedAt: stamp,
  };
  await db.insert(clientPhotos).values(row);
  requestSync();
  return row as ClientPhoto;
}

export async function deletePhoto(id: string): Promise<void> {
  await db
    .update(clientPhotos)
    .set({ isDeleted: true, updatedAt: nowIso(), syncedAt: null })
    .where(eq(clientPhotos.id, id));
  requestSync();
}