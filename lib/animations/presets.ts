import { useReducedMotion } from "react-native-reanimated";
import {
  FadeInDown,
  FadeIn,
  FadeOutUp,
  LinearTransition,
  ZoomIn,
} from "react-native-reanimated";

export function useRowAnimations() {
  const reduced = useReducedMotion();

  return {
    entering: reduced ? undefined : FadeInDown.duration(180),
    exiting: reduced ? undefined : FadeOutUp.duration(140),
    layout: reduced ? undefined : LinearTransition.duration(160),
  };
}

export function useSheetAnimations() {
  const reduced = useReducedMotion();
  return {
    entering: reduced ? undefined : ZoomIn.duration(120),
    fadeIn: reduced ? undefined : FadeIn.duration(180),
  };
}