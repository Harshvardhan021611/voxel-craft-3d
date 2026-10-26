import type { Metadata } from "next";
import PlayClient from "@/components/play/PlayClient";

export const metadata: Metadata = {
  title: "Voxel Sandbox — Play",
  description:
    "Jump into a live voxel sandbox. Controls adapt automatically to keyboard + mouse, touch, or a connected controller.",
};

export default function PlayPage() {
  return <PlayClient />;
}
