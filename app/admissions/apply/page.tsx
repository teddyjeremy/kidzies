import { PublicPage } from "@/components/site/PublicPage";
import { ApplyForm } from "@/components/forms/ApplyForm";

export const metadata = { title: "Apply" };

export default function ApplyPage() {
  return <PublicPage title="Apply for a place" intro="It takes about five minutes. Fields marked optional can be left empty."><ApplyForm /></PublicPage>;
}
