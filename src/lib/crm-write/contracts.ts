import {
  agentOptions,
  clickIdTypeOptions,
  clientTypeOptions,
  operationTypeOptions,
  opportunityOptions,
  pipelineStageOptions,
  pipelineStageToStatus,
  sourceChannelOptions,
  sourceOptions,
  temperatureOptions,
  zoneOptions,
} from "@/lib/crm-options";

export type CreateLeadInput = {
  name: string;
  phone: string;
  email: string;
  source: string;
  opp: string;
  budget: string;
  clientType: string;
  opType: string;
  zoneOfInterest: string;
  propIdOfInterest: string;
  propNameOfInterest: string;
  temperature: string;
  pipelineStage: string;
  probability: string;
  nextFollowUp: string;
  notes: string;
  agent: string;
  sourceChannel: string;
  campaignName: string;
  adSetName: string;
  adName: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  landingPage: string;
  referrer: string;
  clickId: string;
  clickIdType: string;
};

type LeadSheetColumnKey =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z"
  | "AA"
  | "AB"
  | "AC"
  | "AD"
  | "AE"
  | "AF"
  | "AG"
  | "AH"
  | "AI"
  | "AJ"
  | "AK"
  | "AL"
  | "AM"
  | "AN"
  | "AO"
  | "AP"
  | "AQ"
  | "AR";

export type CreateLeadPreviewRow = {
  id: string;
  date: string;
  range: "Leads!A:AR";
  columns: Record<LeadSheetColumnKey, string>;
  values: string[];
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

const LEAD_SHEET_COLUMNS: LeadSheetColumnKey[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "AA",
  "AB",
  "AC",
  "AD",
  "AE",
  "AF",
  "AG",
  "AH",
  "AI",
  "AJ",
  "AK",
  "AL",
  "AM",
  "AN",
  "AO",
  "AP",
  "AQ",
  "AR",
];

const EMPTY_LEAD_COLUMNS: Record<LeadSheetColumnKey, string> = {
  A: "",
  B: "",
  C: "",
  D: "",
  E: "",
  F: "",
  G: "",
  H: "",
  I: "",
  J: "",
  K: "",
  L: "",
  M: "",
  N: "",
  O: "",
  P: "",
  Q: "",
  R: "",
  S: "",
  T: "",
  U: "",
  V: "",
  W: "",
  X: "",
  Y: "",
  Z: "",
  AA: "",
  AB: "",
  AC: "",
  AD: "",
  AE: "",
  AF: "",
  AG: "",
  AH: "",
  AI: "",
  AJ: "",
  AK: "",
  AL: "",
  AM: "",
  AN: "",
  AO: "",
  AP: "",
  AQ: "",
  AR: "",
};

function clean(value: string | null | undefined) {
  return String(value ?? "").trim();
}

function formatSheetDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/La_Paz",
  }).formatToParts(date);

  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";

  return `${day}/${month}/${year}`;
}

function buildSuggestedLeadId(existingLeadCount: number) {
  const nextNumber = Math.max(0, Math.floor(existingLeadCount)) + 1;
  return `VR-${String(nextNumber).padStart(4, "0")}`;
}

function isAllowed(value: string, options: readonly string[]) {
  return options.includes(value);
}

function validateRequiredOption({
  value,
  options,
  message,
  errors,
}: {
  value: string;
  options: readonly string[];
  message: string;
  errors: string[];
}) {
  if (value && !isAllowed(value, options)) {
    errors.push(message);
  }
}

function validateOptionalOption({
  value,
  options,
  message,
  errors,
}: {
  value: string;
  options: readonly string[];
  message: string;
  errors: string[];
}) {
  if (value && !isAllowed(value, options)) {
    errors.push(message);
  }
}

