/* eslint-disable @typescript-eslint/no-explicit-any */

import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type AnyRecord = Record<string, unknown>;

function ensureEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function nowIso() {
  return new Date().toISOString();
}

function mapById<T extends { id: string }>(rows: T[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

function groupBy<T>(rows: T[], getKey: (row: T) => string) {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const key = getKey(row);
    const current = grouped.get(key) ?? [];
    current.push(row);
    grouped.set(key, current);
  }
  return grouped;
}

function asErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Unknown database error";
}

async function run<T>(promise: PromiseLike<{ data: T; error: unknown }>) {
  const { data, error } = await promise;
  if (error) throw new Error(asErrorMessage(error));
  return data;
}

function applyProductWhere(query: any, where: any) {
  if (!where) return query;
  if (typeof where.available === "boolean") query = query.eq("available", where.available);
  if (typeof where.featured === "boolean") query = query.eq("featured", where.featured);
  if (typeof where.categoryId === "string") query = query.eq("categoryId", where.categoryId);
  if (where.NOT?.slug) query = query.neq("slug", where.NOT.slug);
  if (where.name?.contains) query = query.ilike("name", `%${where.name.contains}%`);
  return query;
}

function applyProductOrder(query: any, orderBy: any) {
  if (!orderBy) return query.order("createdAt", { ascending: false });

  if (Array.isArray(orderBy)) {
    let current = query;
    for (const entry of orderBy) {
      const [[column, direction]] = Object.entries(entry);
      current = current.order(column, { ascending: direction === "asc" });
    }
    return current;
  }

  const [[column, direction]] = Object.entries(orderBy);
  return query.order(column, { ascending: direction === "asc" });
}

async function enrichProducts(
  supabase: SupabaseClient,
  products: AnyRecord[],
  include?: AnyRecord
) {
  if (products.length === 0 || !include) return products;

  const productIds = products.map((p) => String(p.id));
  const categoryIds = [...new Set(products.map((p) => String(p.categoryId)))];

  const [imagesRaw, colorsRaw, specsRaw, categoriesRaw] = await Promise.all([
    include.images
      ? run(
          supabase
            .from("ProductImage")
            .select("*")
            .in("productId", productIds)
            .order("order", { ascending: true })
        )
      : Promise.resolve([]),
    include.colors
      ? run(supabase.from("ProductColor").select("*").in("productId", productIds))
      : Promise.resolve([]),
    include.specs
      ? run(supabase.from("ProductSpec").select("*").in("productId", productIds))
      : Promise.resolve([]),
    include.category
      ? run(supabase.from("Category").select("*").in("id", categoryIds))
      : Promise.resolve([]),
  ]);

  const imagesGrouped = groupBy(imagesRaw as AnyRecord[], (row) => String(row.productId));
  const colorsGrouped = groupBy(colorsRaw as AnyRecord[], (row) => String(row.productId));
  const specsGrouped = groupBy(specsRaw as AnyRecord[], (row) => String(row.productId));
  const categoriesById = mapById(categoriesRaw as { id: string }[]);

  return products.map((product) => {
    const item: AnyRecord = { ...product };

    if (include.images) {
      const allImages = imagesGrouped.get(String(product.id)) ?? [];
      const take = include.images && typeof include.images === "object" ? (include.images as any).take : undefined;
      item.images = typeof take === "number" ? allImages.slice(0, take) : allImages;
    }
    if (include.colors) item.colors = colorsGrouped.get(String(product.id)) ?? [];
    if (include.specs) item.specs = specsGrouped.get(String(product.id)) ?? [];
    if (include.category) item.category = categoriesById.get(String(product.categoryId)) ?? null;
    if (include._count) {
      item._count = {
        images: (imagesGrouped.get(String(product.id)) ?? []).length,
        colors: (colorsGrouped.get(String(product.id)) ?? []).length,
      };
    }

    return item;
  });
}

