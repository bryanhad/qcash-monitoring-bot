import { z } from 'zod'

export const setWebHookSchema = z.object({
    ok: z.boolean(),
    result: z.boolean(),
    description: z.string(),
})

export const telegramRequestBodySchema = z.object({
    update_id: z.number().optional(),
    message: z.object({
        message_id: z.number().optional(),
        from: z
            .object({
                id: z.number(),
                is_bot: z.boolean(),
                first_name: z.string(),
                language_code: z.string(),
            })
            .optional(),
        chat: z.object({
            id: z.number(),
            first_name: z.string(),
            type: z.string(),
        }),
        date: z.number().optional(),
        text: z.string(),
        entities: z
            .array(
                z.object({
                    type: z.string(),
                    offset: z.number(),
                    length: z.number(),
                })
            )
            .optional(),
    }),
})
