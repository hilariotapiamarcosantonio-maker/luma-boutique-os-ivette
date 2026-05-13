"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, X } from "lucide-react";
import {
  CreateLeadInput,
  validateCreateLeadInput,
} from "@/lib/crm-write/contracts";
import {
  agentOptions,
  clickIdTypeOptions,
  clientTypeOptions,
  operationTypeOptions,
  opportunityOptions,
  pipelineStageOptions,
  sourceChannelOptions,
  sourceOptions,
  sourceToChannel,
  temperatureOptions,
  zoneOptions,
} from "@/lib/crm-options";
import { Property } from "@/types/crm";

type CreateLeadModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (leadId: string) => void;
  properties: Property[];
};

type FieldConfig = {
  name: keyof CreateLeadInput;
  label: string;
  required?: boolean;
  type?: string;
  textarea?: boolean;
  options?: readonly string[];
  placeholder?: string;
  readOnly?: boolean;
  propertySelect?: boolean;
};

type FieldSection = {
  title: string;
  fields: FieldConfig[];
};

type SelectOption = {
  value: string;
  label: string;
};

const DEFAULT_FORM: CreateLeadInput = {
  name: "",
  phone: "",
  email: "",
  source: "",
  opp: "",
  budget: "",
  clientType: "",
  opType: "",
  zoneOfInterest: "",
  propIdOfInterest: "",
  propNameOfInterest: "",
  temperature: "Tibio",
  pipelineStage: "Nuevo lead",
  probability: "10",
  nextFollowUp: "",
  notes: "",
  agent: "Marcos Hilario",
  sourceChannel: "",
  campaignName: "",
  adSetName: "",
  adName: "",
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  utmContent: "",
  utmTerm: "",
  landingPage: "",
  referrer: "",
  clickId: "",
  clickIdType: "",
};

const FIELD_SECTIONS: FieldSection[] = [
  {
    title: "Datos básicos",
    fields: [
      { name: "name", label: "Nombre del lead", required: true },
      { name: "phone", label: "Teléfono o WhatsApp" },
      { name: "email", label: "Email", type: "email" },
      {
        name: "source",
        label: "Fuente",
        required: true,
        options: sourceOptions,
      },
    ],
  },
  {
    title: "Oportunidad inmobiliaria",
    fields: [
      {
        name: "opp",
        label: "Oportunidad / Modelo",
        options: opportunityOptions,
      },
      {
        name: "budget",
        label: "Presupuesto",
        placeholder: "Ej: 2500 o 150000",
      },
      {
        name: "clientType",
        label: "Tipo de cliente",
        options: clientTypeOptions,
      },
      {
        name: "opType",
        label: "Tipo de operación",
        options: operationTypeOptions,
      },
      {
        name: "zoneOfInterest",
        label: "Zona de interés",
        options: zoneOptions,
      },
      {
        name: "propIdOfInterest",
        label: "Propiedad de interés",
        propertySelect: true,
      },
      {
        name: "propNameOfInterest",
        label: "Referencia seleccionada",
        readOnly: true,
        placeholder: "Se completa al elegir una propiedad",
      },
    ],
  },
  {
    title: "Seguimiento comercial",
    fields: [
      {
        name: "temperature",
        label: "Temperatura",
        options: temperatureOptions,
      },
      {
        name: "pipelineStage",
        label: "Pipeline",
        required: true,
        options: pipelineStageOptions,
      },
      {
        name: "probability",
        label: "Probabilidad",
        type: "number",
        placeholder: "0 a 100",
      },
      { name: "nextFollowUp", label: "Próximo contacto", type: "date" },
      {
        name: "agent",
        label: "Asesor",
        options: agentOptions,
      },
      {
        name: "notes",
        label: "Notas",
        textarea: true,
        placeholder:
          "Detalle libre de oportunidad, intención, urgencia y próximo paso.",
      },
    ],
  },
  {
    title: "Atribución de campaña",
    fields: [
      {
        name: "sourceChannel",
        label: "Canal principal",
        options: sourceChannelOptions,
      },
      {
        name: "campaignName",
        label: "Campaña",
        placeholder: "Ej: Apartamentos Punta Cana Abril",
      },
      {
        name: "adSetName",
        label: "Conjunto de anuncios",
        placeholder: "Ej: Inversionistas RD / USA",
      },
      {
        name: "adName",
        label: "Anuncio",
        placeholder: "Ej: Video 01 - Penthouse",
      },
      {
        name: "utmSource",
        label: "UTM Source",
        placeholder: "facebook, instagram, google...",
      },
      {
        name: "utmMedium",
        label: "UTM Medium",
        placeholder: "paid_social, cpc, organic...",
      },
      {
        name: "utmCampaign",
        label: "UTM Campaign",
        placeholder: "campaña técnica o UTM",
      },
      {
        name: "utmContent",
        label: "UTM Content",
        placeholder: "creativo, anuncio o versión",
      },
      {
        name: "utmTerm",
        label: "UTM Term",
        placeholder: "keyword si aplica",
      },
      {
        name: "landingPage",
        label: "Landing",
        placeholder: "/inversor, /propiedades/penthouse...",
      },
      {
        name: "referrer",
        label: "Referrer",
        placeholder: "URL de referencia si aplica",
      },
      {
        name: "clickId",
        label: "Click ID",
        placeholder: "fbclid, gclid, ttclid...",
      },
      {
        name: "clickIdType",
        label: "Tipo de Click ID",
        options: clickIdTypeOptions,
      },
    ],
  },
];

