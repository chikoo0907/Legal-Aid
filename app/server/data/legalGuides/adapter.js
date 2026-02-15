import { LEGAL_GUIDES_RAW } from "./index";

const ICON_MAP = {
  "Consumer Rights": { icon: "shopping-bag", color: "bg-orange-100 text-orange-600" },
  "Cyber Law": { icon: "security", color: "bg-red-100 text-red-600" },
  "Family Law": { icon: "family-restroom", color: "bg-pink-100 text-pink-600" },
  "Labour Law": { icon: "work", color: "bg-indigo-100 text-indigo-600" },
  "Criminal Procedure": { icon: "gavel", color: "bg-slate-100 text-slate-600" },
  "Legal Services": { icon: "support-agent", color: "bg-green-100 text-green-600" },
  "Civil Procedure": { icon: "description", color: "bg-blue-100 text-blue-600" },
  "Motor Vehicle Law": { icon: "directions-car", color: "bg-yellow-100 text-yellow-600" },
  "Transparency Law": { icon: "visibility", color: "bg-teal-100 text-teal-600" },
  "Housing Law": { icon: "home", color: "bg-purple-100 text-purple-600" },
};

export function getStepCategories() {
  return LEGAL_GUIDES_RAW.map((guide) => {
    const meta = ICON_MAP[guide.category] || {};

    return {
      id: guide.situation_id,
      title: guide.title,
      subtitle: guide.problem_summary,
      category: guide.category,
      icon: meta.icon || "info",
      color: meta.color || "bg-slate-100 text-slate-600",

      // 🔹 normalized for detail screen
      steps: guide.step_by_step_procedure.map((s) => ({
        title: `Step ${s.step}`,
        description: s.description,
      })),

      documents: guide.documents_required.map((d) => ({
        name: d.name,
        mandatory: d.mandatory,
      })),

      raw: guide, // keep full data for future tabs
    };
  });
}
