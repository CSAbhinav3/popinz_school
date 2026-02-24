"""Run the API server. Usage: python run.py"""
import uvicorn

if __name__ == "__main__":
    # Use 127.0.0.1 so browser connects over IPv4 (avoids hang on some Windows setups)
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