type ApiResponse = {
  success: boolean;
  leadId?: string;
  error?: string;
  errors?: string[];
};

function toStaticOptions(options: readonly string[]): SelectOption[] {
  return options.map((option) => ({ value: option, label: option }));
}

function buildPropertyLabel(property: Property) {
  return [property.ref || property.id, property.zone, property.price]
    .filter(Boolean)
    .join(" / ");
}

export function CreateLeadModal({
  open,
  onClose,
  onCreated,
  properties,
}: CreateLeadModalProps) {
  const [form, setForm] = useState<CreateLeadInput>(DEFAULT_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [createdLeadId, setCreatedLeadId] = useState<string | null>(null);

  const propertyOptions = useMemo<SelectOption[]>(
    () => [
      { value: "", label: "Sin propiedad específica" },
      ...properties.map((property) => ({
        value: property.id,
        label: buildPropertyLabel(property),
      })),
    ],
    [properties]
  );

  useEffect(() => {
    if (!open) return;

    setForm(DEFAULT_FORM);
    setErrors([]);
    setIsSaving(false);
    setCreatedLeadId(null);
  }, [open]);

  if (!open) return null;

  function updateField(field: keyof CreateLeadInput, value: string) {
    setForm((current) => {
      if (field === "propIdOfInterest") {
        const property = properties.find((item) => item.id === value);

        return {
          ...current,
          propIdOfInterest: value,
          propNameOfInterest: value ? property?.ref ?? "" : "",
        };
      }

      const next = { ...current, [field]: value };

      if (field === "source" && !current.sourceChannel) {
        next.sourceChannel = sourceToChannel[value] ?? "";
      }

      return next;
    });
  }

  function getOptions(field: FieldConfig) {
    if (field.propertySelect) return propertyOptions;
    if (field.options) return toStaticOptions(field.options);
    return [];
  }

  function createAnotherLead() {
    setForm(DEFAULT_FORM);
    setErrors([]);
    setCreatedLeadId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors([]);

    const validation = validateCreateLeadInput(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success || !data.leadId) {
        setErrors(
          data.errors?.length
            ? data.errors
            : [data.error || "No se pudo crear el lead."]
        );
        return;
      }

      setCreatedLeadId(data.leadId);
      setForm(DEFAULT_FORM);
      onCreated(data.leadId);
    } catch {
      setErrors(["No se pudo conectar con el servidor para crear el lead."]);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <button
        type="button"
        aria-label="Cerrar formulario"
        className="absolute inset-0"
        onClick={isSaving ? undefined : onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-lead-title"
        className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg border border-crm-line bg-crm-bg2 shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-crm-line bg-crm-surface px-5 py-4">
          <div>
            <h2
              id="create-lead-title"
              className="text-lg font-semibold text-crm-text"
            >
              Añadir lead
            </h2>
            <p className="mt-1 text-sm text-crm-muted">
              Completa los datos comerciales antes de crear la fila en Google
              Sheets.
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            disabled={isSaving}
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-crm-line bg-crm-surface2 text-crm-muted transition-colors hover:text-crm-text disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {createdLeadId ? (
          <div className="max-h-[calc(90vh-84px)] overflow-y-auto p-5">
            <div className="rounded-md border border-crm-green/40 bg-crm-green/10 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-crm-green" />
                <div>
                  <p className="text-sm font-semibold text-crm-text">
                    Lead creado correctamente:{" "}
                    <span className="text-crm-green">{createdLeadId}</span>
                  </p>
                  <p className="mt-1 text-sm text-crm-muted">
                    Google Sheets ya recibió el nuevo registro.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-crm-line pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 items-center justify-center rounded-md border border-crm-line bg-crm-surface px-4 text-sm font-medium text-crm-muted transition-colors hover:text-crm-text"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={createAnotherLead}
                className="inline-flex h-10 items-center justify-center rounded-md border border-crm-line bg-crm-surface2 px-4 text-sm font-medium text-crm-text transition-colors hover:border-crm-gold hover:text-crm-gold"
              >
                Crear otro lead
              </button>
              <Link
                href={`/leads/${createdLeadId}`}
                className="inline-flex h-10 items-center justify-center rounded-md bg-crm-gold px-4 text-sm font-medium text-[#080B0E] transition-colors hover:bg-[#b59552]"
              >
                Ver lead creado
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex max-h-[calc(90vh-84px)] flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {errors.length > 0 ? (
                <div className="mb-5 rounded-md border border-crm-red/50 bg-crm-red/10 p-3 text-sm text-crm-text">
                  <p className="font-medium text-crm-red">
                    Revisa estos puntos:
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-crm-muted">
                    {errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="space-y-6">
                {FIELD_SECTIONS.map((section) => (
                  <section
                    key={section.title}
                    className="rounded-md border border-crm-line bg-crm-surface p-4"
                  >
                    <h3 className="mb-4 text-sm font-semibold text-crm-text">
                      {section.title}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {section.fields.map((field) => {
                        const id = `create-lead-${field.name}`;
                        const value = form[field.name] ?? "";
                        const options = getOptions(field);

                        return (
                          <label
                            key={field.name}
                            htmlFor={id}
                            className={
                              field.textarea ? "md:col-span-2" : undefined
                            }
                          >
                            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-crm-faint">
                              {field.label}
                              {field.required ? (
                                <span className="text-crm-gold"> *</span>
                              ) : null}
                            </span>
                            {field.textarea ? (
                              <textarea
                                id={id}
                                value={value}
                                placeholder={field.placeholder}
                                onChange={(event) =>
                                  updateField(field.name, event.target.value)
                                }
                                rows={4}
                                className="w-full rounded-md border border-crm-line bg-crm-surface2 px-3 py-2 text-sm text-crm-text placeholder:text-crm-faint focus:border-crm-gold focus:outline-none focus:ring-1 focus:ring-crm-gold"
                              />
                            ) : options.length > 0 ? (
                              <select
                                id={id}
                                value={value}
                                onChange={(event) =>
                                  updateField(field.name, event.target.value)
                                }
                                className="h-10 w-full rounded-md border border-crm-line bg-crm-surface2 px-3 text-sm text-crm-text focus:border-crm-gold focus:outline-none focus:ring-1 focus:ring-crm-gold"
                              >
                                {!field.propertySelect ? (
                                  <option value="">Seleccionar</option>
                                ) : null}
                                {options.map((option) => (
                                  <option
                                    key={`${field.name}-${option.value || "empty"}`}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                id={id}
                                type={field.type || "text"}
                                min={field.type === "number" ? 0 : undefined}
                                max={field.type === "number" ? 100 : undefined}
                                value={value}
                                readOnly={field.readOnly}
                                placeholder={field.placeholder}
                                onChange={(event) =>
                                  updateField(field.name, event.target.value)
                                }
                                className="h-10 w-full rounded-md border border-crm-line bg-crm-surface2 px-3 text-sm text-crm-text placeholder:text-crm-faint focus:border-crm-gold focus:outline-none focus:ring-1 focus:ring-crm-gold read-only:text-crm-muted"
                              />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>

              <p className="mt-4 text-xs text-crm-faint">
                Debes indicar teléfono o email. La probabilidad debe estar entre
                0 y 100.
              </p>

              <div className="mt-5 rounded-md border border-crm-line bg-crm-surface px-3 py-3 text-sm text-crm-muted">
                Se creará un nuevo lead en Google Sheets con etapa:{" "}
                <span className="font-semibold text-crm-text">
                  {form.pipelineStage || "sin seleccionar"}
                </span>{" "}
                y probabilidad:{" "}
                <span className="font-semibold text-crm-text">
                  {form.probability || "0"}%
                </span>
                .
              </div>
            </div>

            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-crm-line bg-crm-bg2 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isSaving}
                onClick={onClose}
                className="inline-flex h-10 items-center justify-center rounded-md border border-crm-line bg-crm-surface px-4 text-sm font-medium text-crm-muted transition-colors hover:text-crm-text disabled:pointer-events-none disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-10 items-center justify-center rounded-md bg-crm-gold px-4 text-sm font-medium text-[#080B0E] transition-colors hover:bg-[#b59552] disabled:pointer-events-none disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando
                  </>
                ) : (
                  "Guardar lead"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
