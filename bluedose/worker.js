import { mcpHandler } from "../common.js";
import { GLP } from "./glp.js";
const SITES = ["Abdomen, left", "Abdomen, right", "Thigh, left", "Thigh, right", "Upper arm, left", "Upper arm, right"];
const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const tools = [
  { name: "next_injection_site", title: "Next injection site", description: "Suggest the least recently used of the six common subcutaneous injection sites from a history of sites (most recent last). Rotation helper only: it never recommends or calculates doses.",
    inputSchema: { type: "object", properties: { history: { type: "array", items: { type: "string", enum: SITES }, description: "past sites, most recent last" }, enabled: { type: "array", items: { type: "string", enum: SITES } } } },
    run: ({ history = [], enabled = SITES }) => { const last = {}; history.forEach((s, i) => (last[s] = i)); const next = [...enabled].sort((a, b) => (last[a] ?? -1) - (last[b] ?? -1))[0];
      return { next_site: next, sites: SITES, note: "Follow the instructions that come with your medicine and your healthcare provider.", more: "https://bluedoseapp.com/features/injection-site-rotation-app/" }; } },
  { name: "shot_day_countdown", title: "Days until shot day", description: "Days until the next weekly shot day (0 = today) for a weekday and a reference date. A countdown only.",
    inputSchema: { type: "object", properties: { shot_day: { type: "string", enum: DAYS }, today: { type: "string", description: "YYYY-MM-DD, default today (UTC)" } }, required: ["shot_day"] },
    run: ({ shot_day, today }) => { const d = today ? new Date(today + "T12:00:00Z") : new Date(); const n = (DAYS.indexOf(shot_day.toLowerCase()) - d.getUTCDay() + 7) % 7; if (DAYS.indexOf(shot_day.toLowerCase()) < 0) throw new Error("unknown day");
      return { days_until: n, shot_day, is_today: n === 0 }; } },
  { name: "glp1_search_interest", title: "GLP-1 search interest by country", description: "Average monthly Google searches for Mounjaro, Ozempic, Wegovy, Zepbound, Saxenda, tirzepatide and semaglutide in a country (ISO code, e.g. US, BR, JP), from Bluedose's open dataset (Google Keyword Planner, Nov 2026). Searches show interest, not prescriptions.",
    inputSchema: { type: "object", properties: { country: { type: "string", description: "ISO 3166-1 alpha-2 code" } }, required: ["country"] },
    run: ({ country }) => { const c = String(country).toUpperCase(); const r = GLP[c]; if (!r) return { found: false, countries: Object.keys(GLP) };
      return { found: true, country: c, monthly_searches: Object.fromEntries(Object.entries(r).filter(([k]) => k !== "lead")), top_brand: r.lead, dataset: "https://doi.org/10.5281/zenodo.24406001", write_up: "https://bluedoseapp.com/data/glp-1-searches-by-country/" }; } },
];
const handler = mcpHandler({ name: "com.bluedoseapp/glp1-tools", version: "1.0.0", title: "Bluedose GLP-1 Tools", website: "https://bluedoseapp.com/", instructions: "Injection-site rotation, shot-day countdown and GLP-1 search-interest data from Bluedose. Logging and data only: never gives dosing or medical advice.", tools });
export default { fetch: handler };
