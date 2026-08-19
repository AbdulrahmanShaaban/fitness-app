import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Text, View } from "react-native";

import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";
import { SegmentedControl } from "../ui/SegmentedControl";
import type { Client } from "../../types";

const clientSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required"),
  age: z.string(),
  gender: z.string(),
  heightCm: z.string(),
  currentWeightKg: z.string(),
  phone: z.string().trim(),
  startDate: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Use YYYY-MM-DD"),
  goal: z.string().trim(),
  generalNotes: z.string().trim(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export interface ClientFormSubmit {
  fullName: string;
  age?: number;
  gender?: "male" | "female";
  heightCm?: number;
  currentWeightKg?: number;
  phone?: string;
  startDate?: string;
  goal?: string;
  generalNotes?: string;
}

interface ClientFormProps {
  initial?: Client;
  submitLabel: string;
  onSubmit: (values: ClientFormSubmit) => Promise<void>;
}

function toNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

function pick<T>(value: string, min: number, max: number): T | undefined {
  const n = toNumber(value);
  if (n === undefined) return undefined;
  if (n < min || n > max) return undefined;
  return n as T;
}

export function ClientForm({ initial, submitLabel, onSubmit }: ClientFormProps) {
  const { control, handleSubmit, formState } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      fullName: initial?.fullName ?? "",
      age: initial?.age != null ? String(initial.age) : "",
      gender: initial?.gender ?? "",
      heightCm: initial?.heightCm != null ? String(initial.heightCm) : "",
      currentWeightKg:
        initial?.currentWeightKg != null ? String(initial.currentWeightKg) : "",
      phone: initial?.phone ?? "",
      startDate: initial?.startDate ?? "",
      goal: initial?.goal ?? "",
      generalNotes: initial?.generalNotes ?? "",
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      fullName: values.fullName,
      age: pick<number>(values.age, 10, 120),
      gender: (values.gender as "male" | "female" | undefined) || undefined,
      heightCm: pick<number>(values.heightCm, 50, 250),
      currentWeightKg: pick<number>(values.currentWeightKg, 20, 400),
      phone: values.phone || undefined,
      startDate: values.startDate || undefined,
      goal: values.goal || undefined,
      generalNotes: values.generalNotes || undefined,
    });
  });

  return (
    <View className="gap-3.5 p-4">
      <Controller
        control={control}
        name="fullName"
        render={({ field }) => (
          <TextField
            label="Full name *"
            placeholder="e.g. Alex Morgan"
            autoCapitalize="words"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={formState.errors.fullName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="gender"
        render={({ field }) => (
            <View className="gap-1.5">
              <Text className="text-muted text-[13px] font-medium">Gender</Text>
              <SegmentedControl
              accessibilityLabel="Gender"
              value={field.value}
              onChange={field.onChange}
              options={[
                { key: "", label: "—" },
                { key: "male", label: "Male" },
                { key: "female", label: "Female" },
              ]}
            />
          </View>
        )}
      />

      <View className="flex-row gap-3">
        <Controller
          control={control}
          name="age"
          render={({ field }) => (
            <TextField
              label="Age"
              placeholder="32"
              keyboardType="number-pad"
              inputMode="numeric"
              containerClassName="flex-1"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="heightCm"
          render={({ field }) => (
            <TextField
              label="Height (cm)"
              placeholder="178"
              keyboardType="decimal-pad"
              inputMode="decimal"
              containerClassName="flex-1"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </View>

      <View className="flex-row gap-3">
        <Controller
          control={control}
          name="currentWeightKg"
          render={({ field }) => (
            <TextField
              label="Current weight (kg)"
              placeholder="82.5"
              keyboardType="decimal-pad"
              inputMode="decimal"
              containerClassName="flex-1"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="startDate"
          render={({ field }) => (
            <TextField
              label="Start date"
              placeholder="2026-01-15"
              autoCapitalize="none"
              containerClassName="flex-1"
              hint="YYYY-MM-DD"
              error={formState.errors.startDate?.message}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </View>

      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <TextField
            label="Phone"
            placeholder="+20 100 000 0000"
            keyboardType="phone-pad"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="goal"
        render={({ field }) => (
          <TextField
            label="Goal"
            placeholder="e.g. Build strength — 5×5 over 12 weeks"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="generalNotes"
        render={({ field }) => (
          <TextField
            label="Notes"
            placeholder="General notes about this client…"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <View className="mt-2">
        <Button
          label={submitLabel}
          onPress={submit}
          size="lg"
          loading={formState.isSubmitting}
        />
      </View>
    </View>
  );
}