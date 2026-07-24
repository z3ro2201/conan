-- 1) 곡 기본 정보 (언어 무관 값들)
CREATE TABLE tracks (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '곡 고유 ID',
  artist            VARCHAR(255) NOT NULL COMMENT '부른 가수명',
  lyricist          VARCHAR(255) COMMENT '작사가',
  composer          VARCHAR(255) COMMENT '작곡가',
  album_image_url   VARCHAR(500) COMMENT '앨범 이미지 URL',
  youtube_url       VARCHAR(500) NOT NULL COMMENT '유튜브 링크 (필수)',
  apple_music_url   VARCHAR(500) NULL COMMENT '애플뮤직 링크 (없을 수 있음)',
  spotify_url       VARCHAR(500) NULL COMMENT '스포티파이 링크 (없을 수 있음)',
  track_type        ENUM('TV_OP', 'TV_ED', 'MOVIE') NOT NULL COMMENT '곡 유형: TV애니OP/TV애니ED/극장판',
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '레코드 생성 시각',
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '레코드 수정 시각'
) COMMENT = '음원 기본 정보 테이블';

-- 2) 다국어 곡 제목
CREATE TABLE track_titles (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '제목 레코드 고유 ID',
  track_id    BIGINT UNSIGNED NOT NULL COMMENT '연결된 곡 ID (tracks.id 참조)',
  language    ENUM('ko', 'ja', 'en') NOT NULL COMMENT '제목 언어 구분',
  title       VARCHAR(255) NOT NULL COMMENT '해당 언어의 곡 제목',
  UNIQUE KEY uq_track_title_lang (track_id, language),
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
) COMMENT = '곡 제목의 다국어(한/일/영) 버전 저장';

-- 3) 다국어 일반 가사 (전체 텍스트)
CREATE TABLE track_lyrics (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '가사 레코드 고유 ID',
  track_id    BIGINT UNSIGNED NOT NULL COMMENT '연결된 곡 ID (tracks.id 참조)',
  language    ENUM('ko', 'ja', 'en') NOT NULL COMMENT '가사 언어 구분',
  content     TEXT NOT NULL COMMENT '전체 가사 텍스트 (타임스탬프 없음)',
  UNIQUE KEY uq_track_lyrics_lang (track_id, language),
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
) COMMENT = '곡의 다국어 일반(비싱크) 가사 저장';

-- 4) 다국어 싱크 가사 (타임스탬프 포함)
CREATE TABLE track_synced_lyrics (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '싱크 가사 레코드 고유 ID',
  track_id    BIGINT UNSIGNED NOT NULL COMMENT '연결된 곡 ID (tracks.id 참조)',
  language    ENUM('ko', 'ja', 'en') NOT NULL COMMENT '싱크 가사 언어 구분',
  lines       JSON NOT NULL COMMENT '타임스탬프 포함 가사 라인 배열, 예: [{"time":12500,"text":"..."}], time 단위는 ms',
  UNIQUE KEY uq_track_synced_lang (track_id, language),
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
) COMMENT = '곡의 다국어 싱크(타임스탬프) 가사 저장';

-- 시즌/극장판 정보
CREATE TABLE series (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '시리즈 고유 ID',
  series_type     ENUM('TV', 'MOVIE') NOT NULL COMMENT '구분: TV판/극장판',
  number          INT UNSIGNED NOT NULL COMMENT '몇 기 / 몇 번째 극장판인지',
  title           VARCHAR(255) COMMENT '시리즈 정식 명칭 (선택)',
  start_episode   INT UNSIGNED NULL COMMENT 'TV판 시작 화수 (극장판은 NULL)',
  end_episode     INT UNSIGNED NULL COMMENT 'TV판 종료 화수 (극장판은 NULL)',
  UNIQUE KEY uq_series_type_number (series_type, number)
) COMMENT = 'TV판 시즌 및 극장판 회차 정보';