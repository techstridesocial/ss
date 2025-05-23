-- Seed Data for Stride Social Dashboard
-- Sample data demonstrating the influencer roster functionality

-- Insert sample users (5 roles)
INSERT INTO users (email, clerk_id, role, status) VALUES
-- Brands
('sarah.marketing@luxebeauty.com', 'clerk_brand_1', 'BRAND', 'ACTIVE'),
('james.cmto@techstartup.io', 'clerk_brand_2', 'BRAND', 'ACTIVE'),

-- Influencers (Signed)
('emma.lifestyle@gmail.com', 'clerk_inf_1', 'INFLUENCER_SIGNED', 'ACTIVE'),
('alex.fitness@gmail.com', 'clerk_inf_2', 'INFLUENCER_SIGNED', 'ACTIVE'),
('sophia.beauty@gmail.com', 'clerk_inf_3', 'INFLUENCER_SIGNED', 'ACTIVE'),

-- Influencers (Partnered)
('mike.gaming@gmail.com', 'clerk_inf_4', 'INFLUENCER_PARTNERED', 'ACTIVE'),
('zara.fashion@gmail.com', 'clerk_inf_5', 'INFLUENCER_PARTNERED', 'ACTIVE'),

-- Staff
('tom.manager@stridesocial.com', 'clerk_staff_1', 'STAFF', 'ACTIVE'),

-- Admin
('admin@stridesocial.com', 'clerk_admin_1', 'ADMIN', 'ACTIVE');

-- Insert user profiles
INSERT INTO user_profiles (user_id, first_name, last_name, avatar_url, location_country, location_city) VALUES
((SELECT id FROM users WHERE email = 'emma.lifestyle@gmail.com'), 'Emma', 'Rodriguez', 'https://picsum.photos/150/150?random=3', 'United Kingdom', 'Brighton'),
((SELECT id FROM users WHERE email = 'alex.fitness@gmail.com'), 'Alex', 'Thompson', 'https://picsum.photos/150/150?random=4', 'United Kingdom', 'Birmingham'),
((SELECT id FROM users WHERE email = 'sophia.beauty@gmail.com'), 'Sophia', 'Chen', 'https://picsum.photos/150/150?random=5', 'United Kingdom', 'London'),
((SELECT id FROM users WHERE email = 'mike.gaming@gmail.com'), 'Mike', 'Davies', 'https://picsum.photos/150/150?random=6', 'United Kingdom', 'Cardiff'),
((SELECT id FROM users WHERE email = 'zara.fashion@gmail.com'), 'Zara', 'Ahmed', 'https://picsum.photos/150/150?random=7', 'United Kingdom', 'Edinburgh');

-- Insert influencers with comprehensive data matching your requirements
INSERT INTO influencers (user_id, display_name, niche_primary, niches, total_followers, total_engagement_rate, total_avg_views, estimated_promotion_views, ready_for_campaigns, onboarding_completed) VALUES
-- Emma Rodriguez - Lifestyle Influencer
((SELECT id FROM users WHERE email = 'emma.lifestyle@gmail.com'), 'Emma Rodriguez', 'Lifestyle', ARRAY['Lifestyle', 'Travel', 'Fashion'], 125000, 0.0435, 45000, 38250, true, true),

-- Alex Thompson - Fitness Influencer  
((SELECT id FROM users WHERE email = 'alex.fitness@gmail.com'), 'Alex Thompson', 'Fitness', ARRAY['Fitness', 'Lifestyle'], 89000, 0.0612, 32000, 27200, true, true),

-- Sophia Chen - Beauty Influencer
((SELECT id FROM users WHERE email = 'sophia.beauty@gmail.com'), 'Sophia Chen', 'Beauty', ARRAY['Beauty', 'Fashion', 'Lifestyle'], 156000, 0.0521, 58000, 49300, true, true),

-- Mike Davies - Gaming (Partnered)
((SELECT id FROM users WHERE email = 'mike.gaming@gmail.com'), 'Mike Davies', 'Gaming', ARRAY['Gaming', 'Tech'], 95000, 0.0389, 41000, 34850, false, false),

-- Zara Ahmed - Fashion (Partnered)
((SELECT id FROM users WHERE email = 'zara.fashion@gmail.com'), 'Zara Ahmed', 'Fashion', ARRAY['Fashion', 'Lifestyle', 'Beauty'], 110000, 0.0467, 39000, 33150, false, true);

