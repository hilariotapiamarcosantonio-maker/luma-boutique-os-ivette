import { NextResponse } from "next/server";
import { createLead } from "@/lib/crm-write/create-lead";
import {
  CreateLeadInput,
  validateCreateLeadInput,
} from "@/lib/crm-write/contracts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CREATE_LEAD_FIELDS: (keyof CreateLeadInput)[] = [
  "name",
  "phone",
  "email",
  "source",
  "opp",
  "budget",
  "clientType",
  "opType",
  "zoneOfInterest",
  "propIdOfInterest",
  "propNameOfInterest",
  "temperature",
  "pipelineStage",
  "probability",
  "nextFollowUp",
  "notes",
  "agent",
  "sourceChannel",
  "campaignName",
  "adSetName",
  "adName",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmContent",
  "utmTerm",
  "landingPage",
  "referrer",
  "clickId",
  "clickIdType",
];

function toCreateLeadInput(payload: unknown): CreateLeadInput {
  const source =
    typeof payload === "object" && payload !== null
      ? (payload as Partial<Record<keyof CreateLeadInput, unknown>>)
      : {};

  return CREATE_LEAD_FIELDS.reduce((input, field) => {
    input[field] = String(source[field] ?? "");
    return input;
  }, {} as CreateLeadInput);
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "El cuerpo de la solicitud debe ser JSON válido.",
      },
      { status: 400 }
    );
  }

  const input = toCreateLeadInput(payload);
  const validation = validateCreateLeadInput(input);

  if (!validation.valid) {
    return NextResponse.json(
      {
        success: false,
        error: "El lead no cumple las validaciones mínimas.",
        errors: validation.errors,
      },
      { status: 400 }
    );
  }

  const result = await createLead(input);

  if (!result.success) {
    const status = result.code === "DUPLICATE" || result.code === "VALIDATION" ? 400 : 500;

    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result, { status: 201 });
}
