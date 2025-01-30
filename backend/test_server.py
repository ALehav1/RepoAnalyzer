from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

if __name__ == "__main__":
    config = uvicorn.Config(
        app=app,
        host="0.0.0.0",  # This will bind to all available interfaces
        port=8000,
        log_level="debug",
        loop="uvloop",
        http="httptools"
    )
    server = uvicorn.Server(config)
    server.run()
