import "server-only";

import { getLeads } from "@/lib/crm-data/get-leads";
import { getSheetsClient } from "@/lib/google-sheets";
import {
  buildCreateLeadPreview,
  CreateLeadInput,
  validateCreateLeadInput,
} from "@/lib/crm-write/contracts";
import { Lead } from "@/types/crm";

type CreateLeadSuccess = {
  success: true;
  leadId: string;
};

type CreateLeadFailure = {
  success: false;
  error: string;
  errors?: string[];
  code?: "VALIDATION" | "DUPLICATE" | "CONFIG" | "WRITE";
};

export type CreateLeadResult = CreateLeadSuccess | CreateLeadFailure;

const LEAD_ROW_LENGTH_WITH_ATTRIBUTION = 44;

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function extractLeadNumber(id: string) {
  const match = id.trim().match(/^VR-(\d+)$/i);
  if (!match) return 0;

  return Number.parseInt(match[1], 10) || 0;
}

function getMaxLeadNumber(leads: Lead[]) {
  return leads.reduce(
    (max, lead) => Math.max(max, extractLeadNumber(lead.id)),
    0
  );
}

function hasDuplicateLead(input: CreateLeadInput, leads: Lead[]) {
  const phone = normalizePhone(input.phone);
  const email = normalizeEmail(input.email);

  return leads.some((lead) => {
    const samePhone = phone && normalizePhone(lead.phone) === phone;
    const sameEmail = email && normalizeEmail(lead.email) === email;

    return Boolean(samePhone || sameEmail);
  });
}

function safeWriteError(error: unknown) {
  if (error instanceof Error && error.message) {
    if (error.message.includes("permission")) {
      return "No se pudo crear el lead: la Service Account no tiene permiso de editor en el Sheet.";
    }

    if (error.message.includes("insufficient authentication scopes")) {
      return "No se pudo crear el lead: el scope de Google Sheets no permite escritura.";
    }
  }

  return "No se pudo crear el lead en Google Sheets.";
}

export async function createLead(
  input: CreateLeadInput
): Promise<CreateLeadResult> {
  const validation = validateCreateLeadInput(input);

  if (!validation.valid) {
    return {
      success: false,
      code: "VALIDATION",
      error: "El lead no cumple las validaciones mínimas.",
      errors: validation.errors,
    };
  }

  const existingLeads = await getLeads();

  if (hasDuplicateLead(input, existingLeads)) {
    return {
      success: false,
      code: "DUPLICATE",
      error: "Ya existe un lead con este teléfono o email.",
    };
  }

  const { sheets, spreadsheetId } = await getSheetsClient();

  if (!sheets || !spreadsheetId) {
    return {
      success: false,
      code: "CONFIG",
      error: "No se pudo crear el lead: falta configuración de Google Sheets.",
    };
  }

  const maxLeadNumber = getMaxLeadNumber(existingLeads);
  const preview = buildCreateLeadPreview(input, maxLeadNumber);

  if (preview.values.length !== LEAD_ROW_LENGTH_WITH_ATTRIBUTION) {
    return {
      success: false,
      code: "WRITE",
      error: "No se pudo crear el lead: la fila preparada no coincide con el esquema Leads!A:AR.",
    };
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: preview.range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [preview.values],
      },
    });

    return {
      success: true,
      leadId: preview.id,
    };
  } catch (error) {
    console.error("Error creating lead in Google Sheets:", safeWriteError(error));

    return {
      success: false,
      code: "WRITE",
      error: safeWriteError(error),
    };
  }
}
