import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Введите корректный адрес электронной почты'),
  password: z.string().min(8, 'Пароль должен быть не короче 8 символов'),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Укажите имя'),
    username: z.string().max(50, 'Максимум 50 символов').optional().or(z.literal('')),
    email: z.email('Введите корректный адрес электронной почты'),
    password: z.string().min(8, 'Пароль должен быть не короче 8 символов'),
    confirmPassword: z.string().min(8, 'Подтвердите пароль'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Пароли не совпадают',
  });

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Укажите имя'),
  username: z.string().max(50, 'Максимум 50 символов').optional().or(z.literal('')),
  avatarUrl: z.url('Введите корректную ссылку').optional().or(z.literal('')),
});

export const adminTopicSchema = z.object({
  title: z.string().min(2, 'Минимум 2 символа'),
  slug: z
    .string()
    .min(2, 'Минимум 2 символа')
    .regex(/^[a-z0-9-]+$/, 'Слаг может содержать только a-z, 0-9 и дефис'),
  description: z.string().optional(),
  order: z.coerce.number().int().min(0),
  isPublished: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type AdminTopicFormValues = z.infer<typeof adminTopicSchema>;


