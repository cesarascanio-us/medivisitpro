-- Fix for Security Advisor: "RLS Enabled No Policy"
-- Adding default policies for tables that have RLS enabled but no policies.

-- 1. Assignment Items (Items within a stock assignment)
CREATE POLICY "Enable read for authenticated users" ON public.assignment_items
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable write for authenticated users" ON public.assignment_items
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Bank Inventory (Sample Bank)
CREATE POLICY "Enable read for authenticated users" ON public.bank_inventory
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable write for authenticated users" ON public.bank_inventory
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Billing Plans & Prices (Subscription Logic)
CREATE POLICY "Enable read for authenticated users" ON public.billing_plans
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.billing_prices
    FOR SELECT TO authenticated USING (true);

-- 4. Commercial Offers
CREATE POLICY "Enable read for authenticated users" ON public.commercial_offers
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable write for authenticated users" ON public.commercial_offers
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Companies (CRM Entity)
CREATE POLICY "Enable read for authenticated users" ON public.companies
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable write for authenticated users" ON public.companies
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Contact Health Centers (Many-to-Many)
CREATE POLICY "Enable read for authenticated users" ON public.contact_health_centers
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable write for authenticated users" ON public.contact_health_centers
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Cycles (Planning Cycles)
CREATE POLICY "Enable read for authenticated users" ON public.cycles
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable write for authenticated users" ON public.cycles
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Daily Plan Details & Items
CREATE POLICY "Enable read for authenticated users" ON public.daily_plan_details
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable write for authenticated users" ON public.daily_plan_details
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users" ON public.daily_plan_items
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable write for authenticated users" ON public.daily_plan_items
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Debug Tables (Optional, but best to secure if RLS is on)
CREATE POLICY "Enable read for admins" ON public.debug_auth_dump
    FOR SELECT TO authenticated USING ((auth.jwt() ->> 'role')::text = 'admin');
CREATE POLICY "Enable read for admins" ON public.debug_roles_dump
    FOR SELECT TO authenticated USING ((auth.jwt() ->> 'role')::text = 'admin');
CREATE POLICY "Enable read for admins" ON public.debug_triggers_dump
    FOR SELECT TO authenticated USING ((auth.jwt() ->> 'role')::text = 'admin');