-- Insert platform data for each influencer (this is the key data for your display requirements)

-- Emma Rodriguez Platforms
INSERT INTO influencer_platforms (influencer_id, platform, username, profile_url, followers, engagement_rate, avg_views, is_connected, last_synced) VALUES
((SELECT id FROM influencers WHERE display_name = 'Emma Rodriguez'), 'INSTAGRAM', 'emma_lifestyle', 'https://instagram.com/emma_lifestyle', 75000, 0.0456, 28000, true, NOW() - INTERVAL '2 hours'),
((SELECT id FROM influencers WHERE display_name = 'Emma Rodriguez'), 'TIKTOK', 'emmalifestyle', 'https://tiktok.com/@emmalifestyle', 50000, 0.0398, 17000, true, NOW() - INTERVAL '3 hours');

-- Alex Thompson Platforms
INSERT INTO influencer_platforms (influencer_id, platform, username, profile_url, followers, engagement_rate, avg_views, is_connected, last_synced) VALUES
((SELECT id FROM influencers WHERE display_name = 'Alex Thompson'), 'INSTAGRAM', 'alex_fitlife', 'https://instagram.com/alex_fitlife', 45000, 0.0678, 18000, true, NOW() - INTERVAL '1 hour'),
((SELECT id FROM influencers WHERE display_name = 'Alex Thompson'), 'YOUTUBE', 'AlexFitnessJourney', 'https://youtube.com/c/AlexFitnessJourney', 44000, 0.0545, 14000, true, NOW() - INTERVAL '4 hours');

-- Sophia Chen Platforms
INSERT INTO influencer_platforms (influencer_id, platform, username, profile_url, followers, engagement_rate, avg_views, is_connected, last_synced) VALUES
((SELECT id FROM influencers WHERE display_name = 'Sophia Chen'), 'INSTAGRAM', 'sophia_beautyworld', 'https://instagram.com/sophia_beautyworld', 89000, 0.0534, 35000, true, NOW() - INTERVAL '1 hour'),
((SELECT id FROM influencers WHERE display_name = 'Sophia Chen'), 'TIKTOK', 'sophiabeauty', 'https://tiktok.com/@sophiabeauty', 67000, 0.0501, 23000, true, NOW() - INTERVAL '2 hours');

-- Mike Davies Platforms
INSERT INTO influencer_platforms (influencer_id, platform, username, profile_url, followers, engagement_rate, avg_views, is_connected, last_synced) VALUES
((SELECT id FROM influencers WHERE display_name = 'Mike Davies'), 'TWITCH', 'mikeplayz', 'https://twitch.tv/mikeplayz', 65000, 0.0412, 28000, false, NULL),
((SELECT id FROM influencers WHERE display_name = 'Mike Davies'), 'YOUTUBE', 'MikeDaviesGaming', 'https://youtube.com/c/MikeDaviesGaming', 30000, 0.0356, 13000, false, NULL);

-- Zara Ahmed Platforms
INSERT INTO influencer_platforms (influencer_id, platform, username, profile_url, followers, engagement_rate, avg_views, is_connected, last_synced) VALUES
((SELECT id FROM influencers WHERE display_name = 'Zara Ahmed'), 'INSTAGRAM', 'zara_fashionista', 'https://instagram.com/zara_fashionista', 78000, 0.0489, 25000, true, NOW() - INTERVAL '6 hours'),
((SELECT id FROM influencers WHERE display_name = 'Zara Ahmed'), 'TIKTOK', 'zarafashion', 'https://tiktok.com/@zarafashion', 32000, 0.0423, 14000, false, NULL);

-- Insert audience demographics (this supports your detailed view requirements)

-- Emma Rodriguez Instagram Demographics
INSERT INTO audience_demographics (influencer_platform_id, age_13_17, age_18_24, age_25_34, age_35_44, age_45_54, age_55_plus, gender_male, gender_female, gender_other) VALUES
((SELECT id FROM influencer_platforms WHERE platform = 'INSTAGRAM' AND influencer_id = (SELECT id FROM influencers WHERE display_name = 'Emma Rodriguez')), 
 8.5, 32.1, 41.2, 14.8, 2.9, 0.5, 23.4, 75.1, 1.5);

