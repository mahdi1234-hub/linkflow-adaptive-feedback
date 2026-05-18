import modal
from backend.main import app as fastapi_app

image = modal.Image.debian_slim().pip_install_from_requirements("backend/requirements.txt")

app = modal.App("linkflow-backend")

@app.function(image=image, secrets=[
    modal.Secret.from_dict({
        "sender_email": "louatimahdi390@gmail.com",
        "app_password": "vtjb rtop rbfd nevr"
    })
])
@modal.asgi_app()
def asgi_app():
    return fastapi_app
