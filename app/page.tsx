import { redirect } from "next/navigation";

export default function Home() {
  // Add a small delay to allow loading state to show
  return redirect("/login");
}
