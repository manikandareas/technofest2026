import CaseBriefPage, { dynamic } from "../../[id]/brief/page";

export { dynamic };

export default function DemoBriefPage() {
  return <CaseBriefPage params={Promise.resolve({ id: "demo" })} />;
}
