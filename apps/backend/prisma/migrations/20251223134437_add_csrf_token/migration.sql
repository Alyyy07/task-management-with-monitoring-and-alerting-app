-- CreateTable
CREATE TABLE "CsrfToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CsrfToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CsrfToken_token_key" ON "CsrfToken"("token");

-- CreateIndex
CREATE INDEX "CsrfToken_userId_idx" ON "CsrfToken"("userId");

-- AddForeignKey
ALTER TABLE "CsrfToken" ADD CONSTRAINT "CsrfToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
