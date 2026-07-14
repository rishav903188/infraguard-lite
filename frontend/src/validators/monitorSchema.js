import { z } from "zod";

export const monitorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  url: z
    .string()
    .url("Must be a valid URL")
    .regex(/^https?:\/\//, "URL must start with http:// or https://"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]),
  interval: z
    .number({ invalid_type_error: "Interval must be a number" })
    .int()
    .min(1, "Minimum 1 minute")
    .max(60, "Maximum 60 minutes"),
});