-- Створення типів для перерахувань
CREATE TYPE game_status AS ENUM ('WAITING', 'IN_PROGRESS', 'FINISHED');
CREATE TYPE player_color AS ENUM ('WHITE', 'BLACK');

-- Створення таблиці для ігор
CREATE TABLE IF NOT EXISTS games (
  id VARCHAR(8) PRIMARY KEY,
  board JSONB NOT NULL,
  current_player player_color NOT NULL,
  status game_status NOT NULL,
  player_white_id VARCHAR(255),
  player_black_id VARCHAR(255),
  player_white_name VARCHAR(255),
  player_black_name VARCHAR(255),
  winner player_color,
  created_at TIMESTAMP NOT NULL
);