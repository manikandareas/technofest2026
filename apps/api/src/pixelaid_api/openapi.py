import json
import sys
from pathlib import Path

from pixelaid_api.main import app


def export_openapi(output_path: str) -> None:
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(app.openapi(), indent=2) + "\n", encoding="utf-8")


def main() -> None:
    output_path = sys.argv[1] if len(sys.argv) > 1 else "openapi.json"
    export_openapi(output_path)


if __name__ == "__main__":
    main()
