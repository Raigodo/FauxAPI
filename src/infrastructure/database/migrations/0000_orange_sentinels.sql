CREATE TABLE "namespaces" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"value" varchar NOT NULL,
	CONSTRAINT "refresh_tokens_value_unique" UNIQUE("value")
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" varchar NOT NULL,
	"content_type" varchar NOT NULL,
	"namespace_id" varchar NOT NULL,
	"user_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"nickname" varchar NOT NULL,
	"username" varchar NOT NULL,
	"password" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "namespaces" ADD CONSTRAINT "namespaces_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_namespace_id_namespaces_id_fk" FOREIGN KEY ("namespace_id") REFERENCES "public"."namespaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;