import type { Metadata } from "next";
import { ProductionSequence } from "./ProductionSequence";

export const metadata: Metadata = {
  title: "Production",
  description:
    "From mold to instrument. The making of an Aristides in Haarlem — a slow-scroll sequence from the science of the Arium core to the craft of hand luthiery: layup, curing, routing, fretwork, paint, assembly and setup.",
};

export default function ProductionPage() {
  return <ProductionSequence />;
}
