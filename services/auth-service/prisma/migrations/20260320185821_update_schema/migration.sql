/*
  Warnings:

  - Added the required column `phone_no` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone_no" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;
