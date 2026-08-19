import { Image } from "expo-image";
import { Camera, Trash2 } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import type { ClientPhoto, PhotoAngle } from "../../types";

const ANGLE_LABELS: Record<PhotoAngle, string> = {
  front: "Front",
  side: "Side",
  back: "Back",
};

interface PhotoTileProps {
  photo: ClientPhoto;
  onDelete: () => void;
  onPress?: () => void;
}

export function PhotoTile({ photo, onDelete, onPress }: PhotoTileProps) {
  return (
    <View className="relative overflow-hidden rounded-lg border border-line bg-surface2">
      <Pressable
        accessibilityRole="imagebutton"
        accessibilityLabel={`${ANGLE_LABELS[photo.angle]} photo from ${photo.date}`}
        onPress={onPress}
      >
        <Image
          source={{ uri: photo.uri }}
          style={{ width: "100%", aspectRatio: 3 / 4 }}
          contentFit="cover"
          transition={150}
          accessibilityLabel={`${ANGLE_LABELS[photo.angle]} progress photo`}
        />
      </Pressable>
      <View className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5">
        <Text className="text-body text-[10px] font-semibold">{ANGLE_LABELS[photo.angle]}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Delete photo"
        onPress={onDelete}
        className="absolute right-1.5 top-1.5 rounded-md bg-black/60 p-1.5"
      >
        <Trash2 size={13} color="#F87171" />
      </Pressable>
      {photo.assessmentId ? null : (
        <View className="absolute bottom-1.5 right-1.5 rounded bg-black/60 p-1">
          <Camera size={12} color="#8E98A5" />
        </View>
      )}
    </View>
  );
}