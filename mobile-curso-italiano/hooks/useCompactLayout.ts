import { useWindowDimensions } from "react-native";

const COMPACT_MAX_WIDTH = 768;

export function useCompactLayout() {
  const { width } = useWindowDimensions();
  return { isCompact: width < COMPACT_MAX_WIDTH, width };
}
