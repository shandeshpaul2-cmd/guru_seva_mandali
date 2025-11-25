#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Exact, deterministic PDF generator for the 'donation_certificate_temple_v18.html' template.

- Uses Playwright (Chromium) to render your HTML exactly as-is.
- Only injects `window.CERT_DATA` (donorName, amountINR/amountText, donationId, donationDate, reasonText).
- Locks page size (A4) and prints backgrounds for fidelity.
"""

from __future__ import annotations
import json
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from typing import Optional

from playwright.sync_api import sync_playwright  # pip install playwright && playwright install chromium


@dataclass(frozen=True)
class CertInput:
    donor_name: str
    amount_in_inr: Decimal | float | str
    donation_id: str
    donation_date: date | str  # 'YYYY-MM-DD' recommended (your template formats this to DD-MM-YYYY)
    phone_number: str = ""  # phone number field for v19 template
    reason_text: str = "for their valued contribution"  # shown under the name

    def to_cert_data(self) -> dict:
        # Normalize values to what the HTML expects
        # amount: prefer numeric so the template's Intl.NumberFormat('en-IN') is used
        if isinstance(self.amount_in_inr, str):
            amount = Decimal(self.amount_in_inr)
        else:
            amount = Decimal(str(self.amount_in_inr))
        amount = amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # date: pass as YYYY-MM-DD string; the template converts it to DD-MM-YYYY
        if isinstance(self.donation_date, date):
            dstr = self.donation_date.strftime("%Y-%m-%d")
        else:
            dstr = str(self.donation_date)

        return {
            "donorName": self.donor_name,
            "amountINR": float(amount),      # template formats to ₹ with en-IN locale
            "donationId": self.donation_id,
            "donationDate": dstr,
            "phoneNumber": self.phone_number,
            "reasonText": self.reason_text,
        }


class ExactCertificatePDF:
    def __init__(self, html_path: Path):
        if not html_path.exists():
            raise FileNotFoundError(f"Template not found: {html_path}")
        self.html_path = html_path.resolve()

    def generate(self, data: CertInput, out_pdf: Path) -> Path:
        out_pdf = out_pdf.resolve()
        payload = data.to_cert_data()

        with sync_playwright() as p:
            browser = p.chromium.launch()
            context = browser.new_context()  # default A4 is set via CSS in your HTML
            page = context.new_page()

            # Inject window.CERT_DATA BEFORE any scripts execute in your HTML.
            page.add_init_script(f"window.CERT_DATA = {json.dumps(payload, ensure_ascii=False)};")

            # Load local HTML; allow fonts/images to load; wait for network idle.
            page.goto(f"file://{self.html_path}", wait_until="load")
            page.wait_for_load_state("networkidle")

            # Optional: ensure the dynamic text is present before printing
            page.wait_for_selector("#donorName")

            # Print backgrounds + force A4 size
            page.pdf(
                path=str(out_pdf),
                print_background=True,
                prefer_css_page_size=True,
                width="210mm",
                height="297mm",
                margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
                scale=1.0,
            )
            browser.close()
        return out_pdf


# --- CLI for quick testing ----------------------------------------------------
def _cli():
    import argparse
    parser = argparse.ArgumentParser(description="Generate donation certificate PDF exactly from the provided HTML.")
    parser.add_argument("--html", required=True, help="Path to donation_certificate_temple_v19_phone.html")
    parser.add_argument("--out", required=True, help="Output PDF path")
    parser.add_argument("--name", required=True, help="Donor name")
    parser.add_argument("--amount", required=True, help="Amount in INR (e.g., 500 or 500.00)")
    parser.add_argument("--id", required=True, help="Donation/Receipt ID")
    parser.add_argument("--date", required=True, help="Donation date (YYYY-MM-DD preferred)")
    parser.add_argument("--phone", default="", help="Donor phone number")
    parser.add_argument("--reason", default="for their valued contribution")
    args = parser.parse_args()

    doc = ExactCertificatePDF(Path(args.html))
    pdf = doc.generate(
        CertInput(
            donor_name=args.name,
            amount_in_inr=args.amount,
            donation_id=args.id,
            donation_date=args.date,
            phone_number=args.phone,
            reason_text=args.reason,
        ),
        Path(args.out),
    )
    print(f"✅ PDF generated at: {pdf}")

if __name__ == "__main__":
    _cli()