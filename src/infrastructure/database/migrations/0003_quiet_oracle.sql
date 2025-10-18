CREATE TABLE "resources" (
	"key" varchar NOT NULL,
	"content_type" varchar NOT NULL,
	"namespace_key" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	CONSTRAINT "resources_key_namespace_key_user_id_pk" PRIMARY KEY("key","namespace_key","user_id")
);
--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_user_id_namespace_key_namespaces_user_id_key_fk" FOREIGN KEY ("user_id","namespace_key") REFERENCES "public"."namespaces"("user_id","key") ON DELETE restrict ON UPDATE no action;