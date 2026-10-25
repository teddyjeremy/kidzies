import { PublicPage } from "@/components/site/PublicPage";
import { StatusForm } from "@/components/forms/StatusForm";

export const metadata = { title: "Application status" };

export default function StatusPage() {
  return <PublicPage title="Check application status" intro="Enter the reference number you received and the email on the application."><StatusForm /></PublicPage>;
}
