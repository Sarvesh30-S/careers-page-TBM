export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function esc(s: any): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[c] || c;
  });
}

export function fmtD(d: string | number | Date): string {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function fmtT(d: string | number | Date): string {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export function trunc(s: string | undefined | null, n: number): string {
  const str = String(s || "").trim();
  return str.length > n ? str.slice(0, n).replace(/\s+\S*$/, "") + "…" : str;
}

export function expTxt(e: [number, number]): string {
  return e[1] <= 1 ? "0–1 yr" : `${e[0]}–${e[1]} yrs`;
}

export function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
