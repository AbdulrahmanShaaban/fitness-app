import { Plus, X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { findTestDef, getAssessmentTypeDef, type TestDef, type TestFieldDef } from "../../lib/constants/assessmentTypes";
import type { AssessmentType } from "../../types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Sheet } from "../ui/Sheet";
import { TextField } from "../ui/TextField";

export interface DraftTest {
  testName: string;
  fields: Record<string, string>;
  notes: string;
}

interface AssessmentTestEditorProps {
  assessmentType: AssessmentType;
  tests: DraftTest[];
  onChange: (tests: DraftTest[]) => void;
}

export function AssessmentTestEditor({ assessmentType, tests, onChange }: AssessmentTestEditorProps) {
  const def = getAssessmentTypeDef(assessmentType);
  const [pickerOpen, setPickerOpen] = useState(false);

  const addPreset = (testDef: TestDef) => {
    const fields: Record<string, string> = {};
    for (const f of testDef.fields) {
      fields[f.key] = "";
      if (f.side) fields.side = "";
    }
    onChange([...tests, { testName: testDef.name, fields, notes: "" }]);
    setPickerOpen(false);
  };

  const addCustom = () => {
    const customIndex = tests.filter((t) => t.testName.startsWith("Custom")).length + 1;
    onChange([
      ...tests,
      { testName: `Custom ${customIndex}`, fields: { value: "" }, notes: "" },
    ]);
    setPickerOpen(false);
  };

  const updateTest = (index: number, patch: Partial<DraftTest>) => {
    onChange(tests.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  };

  const removeTest = (index: number) => {
    onChange(tests.filter((_, i) => i !== index));
  };

  const isCustomTest = (name: string) =>
    findTestDef(assessmentType, name) === null;

  return (
    <View className="gap-2.5">
      {tests.map((test, index) => (
        <Card key={test.testName + index}>
          {isCustomTest(test.testName) ? (
            <TextField
              label="Test name *"
              placeholder="e.g. Wall Sit"
              value={test.testName}
              onChangeText={(testName) => updateTest(index, { testName })}
            />
          ) : (
            <View className="flex-row items-center justify-between gap-2">
              <Text className="flex-1 text-body text-[15px] font-semibold">{test.testName}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${test.testName}`}
                onPress={() => removeTest(index)}
                className="h-8 w-8 items-center justify-center rounded-md"
              >
                <X size={15} color="#5C6672" />
              </Pressable>
            </View>
          )}
          <View className="mt-2.5 gap-2.5">
            {renderFields(assessmentType, test.testName, test.fields, (patch) =>
              updateTest(index, { fields: { ...test.fields, ...patch } })
            )}
            <TextField
              label="Notes"
              placeholder="How it went, context…"
              value={test.notes}
              onChangeText={(notes) => updateTest(index, { notes })}
            />
          </View>
        </Card>
      ))}

      <Button
        label="Add test"
        onPress={() => setPickerOpen(true)}
        variant="secondary"
        icon={<Plus size={15} color="#F5A524" />}
      />

      <Sheet visible={pickerOpen} onClose={() => setPickerOpen(false)} title="Add test">
        <ScrollView className="max-h-[420px]" contentContainerClassName="gap-2 px-4 pb-4">
          {def.presets.map((p) => (
            <Pressable
              key={p.name}
              accessibilityRole="button"
              accessibilityLabel={`Add test ${p.name}`}
              onPress={() => addPreset(p)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="rounded-lg border border-line bg-surface2 px-3.5 py-3"
            >
              <Text className="text-body text-[15px] font-medium">{p.name}</Text>
              <Text className="text-faint text-[12px]">
                {p.fields.map((f) => `${f.label}${f.unit ? ` (${f.unit})` : ""}`).join(" · ")}
              </Text>
            </Pressable>
          ))}
          {def.allowsCustomTests ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add custom test"
              onPress={addCustom}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="rounded-lg border border-dashed border-line2 px-3.5 py-3"
            >
              <Text className="text-accent text-[15px] font-medium">Custom test…</Text>
              <Text className="text-faint text-[12px]">Any name, one numeric value</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </Sheet>
    </View>
  );
}

function renderFields(
  assessmentType: AssessmentType,
  testName: string,
  fields: Record<string, string>,
  onPatch: (patch: Record<string, string>) => void
) {
  const def = findTestDef(assessmentType, testName);
  const fieldDefs: TestFieldDef[] =
    def?.fields ?? [{ key: "value", label: "Value", kind: "number", step: 1 }];

  return (
    <View className="gap-2.5">
      {fieldDefs.map((f) => (
        <View key={f.key}>
          {f.kind === "select" ? (
            <FieldChips
              label={f.label}
              options={f.options ?? []}
              value={fields[f.key] ?? ""}
              onChange={(v) => onPatch({ [f.key]: v })}
            />
          ) : (
            <TextField
              label={f.label}
              hint={f.unit}
              placeholder="0"
              keyboardType={f.kind === "number" ? "decimal-pad" : "default"}
              inputMode={f.kind === "number" ? "decimal" : "text"}
              value={fields[f.key] ?? ""}
              onChangeText={(v) => onPatch({ [f.key]: v })}
            />
          )}
          {f.side ? (
            <View className="mt-2">
              <FieldChips
                label="Side"
                options={["left", "right"]}
                value={fields.side ?? ""}
                onChange={(v) => onPatch({ side: v })}
              />
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function FieldChips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View className="gap-1.5">
      <Text className="text-muted text-[13px] font-medium">{label}</Text>
      <View className="flex-row gap-2">
        {options.map((opt) => (
          <Pressable
            key={opt}
            accessibilityRole="button"
            accessibilityState={{ selected: value === opt }}
            onPress={() => onChange(value === opt ? "" : opt)}
            className={`flex-1 items-center rounded-lg border py-2.5 ${
              value === opt ? "border-accent bg-accentDim" : "border-line2 bg-surface2"
            }`}
          >
            <Text
              className={`text-[13px] font-medium capitalize ${
                value === opt ? "text-accent" : "text-muted"
              }`}
            >
              {opt}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}