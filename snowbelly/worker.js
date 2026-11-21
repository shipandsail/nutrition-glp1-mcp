import { mcpHandler } from "../common.js";
import { FOODS } from "./foods.js";
const num = (v, name) => { const n = Number(v); if (!isFinite(n) || n <= 0) throw new Error(`${name} must be a positive number`); return n; };
const find = (q) => { const k = String(q || "").toLowerCase().trim(); return FOODS[k] ? [k, FOODS[k]] : Object.entries(FOODS).find(([n]) => n.includes(k) || k.includes(n)); };
const tools = [
  { name: "food_calories", title: "Calories in a food", description: "Calories, protein, fiber, carbs and fat for an everyday food (USDA FoodData Central values), per 100 g and per common portion, or for a given number of grams.",
    inputSchema: { type: "object", properties: { food: { type: "string", description: "e.g. banana, egg, rice, avocado" }, grams: { type: "number", description: "optional portion in grams" } }, required: ["food"] },
    run: ({ food, grams }) => { const f = find(food); if (!f) return { found: false, known_foods: Object.keys(FOODS) };
      const [n, v] = f; const scale = (g) => Object.fromEntries(Object.entries(v.per100).map(([k, x]) => [k, Math.round(x * g / 10) / 10]));
      return { found: true, food: n, per_100g: v.per100, portions: v.portions.map(([g, label]) => ({ label, grams: g, ...scale(g) })), ...(grams ? { for_grams: { grams, ...scale(grams) } } : {}), source: v.source, more: `https://snowbelly.app/foods/` }; } },
  { name: "daily_calories", title: "Daily calorie needs", description: "Estimated resting (BMR) and daily (TDEE) calories with the Mifflin-St Jeor equation, plus a gentle weight-loss target (TDEE - 500). Estimates for general wellness, not medical advice.",
    inputSchema: { type: "object", properties: { weight_kg: { type: "number" }, height_cm: { type: "number" }, age: { type: "number" }, sex: { type: "string", enum: ["female", "male"] }, activity: { type: "string", enum: ["sedentary", "light", "moderate", "very_active", "extra_active"] } }, required: ["weight_kg", "height_cm", "age", "sex"] },
    run: (a) => { const f = { sedentary: 1.2, light: 1.375, moderate: 1.55, very_active: 1.725, extra_active: 1.9 }[a.activity || "light"];
      const bmr = 10 * num(a.weight_kg, "weight_kg") + 6.25 * num(a.height_cm, "height_cm") - 5 * num(a.age, "age") + (a.sex === "male" ? 5 : -161);
      const tdee = bmr * f; return { bmr: Math.round(bmr), tdee: Math.round(tdee), gentle_loss_target: Math.round(Math.max(tdee - 500, a.sex === "male" ? 1500 : 1200)), activity_factor: f, method: "Mifflin-St Jeor (1990)", calculator: "https://snowbelly.app/tools/tdee-calculator/" }; } },
  { name: "protein_fiber_targets", title: "Protein and fiber targets", description: "Protein RDA (0.8 g/kg/day, a minimum) and fiber Adequate Intake (14 g per 1,000 kcal).",
    inputSchema: { type: "object", properties: { weight_kg: { type: "number" }, calories: { type: "number", description: "daily calories, default 2000" } }, required: ["weight_kg"] },
    run: (a) => ({ protein_rda_g: Math.round(0.8 * num(a.weight_kg, "weight_kg")), fiber_ai_g: Math.round((a.calories ? num(a.calories, "calories") : 2000) / 1000 * 14), sources: ["National Academies DRI", "IOM 2002 fiber AI"], calculator: "https://snowbelly.app/tools/protein-weight-loss-calculator/" }) },
  { name: "macro_calories", title: "Calories from macros", description: "Calories from grams of protein, carbs, fat and alcohol (4/4/9/7 kcal per gram).",
    inputSchema: { type: "object", properties: { protein_g: { type: "number" }, carbs_g: { type: "number" }, fat_g: { type: "number" }, alcohol_g: { type: "number" } } },
    run: (a) => { const p = +a.protein_g || 0, c = +a.carbs_g || 0, f = +a.fat_g || 0, al = +a.alcohol_g || 0; const kcal = 4 * p + 4 * c + 9 * f + 7 * al;
      return { calories: Math.round(kcal), split_percent: kcal ? { protein: Math.round(400 * p / kcal), carbs: Math.round(400 * c / kcal), fat: Math.round(900 * f / kcal), alcohol: Math.round(700 * al / kcal) } : null }; } },
];
const handler = mcpHandler({ name: "app.snowbelly/nutrition", version: "1.0.0", title: "Snowbelly Nutrition", website: "https://snowbelly.app/", instructions: "Nutrition lookups and calculators from Snowbelly. Food values come from USDA FoodData Central. Results are estimates for general wellness, not medical advice.", tools });
export default { fetch: handler };
