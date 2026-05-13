export interface Lead {
  id: string;
  date: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  landing: string;
  opp: string;
  budget: string;
  priority: string;
  status: string;
  lastContact: string;
  nextFollowUp: string;
  agent: string;
  notes: string;
  tags: string;
  result: string;
  action: string;
  // Inmobiliaria
  propIdOfInterest: string;
  propNameOfInterest: string;
  clientType: string;
  opType: string;
  zoneOfInterest: string;
  temperature: string;
  potentialComm: string;
  pipelineStage: string;
  probability: string;
  sourceChannel?: string;
  campaignName?: string;
  adSetName?: string;
  adName?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  landingPage?: string;
  referrer?: string;
  clickId?: string;
  clickIdType?: string;
}

export interface Property {
  id: string;
  ref: string;
  type: string;
  operation: string;
  zone: string;
  address: string;
  price: string;
  currency: string;
  maintenance: string;
  beds: string;
  baths: string;
  parking: string;
  m2: string;
  furnished: string;
  airbnbReady: string;
  corp: string;
  retirement: string;
  investment: string;
  status: string;
  owner: string;
  expectedComm: string;
  agent: string;
  notes: string;
  img: string;
}

export interface Visit {
  id: string;
  date: string;
  time: string;
  leadId: string;
  propId: string;
  agent: string;
  status: string;
  interest: string;
  comments: string;
  nextStep: string;
}

export interface Closing {
  id: string;
  date: string;
  leadId: string;
  propId: string;
  type: string;
  price: string;
  currency: string;
  commPct: string;
  commGross: string;
  status: string;
  invoiceDate: string;
  notes: string;
}

export interface DashboardData {
  totalLeads: number;
  visitasAgendadas: number;
  cierresGanados: number;
  comisionesAcumuladas: string;
  funnelData: { name: string; value: number; fill: string }[];
  upcomingVisits: Visit[];
}
