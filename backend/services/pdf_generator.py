import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)

def generate_pdf_report(
    report_type: str,
    submitted_content: str,
    risk_score: int,
    risk_level: str,
    summary: str,
    warning_signs: list[str],
    recommendations: list[str],
    sources: list[dict] = None,
    domain: str = None,
    https_status: bool = None,
    report_id: str = None,
) -> bytes:
    """
    Generates a professional cybersecurity risk assessment PDF using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0B1220'),
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B'),
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#334155'),
    )
    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155'),
        leftIndent=12,
    )

    story = []

    # 1. Header with TrustShield AI branding
    gen_date = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    rep_id = report_id or f"TSA-{int(datetime.utcnow().timestamp())}"

    header_data = [
        [
            Paragraph("<b>TrustShield AI</b><br/><font size=8 color='#64748B'>Automated Cyber Risk Assessment</font>", title_style),
            Paragraph(f"<b>Report ID:</b> {rep_id}<br/><b>Date:</b> {gen_date}<br/><b>Type:</b> {report_type.upper()}", subtitle_style),
        ]
    ]
    header_table = Table(header_data, colWidths=[3.5 * inch, 3.5 * inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#06B6D4'), spaceAfter=15))

    # 2. Risk Overview Banner
    level_lower = (risk_level or "low").lower()
    if level_lower == "high":
        badge_bg = colors.HexColor('#FFE4E6')
        badge_text = colors.HexColor('#E11D48')
        badge_label = "HIGH RISK"
    elif level_lower == "medium":
        badge_bg = colors.HexColor('#FEF3C7')
        badge_text = colors.HexColor('#D97706')
        badge_label = "MEDIUM RISK"
    else:
        badge_bg = colors.HexColor('#D1FAE5')
        badge_text = colors.HexColor('#059669')
        badge_label = "LOW RISK"

    risk_table_data = [
        [
            Paragraph(f"<b>Overall Risk Score:</b> <font size=16 color='{badge_text.hexval()}'><b>{risk_score} / 100</b></font>", body_style),
            Paragraph(f"<b>Classification:</b> <font color='{badge_text.hexval()}'><b>{badge_label}</b></font>", body_style),
        ]
    ]
    risk_table = Table(risk_table_data, colWidths=[3.5 * inch, 3.5 * inch])
    risk_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), badge_bg),
        ('BOX', (0, 0), (-1, -1), 1, badge_text),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.transparent),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(risk_table)
    story.append(Spacer(1, 15))

    # 3. Submitted Content Preview
    story.append(Paragraph("<b>Submitted Content / Claim Evaluated:</b>", section_heading))
    clean_content = submitted_content[:600] + ("..." if len(submitted_content) > 600 else "")
    # Escape xml entities for ReportLab Paragraph
    safe_content = clean_content.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    content_table = Table([[Paragraph(f"<i>\"{safe_content}\"</i>", body_style)]], colWidths=[7.0 * inch])
    content_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
        ('PADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(content_table)
    story.append(Spacer(1, 15))

    # 4. URL Details if applicable
    if domain:
        url_info = f"<b>Target Domain:</b> {domain} | <b>HTTPS Encrypted:</b> {'Yes' if https_status else 'No (Plaintext - High Risk)'}"
        story.append(Paragraph(url_info, body_style))
        story.append(Spacer(1, 10))

    # 5. Analysis Summary
    story.append(Paragraph("<b>Executive Summary:</b>", section_heading))
    safe_summary = (summary or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    story.append(Paragraph(safe_summary, body_style))
    story.append(Spacer(1, 15))

    # 6. Warning Signs / Indicators
    if warning_signs:
        story.append(Paragraph("<b>Detected Warning Signs &amp; Threat Indicators:</b>", section_heading))
        for w in warning_signs:
            safe_w = str(w).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            story.append(Paragraph(f"• <b>{safe_w}</b>", bullet_style))
            story.append(Spacer(1, 3))
        story.append(Spacer(1, 12))

    # 7. Credible Sources (for news verification)
    if sources:
        story.append(Paragraph("<b>Retrieved Evidence &amp; References:</b>", section_heading))
        for s in sources:
            name = s.get("name", "Source").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            url = s.get("url", "#")
            story.append(Paragraph(f"• <b>{name}</b> - <font color='#0284C7'>{url}</font>", bullet_style))
            story.append(Spacer(1, 3))
        story.append(Spacer(1, 12))

    # 8. Recommended Safety Actions
    if recommendations:
        story.append(Paragraph("<b>Recommended Safety Actions:</b>", section_heading))
        for idx, rec in enumerate(recommendations, 1):
            safe_rec = str(rec).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            story.append(Paragraph(f"{idx}. {safe_rec}", bullet_style))
            story.append(Spacer(1, 3))
        story.append(Spacer(1, 15))

    # 9. Disclaimer & Footer
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor('#CBD5E1'), spaceAfter=8))
    disclaimer_text = (
        "<b>Notice &amp; Legal Disclaimer:</b> This risk evaluation report was generated automatically by TrustShield AI. "
        "Automated heuristics and artificial intelligence analyses may not be 100% accurate. "
        "Do not classify unknown content as definitively safe solely based on a low score. "
        "Always verify critical matters through primary official sources or consult national cybersecurity authorities (Helpline: 1930)."
    )
    story.append(Paragraph(disclaimer_text, ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        leading=11,
        textColor=colors.HexColor('#64748B'),
    )))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