export function validateCreateLeadInput(
  input: CreateLeadInput
): ValidationResult {
  const errors: string[] = [];
  const probability = clean(input.probability);
  const source = clean(input.source);
  const opp = clean(input.opp);
  const clientType = clean(input.clientType);
  const opType = clean(input.opType);
  const zoneOfInterest = clean(input.zoneOfInterest);
  const temperature = clean(input.temperature);
  const pipelineStage = clean(input.pipelineStage);
  const agent = clean(input.agent);
  const sourceChannel = clean(input.sourceChannel);
  const clickIdType = clean(input.clickIdType);

  if (!clean(input.name)) {
    errors.push("El nombre del lead es obligatorio.");
  }

  if (!clean(input.phone) && !clean(input.email)) {
    errors.push("Debes indicar al menos teléfono o email.");
  }

  if (!clean(input.source)) {
    errors.push("Indica de dónde llegó el lead.");
  }

  if (!clean(input.pipelineStage)) {
    errors.push("Selecciona la etapa comercial inicial.");
  }

  validateRequiredOption({
    value: source,
    options: sourceOptions,
    message:
      "El valor de Fuente no es válido. Selecciona una opción de la lista.",
    errors,
  });

  validateRequiredOption({
    value: pipelineStage,
    options: pipelineStageOptions,
    message:
      "El valor de Pipeline no es válido. Selecciona una opción de la lista.",
    errors,
  });

  validateOptionalOption({
    value: sourceChannel,
    options: sourceChannelOptions,
    message:
      "El valor de Canal principal no es válido. Selecciona una opción de la lista.",
    errors,
  });

  validateOptionalOption({
    value: opp,
    options: opportunityOptions,
    message:
      "El valor de Oportunidad / Modelo no es válido. Selecciona una opción de la lista.",
    errors,
  });

  validateOptionalOption({
    value: clientType,
    options: clientTypeOptions,
    message:
      "El valor de Tipo de cliente no es válido. Selecciona una opción de la lista.",
    errors,
  });

  validateOptionalOption({
    value: opType,
    options: operationTypeOptions,
    message:
      "El valor de Tipo de operación no es válido. Selecciona una opción de la lista.",
    errors,
  });

  validateOptionalOption({
    value: zoneOfInterest,
    options: zoneOptions,
    message:
      "El valor de Zona de interés no es válido. Selecciona una opción de la lista.",
    errors,
  });

  validateOptionalOption({
    value: temperature,
    options: temperatureOptions,
    message:
      "El valor de Temperatura no es válido. Selecciona una opción de la lista.",
    errors,
  });

  validateOptionalOption({
    value: agent,
    options: agentOptions,
    message:
      "El valor de Asesor no es válido. Selecciona una opción de la lista.",
    errors,
  });

  validateOptionalOption({
    value: clickIdType,
    options: clickIdTypeOptions,
    message:
      "El valor de Tipo de Click ID no es válido. Selecciona una opción de la lista.",
    errors,
  });

  if (probability) {
    const numericProbability = Number(probability.replace(",", "."));
    if (
      Number.isNaN(numericProbability) ||
      numericProbability < 0 ||
      numericProbability > 100
    ) {
      errors.push("La probabilidad debe estar entre 0 y 100.");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function buildCreateLeadPreview(
  input: CreateLeadInput,
  existingLeadCount: number
): CreateLeadPreviewRow {
  const id = buildSuggestedLeadId(existingLeadCount);
  const date = formatSheetDate();
  const normalizedInput: CreateLeadInput = {
    name: clean(input.name),
    phone: clean(input.phone),
    email: clean(input.email),
    source: clean(input.source),
    opp: clean(input.opp),
    budget: clean(input.budget),
    clientType: clean(input.clientType),
    opType: clean(input.opType),
    zoneOfInterest: clean(input.zoneOfInterest),
    propIdOfInterest: clean(input.propIdOfInterest),
    propNameOfInterest: clean(input.propNameOfInterest),
    temperature: clean(input.temperature),
    pipelineStage: clean(input.pipelineStage),
    probability: clean(input.probability),
    nextFollowUp: clean(input.nextFollowUp),
    notes: clean(input.notes),
    agent: clean(input.agent),
    sourceChannel: clean(input.sourceChannel),
    campaignName: clean(input.campaignName),
    adSetName: clean(input.adSetName),
    adName: clean(input.adName),
    utmSource: clean(input.utmSource),
    utmMedium: clean(input.utmMedium),
    utmCampaign: clean(input.utmCampaign),
    utmContent: clean(input.utmContent),
    utmTerm: clean(input.utmTerm),
    landingPage: clean(input.landingPage),
    referrer: clean(input.referrer),
    clickId: clean(input.clickId),
    clickIdType: clean(input.clickIdType),
  };

  const columns: Record<LeadSheetColumnKey, string> = {
    ...EMPTY_LEAD_COLUMNS,
    A: id,
    B: date,
    C: normalizedInput.name,
    D: normalizedInput.email,
    E: normalizedInput.phone,
    F: normalizedInput.source,
    H: normalizedInput.opp,
    I: normalizedInput.budget,
    L: pipelineStageToStatus[normalizedInput.pipelineStage] ?? "",
    N: normalizedInput.nextFollowUp,
    O: normalizedInput.agent,
    P: normalizedInput.notes,
    U: normalizedInput.propIdOfInterest,
    V: normalizedInput.propNameOfInterest,
    W: normalizedInput.clientType,
    X: normalizedInput.opType,
    Y: normalizedInput.zoneOfInterest,
    Z: normalizedInput.temperature,
    AB: normalizedInput.pipelineStage,
    AC: normalizedInput.probability,
    AF: normalizedInput.sourceChannel,
    AG: normalizedInput.campaignName,
    AH: normalizedInput.adSetName,
    AI: normalizedInput.adName,
    AJ: normalizedInput.utmSource,
    AK: normalizedInput.utmMedium,
    AL: normalizedInput.utmCampaign,
    AM: normalizedInput.utmContent,
    AN: normalizedInput.utmTerm,
    AO: normalizedInput.landingPage,
    AP: normalizedInput.referrer,
    AQ: normalizedInput.clickId,
    AR: normalizedInput.clickIdType,
  };

  return {
    id,
    date,
    range: "Leads!A:AR",
    columns,
    values: LEAD_SHEET_COLUMNS.map((column) => columns[column]),
  };
}
