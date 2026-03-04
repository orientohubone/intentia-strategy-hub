
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function check() {
    const { data: users, error: uError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', 'fersouluramal@gmail.com');

    if (uError) {
        console.error('User Error:', uError);
        return;
    }

    if (!users || users.length === 0) {
        console.log('User not found');
        return;
    }

    const userId = users[0].id;
    console.log('User ID found:', userId);

    const { data: overrides, error: oError } = await supabase
        .from('user_feature_overrides')
        .select('*')
        .eq('user_id', userId);

    if (oError) {
        console.error('Overrides Error:', oError);
    } else {
        console.log('Overrides for user:', overrides);
    }

    const { data: flags, error: fError } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('feature_key', 'results');

    if (fError) {
        console.error('Flag Error:', fError);
    } else {
        console.log('Flag "results" status:', flags);
    }
}

check();
