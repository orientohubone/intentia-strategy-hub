-- ============================================
-- STATUS PAGE RLS FIX
-- Adiciona policies de escrita para anon/authenticated
-- permitindo que o Admin Panel gerencie serviços,
-- incidentes e manutenções.
-- ============================================

-- platform_services: INSERT/UPDATE/DELETE para anon e authenticated
CREATE POLICY "Anon can insert services" ON platform_services FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update services" ON platform_services FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete services" ON platform_services FOR DELETE TO anon USING (true);
CREATE POLICY "Auth can insert services" ON platform_services FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update services" ON platform_services FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete services" ON platform_services FOR DELETE TO authenticated USING (true);

-- platform_incidents: INSERT/UPDATE/DELETE
CREATE POLICY "Anon can insert incidents" ON platform_incidents FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update incidents" ON platform_incidents FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete incidents" ON platform_incidents FOR DELETE TO anon USING (true);
CREATE POLICY "Auth can insert incidents" ON platform_incidents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update incidents" ON platform_incidents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete incidents" ON platform_incidents FOR DELETE TO authenticated USING (true);

-- platform_incident_updates: INSERT/UPDATE/DELETE
CREATE POLICY "Anon can insert incident updates" ON platform_incident_updates FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update incident updates" ON platform_incident_updates FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete incident updates" ON platform_incident_updates FOR DELETE TO anon USING (true);
CREATE POLICY "Auth can insert incident updates" ON platform_incident_updates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update incident updates" ON platform_incident_updates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete incident updates" ON platform_incident_updates FOR DELETE TO authenticated USING (true);

-- platform_maintenances: INSERT/UPDATE/DELETE
CREATE POLICY "Anon can insert maintenances" ON platform_maintenances FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update maintenances" ON platform_maintenances FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete maintenances" ON platform_maintenances FOR DELETE TO anon USING (true);
CREATE POLICY "Auth can insert maintenances" ON platform_maintenances FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update maintenances" ON platform_maintenances FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete maintenances" ON platform_maintenances FOR DELETE TO authenticated USING (true);

-- platform_uptime_daily: INSERT/UPDATE/DELETE
CREATE POLICY "Anon can insert uptime" ON platform_uptime_daily FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update uptime" ON platform_uptime_daily FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete uptime" ON platform_uptime_daily FOR DELETE TO anon USING (true);
CREATE POLICY "Auth can insert uptime" ON platform_uptime_daily FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update uptime" ON platform_uptime_daily FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete uptime" ON platform_uptime_daily FOR DELETE TO authenticated USING (true);
