-- CreateTable
CREATE TABLE "gallery_items" (
    "id" TEXT NOT NULL,
    "cloudinaryId" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "bytes" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "blurPlaceholder" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gallery_items_cloudinaryId_key" ON "gallery_items"("cloudinaryId");

-- CreateIndex
CREATE INDEX "gallery_items_isPublished_sortOrder_idx" ON "gallery_items"("isPublished", "sortOrder");
