{
/* ---------- helpers ---------- */
const D = window.TBM_DATA;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} },
};
const DAY = 864e5;
const NOW = Date.now();
const fmtD = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const fmtT = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
const trunc = (s, n) => { s = String(s || "").trim(); return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") + "…" : s; };
const lis = (arr) => (arr || []).map((x) => `<li>${esc(x)}</li>`).join("");
const expTxt = (e) => (e[1] <= 1 ? "0–1 yr" : `${e[0]}–${e[1]} yrs`);
const median = (xs) => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const toastEl = $("#toast");
let toastT;
const toast = (m) => { toastEl.textContent = m; toastEl.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("on"), 2400); };

/* ---------- state ---------- */
const VER = "tbm-careers-proto-v2";
const seed = () => ({
  roles: D.ROLES.map((r) => ({ ...r, location: "Lower Parel, Mumbai" })),
  apps: D.APPLICANTS.map((a) => ({
    ...a,
    applied: new Date(NOW - a.daysAgo * DAY).toISOString(),
    hiredAt: a.hiredAfter != null ? new Date(NOW - a.daysAgo * DAY + a.hiredAfter * DAY).toISOString() : null,
    notes: [], score: {}, ai: {}, custom: {},
  })),
  fields: D.FIELDS.map((f) => ({ ...f })),
  seq: 41,
  session: null,
});
let S = store.get(VER, null) || seed();
const save = () => store.set(VER, S);
const roleById = (id) => S.roles.find((r) => r.id === id);

/* ---------- reveal on scroll ---------- */
const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 }) : null;
const observe = () => $$(".reveal:not(.in)").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));

/* ================= PUBLIC SITE ================= */
const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- values: light up on scroll, tap for "on a Tuesday" ---- */
const VALUES = [
  { name: "Truth wins", line: "Logic beats hierarchy. The best-argued idea wins, whoever said it.", behaviours: [
    ["Be logical, be you", "Your honest, analytical self is the asset here. Don't pretend; think out loud. Say “I need to check the data” instead of guessing, show your math and not only the answer, question things respectfully but thoroughly, and admit what you don't know before you go and find out.", "You say “I don't know yet” in a review, and come back by 4 PM with the answer and how you got it."],
    ["Always think impact", "Flashy gets attention. Boring gets results. We obsess over the unglamorous basics that actually move the number, and we judge work by what changed, not by how good it looked in the deck.", "You skip the shiny side project and fix the step that keeps breaking."],
  ] },
  { name: "Earn trust", line: "Reliability plus understanding makes you irreplaceable.", behaviours: [
    ["Under-promise, over-deliver", "Set realistic expectations, then beat them. If it takes four days, say six and deliver in four. Name exact times, “Tuesday 2 PM” and not “Tuesday afternoon”, and build a 25% buffer into everything so you can finish early.", "You add a buffer, give people a real time, and beat it."],
    ["Take inspiration", "Learn from everyone: competitors, partners and completely different industries. Share a rival's win even when it beat us, write down what you learn, and credit every source.", "You borrow a trick from how hotels check guests in, and say where it came from."],
  ] },
  { name: "Own the outcome", line: "Results over excuses. Growth over blame.", behaviours: [
    ["Work as a sports team", "Performance decides position and merit earns opportunity. The best performer leads, tenure doesn't. Results are visible to everyone, and when a plan fails we change course in 48 hours, not two weeks.", "Your part is done, a teammate's isn't. You ask what you can take."],
    ["There's no single process", "Every challenge needs its own approach. Don't curse the obstacle; find a way around it. Plan A blocked? Plan B is ready in 24 hours, and three new tests are running by day two.", "The usual way doesn't fit. You adapt it, then tell the team what changed."],
  ] },
];
let vk = 0;
$("#valuelist").innerHTML = VALUES.map((g, gi) => `<div class="vgroup" data-g="${gi}">
  <div class="vhead"><span class="n">0${gi + 1}</span><h3>${g.name}</h3><p>${g.line}</p></div>
  <div class="vrows">${g.behaviours.map(([n, p, t]) => { const i = vk++; return `<div class="value"><h4>${n}</h4>
    <button class="link more small" aria-expanded="false" aria-controls="tue-${i}" data-tue="${i}">On a Tuesday</button>
    <p>${p}</p><div class="tue" id="tue-${i}"><b>On a Tuesday:</b> ${t}</div></div>`; }).join("")}</div></div>`).join("");
const vrows = $$(".value");
function valuesScroll() {
  const mid = innerHeight * 0.42; let best = null, bd = 1e9;
  vrows.forEach((el) => { const r = el.getBoundingClientRect(); const d = Math.abs((r.top + r.bottom) / 2 - mid); if (r.bottom > 0 && r.top < innerHeight && d < bd) { bd = d; best = el; } });
  vrows.forEach((el) => el.classList.toggle("active", el === best));
  $$(".vgroup").forEach((g) => g.classList.toggle("on", !!best && g.contains(best)));
}

/* ---- the why ladder ---- */
const LADDERS = [
  { tab: "A hiring request", steps: ["We need to hire 10 people.", "Because work is piling up.", "Because seniors redo a lot of junior work.", "Because briefs land unclear, so first drafts miss.", "Fix the brief first. Then hire 4, not 10."] },
  { tab: "A meeting invite", steps: ["Can we do a one-hour meeting on this?", "To get everyone aligned.", "Because people heard different versions of the plan.", "Because the plan lives in six chats, not one place.", "Write one page. The meeting becomes 15 minutes, or nothing."] },
  { tab: "A tight deadline", steps: ["Let's promise it by Friday.", "Because they want it fast.", "Because they're worried it will slip.", "Because last time, it did.", "Promise Tuesday 2 PM. Deliver Monday. Trust beats speed."] },
];
let lad = 0, lstep = -1;
$("#ltabs").innerHTML = LADDERS.map((l, i) => `<button class="chip" aria-pressed="${i === 0}" data-lad="${i}">${l.tab}</button>`).join("");
function drawLadder(step, force) {
  if (step === lstep && !force) return; lstep = step;
  const L = LADDERS[lad].steps, last = L.length - 1, root = step === last;
  $("#lcount").textContent = step === 0 ? "The request" : root ? "The real problem" : `Why #${step}`;
  $("#ldots").innerHTML = L.map((_, i) => `<button aria-label="Step ${i + 1}" class="${i === last ? "root" : ""}" aria-current="${i === step}" data-lstep="${i}"></button>`).join("");
  $("#lhist").innerHTML = L.slice(Math.max(0, step - 3), step).map((t) => `<li>${esc(t)}</li>`).join("");
  $("#lwhy").textContent = step === 0 ? "Sounds reasonable. But why?" : root ? "So the real fix:" : "Why?";
  const st = $("#lstate"); st.classList.toggle("root", root);
  st.innerHTML = esc(L[step]); st.style.animation = "none"; void st.offsetWidth; st.style.animation = "";
  $("#lnext").innerHTML = root ? `Try another request` : `${step === 0 ? "Ask why" : "Next why"} <span class="arr" aria-hidden="true">→</span>`;
}

/* ---- games: one panel, three tabs ---- */
const GT = $$("#gtabs [role=tab]");
function showGame(i, focus) {
  GT.forEach((b, k) => { const on = k === i; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; $("#g-" + k).hidden = !on; });
  if (focus) GT[i].focus();
}
$("#gtabs").addEventListener("keydown", (e) => {
  const i = GT.indexOf(document.activeElement); if (i < 0) return;
  const k = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: GT.length - 1 }[e.key];
  if (k === undefined) return; e.preventDefault(); showGame((k + GT.length) % GT.length, true);
});

/* ---- team gallery ---- */
const gal = $("#photo");
gal.innerHTML = D.GALLERY.map((g, i) => g.src
  ? `<figure class="photo" aria-roledescription="slide" aria-label="${i + 1} of ${D.GALLERY.length}"><img src="${esc(g.src)}"${g.srcset ? ` srcset="${esc(g.srcset)}"` : ""} sizes="(max-width:1200px) 92vw, 1200px" alt="${esc(g.alt)}" width="1800" height="1350" ${i ? 'loading="lazy" ' : ""}decoding="async"></figure>`
  : `<figure class="photo empty" aria-roledescription="slide" aria-label="${i + 1} of ${D.GALLERY.length}, photo coming soon"><div><b>Photo ${i + 1}</b><span class="small">Team photo goes here</span></div></figure>`).join("");
const slides = $$(".photo", gal);
let gi = 0;
const galGo = (i) => { i = Math.max(0, Math.min(slides.length - 1, i)); gal.scrollTo({ left: slides[i].offsetLeft - gal.offsetLeft, behavior: RM ? "auto" : "smooth" }); };
function galSync() {
  const x = gal.scrollLeft, max = gal.scrollWidth - gal.clientWidth;
  gi = x >= max - 4 ? slides.length - 1 : slides.reduce((best, el, i) => (Math.abs(el.offsetLeft - gal.offsetLeft - x) < Math.abs(slides[best].offsetLeft - gal.offsetLeft - x) ? i : best), 0);
  $("#gcount").textContent = `${gi + 1} / ${slides.length}`;
  $('[data-gal="-1"]').disabled = gi === 0; $('[data-gal="1"]').disabled = gi === slides.length - 1;
}
gal.addEventListener("scroll", () => requestAnimationFrame(galSync), { passive: true });
gal.addEventListener("keydown", (e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); galGo(gi + (e.key === "ArrowRight" ? 1 : -1)); } });
galSync();

/* ---- brand strip ---- */
const brandList = (hidden) => `<ul class="mq-list"${hidden ? ' aria-hidden="true"' : ""}>${D.BRANDS.map((b) => `<li>${b.logo ? `<img src="${esc(b.logo)}" alt="${hidden ? "" : esc(b.name)}" loading="lazy">` : esc(b.name)}</li>`).join("")}</ul>`;
$("#brands").innerHTML = `<div class="mq-track">${brandList(false)}${brandList(true)}</div>`;

