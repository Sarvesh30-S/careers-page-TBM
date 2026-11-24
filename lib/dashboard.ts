import { Applicant, Role } from "@/types";
import { STAGES } from "@/data/data";

export interface FitResult {
  score: number;
  why: string[];
}

export const reachedIdx = (a: Applicant): number => {
  if (a.stage === "Rejected") return a.rejAt ?? 0;
  return STAGES.indexOf(a.stage);
};

export const median = (nums: number[]): number | null => {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
};

export const fitOf = (a: Applicant, roles: Role[]): FitResult => {
  const r = roles.find((x) => x.id === a.role);
  if (!r) return { score: 0, why: ["Role no longer exists."] };

  const text = [
    a.why || "",
    a.admire || "",
    a.problem || "",
    a.lastdes || "",
    a.lastco || "",
    ...Object.values(a.custom || {}),
  ]
    .join(" ")
    .toLowerCase();

  const keys = r.keys || [];
  const hits = keys.filter((k) => text.includes(k.toLowerCase()));
  const why: string[] = [];
  let s = 0;

  s += Math.round(
    35 * Math.min(1, hits.length / Math.max(3, Math.ceil(keys.length / 2)))
  );
  why.push(
    hits.length
      ? `Mentions ${hits.slice(0, 4).join(", ")} in answers or past role.`
      : "Answers don't touch the role's core skills yet."
  );

  const [lo, hi] = r.exp;
  const rel = Number(a.rel) || 0;
  if (rel >= lo && rel <= hi + 2) {
    s += 25;
    why.push(`${rel} yrs relevant, inside the ${lo}–${hi} yr ask.`);
  } else if (rel < lo) {
    s += rel >= lo - 0.5 ? 15 : 5;
    why.push(`${rel} yrs relevant, under the ${lo} yr ask.`);
  } else {
    s += 15;
    why.push(`${rel} yrs relevant, above range. Check level and pay.`);
  }

  if (r.langs?.length) {
    const m = (a.langs || []).filter((l) => r.langs?.includes(l));
    if (m.length) {
      s += 15;
      why.push(`Works in ${m.join(", ")}, which this role needs.`);
    } else {
      why.push(`No ${r.langs.join(" / ")} listed. The role leans on it.`);
    }
  } else {
    s += 15;
  }

  if (
    /\d|track|measure|search|install|lead|retention|cpv|conversion|repeat|booking|cost per/i.test(
      a.problem || ""
    )
  ) {
    s += 15;
    why.push("Pitch names a measurable outcome.");
  } else {
    s += (a.problem || "").length > 60 ? 7 : 0;
    why.push("Pitch stays generic. No number to move.");
  }

  if (a.mumbai === "Yes") {
    s += 5;
  } else {
    why.push("Not open to Mumbai yet.");
  }

  const noticeScores: Record<string, number> = {
    Immediate: 5,
    "15 days": 5,
    "30 days": 4,
    "60 days": 2,
    "90 days": 0,
  };
  s += noticeScores[a.notice] ?? 2;

  return { score: Math.min(100, Math.max(0, s)), why };
};

export const formatMonthly = (
  val: number | string | undefined | null
): string => {
  if (val == null || val === "") return "—";
  const num = Number(val);
  if (Number.isNaN(num) || num <= 0) return "₹0 / mo";
  // Convert legacy LPA values (<= 200) to monthly rupees gracefully:
  const monthly = num <= 200 ? Math.round((num * 100000) / 12) : Math.round(num);
  return `₹${monthly.toLocaleString("en-IN")} / mo`;
};

export const summaryOf = (a: Applicant, hidePay?: boolean): string => {
  const delta =
    a.ctc > 0 ? Math.round(((a.ectc - a.ctc) / a.ctc) * 100) : null;
  const pay =
    hidePay || !a.ectc
      ? ""
      : ` Expects ${formatMonthly(a.ectc)}${
          delta != null ? ` (${delta >= 0 ? "+" : ""}${delta}% on current)` : ""
        }.`;

  const trunc = (s: string, len: number) =>
    s && s.length > len ? s.slice(0, len) + "…" : s || "";

  return [
    `${a.total} yrs total, ${a.rel} relevant. Last: ${a.lastdes || "not given"}${
      a.lastco ? " at " + a.lastco : ""
    }.`,
    `Works in ${(a.langs || []).join(", ") || "no languages listed"}. ${
      a.notice
    } notice${a.buyout === "Yes" ? ", buyout possible" : ""}.${pay}`,
    `Pitch: ${trunc(a.problem, 120) || "not answered"}`,
  ].join("\n");
};

export const slot = (): string => {
  const d = new Date(Date.now() + 2 * 86400000);
  while ([0, 6].includes(d.getDay())) d.setTime(d.getTime() + 86400000);
  return (
    d.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
    }) + " at 2 PM"
  );
};

export const emailOf = (
  a: Applicant,
  kind: "invite" | "reject",
  roles: Role[],
  senderLabel?: string
): string => {
  const r = roles.find((x) => x.id === a.role);
  const roleTitle = r ? r.title : a.role;
  const first = String(a.name || "").trim().split(" ")[0] || "there";

  if (kind === "invite") {
    return [
      `Subject: Next step for ${roleTitle} at TBM`,
      "",
      `Hi ${first},`,
      "",
      `Thanks for applying for ${roleTitle}. Your answer to the brand-problem question stood out, so we'd like to talk.`,
      "",
      `Could you do ${slot()} for 45 minutes? We can meet at our Lower Parel office or on Google Meet, whichever is easier for you.`,
      "",
      `Reply with a yes or a better time, and we'll confirm within one working day.`,
      "",
      `Best,`,
      senderLabel || "The TBM People Team",
    ].join("\n");
  }

  return [
    `Subject: Your application for ${roleTitle} at TBM`,
    "",
    `Hi ${first},`,
    "",
    `Thank you for taking the time to apply for ${roleTitle} and for answering our questions with care.`,
    "",
    `We reviewed your profile against what this role needs right now, and we've decided not to move forward to the interview stage.`,
    "",
    `We keep applications for 12 months, and if another role opens up that feels closer, we will reach out.`,
    "",
    `Wishing you the very best.`,
    "",
    `Best,`,
    senderLabel || "The TBM People Team",
  ].join("\n");
};

export const csvOf = (
  apps: Applicant[],
  roles: Role[],
  hidePay?: boolean
): string => {
  const cols = [
    "name",
    "email",
    "phone",
    "city",
    "role",
    "department",
    "stage",
    "total",
    "rel",
    "ctc",
    "ectc",
    "notice",
    "languages",
    "fit",
    "applied",
  ];
  const q = (x: any) => `"${String(x ?? "").replace(/"/g, '""')}"`;

  const rows = apps.map((a) => {
    const r = roles.find((x) => x.id === a.role);
    return [
      a.name,
      a.email,
      a.phone,
      a.city,
      r?.title || a.role,
      r?.dept || a.dept || "General",
      a.stage,
      a.total,
      a.rel,
      hidePay ? "" : a.ctc,
      hidePay ? "" : a.ectc,
      a.notice,
      (a.langs || []).join(" / "),
      fitOf(a, roles).score,
      String(a.applied || a.appliedAt || "").slice(0, 10),
    ]
      .map(q)
      .join(",");
  });

  return [cols.join(","), ...rows].join("\n");
};
