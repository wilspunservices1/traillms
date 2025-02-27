import { z } from "zod";

// Zod schema for form validation
export const formDataSchema = z.object({
  certificateName: z.string().min(1, { message: "Certificate Name is required" }),
  courseId: z.string().uuid({ message: "Session/Course is required" }),
  enabled: z.boolean({ required_error: "Enabled selection is required" }),
  orientation: z.enum(["landscape", "portrait"], {
    required_error: "Orientation is required",
  }),
  maxDownloads: z.number().min(0, { message: "Maximum Downloads must be at least 0" }).max(1000, { message: "Maximum Downloads cannot exceed 1000" }),
  description: z.string().min(1, { message: "Description is required" }),
  certificateImage: z.any().refine((file) => file instanceof File && file.size <= 5 * 1024 * 1024, {
      message: "Certificate Image must be a valid file and not exceed 5MB",
    }),
});

// Inferred TypeScript type for form data
export type FormData = z.infer<typeof formDataSchema>;
