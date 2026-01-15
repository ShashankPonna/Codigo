import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Hardcoded for now based on project structure, but ideally should be env vars
// Mirroring src/utils/supabase/info.tsx
const projectId = "apzxulqhmrwbfvmyujfu";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwenh1bHFobXJ3YmZ2bXl1amZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNzk1NjIsImV4cCI6MjA4Mzg1NTU2Mn0.Oi4cDvukE-VdyCSFsKjsHO7QF_b1qArlDhCB8z6TXBY";

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const {
        teamName,
        teamId,
        name,
        email,
        college,
        phone,
        member2Name,
        member3Name,
        upiId,
        screenshot_url
    } = req.body;

    if (!email || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const supabaseUrl = `https://${projectId}.supabase.co`;

        // PRIORITY: Use Service Role Key to bypass RLS for the count check.
        // If this is missing, the check will likely fail (return 0) due to RLS.
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY is missing. Rate limiting may not work correctly locally due to RLS.');
        }

        // Use Admin Client for the check (fallback to Anon if Service Role missing, but warn)
        const adminSupabase = createClient(supabaseUrl, serviceRoleKey || publicAnonKey);

        // Rate Limit Logic: Check registrations in last 24 hours
        // timestamp > (now - 24h)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data: existingRegistrations, error: checkError } = await adminSupabase
            .from('registrations')
            .select('created_at')
            .eq('email', email)
            .gt('created_at', twentyFourHoursAgo);

        if (checkError) {
            console.error('Rate limit check error:', checkError);
            return res.status(500).json({ error: 'Failed to validate registration rate limit' });
        }

        if (existingRegistrations && existingRegistrations.length >= 2) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'You have already submitted 2 registrations with this email in the last 24 hours.'
            });
        }

        // Insert Record
        const { data, error: insertError } = await supabase
            .from('registrations')
            .insert([
                {
                    team_name: teamName,
                    team_id: teamId,
                    name,
                    email,
                    college,
                    phone,
                    member2_name: member2Name,
                    member3_name: member3Name || null,
                    upi_id: upiId,
                    screenshot_url
                }
            ])
            .select();

        if (insertError) {
            console.error('Insert error:', insertError);
            return res.status(500).json({ error: insertError.message });
        }

        return res.status(200).json({ success: true, data });

    } catch (error: any) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
