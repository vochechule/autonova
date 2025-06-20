import * as dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey); // přidej na ověření

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
