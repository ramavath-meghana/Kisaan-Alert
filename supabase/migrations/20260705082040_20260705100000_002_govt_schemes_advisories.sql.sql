-- Government Schemes Table
CREATE TABLE government_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_hi TEXT,
    name_te TEXT,
    description TEXT,
    description_hi TEXT,
    description_te TEXT,
    eligibility_criteria TEXT,
    eligible_crops TEXT[] DEFAULT '{}',
    eligible_states TEXT[] DEFAULT '{}',
    benefit_amount TEXT,
    application_url TEXT,
    deadline_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Advisory History (linked to user)
CREATE TABLE advisory_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    input_summary TEXT,
    diagnosis TEXT,
    advisory_en TEXT,
    advisory_te TEXT,
    advisory_hi TEXT,
    severity TEXT DEFAULT 'Medium',
    crop TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Market Prices
CREATE TABLE market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_name TEXT NOT NULL,
    crop_name_hi TEXT,
    crop_name_te TEXT,
    mandi_name TEXT NOT NULL,
    state TEXT NOT NULL,
    min_price NUMERIC,
    max_price NUMERIC,
    modal_price NUMERIC,
    price_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Weather Alerts
CREATE TABLE weather_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    title_en TEXT NOT NULL,
    title_hi TEXT,
    title_te TEXT,
    description_en TEXT,
    description_hi TEXT,
    description_te TEXT,
    severity TEXT DEFAULT 'info',
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Rythu Seva Kendra Locations
CREATE TABLE rythu_seva_kendras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    contact_person TEXT,
    services_offered TEXT[] DEFAULT '{}',
    lat NUMERIC,
    lng NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE government_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisory_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rythu_seva_kendras ENABLE ROW LEVEL SECURITY;

-- RLS Policies for government_schemes (public read)
CREATE POLICY "govt_schemes_public_read" ON government_schemes FOR SELECT
    TO anon, authenticated USING (is_active = true);

-- RLS Policies for advisory_history (user owns their records)
CREATE POLICY "advisory_history_select" ON advisory_history FOR SELECT
    TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "advisory_history_insert" ON advisory_history FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLS Policies for market_prices (public read)
CREATE POLICY "market_prices_public_read" ON market_prices FOR SELECT
    TO anon, authenticated USING (true);

-- RLS Policies for weather_alerts (public read)
CREATE POLICY "weather_alerts_public_read" ON weather_alerts FOR SELECT
    TO anon, authenticated USING (true);

-- RLS Policies for rythu_seva_kendras (public read)
CREATE POLICY "rsk_public_read" ON rythu_seva_kendras FOR SELECT
    TO anon, authenticated USING (true);

-- Insert sample government schemes
INSERT INTO government_schemes (name, name_hi, name_te, description, description_hi, description_te, eligibility_criteria, eligible_crops, eligible_states, benefit_amount, application_url, is_active) VALUES
('PM-KISAN', 'पीएम-किसान', 'పీఎం-కిసాన్', 'Direct income support of ₹6000 per year to eligible farmer families', 'प्रति वर्ष ₹6000 की सीधी आय सहायता', 'సంవత్సరానికి ₹6000 ప్రత్యక్ష ఆదాయ సహాయం', 'Small and marginal farmers with cultivable land up to 2 hectares', ARRAY['Rice', 'Wheat', 'Cotton', 'Pulses'], ARRAY['All States'], '₹6000/year', 'https://pmkisan.gov.in', true),
('Crop Insurance Scheme', 'फसल बीमा योजना', 'పంట బీమా పథకం', 'Comprehensive crop insurance against natural calamities', 'प्राकृतिक आपदाओं के खिला�फ व्यापक फसल बीमा', 'సహజ విపత్తులకు వ్యతిరేకంగా సమగ్ర పంట బీమా', 'All farmers growing notified crops in notified areas', ARRAY['Rice', 'Wheat', 'Maize', 'Groundnut', 'Cotton'], ARRAY['Andhra Pradesh', 'Telangana', 'Maharashtra', 'Punjab', 'Haryana'], 'Varies by crop', 'https://pmfby.gov.in', true),
('Subsidy on Seeds', 'बीज पर सब्सिडी', 'విత్తనాలపై సబ్సిడీ', '50-75% subsidy on certified seeds', 'प्रमाणित बीजों पर 50-75% सब्सिडी', 'ధృవీకరించిన విత్తనాలపై 50-75% సబ్సిడీ', 'All registered farmers with valid land records', ARRAY['All crops'], ARRAY['All States'], '50-75%', 'Contact local agriculture office', true);

-- Insert sample market prices
INSERT INTO market_prices (crop_name, crop_name_hi, crop_name_te, mandi_name, state, min_price, max_price, modal_price) VALUES
('Rice (Paddy)', 'धान', 'వరి', 'Nagpur', 'Maharashtra', 1800, 2200, 2050),
('Rice (Paddy)', 'धान', 'వరి', 'Guntur', 'Andhra Pradesh', 1900, 2350, 2100),
('Wheat', 'गेहूं', 'గోధుమ', 'Karnal', 'Haryana', 2100, 2450, 2275),
('Cotton', 'कपास', 'పత్తి', 'Warangal', 'Telangana', 5500, 6200, 5800),
('Groundnut', 'मूंगफली', 'వేరుశనగ', 'Rajkot', 'Gujarat', 4800, 5500, 5150);

-- Insert sample weather alerts
INSERT INTO weather_alerts (district, state, alert_type, title_en, title_hi, title_te, description_en, description_hi, description_te, severity, valid_from, valid_until) VALUES
('Guntur', 'Andhra Pradesh', 'dry_spell', 'Dry Spell Warning', 'सूखे की चेतावनी', 'అల్పవృష్టి హెచ్చరిక', 'No significant rainfall expected for next 10 days. Delay irrigation planning.', 'अगले 10 दिनों तक कोई महत्वपूर्ण वर्षा की संभावना नहीं।', 'తదుపరి 10 రోజులు గణనీయమైన వర్షపాతం అంచనా లేదు.', 'warning', NOW(), NOW() + INTERVAL '10 days'),
('Warangal', 'Telangana', 'rain', 'Heavy Rain Alert', 'भारी बारिश की चेतावनी', 'భారీ వర్ష హెచ్చరిక', 'Heavy rainfall expected. Complete harvesting immediately.', 'भारी बारिश की संभावना है।', 'భారీ వర్షపాతం అంచనా.', 'high', NOW(), NOW() + INTERVAL '3 days');

-- Insert sample Rythu Seva Kendras
INSERT INTO rythu_seva_kendras (name, district, state, address, phone, contact_person, services_offered, lat, lng) VALUES
('Rythu Seva Kendra Guntur Central', 'Guntur', 'Andhra Pradesh', 'Market Yard, Guntur', '0863-2234567', 'Rama Rao', ARRAY['Seed Distribution', 'Pesticide Advisory', 'Equipment Rental'], 16.3067, 80.4365),
('Rythu Seva Kendra Vijayawada', 'Krishna', 'Andhra Pradesh', 'Agriculture Dept, Vijayawada', '0866-2578910', 'Venkat Reddy', ARRAY['Soil Testing', 'Crop Advisory', 'Seed Distribution'], 16.5062, 80.6480),
('Rythu Seva Kendra Warangal', 'Warangal', 'Telangana', 'District Collectorate Campus', '0870-2567890', 'Srinivas', ARRAY['Equipment Rental', 'Fertilizer Advisory', 'Market Info'], 17.9784, 79.5941);
