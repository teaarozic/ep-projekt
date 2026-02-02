-- CreateTable
CREATE TABLE "public"."_AssignedProjects" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AssignedProjects_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AssignedProjects_B_index" ON "public"."_AssignedProjects"("B");

-- AddForeignKey
ALTER TABLE "public"."_AssignedProjects" ADD CONSTRAINT "_AssignedProjects_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AssignedProjects" ADD CONSTRAINT "_AssignedProjects_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
