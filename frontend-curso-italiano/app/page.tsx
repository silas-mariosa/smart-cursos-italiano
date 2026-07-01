import { redirect } from "next/navigation";
import { DEFAULT_TENANT_SLUG } from "@/lib/demo";

export default function HomePage() {
  redirect(`/${DEFAULT_TENANT_SLUG}`);
}
