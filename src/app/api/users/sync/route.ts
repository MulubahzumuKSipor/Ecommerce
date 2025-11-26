// api/users/sync/route.ts

/**
 * MOCK BACKEND API ROUTE (TypeScript) for synchronizing Firebase User IDs (UID)
 * with the PostgreSQL 'users' table.
 */

// Define the interface for the expected request body payload
interface RequestBody {
    userId: string;
    email: string;
    displayName: string;
}

// In a real Next.js environment, Request and Response are imported from 'next/server'
// For this environment, we use standard global types.

export async function POST(request: Request): Promise<Response> {
    try {
        const body: RequestBody = await request.json();
        const { userId: firebaseUserId, email, displayName } = body;

        if (!firebaseUserId) {
            return new Response(JSON.stringify({ message: "Missing userId" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // ----------------------------------------------------------------------
        // CRITICAL STEP: POSTGRESQL UPSERT LOGIC
        // ----------------------------------------------------------------------

        // NOTE: In a real app, you would import your PG client here (e.g., from 'pg' or 'postgres')
        // and execute the query.

        const upsertQuery = `
            INSERT INTO users (firebase_uid, email, display_name, created_at, last_login_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            ON CONFLICT (firebase_uid) DO UPDATE
            SET 
                last_login_at = NOW(),
                email = COALESCE(users.email, EXCLUDED.email),           -- Only update email if the existing record doesn't have one
                display_name = COALESCE(users.display_name, EXCLUDED.display_name); -- Only update display name if the existing record doesn't have one
        `;
        
        // --- Mocking the execution for demonstration ---
        console.log(`[POSTGRES-MOCK] Executing UPSERT for UID: ${firebaseUserId}, Email: ${email}, DisplayName: ${displayName}`);
        console.log(`[POSTGRES-MOCK] SQL Query: ${upsertQuery.trim()}`);
        
        // Example execution (commented out for mock):
        // await pool.query(upsertQuery, [firebaseUserId, email, displayName]);


        // ----------------------------------------------------------------------
        // END POSTGRESQL LOGIC
        // ----------------------------------------------------------------------

        return new Response(JSON.stringify({ 
            success: true, 
            message: "User ID synchronized successfully with PostgreSQL.",
            pg_user_id: firebaseUserId
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        // Use 'unknown' type for catch errors and narrow it down if necessary
        console.error('Error synchronizing user to PostgreSQL:', error instanceof Error ? error.message : error);
        
        return new Response(JSON.stringify({ message: "Internal Server Error during synchronization." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}