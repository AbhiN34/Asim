import asyncio
import os
from datetime import datetime
from uuid import uuid4

from dotenv import load_dotenv
from graphiti_core import Graphiti
from graphiti_core.nodes import EpisodeType


PARAGRAPH = (
    "Justin is a Columbia University undergraduate studying computer science. "
    "He is the President of CORE (Columbia Organization of Rising Entrepreneurs) "
    "and is building Forward AI, a startup making FDE tooling for Series A and B "
    "AI companies. He has done ML research at Columbia's Creative Machines Lab "
    "under Hod Lipson, focusing on memory-augmented architectures. He has a "
    "signed UBS investment banking internship for summer 2026 but is considering "
    "exiting it for startup work."
)


async def main() -> None:
    load_dotenv()

    uri = os.environ["NEO4J_URI"]
    user = os.environ["NEO4J_USER"]
    password = os.environ["NEO4J_PASSWORD"]

    graphiti = Graphiti(uri, user, password)

    try:
        try:
            await graphiti.build_indices_and_constraints()
        except Exception as e:
            print(f"[indices] skipped: {e}")

        episode_name = f"test-{uuid4()}"
        print(f"[ingest] adding episode {episode_name} (30-90s)...")
        await graphiti.add_episode(
            name=episode_name,
            episode_body=PARAGRAPH,
            source=EpisodeType.text,
            source_description="test paragraph",
            reference_time=datetime.now(),
            group_id="justin",
        )
        print("[ingest] done")

        print("[search] querying: what is Justin building?")
        results = await graphiti.search(
            "what is Justin building?",
            group_ids=["justin"],
            num_results=5,
        )

        if not results:
            print("FAILURE: search returned no results")
            return

        for i, r in enumerate(results, 1):
            fact = getattr(r, "fact", None) or getattr(r, "name", None) or repr(r)
            print(f"  {i}. {fact}")

        print("SUCCESS")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"FAILURE: {type(e).__name__}: {e}")
    finally:
        await graphiti.close()


if __name__ == "__main__":
    asyncio.run(main())
