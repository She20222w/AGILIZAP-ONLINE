ALTER TABLE users
ADD COLUMN service_type TEXT CHECK (service_type IN ('transcribe', 'summarize', 'resumetranscribe', 'auto')) DEFAULT 'transcribe';
