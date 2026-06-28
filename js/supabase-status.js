const SUPABASE_URL = "https://bfetmiogjtklzhhmbnnq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_sm0CDt0xsnrIKImQ3oFIIA_HNiBBj3_";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

async function loadBoothStatus(boothId) {
  const { data, error } = await supabaseClient
    .from("booths")
    .select("id, name, status, message, updated_at")
    .eq("id", boothId)
    .single();

  if (error) throw error;
  return data;
}

async function updateBoothStatus(boothId, status, message) {
  const { data, error } = await supabaseClient
    .from("booths")
    .update({
      status,
      message: message.trim() || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", boothId)
    .select("id, name, status, message, updated_at")
    .single();

  if (error) throw error;
  return data;
}

async function login(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data.user;
}

async function logout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
}

async function getCurrentUser() {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) throw error;
  return data.session?.user || null;
}

window.boothStatusApi = {
  loadBoothStatus,
  updateBoothStatus,
  login,
  logout,
  getCurrentUser
};
