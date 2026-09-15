"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function ensureSubmission(visitId: string): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("field_visit_submissions")
    .select("id")
    .eq("field_visit_id", visitId)
    .eq("student_id", user.id)
    .maybeSingle<{ id: string }>();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("field_visit_submissions")
    .insert({
      field_visit_id: visitId,
      student_id: user.id,
      client_submission_id: randomUUID(),
    })
    .select("id")
    .single<{ id: string }>();

  if (error) throw error;
  return created.id;
}

export async function markSubmissionComplete(submissionId: string, visitId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("field_visit_submissions")
    .update({ status: "complete", submitted_at: new Date().toISOString() })
    .eq("id", submissionId);
  if (error) throw error;
  revalidatePath("/dashboard");
  revalidatePath(`/visits/${visitId}`);
}

export async function reopenSubmission(submissionId: string, visitId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("field_visit_submissions")
    .update({ status: "in_progress", submitted_at: null })
    .eq("id", submissionId);
  if (error) throw error;
  revalidatePath("/dashboard");
  revalidatePath(`/visits/${visitId}`);
}
