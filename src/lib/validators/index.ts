import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Ad en az 2 karakter olmali."),
  email: z.string().trim().email("Gecerli bir e-posta girin.").toLowerCase(),
  password: z
    .string()
    .min(8, "Sifre en az 8 karakter olmali.")
    .regex(/[A-Z]/, "Sifre en az 1 buyuk harf icermeli.")
    .regex(/[0-9]/, "Sifre en az 1 rakam icermeli.")
});

export const loginSchema = z.object({
  email: z.string().trim().email("Gecerli e-posta girin.").toLowerCase(),
  password: z.string().min(1, "Sifre zorunlu.")
});

export const uploadSchema = z.object({
  title: z.string().trim().min(3, "Baslik en az 3 karakter olmali."),
  universityId: z.coerce.number().int().positive(),
  departmentId: z.coerce.number().int().positive(),
  courseId: z.coerce.number().int().positive(),
  year: z.coerce.number().int().min(2000).max(2100),
  examType: z.enum(["MIDTERM", "FINAL", "QUIZ", "MAKEUP"]),
  description: z.string().trim().max(600).optional().default("")
});

export const reportSchema = z.object({
  reason: z.string().trim().min(3, "Neden gerekli."),
  details: z.string().trim().max(400).optional().default("")
});
