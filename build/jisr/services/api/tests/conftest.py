import os

os.environ["JISR_DOTENV_OVERRIDE"] = "0"
import tempfile
from pathlib import Path

_tmp = Path(tempfile.mkdtemp()) / "test.db"
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp.as_posix()}"
os.environ["LLM_PROVIDER"] = "none"
os.environ["JOBS_ENABLED"] = "false"
os.environ["JUDGE_PASSCODE"] = "test-pass"
os.environ["DEMO_MODE"] = "true"
