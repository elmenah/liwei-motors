const fs = require("fs");
const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");

const envRaw = fs.readFileSync(".env", "utf8");
for (const line of envRaw.split(/\r?\n/)) {
  if (!line || line.trim().startsWith("#")) continue;
  const idx = line.indexOf("=");
  if (idx === -1) continue;
  const key = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trim().replace(/^"|"$/g, "");
  process.env[key] = value;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Faltan variables de Supabase en .env");
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const email = "admin@liweimotors.com";
  const password = "admin123";
  const hash = await bcrypt.hash(password, 10);

  const { data: existing, error: existingError } = await supabase
    .from("AdminUser")
    .select("id,email")
    .eq("email", email)
    .limit(1);

  if (existingError) throw existingError;

  if (existing && existing.length > 0) {
    const { error } = await supabase
      .from("AdminUser")
      .update({ password: hash, name: "Administrador" })
      .eq("email", email);

    if (error) throw error;
    console.log("Usuario admin actualizado");
    return;
  }

  const { error } = await supabase.from("AdminUser").insert({
    id: randomUUID(),
    email,
    password: hash,
    name: "Administrador",
  });

  if (error) throw error;
  console.log("Usuario admin creado");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
