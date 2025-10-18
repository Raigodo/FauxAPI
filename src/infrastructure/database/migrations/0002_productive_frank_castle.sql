CREATE TABLE "namespaces" (
	"key" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"parent_namespace_key" varchar,
	CONSTRAINT "namespaces_user_id_key_pk" PRIMARY KEY("user_id","key")
);
--> statement-breakpoint
ALTER TABLE "namespaces" ADD CONSTRAINT "namespaces_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "namespaces" ADD CONSTRAINT "namespaces_user_id_parent_namespace_key_namespaces_user_id_key_fk" FOREIGN KEY ("user_id","parent_namespace_key") REFERENCES "public"."namespaces"("user_id","key") ON DELETE cascade ON UPDATE no action;