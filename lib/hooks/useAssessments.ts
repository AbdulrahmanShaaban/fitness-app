import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addTest,
  createAssessment,
  getAssessmentDetail,
  listAllTestsWithAssessments,
  listAssessmentsByClient,
  softDeleteAssessment,
} from "../../repositories/assessments.repo";
import { addPhoto, deletePhoto, listPhotosByClient } from "../../repositories/photos.repo";
import type { NewAssessment, PhotoAngle } from "../../types";

const KEY = "assessments";

export function useAssessments(clientId: string | undefined) {
  return useQuery({
    queryKey: [KEY, "byClient", clientId],
    queryFn: () => listAssessmentsByClient(clientId as string),
    enabled: Boolean(clientId),
  });
}

export function useAssessmentDetail(assessmentId: string | undefined) {
  return useQuery({
    queryKey: [KEY, "detail", assessmentId],
    queryFn: () => getAssessmentDetail(assessmentId as string),
    enabled: Boolean(assessmentId),
  });
}

export function useCreateAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<NewAssessment, "id" | "createdAt" | "updatedAt" | "isDeleted">) =>
      createAssessment(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useDeleteAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => softDeleteAssessment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useAddTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      assessmentId,
      ...input
    }: {
      assessmentId: string;
      testName: string;
      fields: Record<string, unknown>;
      result?: string;
      notes?: string;
    }) => addTest(assessmentId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "detail"] }),
  });
}

export function useAllTests(clientId: string | undefined) {
  return useQuery({
    queryKey: [KEY, "allTests", clientId],
    queryFn: () => listAllTestsWithAssessments(clientId as string),
    enabled: Boolean(clientId),
  });
}

export function usePhotos(clientId: string | undefined) {
  return useQuery({
    queryKey: [KEY, "photos", clientId],
    queryFn: () => listPhotosByClient(clientId as string),
    enabled: Boolean(clientId),
  });
}

export function useAddPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      assessmentId,
      angle,
      uri,
      date,
    }: {
      clientId: string;
      assessmentId?: string;
      angle: PhotoAngle;
      uri: string;
      date?: string;
    }) => addPhoto({ clientId, assessmentId, angle, uri, date }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "photos"] });
      qc.invalidateQueries({ queryKey: [KEY, "detail"] });
    },
  });
}

export function useDeletePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePhoto(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "photos"] });
      qc.invalidateQueries({ queryKey: [KEY, "detail"] });
    },
  });
}