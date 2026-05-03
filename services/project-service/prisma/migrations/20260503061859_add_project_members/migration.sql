/*
  Warnings:

  - You are about to drop the column `category` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `coverImage` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `demoUrl` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `githubUrl` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `tagline` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `youtubeUrl` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the `drive_links` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ownerId` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- DropForeignKey
ALTER TABLE "drive_links" DROP CONSTRAINT "drive_links_projectId_fkey";

-- DropIndex
DROP INDEX "projects_createdAt_idx";

-- DropIndex
DROP INDEX "projects_userId_idx";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "category",
DROP COLUMN "coverImage",
DROP COLUMN "demoUrl",
DROP COLUMN "githubUrl",
DROP COLUMN "publishedAt",
DROP COLUMN "tagline",
DROP COLUMN "tags",
DROP COLUMN "userId",
DROP COLUMN "youtubeUrl",
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- DropTable
DROP TABLE "drive_links";

-- CreateTable
CREATE TABLE "project_members" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ProjectRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_members_userId_idx" ON "project_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_projectId_userId_key" ON "project_members"("projectId", "userId");

-- CreateIndex
CREATE INDEX "projects_ownerId_idx" ON "projects"("ownerId");

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
