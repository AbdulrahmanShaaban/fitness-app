import { Directory, File, Paths } from "expo-file-system";

import { newId } from "./id";

export async function persistPickedPhoto(uri: string): Promise<string> {
  const photosDir = new Directory(Paths.document, "photos");
  photosDir.create({ intermediates: true, idempotent: true });

  const extension = uri.split(".").pop()?.toLowerCase() === "png" ? "png" : "jpg";
  const target = new File(photosDir, `${newId()}.${extension}`);
  const source = new File(uri);
  await source.copy(target);
  return target.uri;
}