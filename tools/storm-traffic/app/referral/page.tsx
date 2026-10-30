import type { Metadata } from "next";
import StormSite from "@/components/storm-site";
export const metadata: Metadata = {
  title: "Referral program — STORM TRAFFIC",
  description:
    "Recommend a media buyer or team to STORM TRAFFIC. Earn a referral bonus of up to $5000. Explore vacancies and recommend a candidate.",
  alternates: { canonical: "/referral" },
  openGraph: {
    title: "STORM TRAFFIC — Referral program",
    description: "Recommend a candidate and get up to $5000.",
    url: "/referral",
  },
};
export default function Referral() {
  return <StormSite referral />;
}
