-- CreateTable
CREATE TABLE `tracks` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `artist` VARCHAR(255) NOT NULL,
    `lyricist` VARCHAR(255) NULL,
    `composer` VARCHAR(255) NULL,
    `album_image_url` VARCHAR(500) NULL,
    `youtube_url` VARCHAR(500) NOT NULL,
    `apple_music_url` VARCHAR(500) NULL,
    `spotify_url` VARCHAR(500) NULL,
    `track_type` ENUM('TV_OP', 'TV_ED', 'MOVIE') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `track_titles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `track_id` BIGINT UNSIGNED NOT NULL,
    `language` ENUM('ko', 'ja', 'en') NOT NULL,
    `title` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `track_titles_track_id_language_key`(`track_id`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `track_lyrics` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `track_id` BIGINT UNSIGNED NOT NULL,
    `language` ENUM('ko', 'ja', 'en') NOT NULL,
    `content` TEXT NOT NULL,

    UNIQUE INDEX `track_lyrics_track_id_language_key`(`track_id`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `track_synced_lyrics` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `track_id` BIGINT UNSIGNED NOT NULL,
    `language` ENUM('ko', 'ja', 'en') NOT NULL,
    `lines` JSON NOT NULL,

    UNIQUE INDEX `track_synced_lyrics_track_id_language_key`(`track_id`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `track_titles` ADD CONSTRAINT `track_titles_track_id_fkey` FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `track_lyrics` ADD CONSTRAINT `track_lyrics_track_id_fkey` FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `track_synced_lyrics` ADD CONSTRAINT `track_synced_lyrics_track_id_fkey` FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
