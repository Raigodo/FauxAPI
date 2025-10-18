CREATE TABLE "refresh_tokens" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"value" varchar NOT NULL,
	CONSTRAINT "refresh_tokens_value_unique" UNIQUE("value")
);
--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;