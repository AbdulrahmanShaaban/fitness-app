import * as ImagePicker from "expo-image-picker";
import { Camera, FolderOpen, Images } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";

import { useAddPhoto, useDeletePhoto, usePhotos } from "../../lib/hooks/useAssessments";
import { getErrorMessage } from "../../lib/utils/errors";
import { persistPickedPhoto } from "../../lib/utils/photos";
import type { PhotoAngle } from "../../types";
import { PhotoTile } from "../shared/PhotoTile";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { Sheet } from "../ui/Sheet";

interface ClientPhotosSectionProps {
  clientId: string;
  assessmentId?: string;
}

const ANGLES: PhotoAngle[] = ["front", "side", "back"];

export function ClientPhotosSection({ clientId, assessmentId }: ClientPhotosSectionProps) {
  const { data: photos, isLoading } = usePhotos(clientId);
  const addPhoto = useAddPhoto();
  const deletePhoto = useDeletePhoto();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [angle, setAngle] = useState<PhotoAngle>("front");
  const [picking, setPicking] = useState(false);

  const filtered = (photos ?? []).filter((p) =>
    assessmentId ? p.assessmentId === assessmentId : true
  );

  const pick = useCallback(
    async (source: "camera" | "library") => {
      setSheetOpen(false);
      setPicking(true);
      try {
        const permission =
          source === "camera"
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Permission needed", "Allow photo access to add progress photos.");
          return;
        }
        const result =
          source === "camera"
            ? await ImagePicker.launchCameraAsync({
                quality: 0.8,
                allowsEditing: false,
              })
            : await ImagePicker.launchImageLibraryAsync({
                quality: 0.8,
                allowsEditing: false,
                selectionLimit: 1,
              });
        if (result.canceled || result.assets.length === 0) return;

        const persistedUri = await persistPickedPhoto(result.assets[0].uri);
        await addPhoto.mutateAsync({
          clientId,
          assessmentId,
          angle,
          uri: persistedUri,
        });
      } catch (err) {
        Alert.alert("Photo error", getErrorMessage(err));
      } finally {
        setPicking(false);
      }
    },
    [addPhoto, angle, assessmentId, clientId]
  );

  const confirmDelete = (photoId: string) => {
    Alert.alert("Delete photo", "Remove this progress photo?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deletePhoto.mutate(photoId) },
    ]);
  };

  if (isLoading) {
    return (
      <View className="items-center py-12">
        <ActivityIndicator color="#F5A524" />
      </View>
    );
  }

  return (
    <View className="gap-3">
      {filtered.length === 0 ? (
        <EmptyState
          icon={Images}
          title="No photos yet"
          hint="Add progress photos from the camera or library."
          actionLabel="Add photo"
          onAction={() => setSheetOpen(true)}
        />
      ) : (
        <View className="flex-row flex-wrap gap-2">
          {filtered.map((p) => (
            <View key={p.id} className="w-[31%]">
              <PhotoTile photo={p} onDelete={() => confirmDelete(p.id)} />
            </View>
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add photo"
            onPress={() => setSheetOpen(true)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="w-[31%] items-center justify-center rounded-lg border border-dashed border-line2 bg-surface2"
          >
            <View style={{ aspectRatio: 3 / 4, justifyContent: "center", alignItems: "center" }}>
              {picking ? (
                <ActivityIndicator color="#F5A524" />
              ) : (
                <>
                  <Camera size={22} color="#5C6672" />
                  <Text className="mt-1 text-faint text-[11px] font-medium">Add</Text>
                </>
              )}
            </View>
          </Pressable>
        </View>
      )}

      <Sheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="Add progress photo">
        <View className="gap-3 px-4 pb-4">
          <Text className="text-muted text-[13px] font-medium">Angle</Text>
          <View className="flex-row gap-2">
            {ANGLES.map((a) => (
              <Pressable
                key={a}
                accessibilityRole="button"
                accessibilityState={{ selected: angle === a }}
                accessibilityLabel={`${a} angle`}
                onPress={() => setAngle(a)}
                className={`flex-1 items-center rounded-lg border py-2.5 ${
                  angle === a ? "border-accent bg-accentDim" : "border-line2 bg-surface2"
                }`}
              >
                <Text className={`text-[13px] font-medium capitalize ${angle === a ? "text-accent" : "text-muted"}`}>
                  {a}
                </Text>
              </Pressable>
            ))}
          </View>
          <Button
            label="Take photo"
            onPress={() => pick("camera")}
            icon={<Camera size={16} color="#0B0E12" />}
            loading={picking}
          />
          <Button
            label="Choose from library"
            onPress={() => pick("library")}
            variant="secondary"
            icon={<FolderOpen size={16} color="#E9EDF2" />}
            loading={picking}
          />
        </View>
      </Sheet>
    </View>
  );
}