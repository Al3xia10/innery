import { env } from "../config/env.js";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";

function normalizeStep(s) {
  return String(s || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function inferGoalCategory(title) {
  const t = String(title || "").toLowerCase();
  if (/anxiet|anxiety|panic|panică|panica/.test(t)) return "anxiety";
  if (/somn|sleep|insomni/.test(t)) return "sleep";
  if (/stres|stress|burnout/.test(t)) return "stress";
  if (/sport|mișcare|miscare|exercise|workout/.test(t)) return "movement";
  if (/mâncat|mancat|diet|nutri|greutate|weight/.test(t)) return "nutrition";
  if (/social|prieten|izolare|comunicare|relați|relatii/.test(t)) return "social";
  return "generic";
}

function fallbackSteps(title) {
  const cleanTitle = String(title || "").trim();
  const kind = inferGoalCategory(cleanTitle);

  if (kind === "anxiety") {
    return [
      "Alege 2 situații concrete care îți cresc anxietatea în această săptămână.",
      "Practică zilnic 5 minute respirație 4-6 (inspiri 4, expiri 6).",
      "Expune-te 10 minute la o situație evitata, dar sigură.",
      "Notează seara anxietatea (0-10) și ce tehnică a funcționat.",
    ];
  }

  if (kind === "sleep") {
    return [
      "Setează o oră fixă de culcare și trezire pentru următoarele 7 zile.",
      "Evită ecranele cu 30 minute înainte de somn.",
      "Creează un ritual de 10 minute (duș cald, lectură, respirație).",
      "Notează dimineața calitatea somnului (0-10) și orele dormite.",
    ];
  }

  if (kind === "stress") {
    return [
      "Identifică 3 situații care îți cresc cel mai mult stresul.",
      "Fă 2 pauze scurte zilnic (3-5 minute) pentru reglare.",
      "Stabilește o limită clară (un „nu”) pentru o sursă de suprasolicitare.",
      "Evaluează seara nivelul de stres (0-10) și ce a funcționat.",
    ];
  }

  if (kind === "movement") {
    return [
      "Alege 3 zile fixe pe săptămână pentru mișcare (minim 20 minute).",
      "Pregătește echipamentul din seara precedentă.",
      "Începe cu o sesiune scurtă (10-15 minute) dacă motivația e scăzută.",
      "Bifează fiecare sesiune și notează energia înainte/după (0-10).",
    ];
  }

  if (kind === "nutrition") {
    return [
      "Alege un comportament alimentar simplu pentru 7 zile (ex: mic dejun constant).",
      "Planifică 2 mese principale în avans pentru zilele aglomerate.",
      "Pregătește o alternativă sănătoasă pentru momentul în care apar poftele.",
      "Notează zilnic cât de ușor a fost să respecți planul (0-10).",
    ];
  }

  if (kind === "social") {
    return [
      "Alege 2 persoane cu care vrei să reiei contactul.",
      "Trimite primul mesaj simplu către una dintre ele în următoarele 24h.",
      "Stabilește o interacțiune scurtă în persoană sau video în această săptămână.",
      "Notează cum te-ai simțit înainte și după fiecare interacțiune (0-10).",
    ];
  }

  return [
    `Definește un rezultat clar pentru „${cleanTitle}” în următoarele 7 zile.`,
    `Alege o acțiune de 10 minute care te apropie de „${cleanTitle}”.`,
    `Programează 2 momente fixe în calendar pentru „${cleanTitle}”.`,
    `Evaluează la final de săptămână ce a mers pentru „${cleanTitle}”.`,
  ];
}

function looksTooGeneric(steps) {
  const genericPatterns = [
    /definește clar ce înseamnă/i,
    /alege un moment fix/i,
    /fă o acțiune mică/i,
    /notează ce a mers/i,
  ];
  return steps.some((s) => genericPatterns.some((p) => p.test(String(s))));
}

function extractJsonText(raw) {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
  }

  return trimmed;
}

export async function generateGoalStepsWithAi(goalTitle) {
  const title = String(goalTitle || "").trim();
  if (!title) return fallbackSteps(title);

  if (!env.ai.openaiApiKey) return fallbackSteps(title);

  try {
    const prompt =
      "Generează exact 4 pași practici, personalizați, pentru obiectivul clientului. " +
      "Pașii trebuie să fie specifici obiectivului, nu generici, și să poată fi bifați ușor în aplicație. " +
      "Fiecare pas: o singură propoziție, clară, acționabilă, max 14 cuvinte. " +
      "Evită complet formulele generale de tip «definește ce înseamnă reușit» sau «alege un moment fix». " +
      "Folosește limbaj concret, contextual, legat direct de obiectivul dat. " +
      "Răspunde STRICT JSON în format {\"steps\":[\"...\"]}. " +
      "Fără markdown, fără explicații suplimentare, fără numerotare. " +
      `Obiectiv: ${title}`;

    const resp = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.ai.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: env.ai.openaiModel,
        input: prompt,
        temperature: 0.4,
      }),
    });

    if (!resp.ok) {
      return fallbackSteps(title);
    }

    const data = await resp.json();
    const outputText = extractJsonText(String(data?.output_text ?? ""));
    if (!outputText) return fallbackSteps(title);

    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      return fallbackSteps(title);
    }

    const stepsRaw = Array.isArray(parsed?.steps) ? parsed.steps : [];
    const cleaned = stepsRaw
      .map(normalizeStep)
      .filter(Boolean)
      .slice(0, 5);

    if (cleaned.length < 3 || looksTooGeneric(cleaned)) return fallbackSteps(title);
    return cleaned;
  } catch {
    return fallbackSteps(title);
  }
}
