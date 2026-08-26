import NotFound from "@/pages/NotFound";

export function meta() {
  return [{ title: "Not found" }];
}

export default function AppCatchAllRoute() {
  return <NotFound />;
}
