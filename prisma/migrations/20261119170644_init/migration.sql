-- CreateTable
CREATE TABLE "Theme" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "usn" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "isLead" BOOLEAN NOT NULL DEFAULT false,
    "registrationId" TEXT NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Theme_code_key" ON "Theme"("code");

-- CreateIndex
CREATE INDEX "Registration_themeId_idx" ON "Registration"("themeId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_usn_key" ON "Member"("usn");

-- CreateIndex
CREATE INDEX "Member_registrationId_idx" ON "Member"("registrationId");

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
