CREATE TABLE `assessment_tests` (
	`id` text PRIMARY KEY NOT NULL,
	`assessment_id` text NOT NULL,
	`test_name` text NOT NULL,
	`fields` text NOT NULL,
	`result` text,
	`notes` text,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`synced_at` text,
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `assessment_tests_assessment_idx` ON `assessment_tests` (`assessment_id`);--> statement-breakpoint
CREATE INDEX `assessment_tests_updated_at_idx` ON `assessment_tests` (`updated_at`);--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`type` text NOT NULL,
	`custom_type_name` text,
	`date` text NOT NULL,
	`general_notes` text,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`synced_at` text,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `assessments_client_date_idx` ON `assessments` (`client_id`,`date`);--> statement-breakpoint
CREATE INDEX `assessments_updated_at_idx` ON `assessments` (`updated_at`);--> statement-breakpoint
CREATE TABLE `client_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`assessment_id` text,
	`angle` text NOT NULL,
	`uri` text NOT NULL,
	`date` text NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`synced_at` text,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `client_photos_client_date_idx` ON `client_photos` (`client_id`,`date`);--> statement-breakpoint
CREATE INDEX `client_photos_updated_at_idx` ON `client_photos` (`updated_at`);--> statement-breakpoint
CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`age` integer,
	`gender` text,
	`height_cm` real,
	`current_weight_kg` real,
	`phone` text,
	`start_date` text,
	`goal` text,
	`general_notes` text,
	`photo_uri` text,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`synced_at` text
);
--> statement-breakpoint
CREATE INDEX `clients_updated_at_idx` ON `clients` (`updated_at`);--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`muscle_group` text,
	`notes` text,
	`video_link` text,
	`is_custom` integer DEFAULT false NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`synced_at` text
);
--> statement-breakpoint
CREATE INDEX `exercises_updated_at_idx` ON `exercises` (`updated_at`);--> statement-breakpoint
CREATE TABLE `session_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`synced_at` text,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `session_exercises_session_idx` ON `session_exercises` (`session_id`,`order_index`);--> statement-breakpoint
CREATE INDEX `session_exercises_updated_at_idx` ON `session_exercises` (`updated_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`date` text NOT NULL,
	`notes` text,
	`template_name` text,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`synced_at` text,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_client_date_idx` ON `sessions` (`client_id`,`date`);--> statement-breakpoint
CREATE INDEX `sessions_updated_at_idx` ON `sessions` (`updated_at`);--> statement-breakpoint
CREATE TABLE `sets` (
	`id` text PRIMARY KEY NOT NULL,
	`session_exercise_id` text NOT NULL,
	`set_number` integer NOT NULL,
	`weight` real DEFAULT 0 NOT NULL,
	`reps` integer DEFAULT 0 NOT NULL,
	`intensity` text,
	`notes` text,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`synced_at` text,
	FOREIGN KEY (`session_exercise_id`) REFERENCES `session_exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sets_session_exercise_idx` ON `sets` (`session_exercise_id`,`set_number`);--> statement-breakpoint
CREATE INDEX `sets_updated_at_idx` ON `sets` (`updated_at`);