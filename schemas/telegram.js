import { z } from "zod"

export const setWebHookSchema = z.object({
    ok: z.boolean(),
    result: z.boolean(),
    description: z.string(),
})

export const telegramRequestBodySchema = z
    .object({
        message: z
            .object({
                message_id: z.number(),
                chat: z.object({
                    id: z.number(),
                }),
                text: z.string(),
            })
            .optional(), // Make it optional
        edited_message: z
            .object({
                message_id: z.number(),
                chat: z.object({
                    id: z.number(),
                }),
                text: z.string(),
            })
            .optional(), // Also optional
    })
    .refine(
        (data) => data.message || data.edited_message, // At least one of them must exist
        {
            message: "Either 'message' or 'edited_message' must be present",
            path: [], // This path specifies where the error occurs, empty for global error
        }
    )