function createSupabaseClient(): any {
  const url = ensureEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ensureEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return {
    product: {
      async findMany(args?: any) {
        const where = args?.where;
        const include = args?.include;
        const take = args?.take;

        let query: any = supabase.from("Product").select("*");

        if (where?.category?.slug) {
          const categories = await run(
            supabase.from("Category").select("id").eq("slug", where.category.slug).limit(1)
          );
          const categoryId = (categories as AnyRecord[])[0]?.id;
          if (!categoryId) return [];
          query = query.eq("categoryId", String(categoryId));
        }

        query = applyProductWhere(query, where);
        query = applyProductOrder(query, args?.orderBy);
        if (typeof take === "number") query = query.limit(take);

        const rows = (await run(query)) as AnyRecord[];
        return enrichProducts(supabase, rows, include);
      },

      async findUnique(args: any) {
        const where = args?.where ?? {};
        let query: any = supabase.from("Product").select("*");

        if (where.id) query = query.eq("id", where.id);
        if (where.slug) query = query.eq("slug", where.slug);

        const rows = (await run(query.limit(1))) as AnyRecord[];
        const product = rows[0];
        if (!product) return null;

        const [enriched] = await enrichProducts(supabase, [product], args?.include);
        return enriched;
      },

      async create(args: any) {
        const data = args?.data ?? {};
        const productId = randomUUID();

        const productInsert: AnyRecord = {
          id: productId,
          name: data.name,
          slug: data.slug,
          description: data.description ?? null,
          price: data.price ?? null,
          featured: data.featured ?? false,
          available: data.available ?? true,
          isNew: data.isNew ?? false,
          isOffer: data.isOffer ?? false,
          categoryId: data.categoryId,
          updatedAt: nowIso(),
        };

        const productRows = await run(supabase.from("Product").insert(productInsert).select("*").limit(1));
        const product = (productRows as AnyRecord[])[0];

        const colorRows = (data.colors?.create ?? []).map((row: AnyRecord) => ({
          id: randomUUID(),
          name: row.name,
          hex: row.hex,
          productId,
        }));
        const specRows = (data.specs?.create ?? []).map((row: AnyRecord) => ({
          id: randomUUID(),
          label: row.label,
          value: row.value,
          productId,
        }));
        const imageRows = (data.images?.create ?? []).map((row: AnyRecord, index: number) => ({
          id: randomUUID(),
          url: row.url,
          alt: row.alt ?? null,
          order: row.order ?? index,
          productId,
        }));

        await Promise.all([
          colorRows.length ? run(supabase.from("ProductColor").insert(colorRows)) : Promise.resolve(null),
          specRows.length ? run(supabase.from("ProductSpec").insert(specRows)) : Promise.resolve(null),
          imageRows.length ? run(supabase.from("ProductImage").insert(imageRows)) : Promise.resolve(null),
        ]);

        return product;
      },

      async update(args: any) {
        const id = args?.where?.id;
        const data = args?.data ?? {};

        const productUpdate: AnyRecord = Object.fromEntries(
          Object.entries({
            name: data.name,
            slug: data.slug,
            description: data.description ?? null,
            price: data.price ?? null,
            featured: data.featured ?? false,
            available: data.available ?? true,
            isNew: data.isNew ?? false,
            isOffer: data.isOffer ?? false,
            categoryId: data.categoryId,
            updatedAt: nowIso(),
          }).filter(([, v]) => v !== undefined)
        );

        const rows = await run(
          supabase.from("Product").update(productUpdate).eq("id", id).select("*").limit(1)
        );

        const colorRows = (data.colors?.create ?? []).map((row: AnyRecord) => ({
          id: randomUUID(),
          name: row.name,
          hex: row.hex,
          productId: id,
        }));
        const specRows = (data.specs?.create ?? []).map((row: AnyRecord) => ({
          id: randomUUID(),
          label: row.label,
          value: row.value,
          productId: id,
        }));
        const imageRows = (data.images?.create ?? []).map((row: AnyRecord, index: number) => ({
          id: randomUUID(),
          url: row.url,
          alt: row.alt ?? null,
          order: row.order ?? index,
          productId: id,
        }));

        await Promise.all([
          colorRows.length ? run(supabase.from("ProductColor").insert(colorRows)) : Promise.resolve(null),
          specRows.length ? run(supabase.from("ProductSpec").insert(specRows)) : Promise.resolve(null),
          imageRows.length ? run(supabase.from("ProductImage").insert(imageRows)) : Promise.resolve(null),
        ]);

        return (rows as AnyRecord[])[0] ?? null;
      },

      async delete(args: any) {
        await run(supabase.from("Product").delete().eq("id", args?.where?.id));
        return { id: args?.where?.id };
      },

      async count() {
        const rows = await run(supabase.from("Product").select("id"));
        return (rows as AnyRecord[]).length;
      },
    },

    productImage: {
      async deleteMany(args: any) {
        await run(supabase.from("ProductImage").delete().eq("productId", args?.where?.productId));
        return { count: 1 };
      },
    },

    productColor: {
      async deleteMany(args: any) {
        await run(supabase.from("ProductColor").delete().eq("productId", args?.where?.productId));
        return { count: 1 };
      },
    },

    productSpec: {
      async deleteMany(args: any) {
        await run(supabase.from("ProductSpec").delete().eq("productId", args?.where?.productId));
        return { count: 1 };
      },
    },

    category: {
      async findMany(args?: any) {
        let query: any = supabase.from("Category").select("*").order("order", { ascending: true });
        if (args?.orderBy && args.orderBy.order) {
          query = supabase
            .from("Category")
            .select("*")
            .order("order", { ascending: args.orderBy.order === "asc" });
        }
        const categories = (await run(query)) as AnyRecord[];

        if (args?.include?._count) {
          const products = (await run(supabase.from("Product").select("id,categoryId"))) as AnyRecord[];
          const countByCategory = new Map<string, number>();
          for (const product of products) {
            const categoryId = String(product.categoryId);
            countByCategory.set(categoryId, (countByCategory.get(categoryId) ?? 0) + 1);
          }

          return categories.map((category) => ({
            ...category,
            _count: { products: countByCategory.get(String(category.id)) ?? 0 },
          }));
        }

        return categories;
      },

      async count() {
        const rows = await run(supabase.from("Category").select("id"));
        return (rows as AnyRecord[]).length;
      },

      async create(args: any) {
        const data = args?.data ?? {};
        const rows = await run(
          supabase
            .from("Category")
            .insert({
              id: randomUUID(),
              name: data.name,
              slug: data.slug,
              description: data.description ?? null,
              order: data.order ?? 0,
              updatedAt: nowIso(),
            })
            .select("*")
            .limit(1)
        );
        return (rows as AnyRecord[])[0] ?? null;
      },

      async update(args: any) {
        const rows = await run(
          supabase
            .from("Category")
            .update({
              ...args?.data,
              updatedAt: nowIso(),
            })
            .eq("id", args?.where?.id)
            .select("*")
            .limit(1)
        );
        return (rows as AnyRecord[])[0] ?? null;
      },

      async delete(args: any) {
        await run(supabase.from("Category").delete().eq("id", args?.where?.id));
        return { id: args?.where?.id };
      },
    },

    quoteRequest: {
      async findMany(args?: any) {
        let query: any = supabase.from("QuoteRequest").select("*");
        if (args?.orderBy?.createdAt) {
          query = query.order("createdAt", { ascending: args.orderBy.createdAt === "asc" });
        }
        if (typeof args?.take === "number") query = query.limit(args.take);
        return run(query);
      },

      async create(args: any) {
        const data = args?.data ?? {};
        const rows = await run(
          supabase
            .from("QuoteRequest")
            .insert({
              id: randomUUID(),
              company: data.company,
              contact: data.contact,
              email: data.email,
              phone: data.phone ?? null,
              units: data.units ?? null,
              message: data.message ?? null,
              status: data.status ?? "pending",
            })
            .select("*")
            .limit(1)
        );
        return (rows as AnyRecord[])[0] ?? null;
      },

      async update(args: any) {
        const rows = await run(
          supabase.from("QuoteRequest").update(args?.data ?? {}).eq("id", args?.where?.id).select("*").limit(1)
        );
        return (rows as AnyRecord[])[0] ?? null;
      },

      async delete(args: any) {
        await run(supabase.from("QuoteRequest").delete().eq("id", args?.where?.id));
        return { id: args?.where?.id };
      },

      async count(args?: any) {
        let query: any = supabase.from("QuoteRequest").select("id");
        if (args?.where?.status) query = query.eq("status", args.where.status);
        const rows = await run(query);
        return (rows as AnyRecord[]).length;
      },
    },

    banner: {
      async findMany(args?: any) {
        let query: any = supabase.from("Banner").select("*");
        if (typeof args?.where?.active === "boolean") query = query.eq("active", args.where.active);
        if (args?.orderBy?.order) query = query.order("order", { ascending: args.orderBy.order === "asc" });
        return run(query);
      },

      async create(args: any) {
        const data = args?.data ?? {};
        const rows = await run(
          supabase
            .from("Banner")
            .insert({
              id: randomUUID(),
              title: data.title ?? null,
              subtitle: data.subtitle ?? null,
              imageUrl: data.imageUrl ?? null,
              linkUrl: data.linkUrl ?? null,
              linkLabel: data.linkLabel ?? null,
              bgColor: data.bgColor ?? "#1e40af",
              active: data.active ?? true,
              order: data.order ?? 0,
              format: data.format ?? "wide",
              updatedAt: nowIso(),
            })
            .select("*")
            .limit(1)
        );
        return (rows as AnyRecord[])[0] ?? null;
      },

      async update(args: any) {
        const rows = await run(
          supabase
            .from("Banner")
            .update({ ...(args?.data ?? {}), updatedAt: nowIso() })
            .eq("id", args?.where?.id)
            .select("*")
            .limit(1)
        );
        return (rows as AnyRecord[])[0] ?? null;
      },

      async delete(args: any) {
        await run(supabase.from("Banner").delete().eq("id", args?.where?.id));
        return { id: args?.where?.id };
      },
    },

    fAQ: {
      async findMany(args?: any) {
        let query: any = supabase.from("FAQ").select("*");
        if (args?.orderBy?.order) query = query.order("order", { ascending: args.orderBy.order === "asc" });
        return run(query);
      },

      async create(args: any) {
        const data = args?.data ?? {};
        const rows = await run(
          supabase
            .from("FAQ")
            .insert({
              id: randomUUID(),
              question: data.question,
              answer: data.answer,
              order: data.order ?? 0,
              updatedAt: nowIso(),
            })
            .select("*")
            .limit(1)
        );
        return (rows as AnyRecord[])[0] ?? null;
      },

      async update(args: any) {
        const rows = await run(
          supabase
            .from("FAQ")
            .update({ ...(args?.data ?? {}), updatedAt: nowIso() })
            .eq("id", args?.where?.id)
            .select("*")
            .limit(1)
        );
        return (rows as AnyRecord[])[0] ?? null;
      },

      async delete(args: any) {
        await run(supabase.from("FAQ").delete().eq("id", args?.where?.id));
        return { id: args?.where?.id };
      },

      async count() {
        const rows = await run(supabase.from("FAQ").select("id"));
        return (rows as AnyRecord[]).length;
      },
    },

    testimonial: {
      async findMany(args?: any) {
        let query: any = supabase.from("Testimonial").select("*");
        if (typeof args?.where?.active === "boolean") query = query.eq("active", args.where.active);
        if (args?.orderBy?.order) query = query.order("order", { ascending: args.orderBy.order === "asc" });
        return run(query);
      },

      async create(args: any) {
        const data = args?.data ?? {};
        const rows = await run(
          supabase
            .from("Testimonial")
            .insert({
              id: randomUUID(),
              name: data.name,
              role: data.role ?? null,
              company: data.company ?? null,
              content: data.content,
              rating: data.rating ?? 5,
              active: data.active ?? true,
              order: data.order ?? 0,
            })
            .select("*")
            .limit(1)
        );
        return (rows as AnyRecord[])[0] ?? null;
      },

      async update(args: any) {
        const rows = await run(
          supabase
            .from("Testimonial")
            .update(args?.data ?? {})
            .eq("id", args?.where?.id)
            .select("*")
            .limit(1)
        );
        return (rows as AnyRecord[])[0] ?? null;
      },

      async delete(args: any) {
        await run(supabase.from("Testimonial").delete().eq("id", args?.where?.id));
        return { id: args?.where?.id };
      },

      async count() {
        const rows = await run(supabase.from("Testimonial").select("id"));
        return (rows as AnyRecord[]).length;
      },
    },

    adminUser: {
      async findUnique(args: any) {
        const email = args?.where?.email;
        if (!email) return null;
        const rows = await run(
          supabase.from("AdminUser").select("*").eq("email", email).limit(1)
        );
        return (rows as AnyRecord[])[0] ?? null;
      },
    },

    siteSettings: {
      async findFirst() {
        const rows = await run(supabase.from("SiteSettings").select("*").limit(1));
        return (rows as AnyRecord[])[0] ?? null;
      },

      async upsert(args: any) {
        const data = args?.data ?? {};
        const rows = await run(
          supabase
            .from("SiteSettings")
            .upsert({ id: "main", ...data, updatedAt: nowIso() }, { onConflict: "id" })
            .select("*")
            .limit(1)
        );
        return (rows as AnyRecord[])[0] ?? null;
      },
    },
  };
}

const globalForPrisma = globalThis as unknown as {
  prisma?: any;
};

const prisma: any = globalForPrisma.prisma ?? createSupabaseClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
