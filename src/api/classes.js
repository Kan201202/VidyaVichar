// Demo-only (localStorage) class/session API
const DEMO = true;
const KEY = "vv_demo_classes";
const ACTIVE_KEY = "vv_demo_active_class";

function load() { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
function save(v) { localStorage.setItem(KEY, JSON.stringify(v)); }
function getActive() { return JSON.parse(localStorage.getItem(ACTIVE_KEY) || "null"); }
function setActive(c) { localStorage.setItem(ACTIVE_KEY, JSON.stringify(c)); }

export async function listClasses() {
  return load().sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt));
}

export async function startClass({ name }) {
  const cls = {
    id: `${Date.now()}`,
    name: name || `Class ${new Date().toLocaleString()}`,
    status: "active",
    startedAt: new Date().toISOString(),
    endedAt: null,
  };
  const all = load();
  all.unshift(cls); save(all);
  setActive(cls);
  return cls;
}

export async function endClass(id) {
  const all = load();
  const i = all.findIndex(c => c.id === id);
  if (i < 0) throw new Error("Class not found");
  all[i].status = "ended";
  all[i].endedAt = new Date().toISOString();
  save(all);
  setActive(null);
  return all[i];
}

export async function getActiveClass() {
  return getActive();
}
