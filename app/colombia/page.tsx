import { redirect } from "next/navigation";

export default function ColombiaRedirectPage() {
  redirect("/?country=CO");
}