/* ---- and then what? ---- */
const CHAINS = [
  { tab: "A tight deadline", q: "Someone wants it in 7 days. Honestly, it takes 14.", opts: [
    { label: "Say 7 days", good: false, steps: ["Everyone cheers today.", "The team works two weekends.", "Quality slips on day 6.", "It ships late anyway. Trust drops."] },
    { label: "Say 16, plan for 12", good: true, steps: ["One slightly awkward call today.", "The team works normal hours.", "There's room to fix surprises.", "It ships on day 12. Trust compounds."] } ] },
  { tab: "A teammate falls behind", q: "Your part is done. A teammate's part is behind. Deadline is tomorrow.", opts: [
    { label: "Not my part", good: false, steps: ["Your part looks great.", "The whole thing ships late.", "Nobody remembers whose part was on time.", "Next time, nobody helps you either."] },
    { label: "Take a piece of it", good: true, steps: ["You lose an evening.", "It ships on time.", "They return the favour next month.", "The team gets faster, together."] } ] },
  { tab: "A doubt in a meeting", q: "A senior's idea has a flaw only you seem to see.", opts: [
    { label: "Stay quiet", good: false, steps: ["The meeting ends on time.", "The idea goes live.", "The flaw shows up in week two.", "Everyone wishes someone had said it."] },
    { label: "Ask a question that points at it", good: true, steps: ["A short, slightly tense pause.", "The senior spots the flaw themselves.", "The fix goes in before launch.", "Next time, they ask for your view first."] } ] },
];
let tw = 0;
function drawChain(choice) {
  const c = CHAINS[tw];
  $("#twtabs").innerHTML = CHAINS.map((x, i) => `<button class="chip" aria-pressed="${i === tw}" data-tw="${i}">${x.tab}</button>`).join("");
  $("#twq").textContent = c.q;
  $("#twopts").innerHTML = c.opts.map((o, i) => `<button class="chip" aria-pressed="${choice === i}" data-twopt="${i}">${o.label}</button>`).join("");
  if (choice == null) { $("#chain").innerHTML = `<li class="hint">Pick one to see what happens next.</li>`; return; }
  const o = c.opts[choice], when = ["Today", "This week", "Next week", "Next month"];
  $("#chain").innerHTML = o.steps.map((t, i) => `<li style="--i:${i}" class="${i === 3 ? "end " + (o.good ? "good" : "bad") : ""}"><small>${when[i]}</small><b>${esc(t)}</b></li>`).join("");
}
drawChain(null);

/* ---- this or that ---- */
const QUIZ = [
  ["I'd ask the “silly” question", "I'd rather look like I already know"],
  ["Tell me the hard truth now", "Soften it and tell me later"],
  ["Give me a problem", "Give me a checklist"],
  ["Promise less, then beat it", "Promise more to win the room"],
  ["When it breaks, I check my part first", "When it breaks, I find who missed it"],
  ["The best idea wins, whoever said it", "Seniority should settle it"],
];
const QWHY = ["curiosity", "candour", "ownership", "trust", "accountability", "merit"];
let qa = [], qorder = QUIZ.map(() => Math.random() < 0.5);
function drawQuiz() {
  const q = $("#quiz"), i = qa.length;
  if (i < QUIZ.length) {
    const [a, b] = QUIZ[i], flip = qorder[i];
    const opts = flip ? [[b, 0], [a, 1]] : [[a, 1], [b, 0]];
    q.innerHTML = `<div class="qbar" aria-hidden="true">${QUIZ.map((_, j) => `<i class="${j < i ? "on" : ""}"></i>`).join("")}</div>
      <p class="small muted" style="margin-bottom:14px">${i + 1} of ${QUIZ.length} · which sounds more like you?</p>
      <div class="qopts">${opts.map(([t, v], k) => `<button class="qopt" data-q="${v}"><span>${esc(t)}</span><span class="k">${k ? "or this" : "this"}</span></button>`).join("")}</div>`;
    return;
  }
  const n = qa.filter(Boolean).length, split = QUIZ.map((x, j) => (qa[j] ? null : QWHY[j])).filter(Boolean);
  const [h, p] = n === 6 ? ["You'd feel at home.", "Every pick lines up with how we work. Go find a problem worth owning."]
    : n >= 4 ? ["Mostly a fit. Good sign.", `We split on ${split.join(" and ")}. That's a great thing to talk about in an interview.`]
    : ["Honest heads-up.", "This place might frustrate you. That's fine. Not every team fits every person, and we'd rather say so now."];
  q.innerHTML = `<div class="qres"><h3>${h}</h3><p class="muted">${p}</p>
    <ul>${QUIZ.map((x, j) => `<li><span class="dot" style="${qa[j] ? "" : "background:transparent;border:1px solid var(--muted)"}" aria-hidden="true"></span>${esc(qa[j] ? x[0] : x[1])}</li>`).join("")}</ul>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn primary" href="#roles">See open roles <span class="arr" aria-hidden="true">→</span></a><button class="btn ghost" data-qreset>Start over</button></div></div>`;
}
drawQuiz();


/* ---- one scroll loop for everything scroll-driven ---- */
const photo = $("#photo");
let ticking = false;
function onScroll() {
  ticking = false;
  if (document.body.classList.contains("dash")) return;
  valuesScroll();
  const vh = innerHeight;
  if (!RM) { const r = photo.getBoundingClientRect(); const p = Math.min(1, Math.max(0, 1 - r.top / vh)); photo.style.setProperty("--z", (1.1 - 0.1 * p).toFixed(4)); }
}
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener("resize", onScroll);
drawLadder(0, true);

let dept = "All", rq = "";
const openRoles = () => S.roles.filter((r) => r.status === "Open");
function renderChips() {
  const o = openRoles();
  if (dept !== "All" && !o.some((r) => r.dept === dept)) dept = "All";
  $("#deptchips").innerHTML = ["All", ...D.DEPTS.filter((d) => o.some((r) => r.dept === d))].map((d) => {
    const n = d === "All" ? o.length : o.filter((r) => r.dept === d).length;
    return `<button class="chip" aria-pressed="${d === dept}" data-dept="${esc(d)}">${esc(d)} <span style="opacity:.55">${n}</span></button>`;
  }).join("");
}
function renderRoles() {
  const q = rq.trim().toLowerCase();
  const list = openRoles().filter((r) => (dept === "All" || r.dept === dept) &&
    (!q || [r.title, r.dept, r.problem, ...r.resp, ...r.must, ...(r.langs || [])].join(" ").toLowerCase().includes(q)));
  $("#rolecount").textContent = `${list.length} open role${list.length === 1 ? "" : "s"}${dept !== "All" ? " in " + dept : ""}. All based in Lower Parel, Mumbai.`;
  $("#rolelist").innerHTML = list.length ? list.map((r) => `
    <button class="rolerow" data-role="${r.id}">
      <b>${esc(r.title)}</b><span class="meta">${esc(r.dept)}</span><span class="meta">${esc(r.location || "Lower Parel, Mumbai")}</span><span class="meta">${esc(r.type)}</span>
      <span class="mob">${esc(r.dept)} · ${esc(r.type)}</span><span class="go" aria-hidden="true">→</span>
    </button>`).join("") :
    `<p class="empty">Nothing here right now. Write to careers@theboredmonkey.com with a problem you'd solve, and we'll keep you in mind.</p>`;
}
$("#roleq").addEventListener("input", (e) => { rq = e.target.value; renderRoles(); });

/* ---------- drawer & modal ---------- */
const drawer = $("#drawer"), scrim = $("#scrim"), modal = $("#modal"), sheet = $("#sheet");
let lastFocus = null;
function showDrawer(wide) {
  lastFocus = document.activeElement;
  drawer.classList.toggle("panel", !!wide);
  drawer.classList.add("on"); scrim.classList.add("on"); drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => $(".x", drawer)?.focus(), 60);
}
function closeDrawer() {
  drawer.classList.remove("on"); drawer.setAttribute("aria-hidden", "true");
  if (!modal.classList.contains("on")) { scrim.classList.remove("on"); document.body.style.overflow = ""; }
  lastFocus?.focus?.();
}
function openRole(id) {
  const r = roleById(id); if (!r) return;
  drawer.innerHTML = `
    <div class="dh"><span class="small muted">${esc(r.dept)}</span><button class="x" data-close="drawer" aria-label="Close role details">×</button></div>
    <div class="db">
      <h2 id="dr-title">${esc(r.title)}</h2>
      <div class="meta-row"><span>${esc(r.location || "Lower Parel, Mumbai")}</span><span>${esc(r.type)}</span><span>${expTxt(r.exp)}</span><span>${esc(r.pay)}</span></div>
      <p class="problem">${esc(r.problem)}</p>
      <h4>What you'll do</h4><ul class="lines">${lis(r.resp)}</ul>
      <h4>Must-haves</h4><ul class="lines">${lis(r.must)}</ul>
      ${r.nice?.length ? `<h4>Good to have</h4><ul class="lines">${lis(r.nice)}</ul>` : ""}
      <h4>How you'll know it's working</h4><p>${esc(r.metrics)}</p>
    </div>
    <div class="df"><span class="small muted">We reply within 48 hours.</span><button class="btn accent" data-apply="${r.id}">Apply for this role <span class="arr" aria-hidden="true">→</span></button></div>`;
  showDrawer(false);
}

/* ---------- apply flow ---------- */
const DRAFT = "tbm-apply-draft";
let ap = null;
const FILES = {};
const visibleSteps = () => D.STEPS.filter((s) => S.fields.some((f) => f.on && f.step === s.id));
const stepFields = (sid) => S.fields.filter((f) => f.on && f.step === sid);

