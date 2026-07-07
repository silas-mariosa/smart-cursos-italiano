import { redirect } from "next/navigation";

export default function LiveCalendarLegacyRedirectPage() {
  redirect("/dashboard/calendario");
}
