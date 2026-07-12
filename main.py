from backend.app.main import app


def main() -> None:
    print("Run the API with: uv run uvicorn backend.app.main:app --reload")


if __name__ == "__main__":
    main()