function openApply(roleId) {
  const r = roleById(roleId) || openRoles()[0];
  const d = store.get(DRAFT, null);
  ap = { step: 0, v: { dept: r.dept, role: r.id }, file: null, done: false, saved: null };
  if (d && d.v && d.v.role === r.id) { ap.v = { ...ap.v, ...d.v }; ap.step = Math.min(d.step || 0, visibleSteps().length - 1); ap.saved = d.at; setTimeout(() => toast("Picked up where you left off."), 300); }
  closeDrawer();
  lastFocus = document.activeElement;
  modal.classList.add("on"); scrim.classList.add("on"); modal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
  renderApply();
}
function closeModal() {
  modal.classList.remove("on"); modal.setAttribute("aria-hidden", "true");
  if (!drawer.classList.contains("on")) { scrim.classList.remove("on"); document.body.style.overflow = ""; }
  if (ap && !ap.done) toast("Draft saved. Come back any time.");
  ap = null;
}
function autosave() {
  if (!ap || ap.done) return;
  const { resume, ...v } = ap.v;
  ap.saved = new Date().toISOString();
  store.set(DRAFT, { v, step: ap.step, at: ap.saved });
  const el = $("#saved"); if (el) el.innerHTML = `<span class="dot" aria-hidden="true"></span>Saved ${fmtT(ap.saved)}`;
}
function control(f) {
  const v = ap.v[f.id];
  const id = `f-${f.id}`, desc = `aria-describedby="e-${f.id}${f.hint ? " h-" + f.id : ""}"`;
  const req = f.required ? "required" : "";
  switch (f.type) {
    case "long": return `<textarea id="${id}" name="${f.id}" ${desc} ${req}>${esc(v)}</textarea>`;
    case "select": case "dropdown":
      return `<select id="${id}" name="${f.id}" ${desc} ${req}><option value="">Choose…</option>${(f.options || []).map((o) => `<option ${v === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
    case "dept":
      return `<select id="${id}" name="dept" ${desc} required>${D.DEPTS.filter((o) => o === v || openRoles().some((r) => r.dept === o)).map((o) => `<option ${v === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
    case "role": {
      const rs = openRoles().filter((r) => r.dept === ap.v.dept);
      return `<select id="${id}" name="role" ${desc} required><option value="">${rs.length ? "Choose…" : "No open roles in this team"}</option>${rs.map((r) => `<option value="${r.id}" ${v === r.id ? "selected" : ""}>${esc(r.title)}</option>`).join("")}</select>`;
    }
    case "yesno":
      return `<div class="seg" role="group" aria-labelledby="l-${f.id}">${["Yes", "No"].map((o) => `<button type="button" class="chip" data-seg="${f.id}" data-val="${o}" aria-pressed="${v === o}">${o}</button>`).join("")}</div>`;
    case "langs":
      return `<div class="seg" role="group" aria-labelledby="l-${f.id}">${f.options.map((o) => `<button type="button" class="chip" data-multi="${f.id}" data-val="${o}" aria-pressed="${(v || []).includes(o)}">${o}</button>`).join("")}</div>`;
    case "file":
      return `<div class="drop" id="${id}" role="button" tabindex="0" ${desc} data-drop>
        <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" data-file>
        <b>${ap.file ? esc(ap.file.name) : "Drop your resume here"}</b><br><span class="small muted">${ap.file ? `${(ap.file.size / 1048576).toFixed(1)} MB · click to replace` : "or click to browse · PDF or DOC, up to 5 MB"}</span></div>`;
    case "consent":
      return `<label class="check"><input type="checkbox" id="${id}" name="${f.id}" ${v ? "checked" : ""} ${desc}><span>${esc(f.label)} Questions: careers@theboredmonkey.com.</span></label>`;
    default: {
      const t = { email: "email", tel: "tel", number: "number", url: "url", link: "url", date: "date" }[f.type] || "text";
      const extra = t === "number" ? `inputmode="decimal" step="0.1" ${f.min != null ? `min="${f.min}"` : ""} ${f.max != null ? `max="${f.max}"` : ""}` : t === "date" ? `min="${new Date().toISOString().slice(0, 10)}"` : "";
      const ac = { name: "name", email: "email", phone: "tel", city: "address-level2" }[f.id] || "off";
      return `<input id="${id}" name="${f.id}" type="${t}" value="${esc(v)}" ${extra} autocomplete="${ac}" ${desc} ${req}>`;
    }
  }
}
function fieldHTML(f) {
  const lab = f.type === "consent" ? `` :
    ["yesno", "langs", "file"].includes(f.type)
      ? `<span class="lbl" id="l-${f.id}">${esc(f.label)} ${f.required ? "" : '<span class="req">(optional)</span>'}</span>`
      : `<label for="f-${f.id}" id="l-${f.id}">${esc(f.label)} ${f.required ? "" : '<span class="req">(optional)</span>'}</label>`;
  return `<div class="field" data-field="${f.id}">${lab}${control(f)}${f.hint ? `<p class="hint" id="h-${f.id}">${esc(f.hint)}</p>` : ""}<p class="err" id="e-${f.id}" aria-live="polite"></p></div>`;
}
const STEP_TITLES = { personal: "First, the basics.", role: "Which problem do you want?", comp: "Let's talk money, plainly.", exp: "What you've done so far.", links: "Show us the work.", about: "How you think. Our favourite part.", final: "Last bit, promise." };
function renderApply() {
  if (ap.done) return;
  const steps = visibleSteps(), s = steps[ap.step], fs = stepFields(s.id), last = ap.step === steps.length - 1;
  const r = roleById(ap.v.role);
  const pairs = ["age", "gender", "ctc", "ectc", "total", "rel", "lastco", "lastdes", "joining", "notice", "dept", "role", "source", "referral"];
  let body = "", i = 0;
  while (i < fs.length) {
    const a = fs[i], b = fs[i + 1];
    if (b && pairs.includes(a.id) && pairs.includes(b.id)) { body += `<div class="two">${fieldHTML(a)}${fieldHTML(b)}</div>`; i += 2; }
    else { body += fieldHTML(a); i++; }
  }
  sheet.innerHTML = `
    <div class="steplabel"><span id="ap-title">Applying for ${esc(r ? r.title : "a role")}</span><span>Step ${ap.step + 1} of ${steps.length} · ${s.label}</span></div>
    <div class="progress" aria-hidden="true">${steps.map((x, j) => `<i class="${j < ap.step ? "done" : j === ap.step ? "cur" : ""}"></i>`).join("")}</div>
    <form class="form" id="apform" novalidate><h3>${STEP_TITLES[s.id] || s.label}</h3>${body}</form>
    <div class="foot">
      <span class="saved" id="saved">${ap.saved ? `<span class="dot" aria-hidden="true"></span>Saved ${fmtT(ap.saved)}` : "Autosaves as you type"}</span>
      <div style="display:flex;gap:8px">
        ${ap.step ? `<button class="btn ghost" data-back>Back</button>` : `<button class="btn ghost" data-close="modal">Close</button>`}
        <button class="btn ${last ? "accent" : "primary"}" data-next>${last ? "Send application" : "Continue"} <span class="arr" aria-hidden="true">→</span></button>
      </div>
    </div>`;
  setTimeout(() => $("#apform input, #apform select, #apform textarea, #apform [data-seg], #apform [data-drop]")?.focus(), 80);
}
function validate(f) {
  const v = ap.v[f.id];
  const empty = v == null || v === "" || (Array.isArray(v) && !v.length);
  if (f.type === "file") {
    if (!ap.file) return f.required ? "Attach your resume to continue." : "";
    if (!/\.(pdf|docx?)$/i.test(ap.file.name)) return "Use a PDF or DOC file.";
    if (ap.file.size > 5 * 1048576) return "That file is over 5 MB. Try a lighter PDF.";
    return "";
  }
  if (f.type === "consent") return v ? "" : "We need your consent to store your application.";
  if (empty) return f.required ? (f.type === "langs" ? "Pick at least one." : "We need this one.") : "";
  const s = String(v).trim();
  if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return "That email looks off. Check for a typo.";
  if (f.type === "tel") { const n = s.replace(/\D/g, ""); if (n.length < 10 || n.length > 13) return "Use a 10-digit number. Add +91 if you like."; }
  if (f.type === "number") { const n = Number(s); if (Number.isNaN(n)) return "Enter a number."; if ((f.min != null && n < f.min) || (f.max != null && n > f.max)) return `Enter a number between ${f.min} and ${f.max}.`; }
  if (f.id === "rel" && Number(s) > Number(ap.v.total || 0)) return "Relevant can't be more than total experience.";
  if (f.type === "url" || f.type === "link") { try { const u = new URL(/^https?:\/\//i.test(s) ? s : "https://" + s); if (!u.hostname.includes(".")) throw 0; } catch (e) { return "Paste a full link, like linkedin.com/in/you."; } }
  if (f.type === "date" && s < new Date().toISOString().slice(0, 10)) return "Pick today or a later date.";
  if (f.type === "long" && f.required && s.length < 15) return "A line or two, please. Specifics help.";
  if (f.id === "role" && !roleById(s)) return "Choose a role.";
  return "";
}
function showErr(f, msg) {
  const box = $(`[data-field="${f.id}"]`, sheet); if (!box) return;
  box.classList.toggle("bad", !!msg); $(`#e-${f.id}`, sheet).textContent = msg;
  const c = $(`#f-${f.id}`, sheet); if (c) c.setAttribute("aria-invalid", msg ? "true" : "false");
}
function next() {
  const steps = visibleSteps(), s = steps[ap.step];
  let first = null;
  for (const f of stepFields(s.id)) { const m = validate(f); showErr(f, m); if (m && !first) first = f; }
  if (first) { ($(`#f-${first.id}`, sheet) || $(`[data-field="${first.id}"] button`, sheet))?.focus(); return; }
  if (ap.step < steps.length - 1) { ap.step++; autosave(); renderApply(); $(".form", sheet).scrollTop = 0; return; }
  submit();
}
function submit() {
  const v = ap.v, id = "a" + Date.now();
  const custom = {};
  S.fields.filter((f) => f.custom && f.on).forEach((f) => { if (v[f.id] != null && v[f.id] !== "") custom[f.label] = v[f.id]; });
  const num = (x) => (x === "" || x == null ? 0 : Number(x));
  S.apps.unshift({
    id, name: v.name, email: v.email, phone: v.phone, age: v.age, gender: v.gender, city: v.city, mumbai: v.mumbai,
    role: v.role, joining: v.joining, notice: v.notice || "30 days", buyout: v.buyout || "No",
    ctc: num(v.ctc), ectc: num(v.ectc), negotiable: v.negotiable, total: num(v.total), rel: num(v.rel), lastco: v.lastco, lastdes: v.lastdes,
    langs: v.langs || [], portfolio: v.portfolio, linkedin: v.linkedin, instagram: v.instagram, resume: ap.file?.name,
    why: v.why, admire: v.admire, problem: v.problem, source: v.source, referral: v.referral, custom,
    stage: "New", applied: new Date().toISOString(), notes: [], score: {}, ai: {},
  });
  if (ap.file) FILES[id] = URL.createObjectURL(ap.file);
  S.seq++; save(); store.del(DRAFT);
  const ref = `TBM-${new Date().toISOString().slice(2, 7).replace("-", "")}-${String(S.seq).padStart(4, "0")}`;
  const r = roleById(v.role);
  ap.done = true;
  sheet.innerHTML = `<div class="done-screen">
      <p class="muted small">Reference ${ref}</p>
      <h3 id="ap-title">Application in. Thank you, ${esc(String(v.name).split(" ")[0])}.</h3>
      <p class="muted">You applied for ${esc(r?.title)}. Here's exactly what happens next.</p>
      <ol>
        <li><span>A person on our team reads your answers. We use AI to summarise, never to decide.</span></li>
        <li><span>You hear back within 48 hours, either way.</span></li>
        <li><span>If it's a match: a 30-minute call, a short task on a real problem, then a chat with the team.</span></li>
      </ol>
      <p class="note">Prototype note: this application now shows in the HR dashboard (Team login, in the footer).</p>
      <div><button class="btn primary" data-close="modal">Back to roles</button></div>
    </div>`;
  if (document.body.classList.contains("dash")) renderTab();
}
function setFile(file) {
  ap.file = file; ap.v.resume = file ? file.name : "";
  const f = S.fields.find((x) => x.id === "resume");
  const box = $("[data-drop]", sheet);
  if (box) { box.querySelector("b").textContent = file.name; box.querySelector("span").textContent = `${(file.size / 1048576).toFixed(1)} MB · click to replace`; }
  showErr(f, validate(f));
}
sheet.addEventListener("input", (e) => {
  const t = e.target; if (!t.name || !ap) return;
  ap.v[t.name] = t.type === "checkbox" ? t.checked : t.value;
  if (t.name === "dept") { ap.v.role = ""; renderApply(); }
  const f = S.fields.find((x) => x.id === t.name); if (f && $(`[data-field="${f.id}"]`, sheet)?.classList.contains("bad")) showErr(f, validate(f));
  autosave();
});
sheet.addEventListener("change", (e) => { if (e.target.matches("[data-file]") && e.target.files[0]) setFile(e.target.files[0]); });
sheet.addEventListener("focusout", (e) => {
  const t = e.target; if (!ap || !t.name) return;
  const f = S.fields.find((x) => x.id === t.name); if (f && String(ap.v[f.id] ?? "") !== "") showErr(f, validate(f));
});
sheet.addEventListener("keydown", (e) => {
  if (e.target.matches("[data-drop]") && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); $("[data-file]", sheet).click(); }
  if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "checkbox") { e.preventDefault(); next(); }
});
["dragover", "dragleave", "drop"].forEach((ev) => sheet.addEventListener(ev, (e) => {
  const d = e.target.closest?.("[data-drop]"); if (!d) return;
  e.preventDefault(); d.classList.toggle("over", ev === "dragover");
  if (ev === "drop" && e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
}));

/* ================= AI ASSIST (prototype: rule-based) ================= */
function fitOf(a) {
  const r = roleById(a.role); if (!r) return { score: 0, why: ["Role no longer exists."] };
  const text = [a.why, a.admire, a.problem, a.lastdes, a.lastco, ...Object.values(a.custom || {})].join(" ").toLowerCase();
  const hits = r.keys.filter((k) => text.includes(k));
  const why = []; let s = 0;
  s += Math.round(35 * Math.min(1, hits.length / Math.max(3, Math.ceil(r.keys.length / 2))));
  why.push(hits.length ? `Mentions ${hits.slice(0, 4).join(", ")} in answers or past role.` : "Answers don't touch the role's core skills yet.");
  const [lo, hi] = r.exp, rel = Number(a.rel) || 0;
  if (rel >= lo && rel <= hi + 2) { s += 25; why.push(`${rel} yrs relevant, inside the ${lo}–${hi} yr ask.`); }
  else if (rel < lo) { s += rel >= lo - 0.5 ? 15 : 5; why.push(`${rel} yrs relevant, under the ${lo} yr ask.`); }
  else { s += 15; why.push(`${rel} yrs relevant, above range. Check level and pay.`); }
  if (r.langs?.length) { const m = (a.langs || []).filter((l) => r.langs.includes(l)); if (m.length) { s += 15; why.push(`Works in ${m.join(", ")}, which this role needs.`); } else why.push(`No ${r.langs.join(" / ")} listed. The role leans on it.`); }
  else s += 15;
  if (/\d|track|measure|search|install|lead|retention|cpv|conversion|repeat|booking|cost per/i.test(a.problem || "")) { s += 15; why.push("Pitch names a measurable outcome."); }
  else { s += (a.problem || "").length > 60 ? 7 : 0; why.push("Pitch stays generic. No number to move."); }
  if (a.mumbai === "Yes") s += 5; else why.push("Not open to Mumbai yet.");
  s += { Immediate: 5, "15 days": 5, "30 days": 4, "60 days": 2, "90 days": 0 }[a.notice] ?? 2;
  return { score: Math.min(100, s), why };
}
function summaryOf(a, hidePay) {
  const delta = a.ctc > 0 ? Math.round(((a.ectc - a.ctc) / a.ctc) * 100) : null;
  const pay = hidePay || !a.ectc ? "" : ` Expects ₹${a.ectc} LPA${delta != null ? ` (${delta >= 0 ? "+" : ""}${delta}% on current)` : ""}.`;
  return [
    `${a.total} yrs total, ${a.rel} relevant. Last: ${a.lastdes || "not given"}${a.lastco ? " at " + a.lastco : ""}.`,
    `Works in ${(a.langs || []).join(", ") || "no languages listed"}. ${a.notice} notice${a.buyout === "Yes" ? ", buyout possible" : ""}.${pay}`,
    `Pitch: ${trunc(a.problem, 120) || "not answered"}`,
  ].join("\n");
}
function slot() {
  const d = new Date(NOW + 2 * DAY);
  while ([0, 6].includes(d.getDay())) d.setTime(d.getTime() + DAY);
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" }) + " at 2 PM";
}
function emailOf(a, kind, sender) {
  const r = roleById(a.role), first = String(a.name).split(" ")[0];
  if (kind === "invite") return `Subject: Next step for ${r.title} at TBM

Hi ${first},

Thanks for applying for ${r.title}. Your answer to the brand-problem question stood out, so we'd like to talk.

Could you do ${slot()} for 45 minutes? We can meet at our Lower Parel office or on Google Meet, whichever is easier for you.

Reply with a yes or a better time, and we'll confirm within one working day.

${sender}
TBM People Team`;
  const rel = Number(a.rel) || 0;
  const reason = rel < r.exp[0] ? `For this role we need at least ${r.exp[0]} years of hands-on experience, and we didn't want to set you up in a seat that isn't ready for you yet.`
    : r.langs?.length && !(a.langs || []).some((l) => r.langs.includes(l)) ? `This role needs day-to-day work in ${r.langs.join(" or ")}, and that's a must for the creators we manage.`
    : "We had applicants whose experience matched this brief more closely.";
  return `Subject: Your application for ${r.title}

Hi ${first},

Thank you for applying for ${r.title}, and for the time you put into your answers.

We've decided not to move forward this time. ${reason}

We keep applications for 12 months, and we'll reach out if a better fit opens up.

${sender}
TBM People Team`;
}
function draftRole(title, bullets) {
  const lines = bullets.split(/\n+/).map((l) => l.replace(/^[-•*\s]+/, "").trim()).filter(Boolean).map((l) => l[0].toUpperCase() + l.slice(1).replace(/\.$/, ""));
  const isMust = (l) => /\b(\d+\+?\s*(yrs?|years?)|experience|fluent|must|knows?|skill|degree|comfort)/i.test(l);
  const must = lines.filter(isMust), resp = lines.filter((l) => !isMust(l));
  return {
    problem: resp[0] ? `Own this: ${resp[0].toLowerCase()}. Then show us the number it moved.` : `Own one problem end to end, and show us the number it moved.`,
    resp: resp.length ? resp : ["Agree the scope with your manager in week one"],
    must: must.length ? must : ["Has done this before and can talk through a real result"],
    metrics: "Two numbers you agree with your manager in week one. We review them monthly.",
  };
}

/* ================= DASHBOARD ================= */
const PERMS = {
  admin: { label: "HR Admin", tabs: ["overview", "applicants", "pipeline", "roles", "form", "exports"] },
  recruiter: { label: "Recruiter", tabs: ["overview", "applicants", "pipeline", "roles", "exports"] },
  hm: { label: "Hiring manager, Creative Team", tabs: ["overview", "applicants", "pipeline"], scope: "Creative Team", hidePay: true },
};
const TABNAMES = { overview: "Overview", applicants: "Applicants", pipeline: "Pipeline", roles: "Roles", form: "Form builder", exports: "Exports" };
let tab = "overview";
const F = { q: "", dept: "", role: "", stage: "", exp: "", min: "", max: "", notice: "", sort: "applied", dir: -1 };
const P = () => PERMS[S.session?.role] || PERMS.admin;
const scopedApps = () => (P().scope ? S.apps.filter((a) => roleById(a.role)?.dept === P().scope) : S.apps);
const scopedRoles = () => (P().scope ? S.roles.filter((r) => r.dept === P().scope) : S.roles);
const reachedIdx = (a) => (a.stage === "Rejected" ? a.rejAt ?? 0 : D.STAGES.indexOf(a.stage));

function renderDash() {
  const dash = $("#dash");
  if (!S.session) {
    dash.innerHTML = `<main class="login"><form class="box" id="loginf">
      <img class="logo logo-light" src="assets/logo-light.png" alt="TheBoredMonkey" width="137" height="24"><img class="logo logo-dark" src="assets/logo-dark.png" alt="TheBoredMonkey" width="137" height="24">
      <h1>Team login</h1>
      <div class="field"><label for="lg-e">Work email</label><input id="lg-e" type="email" value="people@theboredmonkey.com" autocomplete="email" required></div>
      <div class="field"><label for="lg-r">Sign in as</label><select id="lg-r"><option value="admin">HR Admin: everything</option><option value="recruiter">Recruiter: no form builder</option><option value="hm">Hiring manager: Creative Team only, no pay data</option></select></div>
      <button class="btn primary" type="submit">Sign in <span class="arr" aria-hidden="true">→</span></button>
      <p class="note">Prototype: any email works. The production build uses Supabase magic-link login with these three roles.</p>
      <a class="link small" href="#top">Back to the careers site</a></form></main>`;
    $("#loginf").addEventListener("submit", (e) => { e.preventDefault(); S.session = { email: $("#lg-e").value, role: $("#lg-r").value }; save(); tab = "overview"; renderDash(); });
    return;
  }
  if (!P().tabs.includes(tab)) tab = "overview";
  dash.innerHTML = `<header class="dtop"><div class="wrap">
      <a href="#top" aria-label="Careers site"><img class="logo logo-light" src="assets/logo-light.png" alt="TheBoredMonkey" width="137" height="24"><img class="logo logo-dark" src="assets/logo-dark.png" alt="TheBoredMonkey" width="137" height="24"></a>
      <div class="tabs" role="tablist" aria-label="Dashboard sections">${P().tabs.map((t) => `<button role="tab" data-tab="${t}" aria-selected="${t === tab}">${TABNAMES[t]}</button>`).join("")}</div>
      <div class="who"><span class="hide-m">${esc(P().label)}</span><a class="btn ghost sm" href="#top">View site</a><button class="btn ghost sm" data-logout>Sign out</button></div>
    </div></header><main class="dmain"><div class="wrap" id="dview"></div></main>`;
  renderTab();
}
function renderTab() {
  const v = $("#dview"); if (!v) return;
  ({ overview: vOverview, applicants: vApplicants, pipeline: vPipeline, roles: vRoles, form: vForm, exports: vExports })[tab](v);
}
const barRows = (rows, max, hiIdx = -1) => rows.map(([l, n], i) => `<div class="bar"><span>${esc(l)}</span><span class="track"><i class="${i === hiIdx ? "hi" : ""}" style="width:${max ? Math.max(2, (n / max) * 100) : 0}%"></i></span><em>${n}</em></div>`).join("");

function vOverview(v) {
  const apps = scopedApps();
  const open = scopedRoles().filter((r) => r.status === "Open").length;
  const wk = apps.filter((a) => NOW - new Date(a.applied) < 7 * DAY).length;
  const tth = median(apps.filter((a) => a.hiredAt).map((a) => Math.round((new Date(a.hiredAt) - new Date(a.applied)) / DAY)));
  const inInt = apps.filter((a) => a.stage === "Interview").length;
  const fun = D.STAGES.slice(0, 5).map((s, i) => [s, apps.filter((a) => reachedIdx(a) >= i).length]);
  let drop = -1, worst = 0;
  for (let i = 1; i < fun.length; i++) { const p = fun[i - 1][1] ? 1 - fun[i][1] / fun[i - 1][1] : 0; if (p > worst) { worst = p; drop = i; } }
  const SO = { 1: "Screening is the choke point. Tighten job posts so fewer wrong-fit people apply.", 2: "Check how fast shortlisted people get an interview slot. Days here cost us candidates.", 3: "Check interviewers use the scorecard, not gut feel.", 4: "Look at offer terms and how fast offers go out." };
  const depts = Object.entries(apps.reduce((m, a) => { const d = roleById(a.role)?.dept || "Other"; m[d] = (m[d] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]);
  v.innerHTML = `<h1>${drop > 0 ? `Most candidates drop between ${fun[drop - 1][0]} and ${fun[drop][0]}.` : "Hiring at a glance."}</h1>
    <p class="dsub">${P().scope ? P().scope + " · " : ""}${apps.length} applicants in the system. Sample data.</p>
    <div class="kpis">
      <div class="kpi"><b>${open}</b><span>Open roles</span></div>
      <div class="kpi"><b>${wk}</b><span>New applicants, last 7 days</span></div>
      <div class="kpi"><b>${tth != null ? tth + "d" : "—"}</b><span>Median time-to-hire · target 22d</span></div>
      <div class="kpi"><b>${inInt}</b><span>In interview right now</span></div>
    </div>
    <div class="cols">
      <div class="blk"><h2>Funnel by stage</h2><p class="so">People who reached each stage.</p><div class="bars">${barRows(fun, fun[0][1], drop)}</div></div>
      <div class="blk"><h2>Applicants by department</h2><p class="so">Where interest is, and isn't.</p><div class="bars">${barRows(depts, depts[0]?.[1] || 0)}</div></div>
    </div>
    ${drop > 0 ? `<p class="insight"><span class="dot" aria-hidden="true" style="margin-top:8px"></span><span><b>So what:</b> ${Math.round(worst * 100)}% fall off at ${fun[drop][0].toLowerCase()}. ${SO[drop]}</span></p>` : ""}`;
}

function filtered() {
  const q = F.q.toLowerCase();
  let list = scopedApps().filter((a) => {
    const r = roleById(a.role);
    if (q && ![a.name, a.email, r?.title, a.city, a.lastco, ...(a.langs || [])].join(" ").toLowerCase().includes(q)) return false;
    if (F.dept && r?.dept !== F.dept) return false;
    if (F.role && a.role !== F.role) return false;
    if (F.stage && a.stage !== F.stage) return false;
    if (F.exp) { const [lo, hi] = F.exp.split("-").map(Number); if (a.total < lo || a.total > hi) return false; }
    if (F.min !== "" && a.ectc < Number(F.min)) return false;
    if (F.max !== "" && a.ectc > Number(F.max)) return false;
    if (F.notice && a.notice !== F.notice) return false;
    return true;
  });
  const key = { name: (a) => a.name, stage: (a) => D.STAGES.indexOf(a.stage), total: (a) => a.total, ectc: (a) => a.ectc, notice: (a) => parseInt(a.notice) || 0, fit: (a) => fitOf(a).score, applied: (a) => a.applied }[F.sort];
  return list.sort((a, b) => (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0) * F.dir);
}
function vApplicants(v) {
  const hp = P().hidePay, rs = scopedRoles();
  const opt = (arr, cur, all) => `<option value="">${all}</option>` + arr.map(([val, l]) => `<option value="${esc(val)}" ${cur === val ? "selected" : ""}>${esc(l)}</option>`).join("");
  v.innerHTML = `<h1>Applicants</h1><p class="dsub" id="acount"></p>
    <div class="toolbar">
      <input type="search" id="fq" placeholder="Search name, city, company, language" value="${esc(F.q)}" aria-label="Search applicants">
      ${P().scope ? "" : `<select id="fdept" aria-label="Department">${opt(D.DEPTS.map((d) => [d, d]), F.dept, "All departments")}</select>`}
      <select id="frole" aria-label="Role">${opt(rs.map((r) => [r.id, r.title]), F.role, "All roles")}</select>
      <select id="fstage" aria-label="Stage">${opt(D.STAGES.map((s) => [s, s]), F.stage, "All stages")}</select>
      <select id="fexp" aria-label="Experience">${opt([["0-1", "0–1 yrs"], ["1-3", "1–3 yrs"], ["3-5", "3–5 yrs"], ["5-50", "5+ yrs"]], F.exp, "Any experience")}</select>
      ${hp ? "" : `<input type="number" id="fmin" placeholder="Min ₹L" value="${esc(F.min)}" aria-label="Minimum expected CTC, lakhs"><input type="number" id="fmax" placeholder="Max ₹L" value="${esc(F.max)}" aria-label="Maximum expected CTC, lakhs">`}
      <select id="fnotice" aria-label="Notice period">${opt(["Immediate", "15 days", "30 days", "60 days", "90 days"].map((n) => [n, n]), F.notice, "Any notice")}</select>
      <button class="btn ghost sm" data-clear>Clear</button>
    </div>
    <div class="scroll"><table><thead><tr>
      ${[["name", "Applicant"], ["stage", "Stage"], ["total", "Exp", "num"], ...(hp ? [] : [["ectc", "Expected", "num hide-m"]]), ["notice", "Notice", "hide-m"], ["fit", "AI fit", "num"], ["applied", "Applied", "num hide-m"]]
        .map(([k, l, c]) => `<th class="${c || ""}" aria-sort="${F.sort === k ? (F.dir > 0 ? "ascending" : "descending") : "none"}"><button data-sort="${k}">${l}${F.sort === k ? (F.dir > 0 ? " ↑" : " ↓") : ""}</button></th>`).join("")}
    </tr></thead><tbody id="atbody"></tbody></table></div>`;
  renderTable();
}
function renderTable() {
  const list = filtered(), hp = P().hidePay;
  $("#acount").textContent = `${list.length} of ${scopedApps().length} applicants. Click a row for the full profile.`;
  $("#atbody").innerHTML = list.length ? list.map((a) => { const r = roleById(a.role); return `<tr tabindex="0" data-app="${a.id}">
      <td class="nm"><b>${esc(a.name)}</b><span>${esc(r?.title || "—")}</span></td>
      <td><span class="stage" data-s="${a.stage}">${a.stage}</span></td>
      <td class="num">${a.total} yrs</td>
      ${hp ? "" : `<td class="num hide-m">₹${a.ectc} L</td>`}
      <td class="hide-m">${esc(a.notice)}</td>
      <td class="num fitpill">${fitOf(a).score}</td>
      <td class="num hide-m">${fmtD(a.applied)}</td></tr>`; }).join("")
    : `<tr><td colspan="7" class="empty">No one matches these filters. Try clearing one.</td></tr>`;
}

const SC = ["Logic", "First principles", "Second-order thinking", "Mental models", "Creative", "Judgment", "People & ownership"];
function openApp(id) {
  const a = S.apps.find((x) => x.id === id); if (!a) return;
  const r = roleById(a.role), hp = P().hidePay, fit = fitOf(a);
  a.ai = a.ai || {};
  const summary = a.ai.summary ?? summaryOf(a, hp), rationale = a.ai.rationale ?? fit.why.join("\n");
  const link = (u, l) => (u ? `<a href="${esc(/^https?:/i.test(u) ? u : "https://" + u)}" rel="noopener">${esc(l)}</a>` : "");
  const rows = [["Email", a.email], ["Phone", a.phone], ["City", a.city], ["Open to Mumbai", a.mumbai], ["Experience", `${a.total} yrs (${a.rel} relevant)`], ["Last role", [a.lastdes, a.lastco].filter(Boolean).join(", ")], ["Notice", `${a.notice}${a.buyout === "Yes" ? ", buyout possible" : ""}`], ...(hp ? [] : [["Pay", a.ctc ? `₹${a.ctc} L now → ₹${a.ectc} L expected${a.negotiable === "Yes" ? ", negotiable" : ""}` : `₹${a.ectc} L expected`]]), ["Languages", (a.langs || []).join(", ")], ["Source", a.source + (a.referral ? `, via ${a.referral}` : "")], ["Applied", fmtD(a.applied)]];
  drawer.innerHTML = `
    <div class="dh"><div><b>${esc(a.name)}</b><div class="small muted">${esc(r?.title)} · ${esc(r?.dept)}</div></div><button class="x" data-close="drawer" aria-label="Close profile">×</button></div>
    <div class="db">
      <dl class="pgrid">${rows.filter((x) => x[1]).map(([k, val]) => `<div><dt>${k}</dt><dd>${esc(val)}</dd></div>`).join("")}</dl>
      <h4>Links and resume</h4>
      <p style="display:flex;gap:16px;flex-wrap:wrap">${[link(a.portfolio, "Portfolio"), link(a.linkedin, "LinkedIn"), link(a.instagram && !a.instagram.includes("/") ? "instagram.com/" + a.instagram.replace("@", "") : a.instagram, "Instagram")].filter(Boolean).join("") || '<span class="muted">No links shared.</span>'}</p>
      <p class="small muted" style="margin-top:8px">${FILES[a.id] ? `<a href="${FILES[a.id]}" target="_blank" rel="noopener">Open ${esc(a.resume)}</a>` : a.resume ? esc(a.resume) + ". " : ""}In production the resume PDF previews here from secure storage.</p>
      <h4>Their answers</h4>
      <ul class="lines"><li><span class="small muted">Why TBM</span><br>${esc(a.why)}</li><li><span class="small muted">Campaign or creator they admire</span><br>${esc(a.admire || "—")}</li><li><span class="small muted">Brand problem they'd solve</span><br>${esc(a.problem)}</li>
      ${Object.entries(a.custom || {}).map(([k, val]) => `<li><span class="small muted">${esc(k)}</span><br>${esc(val)}</li>`).join("")}</ul>

      <section class="ai" aria-label="AI assist">
        <div class="aih"><b>Summary</b><span class="tag">AI suggestion · edit before use</span></div>
        <textarea data-ai="summary" aria-label="AI summary, editable">${esc(summary)}</textarea>
        <div class="aih" style="margin-top:18px"><b>Fit against must-haves</b><span class="fitbig">${fit.score}<small>/ 100</small></span></div>
        <textarea data-ai="rationale" aria-label="Fit rationale, editable">${esc(rationale)}</textarea>
        <p class="note" style="margin-top:8px">Scores are a reading aid, not a decision. A person moves every stage.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn ghost sm" data-email="invite">Draft interview email</button><button class="btn ghost sm" data-email="reject">Draft rejection email</button><button class="btn ghost sm" data-regen>Regenerate</button></div>
        <div id="emailbox"></div>
      </section>

      <h4>Scorecard</h4>
      <div class="score">${SC.map((k) => `<span>${k}</span><div class="seg" role="group" aria-label="${k} rating">${[1, 2, 3, 4].map((n) => `<button class="chip" data-score="${k}" data-val="${n}" aria-pressed="${a.score[k] === n}">${n}</button>`).join("")}</div>`).join("")}</div>
      <h4>Notes</h4>
      <ul class="notes">${(a.notes || []).map((n) => `<li>${esc(n.text)}<span>${esc(n.by)} · ${fmtD(n.at)} ${fmtT(n.at)}</span></li>`).join("") || '<li class="muted">No notes yet.</li>'}</ul>
      <textarea id="newnote" placeholder="What did you notice? Be specific." aria-label="New note" style="min-height:80px"></textarea>
      <button class="btn ghost sm" data-note style="margin-top:8px">Add note</button>
    </div>
    <div class="df">
      <label class="small" style="display:flex;gap:10px;align-items:center">Stage <select id="stagesel" style="width:auto;min-height:40px">${D.STAGES.map((s) => `<option ${s === a.stage ? "selected" : ""}>${s}</option>`).join("")}</select></label>
      <span class="small muted">Changes save instantly.</span>
    </div>`;
  drawer.dataset.app = a.id;
  if (!drawer.classList.contains("on")) showDrawer(true);
}
function setStage(a, s) {
  if (a.stage === s) return;
  if (s === "Rejected") a.rejAt = reachedIdx(a);
  if (s === "Hired") a.hiredAt = new Date().toISOString();
  a.stage = s;
  a.notes.push({ text: `Moved to ${s}.`, by: P().label, at: new Date().toISOString() });
  save(); toast(`${a.name.split(" ")[0]} moved to ${s}.`);
}
drawer.addEventListener("input", (e) => {
  const a = S.apps.find((x) => x.id === drawer.dataset.app); if (!a) return;
  if (e.target.dataset.ai) { a.ai[e.target.dataset.ai] = e.target.value; save(); }
});
drawer.addEventListener("change", (e) => {
  if (e.target.id !== "stagesel") return;
  const a = S.apps.find((x) => x.id === drawer.dataset.app);
  setStage(a, e.target.value); openApp(a.id); renderTab();
});

function vPipeline(v) {
  const apps = scopedApps();
  v.innerHTML = `<h1>Pipeline</h1><p class="dsub">Drag a card to move it. With a keyboard, focus a card and use ← →. Enter opens the profile.</p>
    <div class="board">${D.STAGES.map((s) => { const c = apps.filter((a) => a.stage === s); return `<section class="col" data-col="${s}" aria-label="${s}"><h3><span class="stage" data-s="${s}">${s}</span><span class="muted">${c.length}</span></h3>
      ${c.map((a) => `<article class="card" draggable="true" tabindex="0" data-card="${a.id}" aria-label="${esc(a.name)}, ${esc(roleById(a.role)?.title)}, ${s}"><b>${esc(a.name)}</b><span>${esc(roleById(a.role)?.title)}</span><div class="crow"><span>Fit ${fitOf(a).score}</span><span>${Math.max(0, Math.round((NOW - new Date(a.applied)) / DAY))}d in system</span></div></article>`).join("")}</section>`; }).join("")}</div>
    <p class="sr" id="pipelive" aria-live="polite"></p>`;
  if (v._pipe) return; v._pipe = true;
  let dragId = null;
  v.addEventListener("dragstart", (e) => { const c = e.target.closest("[data-card]"); if (!c) return; dragId = c.dataset.card; c.classList.add("drag"); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", dragId); });
  v.addEventListener("dragend", (e) => e.target.closest?.("[data-card]")?.classList.remove("drag"));
  v.addEventListener("dragover", (e) => { const col = e.target.closest("[data-col]"); if (!col) return; e.preventDefault(); $$(".col", v).forEach((x) => x.classList.toggle("over", x === col)); });
  v.addEventListener("dragleave", (e) => { if (!e.relatedTarget || !v.contains(e.relatedTarget)) $$(".col", v).forEach((x) => x.classList.remove("over")); });
  v.addEventListener("drop", (e) => { const col = e.target.closest("[data-col]"); if (!col) return; e.preventDefault(); const a = S.apps.find((x) => x.id === (dragId || e.dataTransfer.getData("text/plain"))); if (a) { setStage(a, col.dataset.col); vPipeline(v); } });
  v.addEventListener("keydown", (e) => {
    const c = e.target.closest("[data-card]"); if (!c) return;
    const a = S.apps.find((x) => x.id === c.dataset.card); const i = D.STAGES.indexOf(a.stage);
    if (e.key === "Enter") return openApp(a.id);
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = D.STAGES[Math.min(D.STAGES.length - 1, Math.max(0, i + (e.key === "ArrowRight" ? 1 : -1)))];
    setStage(a, n); vPipeline(v); $(`[data-card="${a.id}"]`, v)?.focus(); $("#pipelive").textContent = `${a.name} moved to ${n}.`;
  });
  v.addEventListener("click", (e) => { const c = e.target.closest("[data-card]"); if (c && tab === "pipeline") openApp(c.dataset.card); });
}

function vRoles(v) {
  v.innerHTML = `<div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:flex-end"><div><h1>Roles</h1><p class="dsub">${S.roles.filter((r) => r.status === "Open").length} open, ${S.roles.filter((r) => r.status !== "Open").length} closed. Changes show on the careers site instantly.</p></div><button class="btn primary" data-newrole>New role</button></div>
  <div class="scroll"><table class="stack"><thead><tr><th>Role</th><th>Department</th><th>Type</th><th class="num">Applicants</th><th>Status</th><th>Actions</th></tr></thead><tbody>
  ${S.roles.map((r) => `<tr data-editrole="${r.id}" tabindex="0"><td class="nm"><b>${esc(r.title)}</b><span>${expTxt(r.exp)} · ${esc(r.pay)}</span></td><td>${esc(r.dept)}</td><td>${esc(r.type)}</td><td class="num">${S.apps.filter((a) => a.role === r.id).length}</td><td><span class="stage" data-s="${r.status === "Open" ? "Interview" : "Rejected"}">${r.status}</span></td>
    <td style="white-space:nowrap"><button class="link small" data-editrole="${r.id}">Edit</button> · <button class="link small" data-duprole="${r.id}">Duplicate</button> · <button class="link small" data-togglerole="${r.id}">${r.status === "Open" ? "Close" : "Reopen"}</button></td></tr>`).join("")}
  </tbody></table></div>`;
}
function openRoleEditor(id) {
  const r = id ? roleById(id) : { id: "", title: "", dept: D.DEPTS[0], location: "Lower Parel, Mumbai", type: "Full-time", exp: [1, 3], pay: "", problem: "", resp: [], must: [], nice: [], metrics: "", status: "Open", keys: [], langs: [] };
  const inp = (k, l, val, t = "text") => `<div class="field"><label for="re-${k}">${l}</label><input id="re-${k}" name="${k}" type="${t}" value="${esc(val)}"></div>`;
  const ta = (k, l, val, hint) => `<div class="field"><label for="re-${k}">${l}</label><textarea id="re-${k}" name="${k}">${esc(val)}</textarea>${hint ? `<p class="hint">${hint}</p>` : ""}</div>`;
  drawer.innerHTML = `<div class="dh"><b>${id ? "Edit role" : "New role"}</b><button class="x" data-close="drawer" aria-label="Close editor">×</button></div>
    <form class="db" id="roleform" style="display:grid;gap:18px">
      <section class="ai" style="margin:0"><div class="aih"><b>Draft with AI</b><span class="tag">Suggestion · edit before saving</span></div>
        <textarea id="re-bullets" placeholder="Paste a few bullets, e.g.&#10;- run creator shoots for 3 brands&#10;- 2+ years in production&#10;- fluent in Telugu" aria-label="Bullets for AI draft"></textarea>
        <button type="button" class="btn ghost sm" data-draftrole style="margin-top:10px">Draft the description</button></section>
      ${inp("title", "Role title", r.title)}
      <div class="two"><div class="field"><label for="re-dept">Department</label><select id="re-dept" name="dept">${D.DEPTS.map((d) => `<option ${d === r.dept ? "selected" : ""}>${d}</option>`).join("")}</select></div>
        <div class="field"><label for="re-type">Type</label><select id="re-type" name="type">${["Full-time", "Internship", "Contract"].map((d) => `<option ${d === r.type ? "selected" : ""}>${d}</option>`).join("")}</select></div></div>
      <div class="two">${inp("location", "Location", r.location || "Lower Parel, Mumbai")}${inp("pay", "Pay range", r.pay)}</div>
      <div class="two">${inp("exp0", "Min experience (yrs)", r.exp[0], "number")}${inp("exp1", "Max experience (yrs)", r.exp[1], "number")}</div>
      ${ta("problem", "The problem this person owns", r.problem, "One line. Candidates read this first.")}
      ${ta("resp", "Responsibilities", r.resp.join("\n"), "One per line.")}
      ${ta("must", "Must-have skills", r.must.join("\n"), "One per line. The AI fit score reads these.")}
      ${ta("nice", "Good to have", (r.nice || []).join("\n"), "One per line.")}
      ${ta("metrics", "How they'll know it's working", r.metrics)}
      <div class="field"><label for="re-status">Status</label><select id="re-status" name="status">${["Open", "Closed"].map((d) => `<option ${d === r.status ? "selected" : ""}>${d}</option>`).join("")}</select></div>
    </form>
    <div class="df"><span class="small muted" id="roleerr" aria-live="polite"></span><button class="btn primary" data-saverole="${r.id}">Save role</button></div>`;
  showDrawer(true);
}
function saveRole(id) {
  const g = (k) => $(`#re-${k}`, drawer).value.trim();
  const lines = (k) => g(k).split("\n").map((s) => s.trim()).filter(Boolean);
  if (!g("title")) { $("#roleerr").textContent = "Give the role a title."; $("#re-title").focus(); return; }
  const lo = Number(g("exp0")) || 0, hi = Math.max(lo, Number(g("exp1")) || lo);
  const must = lines("must");
  const data = { title: g("title"), dept: g("dept"), type: g("type"), location: g("location"), pay: g("pay"), exp: [lo, hi], problem: g("problem"), resp: lines("resp"), must, nice: lines("nice"), metrics: g("metrics"), status: g("status") };
  data.keys = [...new Set(must.join(" ").toLowerCase().match(/[a-z]{5,}/g) || [])].slice(0, 10);
  if (id) Object.assign(roleById(id), data);
  else S.roles.unshift({ ...data, id: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36).slice(-4), langs: [] });
  save(); closeDrawer(); renderTab(); renderChips(); renderRoles(); toast("Role saved. It's live on the careers site.");
}

function vForm(v) {
  const types = { text: "Short text", email: "Email", tel: "Phone", number: "Number", select: "Dropdown", dropdown: "Dropdown", yesno: "Yes / No", date: "Date", long: "Long answer", url: "Link", link: "Link", file: "File", langs: "Multi-select", consent: "Consent", dept: "Department", role: "Role", short: "Short text" };
  v.innerHTML = `<div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:flex-end"><div><h1>Application form</h1><p class="dsub">Toggle, require or reorder fields. Changes go live on the public form instantly.</p></div><button class="btn primary" data-preview>Preview live form <span class="arr" aria-hidden="true">→</span></button></div>
  ${D.STEPS.map((s) => { const fs = S.fields.filter((f) => f.step === s.id); return `<section class="fb-step"><h3>${s.label} <span class="muted" style="font-weight:400">· ${fs.filter((f) => f.on).length} shown</span></h3>
    ${fs.map((f) => `<div class="fbrow" data-fid="${f.id}"><span>${esc(f.label)}${f.custom ? ' <span class="muted small">(custom)</span>' : ""}</span><span class="t">${types[f.type] || f.type}</span>
      <label class="sw"><input type="checkbox" data-fon ${f.on ? "checked" : ""} ${f.locked ? "disabled" : ""} aria-label="Show ${esc(f.label)}">Shown</label>
      <label class="sw"><input type="checkbox" data-freq ${f.required ? "checked" : ""} ${f.locked || !f.on ? "disabled" : ""} aria-label="Require ${esc(f.label)}">Required</label>
      <span class="mv"><button data-fup aria-label="Move ${esc(f.label)} up">↑</button><button data-fdown aria-label="Move ${esc(f.label)} down">↓</button>${f.custom ? `<button data-fdel aria-label="Delete ${esc(f.label)}">×</button>` : ""}</span></div>`).join("")}</section>`; }).join("")}
  <section class="fb-step"><h3>Add a custom question</h3>
    <form id="addq" style="display:grid;gap:14px;margin-top:16px;max-width:640px">
      <div class="field"><label for="q-l">Question</label><input id="q-l" placeholder="e.g. Which regional creator would you sign first, and why?"></div>
      <div class="two"><div class="field"><label for="q-t">Answer type</label><select id="q-t"><option value="short">Short answer</option><option value="long">Long answer</option><option value="link">Link</option><option value="yesno">Yes / No</option><option value="dropdown">Dropdown</option></select></div>
      <div class="field"><label for="q-s">Step</label><select id="q-s">${D.STEPS.map((s) => `<option value="${s.id}" ${s.id === "about" ? "selected" : ""}>${s.label}</option>`).join("")}</select></div></div>
      <div class="field" id="q-ow" hidden><label for="q-o">Options</label><input id="q-o" placeholder="Comma separated, e.g. Tamil, Telugu, Kannada"></div>
      <label class="check"><input type="checkbox" id="q-r"> Required</label>
      <p class="err" id="q-e" aria-live="polite"></p>
      <div><button class="btn ghost" type="submit">Add question</button></div>
    </form></section>`;
  $("#q-t").addEventListener("change", (e) => ($("#q-ow").hidden = e.target.value !== "dropdown"));
  $("#addq").addEventListener("submit", (e) => {
    e.preventDefault();
    const label = $("#q-l").value.trim(), type = $("#q-t").value, opts = $("#q-o").value.split(",").map((s) => s.trim()).filter(Boolean);
    if (!label) return ($("#q-e").textContent = "Write the question first.");
    if (type === "dropdown" && opts.length < 2) return ($("#q-e").textContent = "Add at least two options.");
    S.fields.push({ step: $("#q-s").value, id: "c" + Date.now().toString(36), label, type: type === "short" ? "text" : type, options: opts, required: $("#q-r").checked, on: true, custom: true });
    save(); vForm(v); toast("Question added to the live form.");
  });
}
function fieldAction(e) {
  const row = e.target.closest("[data-fid]"); if (!row) return false;
  const i = S.fields.findIndex((f) => f.id === row.dataset.fid), f = S.fields[i];
  if (e.target.matches("[data-fon]")) { f.on = e.target.checked; if (!f.on) f.required = false; }
  else if (e.target.matches("[data-freq]")) f.required = e.target.checked;
  else if (e.target.matches("[data-fup],[data-fdown]")) {
    const up = e.target.matches("[data-fup]"); const same = S.fields.map((x, j) => [x, j]).filter(([x]) => x.step === f.step).map(([, j]) => j);
    const k = same.indexOf(i), j = same[k + (up ? -1 : 1)]; if (j == null) return true;
    [S.fields[i], S.fields[j]] = [S.fields[j], S.fields[i]];
  } else if (e.target.matches("[data-fdel]")) S.fields.splice(i, 1);
  else return false;
  save(); vForm($("#dview"));
  const again = $(`[data-fid="${f.id}"] ${e.target.matches("[data-fup]") ? "[data-fup]" : e.target.matches("[data-fdown]") ? "[data-fdown]" : "input"}`); again?.focus();
  return true;
}

const csvOf = () => {
  const cols = ["name", "email", "phone", "city", "role", "department", "stage", "total", "rel", "ctc", "ectc", "notice", "languages", "fit", "applied"];
  const q = (x) => `"${String(x ?? "").replace(/"/g, '""')}"`;
  return [cols.join(","), ...scopedApps().map((a) => { const r = roleById(a.role); return [a.name, a.email, a.phone, a.city, r?.title, r?.dept, a.stage, a.total, a.rel, P().hidePay ? "" : a.ctc, P().hidePay ? "" : a.ectc, a.notice, (a.langs || []).join(" / "), fitOf(a).score, a.applied.slice(0, 10)].map(q).join(","); })].join("\n");
};
function vExports(v) {
  v.innerHTML = `<h1>Exports</h1><p class="dsub">Take the data where you work.</p>
    <div class="cols" style="margin-top:0">
      <div class="blk"><h2>CSV</h2><p class="so">${scopedApps().length} applicants, all columns. Copy, then paste into Sheets or Excel.</p>
        <textarea readonly style="min-height:220px;font:13px/1.5 ui-monospace,Menlo,monospace" aria-label="CSV export">${esc(csvOf())}</textarea>
        <button class="btn primary" data-copycsv style="margin-top:12px">Copy CSV</button></div>
      <div class="blk"><h2>Google Sheet sync</h2><p class="so">Not connected in this prototype.</p>
        <p>In the production build, every new application and stage change writes a row to your hiring sheet within a minute, through a Google service account. One sheet, one tab per department.</p>
        <button class="btn ghost" disabled style="margin-top:16px">Connect Google Sheet</button>
        <p class="note" style="margin-top:10px">Setup steps are in the codebase README.</p>
        ${S.session.role === "admin" ? `<h2 style="margin-top:40px">Sample data</h2><p class="so">Bring back the starting applicants, roles and form.</p><button class="btn ghost" data-reset>Reset sample data</button>` : ""}</div>
    </div>`;
}

/* ================= events & routing ================= */
document.addEventListener("click", async (e) => {
  if (e.target.matches("[data-file]")) return;
  const t = e.target.closest("button, a, tr, [data-card], [data-drop]"); if (!t) { if (e.target === modal) closeModal(); return; }
  const d = t.dataset;
  if (d.tue) { const row = t.closest(".value"); const o = row.classList.toggle("open"); t.setAttribute("aria-expanded", o); return; }
  if (t.matches('a[href="#think"]')) showGame(0);
  if (d.game) return showGame(Number(d.game));
  if (d.gal) return galGo(gi + Number(d.gal));
  if (d.lad) { lad = Number(d.lad); $$("[data-lad]").forEach((b) => b.setAttribute("aria-pressed", b === t)); drawLadder(0, true); return; }
  if (d.lstep) return drawLadder(Number(d.lstep));
  if (d.lnext !== undefined) { const n = LADDERS[lad].steps.length; if (lstep < n - 1) drawLadder(lstep + 1); else { lad = (lad + 1) % LADDERS.length; $$("[data-lad]").forEach((b, k) => b.setAttribute("aria-pressed", k === lad)); drawLadder(0, true); } return; }
  if (d.tw) { tw = Number(d.tw); drawChain(null); return; }
  if (d.twopt) return drawChain(Number(d.twopt));
  if (d.q) { qa.push(d.q === "1"); drawQuiz(); $("#quiz .qopt")?.focus(); return; }
  if (d.qreset !== undefined) { qa = []; qorder = QUIZ.map(() => Math.random() < 0.5); drawQuiz(); $("#quiz .qopt")?.focus(); return; }
  if (d.dept) { dept = d.dept; renderChips(); renderRoles(); return; }
  if (d.role) return openRole(d.role);
  if (d.apply) return openApply(d.apply);
  if (d.close === "drawer") return closeDrawer();
  if (d.close === "modal") return closeModal();
  if (d.next !== undefined) { e.preventDefault(); return next(); }
  if (d.back !== undefined) { ap.step--; renderApply(); return; }
  if (d.seg) { ap.v[d.seg] = d.val; $$(`[data-seg="${d.seg}"]`, sheet).forEach((b) => b.setAttribute("aria-pressed", b === t)); showErr(S.fields.find((f) => f.id === d.seg), ""); autosave(); return; }
  if (d.multi) { const arr = ap.v[d.multi] || []; ap.v[d.multi] = arr.includes(d.val) ? arr.filter((x) => x !== d.val) : [...arr, d.val]; t.setAttribute("aria-pressed", ap.v[d.multi].includes(d.val)); autosave(); return; }
  if (t.matches("[data-drop]")) { $("[data-file]", sheet).click(); return; }
  if (d.tab) { tab = d.tab; renderDash(); return; }
  if (d.logout !== undefined) { S.session = null; save(); renderDash(); return; }
  if (d.sort) { F.dir = F.sort === d.sort ? -F.dir : 1; F.sort = d.sort; vApplicants($("#dview")); return; }
  if (d.clear !== undefined) { Object.assign(F, { q: "", dept: "", role: "", stage: "", exp: "", min: "", max: "", notice: "" }); vApplicants($("#dview")); return; }
  if (d.app && t.tagName === "TR") return openApp(d.app);
  if (d.score) { const a = S.apps.find((x) => x.id === drawer.dataset.app); a.score[d.score] = Number(d.val); save(); $$(`[data-score="${d.score}"]`, drawer).forEach((b) => b.setAttribute("aria-pressed", b === t)); return; }
  if (d.note !== undefined) { const a = S.apps.find((x) => x.id === drawer.dataset.app), txt = $("#newnote").value.trim(); if (!txt) return $("#newnote").focus(); a.notes.push({ text: txt, by: P().label, at: new Date().toISOString() }); save(); openApp(a.id); return; }
  if (d.regen !== undefined) { const a = S.apps.find((x) => x.id === drawer.dataset.app); a.ai = {}; save(); openApp(a.id); toast("Fresh suggestions drafted."); return; }
  if (d.email) { const a = S.apps.find((x) => x.id === drawer.dataset.app); $("#emailbox").innerHTML = `<textarea style="min-height:260px;margin-top:14px" aria-label="Email draft, editable">${esc(emailOf(a, d.email, S.session?.email?.split("@")[0]?.replace(/^\w/, (c) => c.toUpperCase()) || "Team"))}</textarea><button class="btn ghost sm" data-copyemail style="margin-top:8px">Copy email</button>`; return; }
  if (d.copyemail !== undefined) { try { await navigator.clipboard.writeText($("#emailbox textarea").value); toast("Email copied. Paste it into your mail app."); } catch (err) { $("#emailbox textarea").select(); toast("Copy blocked here. The text is selected: press Ctrl/Cmd + C."); } return; }
  if (d.copycsv !== undefined) { try { await navigator.clipboard.writeText(csvOf()); toast("CSV copied."); } catch (err) { $("textarea[readonly]").select(); toast("Copy blocked here. The text is selected: press Ctrl/Cmd + C."); } return; }
  if (d.reset !== undefined) { const s = S.session; S = seed(); S.session = s; save(); renderTab(); renderChips(); renderRoles(); toast("Sample data restored."); return; }
  if (d.newrole !== undefined) return openRoleEditor(null);
  if (d.editrole && (t.tagName === "BUTTON" || t.tagName === "TR")) return openRoleEditor(d.editrole);
  if (d.duprole) { const r = roleById(d.duprole); S.roles.unshift({ ...structuredClone(r), id: r.id + "-" + Date.now().toString(36).slice(-4), title: r.title + " (copy)", status: "Closed" }); save(); renderTab(); toast("Duplicated as a closed draft. Edit, then open it."); return; }
  if (d.togglerole) { const r = roleById(d.togglerole); r.status = r.status === "Open" ? "Closed" : "Open"; save(); renderTab(); renderChips(); renderRoles(); toast(`${r.title} is now ${r.status.toLowerCase()}.`); return; }
  if (d.saverole !== undefined) return saveRole(d.saverole);
  if (d.draftrole !== undefined) { const b = $("#re-bullets").value.trim(); if (!b) return $("#re-bullets").focus(); const o = draftRole($("#re-title").value, b); $("#re-problem").value = o.problem; $("#re-resp").value = o.resp.join("\n"); $("#re-must").value = o.must.join("\n"); if (!$("#re-metrics").value) $("#re-metrics").value = o.metrics; toast("Draft filled in. Edit before saving."); return; }
  if (d.preview !== undefined) return openApply(openRoles()[0]?.id);
});
document.addEventListener("change", (e) => { if (tab === "form" && document.body.classList.contains("dash") && fieldAction(e)) return; });
document.addEventListener("click", (e) => { if (tab === "form" && document.body.classList.contains("dash") && e.target.closest("[data-fup],[data-fdown],[data-fdel]")) fieldAction(e); });
document.addEventListener("input", (e) => {
  const map = { fq: "q", fdept: "dept", frole: "role", fstage: "stage", fexp: "exp", fmin: "min", fmax: "max", fnotice: "notice" };
  if (map[e.target.id]) { F[map[e.target.id]] = e.target.value; renderTable(); }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.matches("tr[data-app]")) openApp(e.target.dataset.app);
  if (e.key === "Enter" && e.target.matches("tr[data-editrole]")) openRoleEditor(e.target.dataset.editrole);
  if (e.key === "Escape") { if (modal.classList.contains("on")) closeModal(); else if (drawer.classList.contains("on")) closeDrawer(); }
  if (e.key === "Tab") {
    const box = modal.classList.contains("on") ? sheet : drawer.classList.contains("on") ? drawer : null; if (!box) return;
    const f = $$('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex="0"]', box).filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
});
scrim.addEventListener("click", () => { if (modal.classList.contains("on")) closeModal(); else closeDrawer(); });

function route() {
  const isDash = location.hash === "#dashboard";
  document.body.classList.toggle("dash", isDash);
  if (drawer.classList.contains("on")) closeDrawer();
  if (isDash) { renderDash(); window.scrollTo(0, 0); }
}
window.addEventListener("hashchange", route);
renderChips(); renderRoles(); observe(); route(); onScroll();
}
