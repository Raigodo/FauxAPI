CREATE TABLE `namespaces` (
	`key` text NOT NULL,
	`user_id` text NOT NULL,
	`parent_namespace_key` text,
	PRIMARY KEY(`user_id`, `key`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_id`,`parent_namespace_key`) REFERENCES `namespaces`(`user_id`,`key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`user_id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `refresh_tokens_value_unique` ON `refresh_tokens` (`value`);--> statement-breakpoint
CREATE TABLE `resources` (
	`key` text NOT NULL,
	`content_type` text NOT NULL,
	`namespace_key` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`key`, `namespace_key`, `user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_id`,`namespace_key`) REFERENCES `namespaces`(`user_id`,`key`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL
);
