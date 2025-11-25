# Donation Certificate Generator Service

This service generates DONATION certificate PDFs for the temple MVP application ONLY.

**IMPORTANT**: This service is exclusively for donation certificates and does not support pooja bookings or other services.

## Setup

1. **Install Python dependencies:**
   ```bash
   cd app/certificates
   pip install -r requirements.txt
   ```

2. **Install Playwright browser (if using Playwright engine):**
   ```bash
   python -m playwright install chromium
   ```

3. **Run the service:**
   ```bash
   python app.py
   ```

The service will start on `http://localhost:5001` by default (port 5001 to avoid conflicts with Next.js on port 3010).

## API Endpoints

### POST /generate
Generate a certificate PDF.

**Request body:**
```json
{
  "donor_name": "John Doe",
  "amount": "1500.00",
  "donation_id": "DN-171025-0001",
  "donation_date": "2025-10-17",
  "payment_mode": "Razorpay",
  "org_name": "Shri Raghavendra Swamy Brundavana Sannidhi, Halasuru",
  "org_subtitle": "Guru Seva Mandali (Regd.)",
  "show_80g_note": true
}
```

**Response:**
```json
{
  "success": true,
  "filename": "certificate_DN-171025-0001_20251017_143022.pdf",
  "message": "Certificate generated successfully"
}
```

### GET /download/<filename>
Download a generated certificate PDF.

### GET /certificates
List all generated certificates.

### POST /cleanup
Clean up old certificates (default: older than 24 hours).

**Request body:**
```json
{
  "max_age_hours": 24
}
```

### GET /health
Health check endpoint.

## CLI Usage

You can also generate certificates directly from the command line:

```bash
python lib/certificate_generator.py \
  --out test_certificate.pdf \
  --donor "John Doe" \
  --amount 1500.00 \
  --donation-id DN-171025-0001 \
  --date 2025-10-17 \
  --payment-mode Razorpay
```

## Integration with Next.js (DONATIONS ONLY)

The Next.js application will call this service to generate certificates after successful DONATIONS only. The generated PDFs can then be:

1. Downloaded by users on the donation success page
2. Sent via WhatsApp as media attachments for donation receipts
3. Stored for admin reference for donation records

**This service does NOT support pooja bookings, parihara poojas, or astrology consultations.**

## Template Customization

Edit `templates/certificate_template.html` to customize the certificate design. The template uses Jinja2 syntax with these variables:

- `{{ donor_name }}` - Donor's full name
- `{{ amount|inr }}` - Formatted amount in INR
- `{{ donation_id }}` - Donation receipt number
- `{{ donation_date|date_dmy }}` - Formatted date (e.g., "17 Oct 2025")
- `{{ payment_mode }}` - Payment method
- `{{ org_name }}` - Temple organization name
- `{{ org_subtitle }}` - Organization subtitle
- `{{ show_80g_note }}` - Boolean to show/hide 80G tax benefit note
- `{{ rendered_at }}` - Generation timestamp

## PDF Engines

The service supports two PDF engines:

1. **Playwright (recommended)** - Better CSS support, more accurate rendering
2. **WeasyPrint** - Fallback option, lighter weight

Playwright requires Chromium to be installed (`python -m playwright install chromium`).

## Security Notes

- All user inputs are validated and sanitized
- HTML injection is prevented via Jinja2 auto-escaping
- File access is restricted to the output directory
- Template layout can be locked via SHA-256 hash to prevent unauthorized changes