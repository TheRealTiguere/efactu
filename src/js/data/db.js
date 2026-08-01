import { createClient } from '@supabase/supabase-js';
import { defaultPlatforms } from './platforms.js';
import { defaultQuestions } from './questions.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseActive = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseActive 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

let cachedPlatforms = null;
let cachedQuestions = null;

export async function initDatabase() {
  // If already initialized
  if (cachedPlatforms && cachedQuestions) return;

  if (isSupabaseActive) {
    try {
      // 1. Fetch Platforms
      const { data: pData, error: pErr } = await supabase.from('platforms').select('*');
      if (pErr) throw pErr;
      
      if (pData && pData.length > 0) {
        cachedPlatforms = pData;
      } else {
        // Seed if empty
        const { error: seedErr } = await supabase.from('platforms').insert(defaultPlatforms);
        if (seedErr) throw seedErr;
        cachedPlatforms = defaultPlatforms;
      }

      // 2. Fetch Questions
      const { data: qData, error: qErr } = await supabase.from('questions').select('*').order('step', { ascending: true });
      if (qErr) throw qErr;

      if (qData && qData.length > 0) {
        // Map postgres json structure to JS
        cachedQuestions = qData;
      } else {
        // Seed if empty
        const { error: seedErr } = await supabase.from('questions').insert(defaultQuestions);
        if (seedErr) throw seedErr;
        cachedQuestions = defaultQuestions;
      }

      console.log("Supabase Connection: Active and Synchronized.");
    } catch (e) {
      console.warn("Supabase database load failed, falling back to LocalStorage:", e);
      loadFromLocalStorage();
    }
  } else {
    console.log("Supabase Credentials missing. LocalStorage Mode activated.");
    loadFromLocalStorage();
  }
}

function loadFromLocalStorage() {
  // Load platforms
  const pLocal = localStorage.getItem('efactu_platforms');
  if (!pLocal) {
    localStorage.setItem('efactu_platforms', JSON.stringify(defaultPlatforms));
    cachedPlatforms = defaultPlatforms;
  } else {
    cachedPlatforms = JSON.parse(pLocal);
  }

  // Load questions
  const qLocal = localStorage.getItem('efactu_questions');
  if (!qLocal) {
    localStorage.setItem('efactu_questions', JSON.stringify(defaultQuestions));
    cachedQuestions = defaultQuestions;
  } else {
    cachedQuestions = JSON.parse(qLocal);
  }
}

export function getCachedPlatforms() {
  if (!cachedPlatforms) {
    // If accessed before async init, try loading from local storage as immediate fallback
    loadFromLocalStorage();
  }
  return cachedPlatforms;
}

export function getCachedQuestions() {
  if (!cachedQuestions) {
    loadFromLocalStorage();
  }
  return cachedQuestions;
}

export async function savePlatformsDb(platformsList) {
  cachedPlatforms = platformsList;
  if (isSupabaseActive) {
    try {
      // Clear current rows and insert updated list
      await supabase.from('platforms').delete().neq('id', 'dummy');
      const { error } = await supabase.from('platforms').insert(platformsList);
      if (error) throw error;
    } catch (e) {
      console.error("Failed to save platforms to Supabase:", e);
      // Fallback
      localStorage.setItem('efactu_platforms', JSON.stringify(platformsList));
    }
  } else {
    localStorage.setItem('efactu_platforms', JSON.stringify(platformsList));
  }
}

export async function saveQuestionsDb(questionsList) {
  cachedQuestions = questionsList;
  if (isSupabaseActive) {
    try {
      await supabase.from('questions').delete().neq('id', 'dummy');
      const { error } = await supabase.from('questions').insert(questionsList);
      if (error) throw error;
    } catch (e) {
      console.error("Failed to save questions to Supabase:", e);
      localStorage.setItem('efactu_questions', JSON.stringify(questionsList));
    }
  } else {
    localStorage.setItem('efactu_questions', JSON.stringify(questionsList));
  }
}

// Leads Persistence
export async function saveLeadDb(lead) {
  if (isSupabaseActive) {
    try {
      const { error } = await supabase.from('leads').insert({
        lead_name: lead.leadName,
        lead_company: lead.leadCompany,
        lead_email: lead.leadEmail,
        lead_phone: lead.leadPhone,
        status: lead.status,
        volume: lead.volume,
        software: lead.software,
        budget: lead.budget,
        assistance: lead.assistance,
        raw_answers: lead
      });
      if (error) throw error;
    } catch (e) {
      console.error("Failed to save lead to Supabase, falling back to LocalStorage:", e);
      saveLeadToLocalStorage(lead);
    }
  } else {
    saveLeadToLocalStorage(lead);
  }
}

function saveLeadToLocalStorage(lead) {
  const leads = JSON.parse(localStorage.getItem('efactu_leads') || '[]');
  leads.push({
    id: Date.now(),
    date: new Date().toISOString(),
    ...lead
  });
  localStorage.setItem('efactu_leads', JSON.stringify(leads));
}

// Contact Requests Persistence
export async function saveContactDb(contact) {
  if (isSupabaseActive) {
    try {
      const { error } = await supabase.from('contacts').insert({
        name: contact.name,
        company: contact.company,
        email: contact.email,
        phone: contact.phone,
        message: contact.message
      });
      if (error) throw error;
    } catch (e) {
      console.error("Failed to save contact request to Supabase, falling back to LocalStorage:", e);
      saveContactToLocalStorage(contact);
    }
  } else {
    saveContactToLocalStorage(contact);
  }
}

function saveContactToLocalStorage(contact) {
  const contacts = JSON.parse(localStorage.getItem('efactu_contact_requests') || '[]');
  contacts.push({
    id: Date.now(),
    date: new Date().toISOString(),
    ...contact
  });
  localStorage.setItem('efactu_contact_requests', JSON.stringify(contacts));
}

// Fetch Leads list
export async function getLeadsListDb() {
  if (isSupabaseActive) {
    try {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ? data.map(l => ({
        id: l.id,
        date: l.created_at,
        leadName: l.lead_name,
        leadCompany: l.lead_company,
        leadEmail: l.lead_email,
        leadPhone: l.lead_phone,
        status: l.status,
        volume: l.volume,
        software: l.software,
        budget: l.budget,
        assistance: l.assistance
      })) : [];
    } catch (e) {
      console.error("Failed to fetch leads from Supabase:", e);
      return JSON.parse(localStorage.getItem('efactu_leads') || '[]');
    }
  } else {
    return JSON.parse(localStorage.getItem('efactu_leads') || '[]');
  }
}

// Fetch Contact Messages list
export async function getContactsListDb() {
  if (isSupabaseActive) {
    try {
      const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ? data.map(c => ({
        id: c.id,
        date: c.created_at,
        name: c.name,
        company: c.company,
        email: c.email,
        phone: c.phone,
        message: c.message
      })) : [];
    } catch (e) {
      console.error("Failed to fetch contacts from Supabase:", e);
      return JSON.parse(localStorage.getItem('efactu_contact_requests') || '[]');
    }
  } else {
    return JSON.parse(localStorage.getItem('efactu_contact_requests') || '[]');
  }
}

// Clear lists from DB
export async function clearLeadsDb() {
  if (isSupabaseActive) {
    await supabase.from('leads').delete().neq('id', 0);
  } else {
    localStorage.removeItem('efactu_leads');
  }
}

export async function clearContactsDb() {
  if (isSupabaseActive) {
    await supabase.from('contacts').delete().neq('id', 0);
  } else {
    localStorage.removeItem('efactu_contact_requests');
  }
}
