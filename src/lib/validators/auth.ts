import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/[a-z]/, "Password must include a lowercase letter.")
    .regex(/[0-9]/, "Password must include a number."),
});

export const operatorRegisterSchema = registerSchema.extend({
  businessName: z.string().trim().min(2, "Business name is required."),
  phone: z.string().trim().min(10, "Phone number is required."),
  description: z.string().trim().min(20, "Tell us more about your business."),
  verificationDocumentUrl: z
    .url("Enter a valid document URL.")
    .optional()
    .or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
