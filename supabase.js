import { createClient } from '@supabase/supabase-js';

const createConnection = () => {
    return createClient(
        process.env.SUPABASEURL,
        process.env.SUPABASEKEY,
        {
            db: {
                schema: "public",
            },
            auth: {
                persistSession: true,
            },
        }
    );
};

export { createConnection };