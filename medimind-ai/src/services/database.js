import { supabase } from "../supabaseClient";

// Get all medications
export const getMedications = async () => {
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .order("time", { ascending: true });

  if (error) throw error;
  return data;
};

// Add new medication
export const addMedication = async (medication) => {
  const { data, error } = await supabase
    .from("medications")
    .insert([medication])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update medication
export const updateMedication = async (id, updates) => {
  const { data, error } = await supabase
    .from("medications")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete medication
export const deleteMedication = async (id) => {
  const { error } = await supabase.from("medications").delete().eq("id", id);

  if (error) throw error;
};

// Upload image to storage
export const uploadDrugImage = async (file) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("drug-images")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("drug-images").getPublicUrl(fileName);

  return publicUrl;
};