-- Alex Thompson Instagram Demographics
INSERT INTO audience_demographics (influencer_platform_id, age_13_17, age_18_24, age_25_34, age_35_44, age_45_54, age_55_plus, gender_male, gender_female, gender_other) VALUES
((SELECT id FROM influencer_platforms WHERE platform = 'INSTAGRAM' AND influencer_id = (SELECT id FROM influencers WHERE display_name = 'Alex Thompson')), 
 5.2, 28.9, 38.4, 21.3, 5.1, 1.1, 67.8, 30.9, 1.3);

-- Insert audience locations (supporting your location breakdown requirement)

-- Emma Rodriguez Instagram - UK focused
INSERT INTO audience_locations (influencer_platform_id, country_code, country_name, percentage) VALUES
((SELECT id FROM influencer_platforms WHERE platform = 'INSTAGRAM' AND influencer_id = (SELECT id FROM influencers WHERE display_name = 'Emma Rodriguez')), 'GB', 'United Kingdom', 42.3),
((SELECT id FROM influencer_platforms WHERE platform = 'INSTAGRAM' AND influencer_id = (SELECT id FROM influencers WHERE display_name = 'Emma Rodriguez')), 'US', 'United States', 28.1),
((SELECT id FROM influencer_platforms WHERE platform = 'INSTAGRAM' AND influencer_id = (SELECT id FROM influencers WHERE display_name = 'Emma Rodriguez')), 'CA', 'Canada', 12.4);

-- Insert audience languages (supporting your language breakdown requirement)

-- Emma Rodriguez Instagram - English dominant
INSERT INTO audience_languages (influencer_platform_id, language_code, language_name, percentage) VALUES
((SELECT id FROM influencer_platforms WHERE platform = 'INSTAGRAM' AND influencer_id = (SELECT id FROM influencers WHERE display_name = 'Emma Rodriguez')), 'en', 'English', 89.4),
((SELECT id FROM influencer_platforms WHERE platform = 'INSTAGRAM' AND influencer_id = (SELECT id FROM influencers WHERE display_name = 'Emma Rodriguez')), 'es', 'Spanish', 4.7),
((SELECT id FROM influencer_platforms WHERE platform = 'INSTAGRAM' AND influencer_id = (SELECT id FROM influencers WHERE display_name = 'Emma Rodriguez')), 'fr', 'French', 2.9);

-- Insert recent content (supporting your "recent content they have posted" requirement)

-- Emma Rodriguez Instagram Recent Posts
INSERT INTO influencer_content (influencer_platform_id, post_url, thumbnail_url, caption, post_type, views, likes, comments, shares, posted_at) VALUES
((SELECT id FROM influencer_platforms WHERE platform = 'INSTAGRAM' AND influencer_id = (SELECT id FROM influencers WHERE display_name = 'Emma Rodriguez')), 
 'https://instagram.com/p/sample1', 'https://picsum.photos/300/300?random=101', 'Morning routine essentials ✨ #lifestyle #morning', 'reel', 45200, 3420, 187, 89, NOW() - INTERVAL '2 days'),

((SELECT id FROM influencer_platforms WHERE platform = 'INSTAGRAM' AND influencer_id = (SELECT id FROM influencers WHERE display_name = 'Emma Rodriguez')), 
 'https://instagram.com/p/sample2', 'https://picsum.photos/300/300?random=102', 'Travel diary: Hidden gems in Cornwall 🌊', 'image', 28900, 2150, 94, 42, NOW() - INTERVAL '4 days');

-- Sophia Chen Instagram Recent Posts  
INSERT INTO influencer_content (influencer_platform_id, post_url, thumbnail_url, caption, post_type, views, likes, comments, shares, posted_at) VALUES
((SELECT id FROM influencer_platforms WHERE platform = 'INSTAGRAM' AND influencer_id = (SELECT id FROM influencers WHERE display_name = 'Sophia Chen')), 
 'https://instagram.com/p/beauty1', 'https://picsum.photos/300/300?random=201', 'NEW: Summer glow makeup tutorial ☀️ #beauty #glowup', 'reel', 78900, 5670, 324, 201, NOW() - INTERVAL '1 day'),

((SELECT id FROM influencer_platforms WHERE platform = 'INSTAGRAM' AND influencer_id = (SELECT id FROM influencers WHERE display_name = 'Sophia Chen')), 
 'https://instagram.com/p/beauty2', 'https://picsum.photos/300/300?random=202', 'Skincare routine that changed my life 🧴', 'image', 52100, 3890, 178, 89, NOW() - INTERVAL '3 days'); 