import { z } from 'zod';

// ─── Project validation ──────────────────────────────────────────────────────

export const projectNameSchema = z
  .string()
  .trim()
  .min(1, 'Project name is required')
  .max(100, 'Project name must be 100 characters or fewer');

export const projectDescriptionSchema = z
  .string()
  .trim()
  .max(500, 'Description must be 500 characters or fewer')
  .default('');

export const projectCategorySchema = z
  .string()
  .trim()
  .max(50, 'Category must be 50 characters or fewer')
  .default('general');

export const projectTagSchema = z
  .string()
  .trim()
  .min(1)
  .max(30, 'Tag must be 30 characters or fewer');

export const createProjectSchema = z.object({
  name: projectNameSchema,
  description: projectDescriptionSchema,
  category: projectCategorySchema,
  tags: z.array(projectTagSchema).max(10, 'Maximum 10 tags allowed').default([]),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// ─── User profile validation ─────────────────────────────────────────────────

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, 'Display name is required')
  .max(50, 'Display name must be 50 characters or fewer');

export const bioSchema = z
  .string()
  .trim()
  .max(300, 'Bio must be 300 characters or fewer')
  .default('');

export const updateProfileSchema = z.object({
  displayName: displayNameSchema.optional(),
  bio: bioSchema.optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Validate input and return either the parsed data or an error message.
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.issues[0]?.message ?? 'Validation failed';
  return { success: false, error: firstError };
}
