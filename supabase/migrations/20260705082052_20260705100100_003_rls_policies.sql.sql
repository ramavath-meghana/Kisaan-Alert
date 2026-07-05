-- RLS Policies for alerts (user owns their alerts)
CREATE POLICY "alerts_select" ON alerts FOR SELECT
    TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "alerts_insert" ON alerts FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "alerts_update" ON alerts FOR UPDATE
    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "alerts_delete" ON alerts FOR DELETE
    TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for crop_recommendations (user owns their recommendations)
CREATE POLICY "crop_rec_select" ON crop_recommendations FOR SELECT
    TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "crop_rec_insert" ON crop_recommendations FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = user_id);