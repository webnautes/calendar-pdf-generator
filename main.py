from fastapi import FastAPI, Response
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import calendar
from datetime import datetime
import io

app = FastAPI(title="Calendar PDF Generator")

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def read_root():
    """Serve the main HTML page"""
    return FileResponse("static/index.html")


@app.get("/api/calendar/{year}")
async def get_calendar(year: int):
    """Get calendar data for a specific year"""
    if year < 1900 or year > 2100:
        return {"error": "Year must be between 1900 and 2100"}

    months_data = []
    for month in range(1, 13):
        cal = calendar.monthcalendar(year, month)
        month_name = calendar.month_name[month]
        months_data.append({
            "month": month,
            "name": month_name,
            "weeks": cal
        })

    return {
        "year": year,
        "months": months_data
    }


@app.get("/api/pdf/{year}")
async def generate_pdf(year: int):
    """Generate PDF for the entire year"""
    if year < 1900 or year > 2100:
        return {"error": "Year must be between 1900 and 2100"}

    # Create PDF in memory
    buffer = io.BytesIO()

    # Create PDF with landscape A4
    p = canvas.Canvas(buffer, pagesize=landscape(A4))
    width, height = landscape(A4)

    # Title
    p.setFont("Helvetica-Bold", 24)
    p.drawCentredString(width / 2, height - 2*cm, f"{year} Calendar")

    # Draw 12 months in 3x4 grid
    months_per_row = 4
    rows = 3
    cell_width = (width - 4*cm) / months_per_row
    cell_height = (height - 6*cm) / rows

    for month_idx in range(1, 13):
        row = (month_idx - 1) // months_per_row
        col = (month_idx - 1) % months_per_row

        x = 2*cm + col * cell_width
        y = height - 4*cm - row * cell_height

        # Month name
        p.setFont("Helvetica-Bold", 12)
        month_name = calendar.month_name[month_idx]
        p.drawCentredString(x + cell_width/2, y - 0.5*cm, month_name)

        # Day headers
        p.setFont("Helvetica", 8)
        day_names = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
        day_width = cell_width / 7

        for i, day_name in enumerate(day_names):
            p.drawCentredString(x + i * day_width + day_width/2, y - 1*cm, day_name)

        # Calendar days
        cal = calendar.monthcalendar(year, month_idx)
        p.setFont("Helvetica", 8)

        for week_idx, week in enumerate(cal):
            for day_idx, day in enumerate(week):
                if day != 0:
                    day_x = x + day_idx * day_width + day_width/2
                    day_y = y - 1.5*cm - week_idx * 0.5*cm
                    p.drawCentredString(day_x, day_y, str(day))

    p.showPage()
    p.save()

    # Get PDF data
    buffer.seek(0)
    pdf_data = buffer.getvalue()

    return Response(
        content=pdf_data,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=calendar_{year}.pdf"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
