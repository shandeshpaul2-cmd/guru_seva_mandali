-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "nakshatra" TEXT,
    "gothra" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receiptNumber" TEXT NOT NULL,
    "userId" TEXT,
    "amount" REAL NOT NULL,
    "donationType" TEXT NOT NULL DEFAULT 'General',
    "donationPurpose" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL DEFAULT 'razorpay',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "receiptPdfUrl" TEXT,
    "whatsappSent" BOOLEAN NOT NULL DEFAULT false,
    "whatsappSentAt" DATETIME,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" DATETIME,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "donations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pooja_services" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "poojaName" TEXT NOT NULL,
    "poojaNameKannada" TEXT,
    "poojaNameHindi" TEXT,
    "description" TEXT,
    "price" REAL NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "maxBookingsPerSlot" INTEGER NOT NULL DEFAULT 5,
    "requiresAdvanceNotice" BOOLEAN NOT NULL DEFAULT true,
    "advanceNoticeHours" INTEGER NOT NULL DEFAULT 24,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pooja_bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingNumber" TEXT NOT NULL,
    "receiptNumber" TEXT,
    "userId" TEXT,
    "userName" TEXT NOT NULL,
    "userPhone" TEXT NOT NULL,
    "userEmail" TEXT,
    "nakshatra" TEXT,
    "gothra" TEXT,
    "poojaId" INTEGER NOT NULL,
    "poojaName" TEXT NOT NULL,
    "poojaPrice" REAL NOT NULL,
    "preferredDate" DATETIME,
    "preferredTime" TEXT,
    "confirmedDate" DATETIME,
    "confirmedTime" TEXT,
    "specialInstructions" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "bookingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "userConfirmationSent" BOOLEAN NOT NULL DEFAULT false,
    "userConfirmationSentAt" DATETIME,
    "adminNotificationSent" BOOLEAN NOT NULL DEFAULT false,
    "adminNotificationSentAt" DATETIME,
    "confirmedByAdminId" TEXT,
    "confirmedByAdminAt" DATETIME,
    "completedAt" DATETIME,
    "cancellationReason" TEXT,
    "cancelledAt" DATETIME,
    "utmSource" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pooja_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "pooja_bookings_poojaId_fkey" FOREIGN KEY ("poojaId") REFERENCES "pooja_services" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "receipt_sequence" (
    "fiscalYear" TEXT NOT NULL PRIMARY KEY,
    "lastSequence" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "booking_sequence" (
    "fiscalYear" TEXT NOT NULL PRIMARY KEY,
    "lastSequence" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "daily_sequence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "lastSequence" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "oldValues" TEXT,
    "newValues" TEXT,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "donations_receiptNumber_key" ON "donations"("receiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "pooja_bookings_bookingNumber_key" ON "pooja_bookings"("bookingNumber");

-- CreateIndex
CREATE UNIQUE INDEX "pooja_bookings_receiptNumber_key" ON "pooja_bookings"("receiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "daily_sequence_type_date_key" ON "daily_sequence"("type", "date");
