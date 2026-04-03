import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://eaomcxofnifycblhxnhc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhb21jeG9mbmlmeWNibGh4bmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyOTQ1MjMsImV4cCI6MjA4ODg3MDUyM30.kZS6FxdsIjRCABBYglbVdMvlhSlz83hefZMRyED4Bnk"
);
