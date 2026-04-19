"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requestDeletion(locale: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  await supabase.from("deletion_requests").insert({
    user_id: user.id,
    email: user.email ?? "",
  });

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(`/${locale}?deleted=1`);
}
