-- Add api_keys column to profiles to store user integrations
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS api_keys JSONB DEFAULT '{}'::jsonb;

-- Comment to document usage
COMMENT ON COLUMN profiles.api_keys IS 'Stores encrypted API keys for providers like {openai: "", gemini: "", groq: ""}';
