from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def generate_prediction_pdf(record_dict: dict) -> bytes:
    """Generate a high-grade PDF report for a SkyIntel AI Weather & Rain Prediction."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#0f172a"),
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#0284c7"),
    )
    credits_style = ParagraphStyle(
        "DocCredits",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#64748b"),
    )
    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#1e293b"),
    )

    story = []

    # Header
    story.append(Paragraph("SkyIntel AI — Weather Intelligence Report", title_style))
    story.append(Paragraph("AI-Powered Rain & Impact Assessment Certificate", subtitle_style))
    story.append(Paragraph("Crafted by Devidas Kulkarni & Sudhanwa Kulkarni", credits_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284c7"), spaceAfter=15))

    # Summary Grid
    city = record_dict.get("city", "N/A")
    date_str = str(record_dict.get("created_at", "Just Now"))
    prob = f"{record_dict.get('rain_probability', 0)}%"
    model = record_dict.get("selected_model", "Random Forest").upper()
    flood = record_dict.get("flood_risk", "Low")
    drying = record_dict.get("drying_condition", "Good")

    summary_data = [
        [Paragraph("<b>Target Location:</b>", styles["Normal"]), Paragraph(city, styles["Normal"]),
         Paragraph("<b>Report Date:</b>", styles["Normal"]), Paragraph(date_str, styles["Normal"])],
        [Paragraph("<b>Rain Probability:</b>", styles["Normal"]), Paragraph(f"<b>{prob}</b>", styles["Normal"]),
         Paragraph("<b>ML Model Applied:</b>", styles["Normal"]), Paragraph(model, styles["Normal"])],
        [Paragraph("<b>Flood Risk Level:</b>", styles["Normal"]), Paragraph(f"<b>{flood}</b>", styles["Normal"]),
         Paragraph("<b>Laundry Drying:</b>", styles["Normal"]), Paragraph(drying, styles["Normal"])],
    ]

    summary_table = Table(summary_data, colWidths=[110, 150, 110, 150])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#334155")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 15))

    # Weather Parameters
    story.append(Paragraph("Meteorological Observations", heading_style))
    story.append(Spacer(1, 6))

    temp = f"{record_dict.get('temperature', 25.0)} °C"
    hum = f"{record_dict.get('humidity', 50.0)} %"
    pres = f"{record_dict.get('pressure', 1013.0)} hPa"
    wind = f"{record_dict.get('wind_speed', 5.0)} m/s"

    meteo_data = [
        ["Temperature", "Humidity", "Atmospheric Pressure", "Wind Speed"],
        [temp, hum, pres, wind],
    ]
    meteo_table = Table(meteo_data, colWidths=[130, 130, 130, 130])
    meteo_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e0f2fe")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0369a1")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#bae6fd")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e0f2fe")),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(meteo_table)
    story.append(Spacer(1, 15))

    # Recommendations
    story.append(Paragraph("Smart AI Actionable Advisory", heading_style))
    story.append(Spacer(1, 6))

    recs = record_dict.get("recommendations", [])
    if isinstance(recs, str):
        recs = [recs]

    rec_items = [[Paragraph(f"• {r}", styles["Normal"])] for r in recs]
    rec_table = Table(rec_items, colWidths=[520])
    rec_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f1f5f9")),
        ("PADDING", (0, 0), (-1, -1), 6),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
    ]))
    story.append(rec_table)
    story.append(Spacer(1, 25))

    # Footer notice
    footer_text = "Generated by SkyIntel AI Platform — Crafted by Devidas Kulkarni & Sudhanwa Kulkarni. All rights reserved."
    story.append(Paragraph(footer_text, ParagraphStyle("Footer", parent=styles["Normal"], fontSize=8, textColor=colors.HexColor("#94a3b8"), alignment=1)))

    doc.build(story)
    pdf_data = buffer.getvalue()
    buffer.close()
    return pdf_data
