#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Flask API server for certificate generation.
Run this server to provide HTTP endpoints for PDF certificate generation.
"""

import os
import sys
import tempfile
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from lib.certificate_generator import CertificateGenerator, CertificateData, ValidationError

# Add current directory to path to import certificate_generator
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)
CORS(app, origins=["http://localhost:3010", "http://localhost:3011"])  # Enable CORS for Next.js frontend

# Configuration
CERTIFICATE_DIR = Path(__file__).parent
TEMPLATE_DIR = CERTIFICATE_DIR / "templates"
OUTPUT_DIR = CERTIFICATE_DIR / "output"
TEMPLATE_NAME = "certificate_template.html"

# Ensure output directory exists
OUTPUT_DIR.mkdir(exist_ok=True)

# Initialize certificate generator
generator = CertificateGenerator(
    template_dir=TEMPLATE_DIR,
    template_name=TEMPLATE_NAME,
    expected_template_sha256=None  # Set this to lock layout if needed
)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "certificate-generator"})

@app.route('/generate', methods=['POST'])
def generate_certificate():
    """Generate certificate PDF from donation data"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['donor_name', 'amount', 'donation_id', 'donation_date']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Parse and create certificate data
        try:
            donation_date = datetime.strptime(data['donation_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

        cert_data = CertificateData(
            donor_name=str(data['donor_name']).strip(),
            amount_in_inr=Decimal(str(data['amount'])),
            donation_id=str(data['donation_id']).strip(),
            donation_date=donation_date,
            payment_mode=data.get('payment_mode'),
            org_name=data.get('org_name', 'Shri Raghavendra Swamy Brundavana Sannidhi, Halasuru'),
            org_subtitle=data.get('org_subtitle', 'Guru Seva Mandali (Regd.)'),
            show_80g_note=data.get('show_80g_note', False),
            extra_meta=data.get('extra_meta')
        )

        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"certificate_{data['donation_id']}_{timestamp}.pdf"
        output_path = OUTPUT_DIR / filename

        # Generate certificate
        generator.generate(cert_data, output_path)

        return jsonify({
            "success": True,
            "filename": filename,
            "message": "Certificate generated successfully"
        })

    except ValidationError as e:
        return jsonify({"error": f"Validation error: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/download/<filename>', methods=['GET'])
def download_certificate(filename):
    """Download generated certificate PDF"""
    try:
        file_path = OUTPUT_DIR / filename

        if not file_path.exists():
            return jsonify({"error": "Certificate not found"}), 404

        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )

    except Exception as e:
        return jsonify({"error": f"Download error: {str(e)}"}), 500

@app.route('/certificates', methods=['GET'])
def list_certificates():
    """List all generated certificates"""
    try:
        certificates = []
        for file_path in OUTPUT_DIR.glob('*.pdf'):
            stat = file_path.stat()
            certificates.append({
                'filename': file_path.name,
                'size': stat.st_size,
                'created': datetime.fromtimestamp(stat.st_ctime).isoformat()
            })

        # Sort by creation time (newest first)
        certificates.sort(key=lambda x: x['created'], reverse=True)

        return jsonify({
            "certificates": certificates,
            "total": len(certificates)
        })

    except Exception as e:
        return jsonify({"error": f"List error: {str(e)}"}), 500

@app.route('/cleanup', methods=['POST'])
def cleanup_certificates():
    """Clean up old certificates (older than specified hours)"""
    try:
        data = request.get_json() or {}
        max_age_hours = data.get('max_age_hours', 24)

        cutoff_time = datetime.now().timestamp() - (max_age_hours * 3600)
        deleted_count = 0

        for file_path in OUTPUT_DIR.glob('*.pdf'):
            if file_path.stat().st_ctime < cutoff_time:
                file_path.unlink()
                deleted_count += 1

        return jsonify({
            "success": True,
            "deleted_count": deleted_count,
            "message": f"Cleaned up {deleted_count} old certificates"
        })

    except Exception as e:
        return jsonify({"error": f"Cleanup error: {str(e)}"}), 500

if __name__ == '__main__':
    # Default port for the certificate service
    port = int(os.environ.get('CERTIFICATE_PORT', 5001))

    print(f"🔥 Certificate Generator API starting on port {port}")
    print(f"📁 Output directory: {OUTPUT_DIR}")
    print(f"📄 Template: {TEMPLATE_DIR / TEMPLATE_NAME}")
    print(f"🌐 Health check: http://localhost:{port}/health")

    app.run(host='0.0.0.0', port=port, debug=False)
