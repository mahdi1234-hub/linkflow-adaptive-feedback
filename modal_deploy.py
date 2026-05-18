import modal
import os

# Create image with requirements and add local source
image = (
    modal.Image.debian_slim()
    .pip_install(
        "fastapi",
        "uvicorn",
        "flwr",
        "numpy",
        "scikit-learn",
        "python-multipart",
        "pydantic",
        "python-dotenv",
        "typer"
    )
    .add_local_dir("backend", remote_path="/root/backend")
)

app = modal.App("linkflow-backend")

@app.function(
    image=image, 
    secrets=[
        modal.Secret.from_dict({
            "sender_email": "louatimahdi390@gmail.com",
            "app_password": "vtjb rtop rbfd nevr"
        })
    ]
)
@modal.asgi_app()
def asgi_app():
    import sys
    # Add both /root and /root/backend to sys.path
    sys.path.append("/root")
    sys.path.append("/root/backend")
    from backend.main import app as fastapi_app
    return fastapi_app
